import { useEffect } from 'react';
import { EpubNavigator, type ReadiumLocator } from '../vendor/readium-navigator';
import type { AppSettings, Book, ReaderTocItem } from '../types';
import { createReaderPublication } from './readerPublication';
import { createReaderLayoutKey } from './readerLayoutCache';
import { cancelReaderIdle, scheduleReaderIdle, type ReaderIdleHandle } from './readerScheduler';
import { recordReaderMetric } from './readerPerformance';
import { ContinuousResourceStrip } from './continuousResourceStrip';
import { getProgress, saveProgress } from './storage';
import {
  deserializeReadiumLocator, progressionFromLocator, serializeReadiumLocator,
  type ReadiumLocatorLike, type ReadiumPublicationLike,
} from './readiumPublication';
import {
  createReadiumDefaults, createReadiumPreferences, currentTocItemId, isContinuousScroll,
  legacyProgressPosition, locatorFromVisibleTxtOffset, normalizeLocatorToPublicationPosition, toTocItems,
} from './readiumViewerModel';
import { createNavigatorCallbacks } from './readiumReaderNavigatorCallbacks';
import { applyReadiumFrameSettingsToNavigator, waitForCurrentFrameReadiness, waitForNextPaint } from './readiumFrameLayout';
import { currentReadiumFrame, getLiveReadiumIframe, isReadiumNavigationReady } from './readiumNavigatorAdapter';
import { waitUntil } from './readiumViewerNavigation';
import {
  formatEpubPageCounter, formatResourceStripPageCounter, revealReadiumFrames,
} from './readiumViewerPresentation';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';
import { cleanupReadiumReader } from './readiumReaderCleanup';

interface LifecycleOptions {
  book: Book;
  reloadToken: number;
  onTocChange: (items: ReaderTocItem[]) => void;
  setLoading: (value: boolean) => void;
  setLoadError: (value: string) => void;
  setPageCounter: (value: string) => void;
  setPreviewImage: (value: { src: string; name: string } | null) => void;
  setSaveStatus: (value: string) => void;
}

