import { AppSettings, BookType } from '../types';
import { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';
import { readerThemeColors } from './readerDocumentStyles';
import { cancelReaderIdle, ReaderIdleHandle, scheduleReaderIdle } from './readerScheduler';
import { readerRuntimePolicy } from './readerRuntimePolicy';
import { clamp, nextPaint, settleWithConcurrency, waitForScrollCompletion } from './continuousResourceDom';
import {
  buildPositionRanges,
  indexForHref,
  locatorForProgression,
  scrollToResourceLocator,
  snapshotResourceLocator,
  sortedRecords,
} from './continuousResourceLocator';
import { applyDocumentSettings, createRecord, defaultResourceHeight, measureRecord, removeRecord } from './continuousResourceRecords';
import { StripCallbacks, StripRecord, StripRecordEnvironment } from './continuousResourceStripTypes';

export class ContinuousResourceStrip {
  private scroller: HTMLDivElement;
  private content: HTMLDivElement;
  private topSpacer: HTMLDivElement;
  private bottomSpacer: HTMLDivElement;
  private records = new Map<number, StripRecord>();
  private resourceHeights = new Map<number, number>();
  private settings: AppSettings;
  private active = false;
  private destroyed = false;
  private currentIndex = 0;
  private currentLocatorValue: ReadiumLocatorLike;
  private scrollRaf: number | null = null;
  private locatorTimer: number | null = null;
  private mutationGeneration = 0;
  private positionRanges: Map<string, ReadiumLocatorLike[]>;
  private windowMutation: Promise<void> = Promise.resolve();
  private pendingWindowCenter: number | null = null;
  private windowTimer: number | null = null;
  private windowIdle: ReaderIdleHandle | null = null;
  private runtimePolicy = readerRuntimePolicy();
  private resourceRadius = this.runtimePolicy.continuousResourceRadius;
  private programmaticScroll = false;
  private layoutGeneration = 0;
  private recordEnvironment: StripRecordEnvironment;

  constructor(
    private host: HTMLElement,
    private publication: ReadiumPublicationLike,
    settings: AppSettings,
    private bookType: BookType,
    private callbacks: StripCallbacks,
  ) {
    this.settings = settings;
    this.positionRanges = buildPositionRanges(publication);
    const first = publication.readingOrder.items[0]?.locator || publication.positions[0];
    this.currentLocatorValue = first;
    this.scroller = document.createElement('div');
    this.scroller.className = 'zenith-resource-strip-scroller';
    this.content = document.createElement('div');
    this.content.className = 'zenith-resource-strip-content';
    this.topSpacer = document.createElement('div');
    this.topSpacer.className = 'zenith-resource-strip-spacer';
    this.bottomSpacer = document.createElement('div');
    this.bottomSpacer.className = 'zenith-resource-strip-spacer';
    this.content.append(this.topSpacer, this.bottomSpacer);
    this.scroller.appendChild(this.content);
    this.host.replaceChildren(this.scroller);
    this.recordEnvironment = {
      publication: this.publication,
      scroller: this.scroller,
      content: this.content,
      records: this.records,
      callbacks: this.callbacks,
      settings: () => this.settings,
      bookType: this.bookType,
      destroyed: () => this.destroyed,
      go: (locator, smooth) => this.go(locator, smooth),
      estimatedHeight: (index) => this.estimatedHeight(index),
      onRecordHeightChange: (record) => {
        this.resourceHeights.set(record.index, record.height);
        this.refreshSpacers();
      },
      bottomSpacer: this.bottomSpacer,
    };
    this.scroller.addEventListener('scroll', this.handleScroll, { passive: true });
    this.scroller.addEventListener('click', this.handleBackgroundClick);
    this.applyHostTheme();
  }

  get currentLocator() { return this.currentLocatorValue; }

  get currentDocument() {
    return this.records.get(this.currentIndex)?.iframe.contentDocument || undefined;
  }

  snapshotLocator() {
    return snapshotResourceLocator(
      this.publication,
      this.positionRanges,
      this.currentLocatorValue,
      this.currentIndex,
      this.scroller,
      this.records,
    );
  }

  updatePositions() {
    this.positionRanges = buildPositionRanges(this.publication);
  }

  async mount(locator?: ReadiumLocatorLike) {
    if (this.destroyed) return;
    const target = locator || this.currentLocatorValue;
    const index = indexForHref(this.publication, target?.href) ?? 0;
    this.currentIndex = index;
    this.currentLocatorValue = target || this.publication.readingOrder.items[index].locator;
    // First paint waits only for the visible resource; the L1 band fills later.
    const current = this.records.get(index);
    if (current) await current.loadPromise;
    else await createRecord(this.recordEnvironment, index);
    if (this.destroyed) return;
    this.resourceHeights.set(index, this.records.get(index)?.height || this.estimatedHeight(index));
    this.refreshSpacers();
    await this.scrollToLocator(this.currentLocatorValue, false);
    this.emitLocator(true);
    void this.ensureWindow(index, false);
  }

  setActive(active: boolean) {
    this.active = active;
    this.host.classList.toggle('zenith-resource-strip-active', active);
    this.host.setAttribute('aria-hidden', active ? 'false' : 'true');
    cancelReaderIdle(this.windowIdle);
    this.windowIdle = null;
    if (active) {
      void this.ensureWindow(this.currentIndex, false);
    }
  }

  async updateSettings(settings: AppSettings, anchor = this.snapshotLocator()) {
    const generation = ++this.layoutGeneration;
    this.settings = settings;
    this.applyHostTheme();
    await Promise.all(Array.from(this.records.values(), async (record) => {
      const doc = record.iframe.contentDocument;
      if (!doc) return;
      await applyDocumentSettings(this.recordEnvironment, doc);
      measureRecord(this.recordEnvironment, record);
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
    const index = indexForHref(this.publication, locator.href);
    if (index === undefined) return false;
    const shouldSmooth = smooth && this.currentIndex === index;
    this.currentIndex = index;
    this.currentLocatorValue = locator;
    const current = this.records.get(index);
    if (current) await current.loadPromise.catch(() => {});
    else await createRecord(this.recordEnvironment, index).catch(() => {});
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    await this.ensureWindow(index, true);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    // Cross-resource jumps stay atomic because window rebalancing can stop a
    // WebView smooth scroll short; local fragment jumps remain animated.
    this.programmaticScroll = shouldSmooth;
    await this.scrollToLocator(locator, shouldSmooth);
    if (shouldSmooth) await waitForScrollCompletion(this.scroller);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    this.programmaticScroll = false;
    this.emitLocator(true);
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
    cancelReaderIdle(this.windowIdle);
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
    let selected = sortedRecords(this.records)[0];
    for (const record of sortedRecords(this.records)) {
      if (record.wrapper.offsetTop <= focus) selected = record;
      if (record.wrapper.offsetTop + record.wrapper.offsetHeight > focus) break;
    }
    if (!selected) return;
    const changed = selected.index !== this.currentIndex;
    this.currentIndex = selected.index;
    this.emitLocator(changed);
    const minimum = sortedRecords(this.records)[0]?.index ?? this.currentIndex;
    const maximum = sortedRecords(this.records).at(-1)?.index ?? this.currentIndex;
    if (!this.programmaticScroll && (changed || selected.index <= minimum + 1 || selected.index >= maximum - 1)) {
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
    this.currentLocatorValue = locatorForProgression(
      this.publication, this.positionRanges, this.currentLocatorValue, link.href, progression,
    );
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
      if (this.windowTimer !== null) window.clearTimeout(this.windowTimer);
      this.windowTimer = null;
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
        this.windowMutation = this.windowMutation.then(() => this.applyWindow(target, false)).catch(() => {});
      }, 24);
    }
    return this.windowMutation;
  }

  private async applyWindow(center: number, waitForCenter: boolean) {
    this.mutationGeneration += 1;
    const start = Math.max(0, center - this.resourceRadius);
    const end = Math.min(this.publication.readingOrder.items.length - 1, center + this.resourceRadius);
    const anchor = this.records.get(center);
    const anchorOffset = anchor ? this.scroller.scrollTop - anchor.wrapper.offsetTop : 0;
    const keep = new Set<number>();
    for (let index = start; index <= end; index++) keep.add(index);
    for (const record of sortedRecords(this.records)) {
      if (keep.has(record.index)) continue;
      this.resourceHeights.set(record.index, record.height);
      removeRecord(this.recordEnvironment, record);
    }
    this.refreshSpacers(start, end);
    const additions: Array<() => Promise<void>> = [];
    for (let index = start; index <= end; index++) {
      if (!this.records.has(index)) additions.push(() => createRecord(this.recordEnvironment, index));
    }
    if (this.runtimePolicy.desktop) {
      const tasks = additions.map((add) => add());
      if (waitForCenter) await Promise.all(tasks);
      else await Promise.allSettled(tasks);
    } else {
      await settleWithConcurrency(additions, this.runtimePolicy.framePreparationConcurrency, waitForCenter);
    }
    if (this.destroyed) return;
    this.refreshSpacers();
    const restoredAnchor = this.records.get(center);
    if (restoredAnchor) this.scroller.scrollTop = Math.max(0, restoredAnchor.wrapper.offsetTop + anchorOffset);
    this.publication.prefetchAroundHref(
      this.publication.readingOrder.items[center]?.href || '', this.resourceRadius + 1, 0,
    ).catch(() => {});
  }

  private scrollToLocator(locator: ReadiumLocatorLike, smooth: boolean) {
    return scrollToResourceLocator(this.publication, this.records, this.scroller, locator, smooth);
  }

  private applyHostTheme() {
    const colors = readerThemeColors(this.settings.theme);
    this.host.style.background = colors.background;
    this.scroller.style.background = colors.background;
  }

  private estimatedHeight(index: number) {
    const known = this.resourceHeights.get(index);
    if (known !== undefined) return known;
    const measured = Array.from(this.resourceHeights.values()).filter((height) => height > 0);
    return measured.length > 0
      ? measured.reduce((sum, height) => sum + height, 0) / measured.length
      : defaultResourceHeight(this.scroller);
  }

  private refreshSpacers(start?: number, end?: number) {
    const records = sortedRecords(this.records);
    const first = start ?? records[0]?.index ?? 0;
    const last = end ?? records.at(-1)?.index ?? -1;
    let top = 0;
    let bottom = 0;
    for (let index = 0; index < first; index++) top += this.estimatedHeight(index);
    for (let index = last + 1; index < this.publication.readingOrder.items.length; index++) {
      bottom += this.estimatedHeight(index);
    }
    this.topSpacer.style.height = `${Math.max(0, top)}px`;
    this.bottomSpacer.style.height = `${Math.max(0, bottom)}px`;
  }
}
