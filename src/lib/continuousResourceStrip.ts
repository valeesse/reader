import { AppSettings, BookType } from '../types';
import { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';
import { applyContinuousReaderDocumentStyles, readerThemeColors } from './readerDocumentStyles';

const RESOURCE_RADIUS = 3;
const MAX_RESOURCES = RESOURCE_RADIUS * 2 + 1;
const DEFAULT_RESOURCE_HEIGHT = 1600;

type StripCallbacks = {
  onLocator: (locator: ReadiumLocatorLike) => void;
  onImage: (image: { src: string; name: string }) => void;
  onToggleChrome: () => void;
};

type StripRecord = {
  index: number;
  wrapper: HTMLDivElement;
  iframe: HTMLIFrameElement;
  height: number;
  loaded: boolean;
  loadPromise: Promise<void>;
  resizeObserver?: ResizeObserver;
};

export class ContinuousResourceStrip {
  private scroller: HTMLDivElement;
  private content: HTMLDivElement;
  private records = new Map<number, StripRecord>();
  private settings: AppSettings;
  private active = false;
  private destroyed = false;
  private currentIndex = 0;
  private currentLocatorValue: ReadiumLocatorLike;
  private scrollRaf: number | null = null;
  private locatorTimer: number | null = null;
  private mutationGeneration = 0;
  private positionRanges = new Map<string, ReadiumLocatorLike[]>();
  private windowMutation: Promise<void> = Promise.resolve();
  private pendingWindowCenter: number | null = null;
  private windowTimer: number | null = null;
  private programmaticScroll = false;
  private layoutGeneration = 0;

  constructor(
    private host: HTMLElement,
    private publication: ReadiumPublicationLike,
    settings: AppSettings,
    private bookType: BookType,
    private callbacks: StripCallbacks,
  ) {
    this.settings = settings;
    for (const position of publication.positions) {
      // Position hrefs are generated from reading-order hrefs. Normalizing the
      // fragment directly avoids a linear reading-order lookup for every
      // position (millions of comparisons for a large TXT).
      const href = position.href.split('#')[0];
      const range = this.positionRanges.get(href) || [];
      range.push(position);
      this.positionRanges.set(href, range);
    }
    const first = publication.readingOrder.items[0]?.locator || publication.positions[0];
    this.currentLocatorValue = first;
    this.scroller = document.createElement('div');
    this.scroller.className = 'zenith-resource-strip-scroller';
    this.content = document.createElement('div');
    this.content.className = 'zenith-resource-strip-content';
    this.scroller.appendChild(this.content);
    this.host.replaceChildren(this.scroller);
    this.scroller.addEventListener('scroll', this.handleScroll, { passive: true });
    this.scroller.addEventListener('click', this.handleBackgroundClick);
    this.applyHostTheme();
  }

  get currentLocator() {
    return this.currentLocatorValue;
  }

  get currentDocument() {
    return this.records.get(this.currentIndex)?.iframe.contentDocument || undefined;
  }

  snapshotLocator() {
    const focus = this.scroller.scrollTop + this.scroller.clientHeight * 0.5;
    const record = this.sortedRecords().find((item) => item.wrapper.offsetTop + item.wrapper.offsetHeight > focus)
      || this.records.get(this.currentIndex);
    const link = record && this.publication.readingOrder.items[record.index];
    const doc = record?.iframe.contentDocument;
    if (!record || !link || !doc?.body) return this.currentLocatorValue;
    const localFocus = focus - record.wrapper.offsetTop;
    const element = Array.from(doc.body.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
      .filter((item) => item.textContent?.trim())
      .sort((a, b) => distanceToElement(a, localFocus) - distanceToElement(b, localFocus))[0];
    const progression = clamp(localFocus / Math.max(1, record.height), 0, 1);
    const locator = this.locatorForProgression(link.href, progression);
    return locator.copyWithLocations({
      ...locator.locations,
      progression,
      cssSelector: element ? cssSelector(element) : undefined,
      zenithViewportY: 0.5,
    });
  }

  updatePositions() {
    this.positionRanges.clear();
    for (const position of this.publication.positions) {
      const href = position.href.split('#')[0];
      const range = this.positionRanges.get(href) || [];
      range.push(position);
      this.positionRanges.set(href, range);
    }
  }

  async mount(locator?: ReadiumLocatorLike) {
    if (this.destroyed) return;
    const target = locator || this.currentLocatorValue;
    const index = this.indexForHref(target?.href) ?? 0;
    this.currentIndex = index;
    this.currentLocatorValue = target || this.publication.readingOrder.items[index].locator;
    // First paint only waits for the visible resource. The surrounding L1 band
    // is filled after it becomes readable, so a large EPUB chapter cannot hold
    // the startup screen hostage while six off-screen documents finish layout.
    const current = this.records.get(index);
    if (current) await current.loadPromise;
    else await this.createRecord(index);
    if (this.destroyed) return;
    await this.scrollToLocator(this.currentLocatorValue, false);
    this.emitLocator(true);
    void this.ensureWindow(index, false);
  }

  setActive(active: boolean) {
    this.active = active;
    this.host.classList.toggle('zenith-resource-strip-active', active);
    this.host.setAttribute('aria-hidden', active ? 'false' : 'true');
  }

  async updateSettings(settings: AppSettings, anchor = this.snapshotLocator()) {
    const generation = ++this.layoutGeneration;
    this.settings = settings;
    this.applyHostTheme();
    await Promise.all(Array.from(this.records.values(), async (record) => {
      const doc = record.iframe.contentDocument;
      if (!doc) return;
      await this.applyDocumentSettings(doc);
      this.measureRecord(record);
    }));
    await nextPaint(2);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    await this.scrollToLocator(anchor, false);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    this.currentLocatorValue = anchor;
    return true;
  }

  async go(locator: ReadiumLocatorLike, smooth = false) {
    const generation = ++this.layoutGeneration;
    if (this.destroyed || !locator?.href) return false;
    const index = this.indexForHref(locator.href);
    if (index === undefined) return false;
    const shouldSmooth = smooth && this.currentIndex === index;
    this.currentIndex = index;
    this.currentLocatorValue = locator;
    const current = this.records.get(index);
    if (current) await current.loadPromise.catch(() => {});
    else await this.createRecord(index).catch(() => {});
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    // WebView smooth scrolling can stop short when the virtual window is
    // rebalanced over a multi-resource distance. Cross-resource jumps are
    // therefore atomic; local fragment jumps can remain smoothly animated.
    this.programmaticScroll = shouldSmooth;
    await this.scrollToLocator(locator, shouldSmooth);
    if (shouldSmooth) await waitForScrollCompletion(this.scroller);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    this.programmaticScroll = false;
    this.emitLocator(true);
    void this.ensureWindow(index, false);
    return true;
  }

  turn(direction: -1 | 1) {
    if (!this.active || this.destroyed) return;
    const distance = Math.max(120, this.scroller.clientHeight * 0.9) * direction;
    this.scroller.scrollBy({ top: distance, behavior: 'smooth' });
  }

  destroy() {
    this.destroyed = true;
    this.layoutGeneration += 1;
    this.mutationGeneration += 1;
    if (this.scrollRaf !== null) cancelAnimationFrame(this.scrollRaf);
    if (this.locatorTimer !== null) window.clearTimeout(this.locatorTimer);
    if (this.windowTimer !== null) window.clearTimeout(this.windowTimer);
    this.scroller.removeEventListener('scroll', this.handleScroll);
    this.scroller.removeEventListener('click', this.handleBackgroundClick);
    for (const record of this.records.values()) record.resizeObserver?.disconnect();
    this.records.clear();
    this.host.replaceChildren();
  }

  private handleScroll = () => {
    if (!this.active || this.scrollRaf !== null) return;
    this.scrollRaf = requestAnimationFrame(() => {
      this.scrollRaf = null;
      this.updateCurrentFromScroll();
    });
  };

  private handleBackgroundClick = (event: MouseEvent) => {
    if (event.target === this.scroller || event.target === this.content) this.callbacks.onToggleChrome();
  };

  private updateCurrentFromScroll() {
    if (this.destroyed || this.records.size === 0) return;
    const focus = this.scroller.scrollTop + this.scroller.clientHeight * 0.5;
    let selected = this.sortedRecords()[0];
    for (const record of this.sortedRecords()) {
      if (record.wrapper.offsetTop <= focus) selected = record;
      if (record.wrapper.offsetTop + record.wrapper.offsetHeight > focus) break;
    }
    if (!selected) return;
    const changed = selected.index !== this.currentIndex;
    this.currentIndex = selected.index;
    this.emitLocator(changed);
    if (!this.programmaticScroll && (changed || selected.index <= this.minimumIndex() + 1 || selected.index >= this.maximumIndex() - 1)) {
      void this.ensureWindow(selected.index, false);
    }
  }

  private emitLocator(immediate = false) {
    if (!this.active) return;
    const record = this.records.get(this.currentIndex);
    const link = this.publication.readingOrder.items[this.currentIndex];
    if (!record || !link) return;
    const localFocus = Math.max(0, this.scroller.scrollTop + this.scroller.clientHeight * 0.5 - record.wrapper.offsetTop);
    const progression = clamp(localFocus / Math.max(1, record.height), 0, 1);
    this.currentLocatorValue = this.locatorForProgression(link.href, progression);
    if (this.locatorTimer !== null) window.clearTimeout(this.locatorTimer);
    if (immediate) {
      this.locatorTimer = null;
      this.callbacks.onLocator(this.currentLocatorValue);
      return;
    }
    this.locatorTimer = window.setTimeout(() => {
      this.locatorTimer = null;
      if (this.active && !this.destroyed) this.callbacks.onLocator(this.currentLocatorValue);
    }, 90);
  }

  private ensureWindow(center: number, waitForCenter: boolean): Promise<void> {
    if (waitForCenter) {
      if (this.windowTimer !== null) {
        window.clearTimeout(this.windowTimer);
        this.windowTimer = null;
      }
      this.pendingWindowCenter = null;
      const task = this.windowMutation.then(() => this.applyWindow(center, true));
      this.windowMutation = task.catch(() => {});
      return task;
    }
    this.pendingWindowCenter = center;
    if (this.windowTimer === null) {
      this.windowTimer = window.setTimeout(() => {
        this.windowTimer = null;
        const target = this.pendingWindowCenter;
        this.pendingWindowCenter = null;
        if (target === null || this.destroyed) return;
        this.windowMutation = this.windowMutation
          .then(() => this.applyWindow(target, false))
          .catch(() => {});
      }, 24);
    }
    return this.windowMutation;
  }

  private async applyWindow(center: number, waitForCenter: boolean) {
    this.mutationGeneration += 1;
    const start = Math.max(0, center - RESOURCE_RADIUS);
    const end = Math.min(this.publication.readingOrder.items.length - 1, center + RESOURCE_RADIUS);
    const additions: Promise<void>[] = [];
    for (let index = start; index <= end; index++) {
      if (!this.records.has(index)) additions.push(this.createRecord(index));
    }
    if (waitForCenter) {
      await Promise.all(additions);
    } else {
      await Promise.allSettled(additions);
    }
    if (this.destroyed) return;
    const keep = new Set<number>();
    for (let index = start; index <= end; index++) keep.add(index);
    for (const record of this.sortedRecords()) {
      if (keep.has(record.index) || this.records.size <= MAX_RESOURCES) continue;
      this.removeRecord(record);
    }
    this.publication.prefetchAroundHref(
      this.publication.readingOrder.items[center]?.href || '',
      RESOURCE_RADIUS + 1,
      0,
    ).catch(() => {});
  }

  private createRecord(index: number) {
    const wrapper = document.createElement('div');
    wrapper.className = 'zenith-resource-strip-item';
    wrapper.dataset.resourceIndex = String(index);
    wrapper.dataset.resourceHref = this.publication.readingOrder.items[index]?.href || '';
    wrapper.style.height = `${this.estimatedHeight()}px`;
    const iframe = document.createElement('iframe');
    iframe.className = 'zenith-resource-strip-frame';
    // Executable publication content is stripped by the resource manager.
    // Keeping this aligned with the navigator's same-origin frames avoids a
    // pair of WebView sandbox diagnostics for every warm resource.
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('aria-label', this.publication.readingOrder.items[index]?.title || `资源 ${index + 1}`);
    wrapper.appendChild(iframe);
    const next = this.sortedRecords().find((record) => record.index > index);
    const estimatedHeight = this.estimatedHeight();
    const insertingAboveViewport = Boolean(next && next.wrapper.offsetTop <= this.scroller.scrollTop + 1);
    this.content.insertBefore(wrapper, next?.wrapper || null);
    if (insertingAboveViewport) this.scroller.scrollTop += estimatedHeight;
    const record = {
      index,
      wrapper,
      iframe,
      height: estimatedHeight,
      loaded: false,
      loadPromise: Promise.resolve(),
    } as StripRecord;
    this.records.set(index, record);
    record.loadPromise = this.loadRecord(record);
    return record.loadPromise;
  }

  private async loadRecord(record: StripRecord) {
    const link = this.publication.readingOrder.items[record.index];
    if (!link || this.destroyed) return;
    const source = await this.publication.get(link).readAsString();
    if (!source || this.destroyed || this.records.get(record.index) !== record) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(`Resource strip frame timed out: ${link.href}`)), 2500);
      record.iframe.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      record.iframe.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error(`Resource strip frame failed: ${link.href}`));
      };
      record.iframe.srcdoc = source;
    });
    if (this.destroyed || this.records.get(record.index) !== record) return;
    const doc = record.iframe.contentDocument;
    if (!doc) return;
    await this.applyDocumentSettings(doc);
    this.installDocumentInteractions(record, doc);
    record.loaded = true;
    this.measureRecord(record);
    const fontSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
    fontSet?.ready.then(() => this.measureRecord(record)).catch(() => {});
    doc.querySelectorAll('img').forEach((image) => {
      if (!image.complete) image.addEventListener('load', () => this.measureRecord(record), { once: true });
    });
    record.resizeObserver = new ResizeObserver(() => this.measureRecord(record));
    if (doc.body) record.resizeObserver.observe(doc.body);
  }

  private installDocumentInteractions(record: StripRecord, doc: Document) {
    doc.addEventListener('click', (event) => {
      const target = event.target as Element | null;
      const image = target?.closest('img, image') as HTMLImageElement | SVGImageElement | null;
      if (image) {
        event.preventDefault();
        const src = image instanceof HTMLImageElement ? image.currentSrc || image.src : image.getAttribute('href') || '';
        if (src) this.callbacks.onImage({ src, name: image.getAttribute('alt') || image.getAttribute('title') || '插图' });
        return;
      }
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (anchor) {
        const rawHref = anchor.getAttribute('href') || '';
        if (rawHref.startsWith('#')) {
          event.preventDefault();
          const element = doc.getElementById(decodeURIComponent(rawHref.slice(1)));
          if (element) this.scroller.scrollTo({ top: record.wrapper.offsetTop + element.getBoundingClientRect().top, behavior: 'smooth' });
          return;
        }
        const resolvedHref = resolvePublicationHref(
          this.publication.readingOrder.items[record.index]?.href || '',
          rawHref,
        );
        const link = resolvedHref ? this.findReadingOrderLink(resolvedHref) : undefined;
        if (link) {
          event.preventDefault();
          const fragment = rawHref.includes('#') ? decodeURIComponent(rawHref.split('#')[1] || '') : '';
          const locator = fragment
            ? link.locator.copyWithLocations({ ...link.locator.locations, fragments: [fragment] })
            : link.locator;
          void this.go(locator, true);
          return;
        }
      }
      this.callbacks.onToggleChrome();
    });
  }

  private applyDocumentSettings(doc: Document) {
    return applyContinuousReaderDocumentStyles(doc, this.settings, this.bookType);
  }

  private measureRecord(record: StripRecord) {
    if (!record.loaded || this.destroyed) return;
    const doc = record.iframe.contentDocument;
    if (!doc) return;
    const oldHeight = record.height;
    const measured = Math.max(
      1,
      Math.ceil(doc.documentElement.scrollHeight || 0),
      Math.ceil(doc.body?.scrollHeight || 0),
      Math.ceil(doc.body?.getBoundingClientRect().height || 0),
    );
    if (Math.abs(measured - oldHeight) < 1) return;
    const aboveViewport = record.wrapper.offsetTop < this.scroller.scrollTop - 1;
    record.height = measured;
    record.wrapper.style.height = `${measured}px`;
    record.iframe.style.height = `${measured}px`;
    if (aboveViewport) this.scroller.scrollTop += measured - oldHeight;
  }

  private removeRecord(record: StripRecord) {
    const aboveViewport = record.wrapper.offsetTop < this.scroller.scrollTop;
    const height = record.wrapper.offsetHeight;
    record.resizeObserver?.disconnect();
    this.records.delete(record.index);
    record.wrapper.remove();
    if (aboveViewport) this.scroller.scrollTop = Math.max(0, this.scroller.scrollTop - height);
  }

  private async scrollToLocator(locator: ReadiumLocatorLike, smooth: boolean) {
    const index = this.indexForHref(locator.href);
    if (index === undefined) return;
    const record = this.records.get(index);
    if (!record) return;
    await record.loadPromise.catch(() => {});
    const fragments = locator.locations?.fragments as string[] | undefined;
    const fragment = fragments?.[0] || locator.href.split('#')[1];
    const locations = locator.locations as Record<string, unknown> & { getCssSelector?: () => string | undefined };
    const selector = typeof locations.getCssSelector === 'function'
      ? locations.getCssSelector()
      : typeof locations.cssSelector === 'string' ? locations.cssSelector : undefined;
    const doc = record.iframe.contentDocument;
    let element = fragment ? doc?.getElementById(decodeURIComponent(fragment)) : null;
    if (!element && selector) {
      try {
        element = doc?.querySelector(selector) || null;
      } catch {
        // Malformed selectors fall back to the resource progression.
      }
    }
    const progression = typeof locator.locations?.progression === 'number' ? locator.locations.progression : 0;
    const viewportY = typeof locations.zenithViewportY === 'number' ? locations.zenithViewportY : 0;
    const local = element
      ? element.getBoundingClientRect().top - viewportY * this.scroller.clientHeight
      : progression * record.height - viewportY * this.scroller.clientHeight;
    this.scroller.scrollTo({ top: Math.max(0, record.wrapper.offsetTop + local), behavior: smooth ? 'smooth' : 'auto' });
  }

  private indexForHref(href?: string) {
    if (!href) return undefined;
    const index = this.publication.readingOrder.findIndexWithHref(href);
    return index >= 0 ? index : undefined;
  }

  private findReadingOrderLink(href: string) {
    const direct = this.publication.readingOrder.findWithHref(href);
    if (direct) return direct;
    const normalized = normalizeResourcePath(href);
    const basename = normalized.split('/').at(-1);
    const suffixMatches = this.publication.readingOrder.items.filter((link) => {
      const candidate = normalizeResourcePath(link.href);
      return candidate.endsWith(`/${normalized}`) || candidate === normalized;
    });
    if (suffixMatches.length === 1) return suffixMatches[0];
    const basenameMatches = basename
      ? this.publication.readingOrder.items.filter((link) => normalizeResourcePath(link.href).split('/').at(-1) === basename)
      : [];
    return basenameMatches.length === 1 ? basenameMatches[0] : undefined;
  }

  private locatorForProgression(href: string, progression: number) {
    const normalized = this.publication.readingOrder.findWithHref(href)?.href || href.split('#')[0];
    const range = this.positionRanges.get(normalized) || [];
    const selected = range[Math.min(range.length - 1, Math.max(0, Math.floor(progression * range.length)))]
      || this.publication.readingOrder.findWithHref(normalized)?.locator
      || this.currentLocatorValue;
    return selected.copyWithLocations({
      ...selected.locations,
      progression,
    });
  }

  private sortedRecords() {
    return Array.from(this.records.values()).sort((a, b) => a.index - b.index);
  }

  private minimumIndex() {
    return this.sortedRecords()[0]?.index ?? this.currentIndex;
  }

  private maximumIndex() {
    return this.sortedRecords().at(-1)?.index ?? this.currentIndex;
  }

  private estimatedHeight() {
    const loaded = this.sortedRecords().filter((record) => record.loaded);
    if (loaded.length === 0) return Math.max(DEFAULT_RESOURCE_HEIGHT, this.scroller.clientHeight * 1.5);
    return loaded.reduce((sum, record) => sum + record.height, 0) / loaded.length;
  }

  private applyHostTheme() {
    const colors = readerThemeColors(this.settings.theme);
    this.host.style.background = colors.background;
    this.scroller.style.background = colors.background;
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function resolvePublicationHref(baseHref: string, href: string) {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return undefined;
  try {
    const resolved = new URL(href, new URL(baseHref, 'https://zenith.invalid/'));
    return decodeURIComponent(resolved.pathname.replace(/^\//, ''));
  } catch {
    return undefined;
  }
}

function normalizeResourcePath(href: string) {
  return decodeURIComponent(href.split('#')[0])
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .toLowerCase();
}

function distanceToElement(element: HTMLElement, y: number) {
  const rect = element.getBoundingClientRect();
  return Math.abs((rect.top + rect.bottom) * 0.5 - y);
}

function cssSelector(element: HTMLElement) {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current?.parentElement && current !== current.ownerDocument.body) {
    const siblings = Array.from(current.parentElement.children).filter((item) => item.tagName === current!.tagName);
    const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : '';
    parts.unshift(`${current.tagName.toLowerCase()}${suffix}`);
    current = current.parentElement;
  }
  return parts.length > 0 ? `body > ${parts.join(' > ')}` : 'body';
}

function nextPaint(frames = 1): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => requestAnimationFrame(() => remaining > 1 ? step(remaining - 1) : resolve());
    step(frames);
  });
}

function waitForScrollCompletion(element: HTMLElement) {
  return new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      element.removeEventListener('scrollend', finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, 900);
    element.addEventListener('scrollend', finish, { once: true });
  });
}