export function useReadiumReaderLifecycle(runtime: ReadiumReaderRuntime, options: LifecycleOptions) {
  const { book, reloadToken, onTocChange } = options;
  useEffect(() => {
    let cancelled = false;
    let pageCounterTimer: number | null = null;
    let tocIdleId: ReaderIdleHandle | null = null;
    const scheduleToc = (publication: ReadiumPublicationLike) => {
      cancelReaderIdle(tocIdleId);
      tocIdleId = scheduleReaderIdle(() => {
        tocIdleId = null;
        if (!cancelled && runtime.publicationRef.current === publication) onTocChange(toTocItems(publication));
      }, { timeout: 1600 });
    };
    const schedulePageCounter = (locator?: ReadiumLocator, delay = 16) => {
      if (!locator) return;
      if (pageCounterTimer !== null) window.clearTimeout(pageCounterTimer);
      pageCounterTimer = window.setTimeout(() => {
        pageCounterTimer = null;
        const navigator = runtime.navigatorRef.current;
        const publication = runtime.publicationRef.current;
        if (cancelled || !navigator || !publication) return;
        const strip = isContinuousScroll(runtime.settingsRef.current) ? runtime.resourceStripRef.current : null;
        if (strip) {
          const stripLocator = strip.snapshotLocator();
          options.setPageCounter(formatResourceStripPageCounter(stripLocator, publication, strip.pageMetrics));
          return;
        }
        const doc = getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentDocument || undefined;
        const semanticLocator = locatorFromVisibleTxtOffset(locator as unknown as ReadiumLocatorLike, publication, doc) as unknown as ReadiumLocator;
        options.setPageCounter(formatEpubPageCounter(navigator, semanticLocator, publication));
      }, delay);
    };
    runtime.pageCounterRefreshRef.current = schedulePageCounter;
    const flushProgressSave = (urgent = false) => {
      const payload = runtime.pendingProgressRef.current;
      if (!payload) return;
      runtime.pendingProgressRef.current = null;
      runtime.lastSavedLocationRef.current = payload.location;
      saveProgress(payload, { urgent }).catch((error) => console.warn('Failed to save Readium progress', error));
    };
    const handlePageHide = () => {
      runtime.publicationRef.current?.advancePrefetchGeneration();
      flushProgressSave(true);
    };
    const queueProgressSave = (locator: ReadiumLocator) => {
      const location = serializeReadiumLocator(locator);
      if (!location || location === runtime.lastSavedLocationRef.current) return;
      runtime.pendingProgressRef.current = { bookId: book.id, location, updatedAt: Date.now() };
      if (runtime.progressSaveTimerRef.current !== null) window.clearTimeout(runtime.progressSaveTimerRef.current);
      runtime.progressSaveTimerRef.current = window.setTimeout(() => {
        runtime.progressSaveTimerRef.current = null;
        flushProgressSave();
      }, 700);
    };
    const openPreview = (image: { src: string; name: string }) => {
      runtime.suppressChromeToggleUntilRef.current = Date.now() + 450;
      options.setPreviewImage(image);
      options.setSaveStatus('');
    };
    const resolveLoading = (forceReveal: boolean) => {
      if (cancelled || runtime.loadingResolvedRef.current) return;
      runtime.loadingResolvedRef.current = true;
      if (forceReveal) revealReadiumFrames(runtime.containerRef.current, runtime.navigatorRef.current);
      options.setLoading(false);
      runtime.onPresentableRef.current?.();
    };
    const ensureStrip = (publication: ReadiumPublicationLike, stripHost: HTMLDivElement | null) => async (
      stripSettings: AppSettings, locator: ReadiumLocatorLike,
    ) => {
      const existing = runtime.resourceStripRef.current;
      if (existing) return existing;
      if (!stripHost || cancelled || runtime.publicationRef.current !== publication) return null;
      let created: ContinuousResourceStrip;
      created = new ContinuousResourceStrip(stripHost, publication, stripSettings, book.type, {
        onLocator: (nextLocator) => {
          if (runtime.resourceStripRef.current !== created || !isContinuousScroll(runtime.settingsRef.current)) return;
          const progress = progressionFromLocator(nextLocator, publication);
          runtime.lastEmittedProgressRef.current = progress;
          options.setPageCounter(formatResourceStripPageCounter(nextLocator, publication, created.pageMetrics));
          runtime.onProgressChangeRef.current(progress);
          runtime.onCurrentTocChangeRef.current(currentTocItemId(nextLocator, publication, created.currentDocument));
          queueProgressSave(nextLocator as ReadiumLocator);
          runtime.operations.scheduleDeferredWork(nextLocator.href, 0, false);
        },
        onImage: openPreview,
        onToggleChrome: () => runtime.onToggleChromeRef.current(),
      });
      runtime.resourceStripRef.current = created;
      await created.mount(locator);
      if (cancelled || runtime.resourceStripRef.current !== created) return null;
      return created;
    };
    const init = async () => {
      const initStartedAt = performance.now();
      try {
        options.setLoading(true);
        options.setLoadError('');
        runtime.loadingResolvedRef.current = false;
        runtime.deferredHrefRef.current = '';
        runtime.deferredDirectionRef.current = 0;
        runtime.preparedTargetRef.current = null;
        runtime.prepareGenerationRef.current += 1;
        const container = runtime.containerRef.current;
        if (!container) return;
        const progressPromise = getProgress(book.id);
        const publicationStartedAt = performance.now();
        const publicationPromise = createReaderPublication(book);
        const storedProgress = await progressPromise;
        const publication = await publicationPromise;
        recordReaderMetric({ kind: 'load', name: `${book.type}-publication`, durationMs: performance.now() - publicationStartedAt });
        if (cancelled) { publication.close(); return; }
        runtime.publicationRef.current = publication;
        runtime.positionsRefinedRef.current = !publication.refinePositions;
        onTocChange([]);
        if (cancelled) {
          if (runtime.publicationRef.current === publication) runtime.publicationRef.current = null;
          publication.close();
          return;
        }
        runtime.lastSavedLocationRef.current = storedProgress?.location || '';
        const initialPosition = normalizeLocatorToPublicationPosition(
          deserializeReadiumLocator(storedProgress?.location)
            || legacyProgressPosition(storedProgress?.scrollPercentage, publication), publication,
        );
        const initialHref = initialPosition?.href || publication.readingOrder.items[0]?.href || '';
        if (!isContinuousScroll(runtime.settingsRef.current)) publication.prefetchAroundHref(initialHref, 1).catch(() => {});
        const ensureResourceStrip = ensureStrip(publication, runtime.resourceStripHostRef.current);
        runtime.ensureResourceStripRef.current = ensureResourceStrip;
        const initialStripLocator = initialPosition || publication.readingOrder.items[0]?.locator;
        const stripMountPromise = isContinuousScroll(runtime.settingsRef.current) && initialStripLocator
          ? ensureResourceStrip(runtime.settingsRef.current, initialStripLocator) : Promise.resolve(null);
        if (isContinuousScroll(runtime.settingsRef.current)) void stripMountPromise.then(async (strip) => {
          if (!strip || cancelled || runtime.resourceStripRef.current !== strip) return;
          strip.setActive(true);
          await waitForNextPaint();
          if (!cancelled) {
            resolveLoading(false);
            recordReaderMetric({ kind: 'load', name: `${book.type}-strip-presentable`, durationMs: performance.now() - initStartedAt });
          }
        });
        container.classList.toggle('zenith-resource-strip-suspended', isContinuousScroll(runtime.settingsRef.current));
        const backingSettings = isContinuousScroll(runtime.settingsRef.current)
          ? { ...runtime.settingsRef.current, pageTurnAnimation: 'minimal' as const } : runtime.settingsRef.current;
        const navigatorStartedAt = performance.now();
        let navigator!: EpubNavigator;
        navigator = new EpubNavigator(
          container, publication,
          createNavigatorCallbacks(runtime, { book, navigator: () => navigator, publication, openPreview, queueProgressSave, schedulePageCounter }),
          publication.positions, initialPosition,
          { preferences: createReadiumPreferences(backingSettings, book.type), defaults: createReadiumDefaults(backingSettings, book.type) },
        );
        recordReaderMetric({ kind: 'load', name: `${book.type}-navigator-constructor`, durationMs: performance.now() - navigatorStartedAt });
        runtime.navigatorRef.current = navigator;
        let boundedPresentableRecorded = false;
        const recordBoundedPresentable = (timeout: boolean) => {
          if (boundedPresentableRecorded) return;
          boundedPresentableRecorded = true;
          recordReaderMetric({ kind: 'load', name: `${book.type}-bounded-presentable`, durationMs: performance.now() - initStartedAt, detail: { timeout } });
        };
        const loadingFallback = window.setTimeout(() => recordBoundedPresentable(true), 1800);
        const navigatorLoadStartedAt = performance.now();
        navigator.load().then(async () => {
          if (cancelled) return;
          const layoutChanged = applyReadiumFrameSettingsToNavigator(navigator, runtime.settingsRef.current, book.type);
          const resizeStartedAt = performance.now();
          if (layoutChanged) await navigator.resizeHandler?.();
          recordReaderMetric({ kind: 'load', name: `${book.type}-post-load-resize`, durationMs: performance.now() - resizeStartedAt, detail: { performed: layoutChanged } });
          const layoutStartedAt = performance.now();
           if (isContinuousScroll(runtime.settingsRef.current)) {
             const strip = await stripMountPromise;
             if (cancelled) return;
             if (strip) strip.setActive(true);
           }
          await waitForNextPaint();
          if (cancelled) return;
          revealReadiumFrames(container, navigator);
          resolveLoading(false);
          const readyStartedAt = performance.now();
          await waitUntil(() => isReadiumNavigationReady(navigator), 1800);
          recordReaderMetric({ kind: 'load', name: `${book.type}-frame-interactive`, durationMs: performance.now() - readyStartedAt });
          if (cancelled) return;
          if (!isReadiumNavigationReady(navigator)) throw new Error(`${book.type.toUpperCase()} 阅读页面未就绪`);
          revealReadiumFrames(container, navigator);
          runtime.appliedLayoutSettingsRef.current = runtime.settingsRef.current;
           runtime.layoutRestoringRef.current = false;
           runtime.operations.drainAbsoluteNavigation();
           runtime.operations.drainNavigationQueue();
          const assetsStartedAt = performance.now();
          void waitForCurrentFrameReadiness(navigator, book.type).then(() => recordReaderMetric({ kind: 'load', name: `${book.type}-frame-assets-ready`, durationMs: performance.now() - assetsStartedAt }));
          const currentLocator = navigator.currentLocator;
          const currentLink = publication.readingOrder.findWithHref(currentLocator.href);
          if (currentLink) {
            const viewport = { width: container.clientWidth, height: container.clientHeight, devicePixelRatio: window.devicePixelRatio || 1 };
            navigator.markPreparedReady(currentLocator, `${createReaderLayoutKey(publication.contentKey, runtime.settingsRef.current, viewport, book.type)}:${currentLink.href}`);
          }
          recordReaderMetric({ kind: 'load', name: `${book.type}-layout-settle`, durationMs: performance.now() - layoutStartedAt });
          recordReaderMetric({ kind: 'load', name: `${book.type}-navigator-load`, durationMs: performance.now() - navigatorLoadStartedAt });
          recordReaderMetric({ kind: 'load', name: `${book.type}-presentable`, durationMs: performance.now() - initStartedAt });
          recordBoundedPresentable(false);
          runtime.operations.scheduleStableAnchorCapture(navigator);
          scheduleToc(publication);
          runtime.operations.scheduleDeferredWork(initialHref, 0, true);
        }).catch((error) => {
          console.error('Readium navigator failed to load', error);
          if (!cancelled && !runtime.loadingResolvedRef.current) options.setLoadError(error instanceof Error ? error.message : `${book.type.toUpperCase()} 渲染失败`);
          resolveLoading(true);
        }).finally(() => window.clearTimeout(loadingFallback));
      } catch (error) {
        console.error(`Failed to load ${book.type.toUpperCase()} with Readium`, error);
        if (!cancelled) options.setLoadError(error instanceof Error ? error.message : `${book.type.toUpperCase()} 加载失败`);
        resolveLoading(true);
      }
    };
    window.addEventListener('pagehide', handlePageHide);
    init();
    return () => cleanupReadiumReader(runtime, {
      onTocChange, flushProgressSave, pageCounterTimer, tocIdleId,
      cancel: () => { cancelled = true; }, handlePageHide,
    });
  }, [book.id, book.resourceId, book.title, reloadToken]);
}
