import { AppSettings, BookType } from '../types';
import { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';
import { readerThemeColors } from './readerDocumentStyles';
import { cancelReaderIdle, ReaderIdleHandle, scheduleReaderIdle, yieldReaderTask } from '../lib/readerScheduler';
import { readerRuntimePolicy } from './readerRuntimePolicy';
import { clamp, waitForScrollCompletion } from './continuousResourceDom';
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
import { ContinuousResourceGeometry } from './continuousResourceGeometry';

export class ContinuousResourceStrip {
  private scroller: HTMLDivElement;
  private content: HTMLDivElement;
  private topSpacer: HTMLDivElement;
  private bottomSpacer: HTMLDivElement;
  private records = new Map<number, StripRecord>();
  private geometry: ContinuousResourceGeometry;
  private settings: AppSettings;
  private active = false;
  private destroyed = false;
  private currentIndex = 0;
  private currentLocatorValue: ReadiumLocatorLike;
  private scrollRaf: number | null = null;
  private locatorTimer: number | null = null;
  private mutationGeneration = 0;
  private positionRanges: Map<string, ReadiumLocatorLike[]>;
  private pendingWindowCenter: number | null = null;
  private pendingWindowGeneration = 0;
  private windowTimer: number | null = null;
  private windowIdle: ReaderIdleHandle | null = null;
  private runtimePolicy = readerRuntimePolicy();
  private programmaticScroll = false;
  private layoutGeneration = 0;
  private predictedDirection: -1 | 0 | 1 = 1;
  private predictedScreens = 3;
  private lastScrollTop = 0;
  private lastScrollAt = performance.now();
  private lastWindowRequestTop = 0;
  private turnTargetTop: number | null = null;
  private turnTargetAnchor: { index: number; local: number } | null = null;
  private turnTimer: number | null = null;
  private turnGeneration = 0;
  private stableViewportAnchor?: { index: number; id: string; txtOffset?: string; viewportOffset: number };
  private stableAnchorLocked = false;
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
    const baseline = Math.max(1600, this.host.clientHeight * 1.5);
    const positionCounts = publication.readingOrder.items.map((link) => Math.max(1, publication.positions.filter((position) => (
      publication.readingOrder.findWithHref(position.href)?.href === link.href
    )).length));
    const median = [...positionCounts].sort((a, b) => a - b)[Math.floor(positionCounts.length / 2)] || 1;
    this.geometry = new ContinuousResourceGeometry(
      publication.readingOrder.items.length,
      positionCounts.map((count) => baseline * count / median),
    );
    this.refreshGeometry();
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
      positionRecord: (record) => this.positionRecord(record),
      onRecordHeightChange: (record, previousHeight) => {
        const anchor = this.captureTopAnchor();
        const turnAnchor = this.turnTargetAnchor;
        this.geometry.setHeight(record.index, record.height);
        this.positionRecords();
        this.refreshGeometry();
        this.restoreTopAnchor(anchor, record.index, previousHeight);
        if (turnAnchor) {
          this.turnTargetTop = clamp(
            this.geometry.top(turnAnchor.index) + turnAnchor.local,
            0,
            Math.max(0, this.geometry.total() - this.scroller.clientHeight),
          );
          this.scroller.scrollTo({ top: this.turnTargetTop, behavior: 'smooth' });
        }
        if (this.active) this.emitLocator(true);
      },
      bottomSpacer: this.bottomSpacer,
    };
    this.scroller.addEventListener('scroll', this.handleScroll, { passive: true });
    this.scroller.addEventListener('click', this.handleBackgroundClick);
    this.scroller.addEventListener('wheel', this.unlockStableAnchor, { passive: true });
    this.scroller.addEventListener('pointerdown', this.unlockStableAnchor, { passive: true });
    this.applyHostTheme();
  }

  get currentLocator() { return this.currentLocatorValue; }

  get currentDocument() {
    return this.records.get(this.currentIndex)?.iframe.contentDocument || undefined;
  }

  get pageMetrics() {
    const viewport = Math.max(1, this.scroller.clientHeight);
    const record = this.records.get(this.currentIndex);
    const localOffset = record
      ? clamp(this.scroller.scrollTop - this.geometry.top(this.currentIndex), 0, Math.max(0, record.height - 1))
      : 0;
    const resourceHeight = record?.height || this.estimatedHeight(this.currentIndex);
    const textRange = this.publication.textRangeForHref?.(this.publication.readingOrder.items[this.currentIndex]?.href || '');
    const txtOffset = this.currentLocatorValue.locations.txtOffset;
    if (textRange && this.publication.textLength && typeof txtOffset === 'number') {
      const screensPerCharacter = resourceHeight / viewport / Math.max(1, textRange.end - textRange.start);
      const publicationTotal = Math.max(1, Math.ceil(this.publication.textLength * screensPerCharacter));
      return {
        resourceCurrent: Math.floor(Math.max(0, txtOffset - textRange.start) * screensPerCharacter) + 1,
        resourceTotal: Math.max(1, Math.ceil((textRange.end - textRange.start) * screensPerCharacter)),
        publicationCurrent: Math.max(1, Math.min(publicationTotal, Math.floor(txtOffset * screensPerCharacter) + 1)),
        publicationTotal,
      };
    }
    let precedingHeight = 0;
    let totalHeight = 0;
    for (let index = 0; index < this.publication.readingOrder.items.length; index++) {
      const height = this.geometry.height(index);
      if (index < this.currentIndex) precedingHeight += height;
      totalHeight += height;
    }
    return {
      resourceCurrent: Math.floor(localOffset / viewport) + 1,
      resourceTotal: Math.max(1, Math.ceil(resourceHeight / viewport)),
      publicationCurrent: Math.min(Math.max(1, Math.ceil(totalHeight / viewport)), Math.floor((precedingHeight + localOffset) / viewport) + 1),
      publicationTotal: Math.max(1, Math.ceil(totalHeight / viewport)),
    };
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
    // The first visible frame is not exposed until its following viewport is real
    // content. Spacers represent distant resources, never the next reader page.
    const current = this.records.get(index);
    if (current) await current.loadPromise;
    else await createRecord(this.recordEnvironment, index);
    if (this.destroyed) return;
    this.positionRecords();
    this.refreshGeometry();
    await this.scrollToLocator(this.currentLocatorValue, false);
    this.resetScrollSample();
    void this.ensureWindow(index, false);
    this.emitLocator(true);
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

  captureViewportAnchor() {
    return this.captureLiveViewportAnchor() || this.stableViewportAnchor;
  }

  stableTopAnchor() {
    return this.stableViewportAnchor;
  }

  private captureLiveViewportAnchor() {
    const viewportTop = this.scroller.getBoundingClientRect().top;
    const current = this.geometry.indexAt(this.scroller.scrollTop + 1);
    const candidates = [this.records.get(current), this.records.get(current + 1)].filter((record): record is StripRecord => Boolean(record));
    for (const record of candidates) {
      const frameTop = record.iframe.getBoundingClientRect().top;
      const elements = Array.from(record.iframe.contentDocument?.querySelectorAll<HTMLElement>('[data-txt-start], [id]') || []);
      const element = elements.find((candidate) => frameTop + candidate.getBoundingClientRect().top >= viewportTop)
        || elements.find((candidate) => frameTop + candidate.getBoundingClientRect().bottom > viewportTop);
      if (!element) continue;
      return {
        index: record.index,
        id: element.id,
        txtOffset: element.dataset.txtStart,
        viewportOffset: frameTop + element.getBoundingClientRect().top - viewportTop,
      };
    }
    return undefined;
  }

  async updateSettings(settings: AppSettings, anchor = this.snapshotLocator(), viewportAnchor = this.captureViewportAnchor()) {
    const generation = ++this.layoutGeneration;
    this.stableAnchorLocked = true;
    this.turnGeneration += 1;
    if (this.turnTimer !== null) window.clearTimeout(this.turnTimer);
    this.turnTimer = null;
    this.turnTargetTop = null;
    this.turnTargetAnchor = null;
    this.scroller.scrollTo({ top: this.scroller.scrollTop, behavior: 'auto' });
    this.settings = settings;
    this.applyHostTheme();
    const current = this.records.get(this.currentIndex);
    const currentDoc = current?.iframe.contentDocument;
    if (current && currentDoc) {
      await applyDocumentSettings(this.recordEnvironment, currentDoc);
      measureRecord(this.recordEnvironment, current);
    }
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    if (!this.restoreViewportAnchor(viewportAnchor)) await this.scrollToLocator(anchor, false);
    this.resetScrollSample();
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    this.currentLocatorValue = anchor;
    this.emitLocator(true);
    void Promise.all(Array.from(this.records.values()).filter((record) => record !== current).map(async (record) => {
      await yieldReaderTask('background', { timeout: 80 }).catch(() => {});
      if (this.destroyed || generation !== this.layoutGeneration || this.records.get(record.index) !== record) return;
      const doc = record.iframe.contentDocument;
      if (!doc) return;
      await applyDocumentSettings(this.recordEnvironment, doc);
      if (this.destroyed || generation !== this.layoutGeneration || this.records.get(record.index) !== record) return;
      measureRecord(this.recordEnvironment, record);
    })).then(() => {
      if (!this.destroyed && generation === this.layoutGeneration) void this.ensureWindow(this.currentIndex, false);
    });
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
    // Cross-resource jumps stay atomic because window rebalancing can stop a
    // WebView smooth scroll short; local fragment jumps remain animated.
    this.programmaticScroll = shouldSmooth;
    await this.scrollToLocator(locator, shouldSmooth);
    if (shouldSmooth) await waitForScrollCompletion(this.scroller);
    if (this.destroyed || generation !== this.layoutGeneration) return false;
    this.programmaticScroll = false;
    this.resetScrollSample();
    this.emitLocator(true);
    void this.ensureWindow(index, false);
    return true;
  }

  turn(direction: -1 | 1) {
    if (!this.active || this.destroyed) return;
    this.setPredictedDirection(direction);
    this.stableAnchorLocked = false;
    this.predictedScreens = Math.max(this.predictedScreens, 5);
    const distance = Math.max(1, this.scroller.clientHeight) * direction;
    const base = this.turnTargetTop ?? this.scroller.scrollTop;
    this.turnTargetTop = clamp(base + distance, 0, Math.max(0, this.geometry.total() - this.scroller.clientHeight));
    const target = this.turnTargetTop;
    const turnGeneration = ++this.turnGeneration;
    const targetStart = this.geometry.indexAt(target);
    this.turnTargetAnchor = { index: targetStart, local: target - this.geometry.top(targetStart) };
    const targetEnd = this.geometry.indexAt(Math.min(this.geometry.total() - 1, target + this.scroller.clientHeight));
    const ready = this.rangeReady(targetStart, targetEnd);
    if (ready) this.commitTurn(turnGeneration);
    else void this.ensureRecordRange(targetStart, targetEnd).then(() => {
      if (turnGeneration === this.turnGeneration) this.commitTurn(turnGeneration);
    }).catch(() => {
      if (turnGeneration !== this.turnGeneration) return;
      this.turnTargetTop = null;
      this.turnTargetAnchor = null;
    });
    if (this.turnTimer !== null) window.clearTimeout(this.turnTimer);
    void this.ensureWindow(this.currentIndex, false);
  }

  destroy() {
    this.destroyed = true;
    this.layoutGeneration += 1;
    this.turnGeneration += 1;
    this.mutationGeneration += 1;
    if (this.scrollRaf !== null) cancelAnimationFrame(this.scrollRaf);
    if (this.locatorTimer !== null) window.clearTimeout(this.locatorTimer);
    if (this.windowTimer !== null) window.clearTimeout(this.windowTimer);
    if (this.turnTimer !== null) window.clearTimeout(this.turnTimer);
    cancelReaderIdle(this.windowIdle);
    this.scroller.removeEventListener('scroll', this.handleScroll);
    this.scroller.removeEventListener('click', this.handleBackgroundClick);
    this.scroller.removeEventListener('wheel', this.unlockStableAnchor);
    this.scroller.removeEventListener('pointerdown', this.unlockStableAnchor);
    for (const record of Array.from(this.records.values())) removeRecord(this.recordEnvironment, record);
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

  private unlockStableAnchor = () => {
    this.stableAnchorLocked = false;
  };

  private updateCurrentFromScroll() {
    if (this.destroyed || this.records.size === 0) return;
    if (!this.stableAnchorLocked) {
      this.stableViewportAnchor = this.captureLiveViewportAnchor() || this.stableViewportAnchor;
    }
    this.updateScrollPrediction();
    const focus = this.scroller.scrollTop + 1;
    const selectedIndex = this.geometry.indexAt(focus);
    const changed = selectedIndex !== this.currentIndex;
    this.currentIndex = selectedIndex;
    this.emitLocator(changed, false);
    const minimum = sortedRecords(this.records)[0]?.index ?? this.currentIndex;
    const maximum = sortedRecords(this.records).at(-1)?.index ?? this.currentIndex;
    const predictionAdvanced = Math.abs(this.scroller.scrollTop - this.lastWindowRequestTop)
      >= this.scroller.clientHeight * 0.35;
    if (!this.programmaticScroll && (
      changed || predictionAdvanced || selectedIndex <= minimum + 1 || selectedIndex >= maximum - 1
    )) {
      this.lastWindowRequestTop = this.scroller.scrollTop;
      void this.ensureWindow(selectedIndex, false);
    }
  }

  private updateScrollPrediction() {
    const now = performance.now();
    const top = this.scroller.scrollTop;
    const delta = top - this.lastScrollTop;
    const elapsed = Math.max(8, now - this.lastScrollAt);
    this.lastScrollTop = top;
    this.lastScrollAt = now;
    if (Math.abs(delta) < 1) return;
    this.setPredictedDirection(delta > 0 ? 1 : -1);
    const screensPerSecond = Math.abs(delta) / Math.max(1, this.scroller.clientHeight) * 1000 / elapsed;
    const maximum = this.runtimePolicy.constrained ? 5 : this.runtimePolicy.desktop ? 10 : 7;
    this.predictedScreens = clamp(3 + Math.ceil(screensPerSecond * 0.75), 3, maximum);
  }

  private resetScrollSample() {
    this.lastScrollTop = this.scroller.scrollTop;
    this.lastWindowRequestTop = this.scroller.scrollTop;
    this.lastScrollAt = performance.now();
  }

  private setPredictedDirection(direction: -1 | 1) {
    if (this.predictedDirection !== direction) this.publication.advancePrefetchGeneration();
    this.predictedDirection = direction;
  }

  private emitLocator(immediate = false, semantic = immediate) {
    if (!this.active) return;
    if (semantic && this.records.has(this.currentIndex)) {
      this.currentLocatorValue = snapshotResourceLocator(
        this.publication, this.positionRanges, this.currentLocatorValue,
        this.currentIndex, this.scroller, this.records,
      );
    } else {
      const link = this.publication.readingOrder.items[this.currentIndex];
      if (!link) return;
      const local = this.scroller.scrollTop - this.geometry.top(this.currentIndex);
      this.currentLocatorValue = locatorForProgression(
        this.publication, this.positionRanges, this.currentLocatorValue, link.href,
        clamp(local / this.geometry.height(this.currentIndex), 0, 1),
      );
    }
    if (this.locatorTimer !== null) window.clearTimeout(this.locatorTimer);
    if (immediate) {
      this.locatorTimer = null;
      if (!this.stableAnchorLocked) {
        this.stableViewportAnchor = this.captureLiveViewportAnchor() || this.stableViewportAnchor;
      }
      this.callbacks.onLocator(this.currentLocatorValue);
      return;
    }
    this.locatorTimer = window.setTimeout(() => {
      this.locatorTimer = null;
      if (this.active && !this.destroyed) {
        if (!this.stableAnchorLocked) {
          this.stableViewportAnchor = this.captureLiveViewportAnchor() || this.stableViewportAnchor;
        }
        this.callbacks.onLocator(this.currentLocatorValue);
      }
    }, 90);
  }

  private ensureWindow(center: number, waitForCenter: boolean): Promise<void> {
    const generation = ++this.mutationGeneration;
    if (waitForCenter) {
      if (this.windowTimer !== null) window.clearTimeout(this.windowTimer);
      this.windowTimer = null;
      this.pendingWindowCenter = null;
      return this.applyWindow(center, true, generation);
    }
    this.pendingWindowCenter = center;
    this.pendingWindowGeneration = generation;
    if (this.windowTimer === null) {
      this.windowTimer = window.setTimeout(() => {
        this.windowTimer = null;
        const target = this.pendingWindowCenter;
        const targetGeneration = this.pendingWindowGeneration;
        this.pendingWindowCenter = null;
        if (target === null || this.destroyed) return;
        void this.applyWindow(target, false, targetGeneration).catch(() => {});
      }, 24);
    }
    return Promise.resolve();
  }

  private async applyWindow(center: number, waitForCenter: boolean, generation: number) {
    if (this.destroyed || generation !== this.mutationGeneration) return;
    const viewportTop = this.scroller.scrollTop;
    const viewportBottom = viewportTop + this.scroller.clientHeight;
    const behind = this.predictedDirection < 0 ? this.predictedScreens : 2;
    const ahead = this.predictedDirection >= 0 ? this.predictedScreens : 2;
    let start = this.geometry.indexAt(Math.max(0, viewportTop - this.scroller.clientHeight * behind));
    let end = this.geometry.indexAt(Math.min(this.geometry.total() - 1, viewportBottom + this.scroller.clientHeight * ahead));
    start = Math.min(start, center);
    end = Math.max(end, center);
    const limit = this.runtimePolicy.continuousResourceLimit;
    const visibleStart = this.geometry.indexAt(viewportTop);
    const visibleEnd = this.geometry.indexAt(Math.min(this.geometry.total() - 1, viewportBottom));
    const effectiveLimit = Math.max(limit, visibleEnd - visibleStart + 1);
    while (end - start + 1 > effectiveLimit) {
      if (this.predictedDirection < 0 && end > Math.max(center, visibleEnd)) end -= 1;
      else if (this.predictedDirection >= 0 && start < Math.min(center, visibleStart)) start += 1;
      else if (end > Math.max(center, visibleEnd)) end -= 1;
      else if (start < Math.min(center, visibleStart)) start += 1;
      else break;
    }
    void this.publication.prepareResourceWindow({
      startIndex: start,
      endIndex: end,
      centerIndex: center,
      direction: this.predictedDirection,
      generation,
    }).catch(() => {});
    const keep = new Set<number>();
    for (let index = start; index <= end; index++) keep.add(index);
    if (this.turnTargetTop !== null) {
      const targetStart = this.geometry.indexAt(this.turnTargetTop);
      const targetEnd = this.geometry.indexAt(Math.min(this.geometry.total() - 1, this.turnTargetTop + this.scroller.clientHeight));
      for (let index = targetStart; index <= targetEnd; index++) keep.add(index);
    }
    for (const record of sortedRecords(this.records)) {
      if (keep.has(record.index)) continue;
      removeRecord(this.recordEnvironment, record);
    }
    this.refreshGeometry();
    const additions: Array<{ index: number; run: () => Promise<void> }> = [];
    for (let index = start; index <= end; index++) {
      if (!this.records.has(index)) additions.push({ index, run: () => createRecord(this.recordEnvironment, index) });
    }
    additions.sort((left, right) => {
      const leftAhead = (left.index - center) * this.predictedDirection >= 0;
      const rightAhead = (right.index - center) * this.predictedDirection >= 0;
      if (leftAhead !== rightAhead) return leftAhead ? -1 : 1;
      return Math.abs(left.index - center) - Math.abs(right.index - center);
    });
    const centerTask = additions.find((addition) => addition.index === center);
    if (waitForCenter && centerTask) await centerTask.run().catch(() => {});
    const background = additions.filter((addition) => addition !== centerTask);
    void this.loadRecordsInBackground(background.map((addition) => addition.run), generation);
    if (this.destroyed || generation !== this.mutationGeneration) return;
    this.positionRecords();
    this.refreshGeometry();
    // The predicted direction gets a velocity-scaled runway of real DOM. The
    // opposite direction stays warm so reversing direction remains immediate.
    const requiredBottom = () => this.scroller.scrollTop + this.scroller.clientHeight * ahead;
    if (this.predictedDirection >= 0) void this.extendForwardRunway(start, end, limit, requiredBottom, generation);
    this.refreshGeometry();
  }

  private async loadRecordsInBackground(tasks: Array<() => Promise<void>>, generation: number) {
    const pending = tasks.entries();
    const worker = async () => {
      for (let next = pending.next(); !next.done && generation === this.mutationGeneration; next = pending.next()) {
        await yieldReaderTask('background', { timeout: 80 }).catch(() => {});
        if (generation !== this.mutationGeneration) break;
        await next.value[1]().catch(() => {});
      }
    };
    await Promise.all(Array.from({ length: Math.min(tasks.length, this.runtimePolicy.framePreparationConcurrency) }, worker));
  }

  private async extendForwardRunway(start: number, initialEnd: number, limit: number, requiredBottom: () => number, generation: number) {
    let end = initialEnd;
    while (!this.destroyed && generation === this.mutationGeneration
      && end < this.publication.readingOrder.items.length - 1 && end - start + 1 < limit) {
      const last = this.records.get(end);
      if (last?.loaded && this.geometry.top(end) + last.height >= requiredBottom()) break;
      end += 1;
      await createRecord(this.recordEnvironment, end).catch(() => {});
      this.positionRecords();
      this.refreshGeometry();
    }
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
    return this.geometry?.height(index) || defaultResourceHeight(this.scroller);
  }

  private positionRecord(record: StripRecord) {
    record.wrapper.style.top = `${this.geometry.top(record.index)}px`;
  }

  private positionRecords() {
    for (const record of this.records.values()) this.positionRecord(record);
  }

  private refreshGeometry() {
    this.content.style.height = `${Math.max(1, this.geometry.total())}px`;
  }

  private captureTopAnchor() {
    const index = this.geometry.indexAt(this.scroller.scrollTop + 1);
    return { index, local: this.scroller.scrollTop - this.geometry.top(index) };
  }

  private restoreViewportAnchor(anchor?: { index: number; id: string; txtOffset?: string; viewportOffset: number }) {
    if (!anchor) return false;
    const record = this.records.get(anchor.index);
    const doc = record?.iframe.contentDocument;
    if (!record || !doc) return false;
    const element = anchor.id ? doc.getElementById(anchor.id) : anchor.txtOffset
      ? doc.querySelector<HTMLElement>(`[data-txt-start="${CSS.escape(anchor.txtOffset)}"]`)
      : null;
    if (!element) return false;
    const contentTop = this.geometry.top(record.index) + element.getBoundingClientRect().top;
    this.scroller.scrollTop = clamp(
      contentTop - anchor.viewportOffset,
      0,
      Math.max(0, this.geometry.total() - this.scroller.clientHeight),
    );
    this.stableViewportAnchor = anchor;
    return true;
  }

  private restoreTopAnchor(anchor: { index: number; local: number }, changedIndex: number, previousHeight?: number) {
    if (previousHeight !== undefined && changedIndex >= anchor.index) return;
    this.scroller.scrollTop = clamp(
      this.geometry.top(anchor.index) + anchor.local,
      0,
      Math.max(0, this.geometry.total() - this.scroller.clientHeight),
    );
  }

  private rangeReady(start: number, end: number) {
    for (let index = start; index <= end; index++) {
      if (!this.records.get(index)?.layoutReady) return false;
    }
    return true;
  }

  private async ensureRecordRange(start: number, end: number) {
    const failures: number[] = [];
    await Promise.all(Array.from({ length: end - start + 1 }, async (_, offset) => {
      const index = start + offset;
      try {
        await createRecord(this.recordEnvironment, index);
        await this.records.get(index)?.readyPromise;
      } catch { failures.push(index); }
    }));
    for (const index of failures) {
      await createRecord(this.recordEnvironment, index);
      await this.records.get(index)?.readyPromise;
    }
    this.positionRecords();
    this.refreshGeometry();
  }

  private commitTurn(generation: number) {
    if (generation !== this.turnGeneration || this.turnTargetTop === null || !this.active || this.destroyed) return;
    this.scroller.scrollTo({ top: this.turnTargetTop, behavior: 'smooth' });
    if (this.turnTimer !== null) window.clearTimeout(this.turnTimer);
    this.turnTimer = window.setTimeout(() => {
      if (generation !== this.turnGeneration) return;
      this.turnTimer = null;
      this.turnTargetTop = null;
      this.turnTargetAnchor = null;
      this.emitLocator(true);
    }, 900);
  }
}
