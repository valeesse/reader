import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Check from 'lucide-react/dist/esm/icons/check.mjs';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs';
import Download from 'lucide-react/dist/esm/icons/download.mjs';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle.mjs';
import X from 'lucide-react/dist/esm/icons/x.mjs';
import { EpubNavigator, EpubPreferences, ReadiumFrameClickEvent, ReadiumLocator, ReadiumPositionChangedContext } from './vendor/readium-navigator';
import { AppSettings, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import { getProgress, saveProgress } from './lib/storage';
import {
  deserializeReadiumLocator,
  invalidatePublicationPositionRanges,
  locatorAtProgress,
  pageFromLocator,
  progressionFromLocator,
  ReadiumLocatorLike,
  ReadiumPublicationLike,
  serializeReadiumLocator,
} from './lib/readiumPublication';
import { createReaderPublication } from './lib/readerPublication';
import { readTxtPreview, saveImageFromSource } from './lib/native';
import { ReaderLoadError, ReaderLoading, ReaderPageCounter, ReaderViewerProps } from './components/reader/ReaderShared';
import { createReaderLayoutKey, createReaderSettingsLayoutFingerprint, ReaderLayoutCache } from './lib/readerLayoutCache';
import { recordReaderMetric } from './lib/readerPerformance';
import { ContinuousResourceStrip } from './lib/continuousResourceStrip';
import { applyReaderDocumentStyles, readerThemeColors, readiumFontScale } from './lib/readerDocumentStyles';

const DOUBLE_PAGE_CENTER_GAP = 56;
const IMMEDIATE_PREFETCH_RADIUS = 1;
const STABLE_PREFETCH_RADIUS = 3;
const WHEEL_PAGE_THRESHOLD = 80;
const WHEEL_GESTURE_RESET_MS = 180;
type ReadiumPageGeometry = {
  viewportWidth: number;
  viewportHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  columnCount: number;
  columnGap: number;
  horizontal: boolean;
  stride: number;
};
const readiumPageGeometryCache = new WeakMap<Document, ReadiumPageGeometry>();

export function ReadiumReaderViewer({
  book,
  chromeVisible,
  onProgressChange,
  onToggleChrome,
  onTocChange,
  onCurrentTocChange,
  tocTarget,
  seekRequest,
  onPresentable,
}: ReaderViewerProps & {
  chromeVisible: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resourceStripHostRef = useRef<HTMLDivElement>(null);
  const resourceStripRef = useRef<ContinuousResourceStrip | null>(null);
  const navigatorRef = useRef<EpubNavigator | null>(null);
  const publicationRef = useRef<ReadiumPublicationLike | null>(null);
  const { settings } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [pageLabel, setPageLabel] = useState('');
  const [pageCounter, setPageCounter] = useState('');
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [txtPreview, setTxtPreview] = useState('');
  const settingsRef = useRef(settings);
  const appliedLayoutSettingsRef = useRef(settings);
  const onProgressChangeRef = useRef(onProgressChange);
  const onToggleChromeRef = useRef(onToggleChrome);
  const onPresentableRef = useRef(onPresentable);
  const onCurrentTocChangeRef = useRef(onCurrentTocChange);
  const loadingResolvedRef = useRef(false);
  const settingsApplyTimerRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const pageCounterRefreshRef = useRef<(locator?: ReadiumLocator, delay?: number) => void>(() => {});
  const settingsRevisionRef = useRef(0);
  const settingsAnchorRef = useRef<ReturnType<typeof snapshotLocator>>(undefined);
  const resizeAnchorRef = useRef<ReturnType<typeof snapshotLocator>>(undefined);
  const stableViewportAnchorRef = useRef<ReturnType<typeof snapshotLocator>>(undefined);
  const anchorCaptureRafRef = useRef<number | null>(null);
  const layoutQueueRef = useRef<Promise<void>>(Promise.resolve());
  const suppressResizeUntilRef = useRef(0);
  const layoutRestoringRef = useRef(false);
  const lastEmittedProgressRef = useRef(-1);
  const lastSavedLocationRef = useRef('');
  const pendingProgressRef = useRef<ReturnType<typeof createProgressPayload> | null>(null);
  const progressSaveTimerRef = useRef<number | null>(null);
  const previewImageRef = useRef(previewImage);
  const suppressChromeToggleUntilRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelLastEventAtRef = useRef(0);
  const scrollBoundaryGestureLockedRef = useRef(false);
  const scrollBoundaryGestureTimerRef = useRef<number | null>(null);
  const scrollBoundaryPendingDirectionRef = useRef<-1 | 0 | 1>(0);
  const navigationLockedRef = useRef(false);
  const pendingNavigationRef = useRef(0);
  const navigationUnlockTimerRef = useRef<number | null>(null);
  const navigationTokenRef = useRef(0);
  const navigationRetryTimerRef = useRef<number | null>(null);
  const navigationRetryCountRef = useRef(0);
  const navigationIdRef = useRef(0);
  const navigationByTurnRequestRef = useRef(new Map<number, number>());
  const stablePrefetchTimerRef = useRef<number | null>(null);
  const refinementTimerRef = useRef<number | null>(null);
  const refinementIdleRef = useRef<number | null>(null);
  const refinementAbortRef = useRef<AbortController | null>(null);
  const positionsRefinedRef = useRef(false);
  const absoluteNavigationPendingRef = useRef<{ locator: ReadiumLocatorLike; requestId: number } | null>(null);
  const absoluteNavigationRunningRef = useRef(false);
  const absoluteNavigationTimerRef = useRef<number | null>(null);
  const deferredHrefRef = useRef('');
  const deferredDirectionRef = useRef<-1 | 0 | 1>(0);
  const layoutCacheRef = useRef(new ReaderLayoutCache(3));
  const preparedTargetRef = useRef<{ currentHref: string; direction: -1 | 1; href: string; generation: number } | null>(null);
  const prepareGenerationRef = useRef(0);
  const navigationStartedAtRef = useRef<number | null>(null);
  const pageTransitionRef = useRef<Animation | null>(null);
  const settingsLayoutFingerprintRef = useRef(createReaderSettingsLayoutFingerprint(settings, book.type));

  const scheduleStableAnchorCapture = (navigator: EpubNavigator, remainingFrames = 1) => {
    if (anchorCaptureRafRef.current !== null) window.cancelAnimationFrame(anchorCaptureRafRef.current);
    const capture = (frames: number) => {
      anchorCaptureRafRef.current = window.requestAnimationFrame(() => {
        if (frames > 1) {
          capture(frames - 1);
          return;
        }
        anchorCaptureRafRef.current = null;
        if (navigatorRef.current !== navigator || layoutRestoringRef.current) return;
        stableViewportAnchorRef.current = snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current)
          || snapshotLocator(navigator.currentLocator);
      });
    };
    capture(remainingFrames);
  };

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  useEffect(() => {
    onToggleChromeRef.current = onToggleChrome;
  }, [onToggleChrome]);

  useEffect(() => {
    onPresentableRef.current = onPresentable;
  }, [onPresentable]);

  useEffect(() => {
    onCurrentTocChangeRef.current = onCurrentTocChange;
  }, [onCurrentTocChange]);

  useEffect(() => {
    previewImageRef.current = previewImage;
  }, [previewImage]);

  useEffect(() => {
    let cancelled = false;
    let pageCounterTimer: number | null = null;
    let tocIdleId: number | null = null;

    const scheduleToc = (publication: ReadiumPublicationLike) => {
      if (tocIdleId !== null) window.cancelIdleCallback(tocIdleId);
      tocIdleId = window.requestIdleCallback(() => {
        tocIdleId = null;
        if (!cancelled && publicationRef.current === publication) {
          onTocChange(toTocItems(publication));
        }
      }, { timeout: 1600 });
    };

    const schedulePageCounter = (locator?: ReadiumLocator, delay = 120) => {
      if (!locator) return;
      if (pageCounterTimer !== null) window.clearTimeout(pageCounterTimer);
      pageCounterTimer = window.setTimeout(() => {
        pageCounterTimer = null;
        const navigator = navigatorRef.current;
        const publication = publicationRef.current;
        if (cancelled || !navigator || !publication) return;
        setPageCounter(formatEpubPageCounter(navigator, locator, publication));
      }, delay);
    };
    pageCounterRefreshRef.current = schedulePageCounter;

    const flushProgressSave = () => {
      const payload = pendingProgressRef.current;
      if (!payload) return;
      pendingProgressRef.current = null;
      lastSavedLocationRef.current = payload.location;
      saveProgress(payload).catch((error) => {
        console.warn('Failed to save Readium progress', error);
      });
    };

    const handlePageHide = () => {
      flushProgressSave();
    };

    const queueProgressSave = (locator: ReadiumLocator) => {
      const location = serializeReadiumLocator(locator);
      if (!location || location === lastSavedLocationRef.current) return;
      pendingProgressRef.current = createProgressPayload(book.id, location);
      if (progressSaveTimerRef.current !== null) window.clearTimeout(progressSaveTimerRef.current);
      progressSaveTimerRef.current = window.setTimeout(() => {
        progressSaveTimerRef.current = null;
        flushProgressSave();
      }, 700);
    };

    const openPreview = (image: { src: string; name: string }) => {
      suppressChromeToggleUntilRef.current = Date.now() + 450;
      setPreviewImage(image);
      setSaveStatus('');
    };

    const handlePointer = (event: ReadiumFrameClickEvent) => {
      if (handleReadiumClick(event, openPreview)) return true;
      if (event.doNotDisturb || previewImageRef.current || Date.now() < suppressChromeToggleUntilRef.current) return true;
      return false;
    };

    const resolveLoading = (forceReveal: boolean) => {
      if (cancelled || loadingResolvedRef.current) return;
      loadingResolvedRef.current = true;
      if (forceReveal) revealReadiumFrames(containerRef.current, navigatorRef.current);
      setLoading(false);
      setTxtPreview('');
      onPresentableRef.current?.();
    };

    const init = async () => {
      const initStartedAt = performance.now();
      try {
        setLoading(true);
        setLoadError('');
        setTxtPreview('');
        loadingResolvedRef.current = false;
        deferredHrefRef.current = '';
        deferredDirectionRef.current = 0;
        preparedTargetRef.current = null;
        prepareGenerationRef.current += 1;
        const container = containerRef.current;
        if (!container) return;

        const progressPromise = getProgress(book.id);
        const publicationStartedAt = performance.now();
        const publicationPromise = createReaderPublication(book);
        const storedProgress = await progressPromise;
        if (book.type === 'txt' && !storedProgress?.location && storedProgress?.scrollPercentage === undefined) {
          readTxtPreview(book.resourceId, 12_000).then((preview) => {
            if (!cancelled && !loadingResolvedRef.current) {
              setTxtPreview(preview.text);
            }
          }).catch(() => {});
        }
        const publication = await publicationPromise;
        recordReaderMetric({
          kind: 'load',
          name: `${book.type}-publication`,
          durationMs: performance.now() - publicationStartedAt,
        });
        if (cancelled) {
          publication.close();
          return;
        }

        publicationRef.current = publication;
        positionsRefinedRef.current = !publication.refinePositions;
        onTocChange([]);
        if (cancelled) {
          if (publicationRef.current === publication) publicationRef.current = null;
          publication.close();
          return;
        }
        lastSavedLocationRef.current = storedProgress?.location || '';
        const initialPosition = normalizeLocatorToPublicationPosition(
          deserializeReadiumLocator(storedProgress?.location)
            || legacyProgressPosition(storedProgress?.scrollPercentage, publication),
          publication,
        );
        if (initialPosition?.href) {
          publication.prefetchAroundHref(initialPosition.href, IMMEDIATE_PREFETCH_RADIUS).catch(() => {});
        } else {
          publication.prefetchAroundHref(publication.readingOrder.items[0]?.href || '', IMMEDIATE_PREFETCH_RADIUS).catch(() => {});
        }
        const stripHost = resourceStripHostRef.current;
        const strip = stripHost ? new ContinuousResourceStrip(
          stripHost,
          publication,
          settingsRef.current,
          book.type,
          {
            onLocator: (locator) => {
              if (resourceStripRef.current !== strip || !isContinuousScroll(settingsRef.current)) return;
              const progress = progressionFromLocator(locator, publication);
              lastEmittedProgressRef.current = progress;
              setPageLabel(formatProgressLabel(progress));
              setPageCounter(formatResourceStripPageCounter(locator, publication));
              onProgressChangeRef.current(progress);
              onCurrentTocChangeRef.current(currentTocItemId(locator, publication, strip?.currentDocument));
              queueProgressSave(locator as ReadiumLocator);
              scheduleDeferredWork(locator.href, 0, false);
            },
            onImage: openPreview,
            onToggleChrome: () => onToggleChromeRef.current(),
          },
        ) : null;
        resourceStripRef.current = strip;
        const stripMountPromise = strip?.mount(initialPosition || publication.readingOrder.items[0]?.locator);
        strip?.setActive(isContinuousScroll(settingsRef.current));
        container.classList.toggle('zenith-resource-strip-suspended', isContinuousScroll(settingsRef.current));
        // The paginated navigator remains a warm backing surface while the
        // resource strip is active, so switching modes does not rebuild the
        // publication or wait for a cold first frame.
        const backingSettings = isContinuousScroll(settingsRef.current)
          ? { ...settingsRef.current, pageTurnAnimation: 'minimal' as const }
          : settingsRef.current;
        const initialPreferences = createReadiumPreferences(backingSettings, book.type);
        const navigatorStartedAt = performance.now();
        const navigator = new EpubNavigator(
          container,
          publication,
          {
            frameLoaded: (wnd) => {
              applyReadiumFrameSettings(wnd.document, settingsRef.current, book.type);
              installImagePreview(wnd, openPreview);
              installReadiumWheel(wnd, navigateByWheel, navigateContinuousScrollBoundary, settingsRef);
              watchReadiumFrameLayout(wnd, () => schedulePageCounter(navigatorRef.current?.currentLocator));
              queueMicrotask(drainNavigationQueue);
            },
            positionChanged: (locator, context?: ReadiumPositionChangedContext) => {
              if (navigatorRef.current !== navigator || publicationRef.current !== publication) return;
              const navigationId = context?.turnRequestId === undefined
                ? undefined
                : navigationByTurnRequestRef.current.get(context.turnRequestId);
              if (context?.cause === 'turn' && context.iframeElapsedMs !== undefined) {
                recordReaderMetric({
                  kind: 'navigation',
                  name: 'iframe-turn',
                  durationMs: context.iframeElapsedMs,
                  detail: { navigationId, turnRequestId: context.turnRequestId, cause: context.cause, callbackReleased: context.callbackReleased, transport: context.transport },
                });
              }
              if (context?.cause === 'turn' && context.locatorLookupMs !== undefined) {
                recordReaderMetric({
                  kind: 'navigation',
                  name: 'locator-lookup',
                  durationMs: context.locatorLookupMs,
                  detail: { navigationId, turnRequestId: context.turnRequestId, cause: context.cause, callbackReleased: context.callbackReleased, transport: context.transport },
                });
              }
              if (layoutRestoringRef.current) return;
              scheduleStableAnchorCapture(navigator);
              // Preserve the frame's ready token after it has been the visible
              // resource. The three-frame pool can then reuse the just-left
              // chapter for an immediate direction reversal without creating
              // a second speculative reservation.
              const visibleLink = publication.readingOrder.findWithHref(locator.href);
              if (visibleLink) {
                const viewport = {
                  width: container.clientWidth,
                  height: container.clientHeight,
                  devicePixelRatio: window.devicePixelRatio || 1,
                };
                const visibleLayoutKey = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${visibleLink.href}`;
                navigator.markPreparedReady(locator, visibleLayoutKey);
              }
              const progress = progressionFromLocator(locator, publication);
              onCurrentTocChangeRef.current(currentTocItemId(
                locator,
                publication,
                getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentDocument || undefined,
              ));
              const previousProgress = lastEmittedProgressRef.current;
              const direction: -1 | 0 | 1 = previousProgress < 0 ? 0 : progress > previousProgress ? 1 : progress < previousProgress ? -1 : 0;
              // Initial loads and TOC jumps have no meaningful turn direction.
              // Prepare the overwhelmingly common forward boundary instead of
              // inheriting a stale direction from the previous chapter.
              const cacheDirection: -1 | 0 | 1 = context?.cause === 'turn' ? direction : 1;
              // Navigation completion is the latency-critical path. Cache
              // maintenance is intentionally started after Readium has released
              // the turn callback; the current/adjacent resources are already
              // covered by the immediate L1 window.
              queueMicrotask(() => {
                if (publicationRef.current !== publication) return;
                if (deferredHrefRef.current !== locator.href) {
                  publication.prefetchAroundHref(locator.href, IMMEDIATE_PREFETCH_RADIUS, cacheDirection).catch(() => {});
                }
                scheduleDeferredWork(locator.href, cacheDirection, false);
              });
              schedulePageCounter(locator);
              if (Math.abs(progress - lastEmittedProgressRef.current) >= 0.001) {
                lastEmittedProgressRef.current = progress;
                setPageLabel(formatProgressLabel(progress));
                onProgressChangeRef.current(progress);
              }
              queueProgressSave(locator);
            },
            click: handlePointer,
            tap: handlePointer,
            contextMenu: () => {},
            miscPointer: () => {
              if (Date.now() < suppressChromeToggleUntilRef.current || previewImageRef.current) return;
              onToggleChromeRef.current();
            },
          },
          publication.positions,
          initialPosition,
          {
            preferences: initialPreferences,
            defaults: createReadiumDefaults(backingSettings, book.type),
          },
        );
        recordReaderMetric({
          kind: 'load',
          name: `${book.type}-navigator-constructor`,
          durationMs: performance.now() - navigatorStartedAt,
        });

        navigatorRef.current = navigator;
        let boundedPresentableRecorded = false;
        const recordBoundedPresentable = (timeout: boolean) => {
          if (boundedPresentableRecorded) return;
          boundedPresentableRecorded = true;
          recordReaderMetric({
            kind: 'load',
            name: `${book.type}-bounded-presentable`,
            durationMs: performance.now() - initStartedAt,
            detail: { timeout },
          });
        };
        const loadingFallback = window.setTimeout(() => {
          recordBoundedPresentable(true);
          resolveLoading(true);
        }, 1800);
        const navigatorLoadStartedAt = performance.now();
        navigator.load()
          .then(async () => {
            if (cancelled) return;
            const layoutChanged = applyReadiumFrameSettingsToNavigator(navigator, settingsRef.current, book.type);
            const resizeStartedAt = performance.now();
            if (layoutChanged) await navigator.resizeHandler?.();
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-post-load-resize`,
              durationMs: performance.now() - resizeStartedAt,
              detail: { performed: layoutChanged },
            });
            const layoutStartedAt = performance.now();
            if (isContinuousScroll(settingsRef.current) && strip) {
              await stripMountPromise;
              if (cancelled) return;
              await strip.go(navigator.currentLocator as ReadiumLocatorLike, false);
            }
            await waitForNextPaint();
            if (cancelled) return;
            await waitUntil(() => isReadiumNavigationReady(navigator), 500);
            if (cancelled) return;
            revealReadiumFrames(container, navigator);
            appliedLayoutSettingsRef.current = settingsRef.current;
            layoutRestoringRef.current = false;
            resolveLoading(false);
            drainNavigationQueue();
            const assetsStartedAt = performance.now();
            void waitForCurrentFrameReadiness(navigator, book.type).then(() => {
              recordReaderMetric({
                kind: 'load',
                name: `${book.type}-frame-assets-ready`,
                durationMs: performance.now() - assetsStartedAt,
              });
            });
            const currentLocator = navigator.currentLocator;
            const currentLink = publication.readingOrder.findWithHref(currentLocator.href);
            if (currentLink) {
              const viewport = {
                width: container.clientWidth,
                height: container.clientHeight,
                devicePixelRatio: window.devicePixelRatio || 1,
              };
              const layoutKey = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${currentLink.href}`;
              navigator.markPreparedReady(currentLocator, layoutKey);
            }
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-layout-settle`,
              durationMs: performance.now() - layoutStartedAt,
            });
            const presentableDurationMs = performance.now() - initStartedAt;
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-navigator-load`,
              durationMs: performance.now() - navigatorLoadStartedAt,
            });
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-presentable`,
              durationMs: presentableDurationMs,
            });
            recordBoundedPresentable(false);
            scheduleStableAnchorCapture(navigator);
            scheduleToc(publication);
            scheduleDeferredWork(initialPosition?.href || publication.readingOrder.items[0]?.href || '', 0, true);
          })
          .catch((error) => {
            console.error('Readium navigator failed to load', error);
            if (!cancelled && !loadingResolvedRef.current) {
              setLoadError(error instanceof Error ? error.message : `${book.type.toUpperCase()} 渲染失败`);
            }
            resolveLoading(true);
          })
          .finally(() => window.clearTimeout(loadingFallback));
      } catch (error) {
        console.error(`Failed to load ${book.type.toUpperCase()} with Readium`, error);
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : `${book.type.toUpperCase()} 加载失败`);
        }
        resolveLoading(true);
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    init();

    return () => {
      cancelled = true;
      pageCounterRefreshRef.current = () => {};
      if (pageCounterTimer !== null) window.clearTimeout(pageCounterTimer);
      if (tocIdleId !== null) window.cancelIdleCallback(tocIdleId);
      window.removeEventListener('pagehide', handlePageHide);
      onTocChange([]);
      if (progressSaveTimerRef.current !== null) {
        window.clearTimeout(progressSaveTimerRef.current);
        progressSaveTimerRef.current = null;
      }
      if (navigationUnlockTimerRef.current !== null) {
        window.clearTimeout(navigationUnlockTimerRef.current);
        navigationUnlockTimerRef.current = null;
      }
      if (absoluteNavigationTimerRef.current !== null) {
        window.clearTimeout(absoluteNavigationTimerRef.current);
        absoluteNavigationTimerRef.current = null;
      }
      absoluteNavigationPendingRef.current = null;
      absoluteNavigationRunningRef.current = false;
      if (scrollBoundaryGestureTimerRef.current !== null) {
        window.clearTimeout(scrollBoundaryGestureTimerRef.current);
        scrollBoundaryGestureTimerRef.current = null;
      }
      scrollBoundaryGestureLockedRef.current = false;
      scrollBoundaryPendingDirectionRef.current = 0;
      containerRef.current?.classList.remove('zenith-scroll-gesture-locked');
      document.querySelectorAll('.zenith-scroll-transition-snapshot').forEach((snapshot) => snapshot.remove());
      containerRef.current?.querySelectorAll<HTMLIFrameElement>(
        '.zenith-scroll-transition-outgoing, .zenith-scroll-transition-incoming',
      ).forEach((iframe) => {
        iframe.classList.remove('zenith-scroll-transition-outgoing', 'zenith-scroll-transition-incoming');
        iframe.style.removeProperty('visibility');
        iframe.style.removeProperty('opacity');
      });
      navigationTokenRef.current += 1;
      if (navigationRetryTimerRef.current !== null) {
        window.clearTimeout(navigationRetryTimerRef.current);
        navigationRetryTimerRef.current = null;
      }
      navigationLockedRef.current = false;
      pendingNavigationRef.current = 0;
      navigationRetryCountRef.current = 0;
      navigationByTurnRequestRef.current.clear();
      layoutCacheRef.current.invalidate();
      prepareGenerationRef.current += 1;
      preparedTargetRef.current = null;
      settingsAnchorRef.current = undefined;
      resizeAnchorRef.current = undefined;
      stableViewportAnchorRef.current = undefined;
      if (anchorCaptureRafRef.current !== null) window.cancelAnimationFrame(anchorCaptureRafRef.current);
      anchorCaptureRafRef.current = null;
      layoutRestoringRef.current = false;
      if (settingsApplyTimerRef.current !== null) window.clearTimeout(settingsApplyTimerRef.current);
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      cancelDeferredWork(true);
      flushProgressSave();
      const navigator = navigatorRef.current;
      navigatorRef.current = null;
      resourceStripRef.current?.destroy();
      resourceStripRef.current = null;
      navigator?.destroy?.();
      publicationRef.current?.close();
      publicationRef.current = null;
    };
  }, [book.id, book.resourceId, book.title, reloadToken]);

  useEffect(() => {
    const navigator = navigatorRef.current;
    if (!navigator) return;
    const strip = resourceStripRef.current;
    const stripSettingsUpdate = strip ? strip.updateSettings(settings) : Promise.resolve();
    const wasContinuous = isContinuousScroll(appliedLayoutSettingsRef.current);
    const wantsContinuous = isContinuousScroll(settings);
    const layoutFingerprint = createReaderSettingsLayoutFingerprint(settings, book.type);
    const layoutChanged = settingsLayoutFingerprintRef.current !== layoutFingerprint;
    settingsLayoutFingerprintRef.current = layoutFingerprint;
    if (wantsContinuous && strip) {
      const revision = ++settingsRevisionRef.current;
      const anchor = wasContinuous
        ? strip.currentLocator
        : snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current) || snapshotLocator(navigator.currentLocator);
      layoutRestoringRef.current = true;
      void stripSettingsUpdate.then(() => strip.go((anchor || navigator.currentLocator) as ReadiumLocatorLike, false)).then(() => {
        if (revision !== settingsRevisionRef.current || resourceStripRef.current !== strip) return;
        strip.setActive(true);
        containerRef.current?.classList.add('zenith-resource-strip-suspended');
        appliedLayoutSettingsRef.current = settings;
        layoutRestoringRef.current = false;
        settingsAnchorRef.current = undefined;
      });
      return;
    }
    void stripSettingsUpdate;
    if (wasContinuous && strip) {
      settingsAnchorRef.current = snapshotLocator(strip.currentLocator as ReadiumLocator);
      strip.setActive(false);
      containerRef.current?.classList.remove('zenith-resource-strip-suspended');
    }
    if (!layoutChanged) {
      applyReadiumFrameSettingsToNavigator(navigator, settings, book.type);
      return;
    }
    cancelDeferredWork(true);
    layoutCacheRef.current.invalidate();
    navigator.clearPreparedReady();
    prepareGenerationRef.current += 1;
    preparedTargetRef.current = null;
    navigator.releasePrepared?.();
    publicationRef.current?.advancePrefetchGeneration();
    const revision = ++settingsRevisionRef.current;
    const preferences = createReadiumPreferences(settings, book.type);
    settingsAnchorRef.current ||= snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current);
    // Lock as soon as the setting changes, including the debounce window. Page
    // turns requested during reflow stay in the bounded queue and are drained
    // against the new geometry instead of moving in the old layout and then
    // being overwritten by its stale anchor.
    layoutRestoringRef.current = true;
    if (settingsApplyTimerRef.current !== null) window.clearTimeout(settingsApplyTimerRef.current);
    settingsApplyTimerRef.current = window.setTimeout(() => {
      settingsApplyTimerRef.current = null;
      enqueueLayout(async () => {
        if (revision !== settingsRevisionRef.current || navigatorRef.current !== navigator) return;
        const navigationWasActive = navigationLockedRef.current;
        if (navigationWasActive) {
          await waitUntil(() => !navigationLockedRef.current, 350);
        }
        if (revision !== settingsRevisionRef.current || navigatorRef.current !== navigator) return;
        // A turn which began before the setting click is authoritative. Refresh
        // the anchor after it settles; turns clicked after the setting change
        // are queued because layoutRestoringRef is already true.
        const before = navigationWasActive
          ? snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current) || snapshotLocator(navigator.currentLocator)
          : settingsAnchorRef.current || snapshotLocator(navigator.currentLocator);
        try {
          suppressResizeUntilRef.current = performance.now() + 500;
          await navigator.submitPreferences(new EpubPreferences(preferences));
          if (navigator.layout !== 'fixed'
            && isContinuousScroll(appliedLayoutSettingsRef.current) !== isContinuousScroll(settings)) {
            // Rapid mixed switches can update Readium's internal layout enum
            // before its current iframe has actually been replaced. Force one
            // authoritative pool rebuild at the scroll/paged boundary so the
            // visible frame and navigator state cannot diverge.
            await navigator.setLayout(isContinuousScroll(settings) ? 'scrolled' : 'reflowable', true);
          }
          await navigator.resizeHandler?.();
          await waitForLayoutFrames();
          if (navigatorRef.current !== navigator) return;
          const isLatest = revision === settingsRevisionRef.current;
           applyReadiumFrameSettingsToNavigator(navigator, isLatest ? settings : settingsRef.current, book.type);
           if (before) await navigateToLocator(navigator, retargetLocatorViewport(before, isLatest ? settings : settingsRef.current));
           revealReadiumFrames(containerRef.current, navigator);
           if (isLatest) {
             appliedLayoutSettingsRef.current = settings;
             settingsAnchorRef.current = undefined;
            scheduleDeferredWork(navigator.currentLocator?.href || before?.href || '', 0, true);
          }
        } finally {
          // An older queued revision must not unlock navigation while a newer
          // layout revision is still waiting or applying.
           if (revision === settingsRevisionRef.current) {
             layoutRestoringRef.current = false;
             scheduleStableAnchorCapture(navigator, 2);
             drainNavigationQueue();
           }
        }
      });
    }, 120);
    return () => {
      if (settingsApplyTimerRef.current !== null) {
        window.clearTimeout(settingsApplyTimerRef.current);
        settingsApplyTimerRef.current = null;
      }
    };
  }, [settings]);

  useEffect(() => {
    const element = containerRef.current;
    const navigator = navigatorRef.current;
    if (!element || !navigator) return;
    // Readium writes an inline pixel width onto the container. Watching that
    // fixed element misses parent growth entirely: the window becomes wider,
    // but the observed box stays at its old width and no resize transaction is
    // scheduled. The parent is the actual responsive viewport.
    const resizeTarget = element.parentElement || element;
    let observedWidth = resizeTarget.clientWidth;
    let observedHeight = resizeTarget.clientHeight;
    let stableWidth = Math.max(1, element.getBoundingClientRect().width);
    let stableHeight = Math.max(1, element.getBoundingClientRect().height);
    let frozen = false;
    let frozenInlineStyle: Partial<Record<'width' | 'height' | 'position' | 'left' | 'top' | 'transform' | 'margin' | 'willChange', string>> | null = null;
    const freezeSurface = () => {
      if (frozen) return;
      frozen = true;
      pageTransitionRef.current?.cancel();
      pageTransitionRef.current = null;
      frozenInlineStyle = {
        width: element.style.width,
        height: element.style.height,
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        transform: element.style.transform,
        margin: element.style.margin,
        willChange: element.style.willChange,
      };
      // Keep the last complete column layout as one stable compositor layer.
      // The responsive parent clips or reveals it while the native window is
      // dragged; Readium only receives the final dimensions after the gesture.
      element.style.width = `${stableWidth}px`;
      element.style.height = `${stableHeight}px`;
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.transform = 'translate3d(-50%, -50%, 0)';
      element.style.margin = '0';
      element.style.willChange = 'transform';
    };
    const releaseSurface = () => {
      if (!frozen) return;
      frozen = false;
      const inline = frozenInlineStyle;
      frozenInlineStyle = null;
      if (!inline) return;
      element.style.width = inline.width || '';
      element.style.height = inline.height || '';
      element.style.position = inline.position || '';
      element.style.left = inline.left || '';
      element.style.top = inline.top || '';
      element.style.transform = inline.transform || '';
      element.style.margin = inline.margin || '';
      element.style.willChange = inline.willChange || '';
    };
    const applyResize = () => {
      const suppressionRemaining = Math.max(0, suppressResizeUntilRef.current - performance.now());
      if (settingsApplyTimerRef.current !== null || suppressionRemaining > 0) {
        resizeTimerRef.current = window.setTimeout(applyResize, Math.max(24, suppressionRemaining + 8));
        return;
      }
      // Viewport-sized readiness tokens are no longer valid, but the prepared
      // frames and raw publication resources remain useful. Exact dimensions
      // are part of the layout key, so old L1 entries can age out naturally.
      navigator.clearPreparedReady();
      prepareGenerationRef.current += 1;
      preparedTargetRef.current = null;
      resizeTimerRef.current = null;
      enqueueLayout(async () => {
        if (navigatorRef.current !== navigator) return;
        const before = resizeAnchorRef.current
          || snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current)
          || snapshotLocator(navigator.currentLocator);
        layoutRestoringRef.current = true;
        try {
          suppressResizeUntilRef.current = performance.now() + 180;
          releaseSurface();
          const forceRequestedLayout = () => {
            if (navigatorRef.current === navigator) {
              applyReadiumFrameSettingsToNavigator(navigator, settingsRef.current, book.type);
            }
          };
          // resizeHandler synchronously chooses its responsive effective column
          // count before returning its promise. Override it in the same task so
          // an automatic one-column/zero-gap intermediate can never be painted.
          const resizeOperation = navigator.resizeHandler?.();
          forceRequestedLayout();
          await resizeOperation;
          if (navigatorRef.current !== navigator) return;
          forceRequestedLayout();
          if (before) await navigateToLocator(navigator, before, forceRequestedLayout);
          forceRequestedLayout();
          invalidateReadiumPageGeometry(navigator);
          pageCounterRefreshRef.current(navigator.currentLocator, 0);
          revealReadiumFrames(containerRef.current, navigator);
          const settledRect = element.getBoundingClientRect();
          stableWidth = Math.max(1, settledRect.width);
          stableHeight = Math.max(1, settledRect.height);
          appliedLayoutSettingsRef.current = settingsRef.current;
          const href = navigator.currentLocator?.href;
          if (href) scheduleDeferredWork(href, deferredDirectionRef.current, false);
        } finally {
          releaseSurface();
          resizeAnchorRef.current = undefined;
          layoutRestoringRef.current = false;
          if (before) stableViewportAnchorRef.current = before;
          drainNavigationQueue();
        }
      });
    };
    const scheduleResize = (delay = 80) => {
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(applyResize, delay);
    };
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box && Math.abs(box.width - observedWidth) < 0.5 && Math.abs(box.height - observedHeight) < 0.5) return;
      if (box) {
        observedWidth = box.width;
        observedHeight = box.height;
      }
      // ResizeObserver runs before Readium's rAF resize handler. Capture the
      // actually visible text synchronously while the old column geometry is
      // still intact; the last stable locator is only a fallback. This matters
      // when a narrow window changes the effective column count from two to one.
      resizeAnchorRef.current ||= snapshotVisibleTextLocator(navigator, appliedLayoutSettingsRef.current)
        || stableViewportAnchorRef.current
        || snapshotLocator(navigator.currentLocator);
      layoutRestoringRef.current = true;
      freezeSurface();
      const suppressionRemaining = Math.max(0, suppressResizeUntilRef.current - performance.now());
      scheduleResize(Math.max(80, suppressionRemaining + 8));
    });
    observer.observe(resizeTarget);
    return () => {
      observer.disconnect();
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }
      releaseSurface();
      resizeAnchorRef.current = undefined;
    };
  }, [loading]);

  const enqueueLayout = (operation: () => Promise<void>) => {
    layoutQueueRef.current = layoutQueueRef.current
      .catch(() => {})
      .then(operation)
      .catch((error) => console.warn('Failed to update Readium layout', error));
  };

  const cancelDeferredWork = (abortRefinement: boolean) => {
    if (stablePrefetchTimerRef.current !== null) window.clearTimeout(stablePrefetchTimerRef.current);
    if (refinementTimerRef.current !== null) window.clearTimeout(refinementTimerRef.current);
    if (refinementIdleRef.current !== null) {
      window.cancelIdleCallback(refinementIdleRef.current);
    }
    stablePrefetchTimerRef.current = null;
    refinementTimerRef.current = null;
    refinementIdleRef.current = null;
    if (abortRefinement) {
      refinementAbortRef.current?.abort();
      refinementAbortRef.current = null;
    }
  };

  const scheduleDeferredWork = (href: string, direction: -1 | 0 | 1, restartRefinement: boolean) => {
    const publication = publicationRef.current;
    if (!publication || !href) return;
    const resourceChanged = Boolean(deferredHrefRef.current && deferredHrefRef.current !== href);
    if (resourceChanged) publication.advancePrefetchGeneration();
    deferredHrefRef.current = href;
    if (direction !== 0) deferredDirectionRef.current = direction;
    void prepareAdjacentLayouts(href, direction);
    if (stablePrefetchTimerRef.current !== null) window.clearTimeout(stablePrefetchTimerRef.current);
    stablePrefetchTimerRef.current = window.setTimeout(() => {
      stablePrefetchTimerRef.current = null;
      publication.prefetchAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
      publication.prepareContentAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
    }, 320);

    if (restartRefinement || resourceChanged) cancelPositionRefinement();
    if (positionsRefinedRef.current || !publication.refinePositions || refinementAbortRef.current) return;
    if (refinementTimerRef.current !== null) window.clearTimeout(refinementTimerRef.current);
    refinementTimerRef.current = window.setTimeout(() => {
      refinementTimerRef.current = null;
      const run = () => {
        refinementIdleRef.current = null;
        if (positionsRefinedRef.current || !publication.refinePositions) return;
        const controller = new AbortController();
        refinementAbortRef.current = controller;
        publication.refinePositions(controller.signal).then(() => {
          if (!controller.signal.aborted) {
            positionsRefinedRef.current = true;
            const navigator = navigatorRef.current;
            invalidatePublicationPositionRanges(publication);
            navigator?.refreshPositions();
            resourceStripRef.current?.updatePositions();
            if (navigator?.currentLocator) {
              setPageCounter(formatEpubPageCounter(navigator, navigator.currentLocator, publication));
              const progress = progressionFromLocator(navigator.currentLocator, publication);
              lastEmittedProgressRef.current = progress;
              setPageLabel(formatProgressLabel(progress));
              onProgressChangeRef.current(progress);
            }
          }
        }).catch((error) => {
          if (!controller.signal.aborted) console.warn('Failed to refine publication positions', error);
        }).finally(() => {
          if (refinementAbortRef.current === controller) refinementAbortRef.current = null;
        });
      };
      refinementIdleRef.current = window.requestIdleCallback(run, { timeout: 1500 });
    }, 850);
  };

  const prepareAdjacentLayouts = async (href: string, direction: -1 | 0 | 1) => {
    const publication = publicationRef.current;
    const navigator = navigatorRef.current;
    const container = containerRef.current;
    // Pre-layout the next paginated resource in the navigator's bounded frame
    // pool. Preparation is scheduled at background/idle priority above, keeping
    // it out of the active page-turn path while making resource boundaries L1.
    if (!publication || !navigator || !container || isContinuousScroll(settingsRef.current)) {
      navigator?.releasePrepared();
      preparedTargetRef.current = null;
      return;
    }
    const currentIndex = publication.readingOrder.findIndexWithHref(href);
    if (currentIndex < 0) return;
    const effectiveDirection: -1 | 1 = direction || deferredDirectionRef.current || 1;
    const currentHref = publication.readingOrder.items[currentIndex].href;
    const nearBoundary = isNearResourceBoundary(navigator, currentHref, effectiveDirection);
    const link = publication.readingOrder.items[currentIndex + effectiveDirection];
    if (!link) {
      navigator.releasePrepared();
      preparedTargetRef.current = null;
      return;
    }
    const previousTarget = preparedTargetRef.current;
    const targetChanged = previousTarget?.currentHref !== currentHref
      || previousTarget.direction !== effectiveDirection
      || previousTarget.href !== link.href;
    const generation = targetChanged ? ++prepareGenerationRef.current : previousTarget.generation;
    if (targetChanged) navigator.releasePrepared();
    preparedTargetRef.current = { currentHref, direction: effectiveDirection, href: link.href, generation };
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    const isCurrentTarget = (targetHref: string, targetGeneration: number) => publicationRef.current === publication
      && navigatorRef.current === navigator
      && preparedTargetRef.current?.href === targetHref
      && preparedTargetRef.current.generation === targetGeneration;
    const layoutKey = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${link.href}`;
    const layoutReady = layoutCacheRef.current.isReady(layoutKey);
    const physicalReady = navigator.isPreparedReady(link.locator, layoutKey);
    if (layoutReady && !physicalReady) layoutCacheRef.current.delete(layoutKey);
    if (physicalReady) {
      if (navigatorReservedHref(navigator) !== link.href) await navigator.reservePrepared(link.locator);
      return;
    }
    const framePreparation = layoutCacheRef.current.prepare(layoutKey, async () => {
      // Reserve synchronously before yielding. Keeping this inside the cache's
      // deduplicated task prevents repeated position events from reloading the
      // same hidden frame while its first preparation is still pending.
      const reservedFrames = navigator.reservePrepared(link.locator);
      if (!nearBoundary) await yieldForReaderPreparation();
      if (!isCurrentTarget(link.href, generation)) return false;
      const frames = await reservedFrames;
      if (!isCurrentTarget(link.href, generation) || frames.length === 0) return false;
      await Promise.all(frames.map(async (frameWindow) => {
        applyReadiumFrameSettings(frameWindow.document, settingsRef.current, book.type);
        await waitForFrameReadiness(frameWindow.document, book.type);
      }));
      await waitForLayoutFrames();
      if (!isCurrentTarget(link.href, generation)) return false;
      navigator.markPreparedReady(link.locator, layoutKey, frames[0]);
      return navigator.isPreparedReady(link.locator, layoutKey);
    });
    await Promise.all([
      framePreparation,
      publication.prepareContentAroundHref(href, 1, effectiveDirection).catch(() => {}),
    ]);
  };

  const cancelPositionRefinement = () => {
    if (refinementTimerRef.current !== null) window.clearTimeout(refinementTimerRef.current);
    if (refinementIdleRef.current !== null) {
      window.cancelIdleCallback(refinementIdleRef.current);
    }
    refinementTimerRef.current = null;
    refinementIdleRef.current = null;
    refinementAbortRef.current?.abort();
    refinementAbortRef.current = null;
  };

  const drainAbsoluteNavigation = () => {
    if (absoluteNavigationRunningRef.current || layoutRestoringRef.current) return;
    const request = absoluteNavigationPendingRef.current;
    const navigator = navigatorRef.current;
    if (!request || !navigator) return;
    absoluteNavigationPendingRef.current = null;
    absoluteNavigationRunningRef.current = true;
    const finish = (applied: boolean) => {
      if (absoluteNavigationTimerRef.current !== null) window.clearTimeout(absoluteNavigationTimerRef.current);
      absoluteNavigationTimerRef.current = null;
      absoluteNavigationRunningRef.current = false;
      if (!applied && !absoluteNavigationPendingRef.current) absoluteNavigationPendingRef.current = request;
      window.setTimeout(drainAbsoluteNavigation, applied ? 0 : 32);
    };
    absoluteNavigationTimerRef.current = window.setTimeout(() => {
      navigator.recoverNavigation();
      finish(false);
    }, 2500);
    if (isContinuousScroll(settingsRef.current) && resourceStripRef.current) {
      resourceStripRef.current.go(request.locator, false).then(finish).catch(() => finish(false));
    } else {
      navigator.go(request.locator as ReadiumLocator, false, finish);
    }
  };

  const submitAbsoluteNavigation = (locator: ReadiumLocatorLike, requestId: number) => {
    absoluteNavigationPendingRef.current = { locator, requestId };
    pendingNavigationRef.current = 0;
    drainAbsoluteNavigation();
  };

  useEffect(() => {
    if (!tocTarget?.href) return;
    const publication = publicationRef.current;
    const navigator = navigatorRef.current;
    const link = publication?.toc.findExactWithHref(tocTarget.href)
      || publication?.toc.findWithHref(tocTarget.href)
      || publication?.linkWithHref(tocTarget.href);
    if (link && navigator) {
      const fragment = tocTarget.href.split('#')[1];
      const locator = fragment
        ? link.locator.copyWithLocations({ fragments: [decodeURIComponent(fragment)] })
        : link.locator;
      if (isContinuousScroll(settingsRef.current) && resourceStripRef.current) {
        submitAbsoluteNavigation(locator, tocTarget.index ?? Date.now());
      } else {
        submitAbsoluteNavigation(locator, tocTarget.index ?? Date.now());
      }
    }
  }, [tocTarget, loading]);

  useEffect(() => {
    if (!seekRequest) return;
    const publication = publicationRef.current;
    const navigator = navigatorRef.current;
    if (!publication || !navigator || publication.positions.length === 0) return;
    const target = locatorAtProgress(publication, seekRequest.progress);
    if (!target) return;
    submitAbsoluteNavigation(target, seekRequest.requestId);
  }, [seekRequest, loading]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (previewImage) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, select, textarea, button, [contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft') {
        navigatePage(-1);
      } else if (event.key === 'ArrowRight') {
        navigatePage(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => navigateByWheel(event);
    element.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => element.removeEventListener('wheel', handleWheel, { capture: true });
  }, [loading]);

  const releaseScrollBoundaryGestureAfterQuietPeriod = () => {
    if (scrollBoundaryGestureTimerRef.current !== null) {
      window.clearTimeout(scrollBoundaryGestureTimerRef.current);
    }
    scrollBoundaryGestureTimerRef.current = window.setTimeout(() => {
      scrollBoundaryGestureTimerRef.current = null;
      scrollBoundaryGestureLockedRef.current = false;
      containerRef.current?.classList.remove('zenith-scroll-gesture-locked');
      wheelDeltaRef.current = 0;
      const pendingDirection = scrollBoundaryPendingDirectionRef.current;
      scrollBoundaryPendingDirectionRef.current = 0;
      if (pendingDirection !== 0) navigatePage(pendingDirection);
    }, WHEEL_GESTURE_RESET_MS);
  };

  const navigateByWheel = (event: WheelEvent) => {
    if (event.ctrlKey || previewImageRef.current) return;
    if (isContinuousScroll(settingsRef.current)) {
      if (scrollBoundaryGestureLockedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        wheelLastEventAtRef.current = performance.now();
        releaseScrollBoundaryGestureAfterQuietPeriod();
      }
      return;
    }
    const dominantDelta = normalizeWheelDelta(event, containerRef.current);
    if (Math.abs(dominantDelta) < 1) return;
    event.preventDefault();
    event.stopPropagation();

    const now = performance.now();
    if (
      now - wheelLastEventAtRef.current > WHEEL_GESTURE_RESET_MS
      || Math.sign(wheelDeltaRef.current) !== Math.sign(dominantDelta)
    ) {
      wheelDeltaRef.current = 0;
    }
    wheelLastEventAtRef.current = now;
    wheelDeltaRef.current += dominantDelta;
    if (Math.abs(wheelDeltaRef.current) < WHEEL_PAGE_THRESHOLD) return;
    wheelDeltaRef.current = 0;
    navigatePage(dominantDelta > 0 ? 1 : -1);
  };

  const navigateContinuousScrollBoundary = (event: WheelEvent, wnd: Window) => {
    if (event.ctrlKey || previewImageRef.current || !isContinuousScroll(settingsRef.current)) return;
    const delta = normalizeWheelDelta(event, containerRef.current);
    if (Math.abs(delta) < 1) return;
    // A wheel gesture may keep emitting inertial events after the next resource
    // has mounted. Consume the whole gesture, including events over the new
    // frame, so one physical scroll can cross at most one resource boundary.
    if (scrollBoundaryGestureLockedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      wheelLastEventAtRef.current = performance.now();
      releaseScrollBoundaryGestureAfterQuietPeriod();
      return;
    }
    const scroller = wnd.document.scrollingElement;
    if (!scroller) return;
    const maxScrollTop = Math.max(0, scroller.scrollHeight - wnd.innerHeight);
    const atStart = scroller.scrollTop <= 1;
    const atEnd = scroller.scrollTop >= maxScrollTop - 1;
    if ((delta < 0 && !atStart) || (delta > 0 && !atEnd)) return;

    event.preventDefault();
    event.stopPropagation();
    // While the next resource is being attached, every remaining wheel event
    // still targets the old frame at its boundary. Queuing those events used to
    // skip several chapters and made the failure self-reinforcing. Consume the
    // gesture until the new scrolling frame is ready instead.
    if (navigationLockedRef.current || layoutRestoringRef.current || pendingNavigationRef.current !== 0) {
      wheelDeltaRef.current = 0;
      return;
    }
    const now = performance.now();
    if (
      now - wheelLastEventAtRef.current > WHEEL_GESTURE_RESET_MS
      || Math.sign(wheelDeltaRef.current) !== Math.sign(delta)
    ) {
      wheelDeltaRef.current = 0;
    }
    wheelLastEventAtRef.current = now;
    wheelDeltaRef.current += delta;
    if (Math.abs(wheelDeltaRef.current) < WHEEL_PAGE_THRESHOLD) return;
    wheelDeltaRef.current = 0;
    scrollBoundaryGestureLockedRef.current = true;
    scrollBoundaryPendingDirectionRef.current = delta > 0 ? 1 : -1;
    containerRef.current?.classList.add('zenith-scroll-gesture-locked');
    // Defer the actual resource swap until the physical wheel gesture has gone
    // quiet. Navigating immediately destroys the old iframe's wheel listener,
    // allowing latched inertial events to scroll the new document unchecked.
    releaseScrollBoundaryGestureAfterQuietPeriod();
  };

  const navigatePage = (direction: -1 | 1) => {
    if (isContinuousScroll(settingsRef.current) && resourceStripRef.current) {
      resourceStripRef.current.turn(direction);
      return;
    }
    // Keep a small bounded queue so clicks and key presses made while a chapter
    // or layout is settling are applied instead of being silently discarded.
    pendingNavigationRef.current = Math.max(-3, Math.min(3, pendingNavigationRef.current + direction));
    navigationStartedAtRef.current ??= performance.now();
    if (deferredDirectionRef.current !== direction) {
      deferredDirectionRef.current = direction;
      const href = navigatorRef.current?.currentLocator?.href;
      if (href) void prepareAdjacentLayouts(href, direction);
    }
    drainNavigationQueue();
  };

  const drainNavigationQueue = () => {
    const navigator = navigatorRef.current;
    const pending = pendingNavigationRef.current;
    if (!navigator || pending === 0 || layoutRestoringRef.current || navigationLockedRef.current || !isReadiumNavigationReady(navigator)) return;

    const direction: -1 | 1 = pending > 0 ? 1 : -1;
    const warmNavigation = inspectWarmNavigationPath(navigator, direction);
    const warmPath = warmNavigation.warm;
    pendingNavigationRef.current -= direction;
    navigationLockedRef.current = true;
    const token = ++navigationTokenRef.current;
    let finished = false;
    let dispatchedAt = 0;
    let navigationId = 0;
    const attempt = navigationRetryCountRef.current + 1;
    const inputStartedAt = navigationStartedAtRef.current;
    navigationStartedAtRef.current = null;
    const outgoingScrollFrame = getLiveReadiumIframe(currentReadiumFrame(navigator))
      || Array.from(containerRef.current?.querySelectorAll<HTMLIFrameElement>('.readium-navigator-iframe') || [])
        .find((iframe) => {
          const style = getComputedStyle(iframe);
          return style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0;
        });
    const outgoingScrollDocument = outgoingScrollFrame?.contentDocument;
    outgoingScrollFrame?.classList.add('zenith-scroll-transition-outgoing');
    const scrollTransitionSnapshot = outgoingScrollFrame && containerRef.current
      ? createScrollTransitionSnapshot(outgoingScrollFrame, containerRef.current)
      : undefined;
    const finishScrollFrameTransition = () => {
      if (!outgoingScrollFrame && !scrollTransitionSnapshot) return;
      let remainingFrames = 120;
      const handOff = () => {
        const container = containerRef.current;
        if (!container) {
          outgoingScrollFrame?.classList.remove('zenith-scroll-transition-outgoing');
          scrollTransitionSnapshot?.remove();
          return;
        }
        // Keep the outgoing frame forced visible while the navigator finishes
        // updating its frame pool. revealReadiumFrames can already expose the
        // incoming frame here without producing a blank compositor frame.
        revealReadiumFrames(container, navigator);
        const currentHandle = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes?.[0];
        const incomingFrame = getLiveReadiumIframe(currentHandle);
        const incomingChanged = Boolean(
          incomingFrame
          && (
            !outgoingScrollFrame
            || incomingFrame !== outgoingScrollFrame
            || incomingFrame.contentDocument !== outgoingScrollDocument
          )
        );
        const incomingDocument = incomingFrame?.contentDocument;
        const incomingRenderable = Boolean(
          incomingDocument?.body
          && (
            incomingDocument.body.textContent?.trim()
            || incomingDocument.body.querySelector('img, picture, svg, canvas, video, object, embed')
          )
        );
        const incomingReady = Boolean(incomingChanged && incomingRenderable && currentHandle?.msg?.ready);
        remainingFrames -= 1;
        if ((!incomingReady || scrollBoundaryGestureLockedRef.current) && remainingFrames > 0) {
          window.requestAnimationFrame(handOff);
          return;
        }
        incomingFrame?.classList.add('zenith-scroll-transition-incoming');
        incomingFrame?.getAnimations().forEach((animation) => animation.cancel());
        incomingFrame?.style.setProperty('visibility', 'visible', 'important');
        incomingFrame?.style.setProperty('opacity', '1', 'important');
        // Confirm the incoming geometry over two paints. Only then remove the
        // outgoing visibility override and project the final active frame set.
        window.requestAnimationFrame(() => {
          revealReadiumFrames(containerRef.current, navigator);
          window.requestAnimationFrame(() => {
            outgoingScrollFrame?.classList.remove('zenith-scroll-transition-outgoing');
            scrollTransitionSnapshot?.remove();
            revealReadiumFrames(containerRef.current, navigator);
            // The frame pool has its own opacity transition. Keep the incoming
            // frame opaque until that transition has completed underneath, or
            // removing the outgoing frame exposes a transparent frame.
            window.setTimeout(() => {
              incomingFrame?.classList.remove('zenith-scroll-transition-incoming');
              incomingFrame?.style.removeProperty('visibility');
              incomingFrame?.style.removeProperty('opacity');
              revealReadiumFrames(containerRef.current, navigator);
            }, 220);
          });
        });
      };
      window.requestAnimationFrame(handOff);
    };
    if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
    const unlock = (ok?: boolean, transport?: 'direct' | 'postMessage') => {
      if (finished) return;
      finished = true;
      finishScrollFrameTransition();
      if (navigationTokenRef.current !== token) return;
      if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
      navigationUnlockTimerRef.current = null;
      navigationLockedRef.current = false;
      const shouldRetry = ok === false
        && navigationRetryCountRef.current < 2
        && canNavigateInDirection(navigator, direction);
      if (shouldRetry) {
        navigationRetryCountRef.current += 1;
        pendingNavigationRef.current = Math.max(-3, Math.min(3, pendingNavigationRef.current + direction));
        navigationStartedAtRef.current ??= inputStartedAt;
      } else {
        navigationRetryCountRef.current = 0;
      }
      if (navigationId > 0) {
        recordReaderMetric({
          kind: 'navigation',
          name: 'navigator-callback',
          durationMs: performance.now() - dispatchedAt,
          hit: warmPath,
          detail: { navigationId, attempt, direction, warmPath, ok, retried: shouldRetry, transport, ...warmNavigation.detail },
        });
      }
      if (shouldRetry) {
        if (navigationRetryTimerRef.current !== null) window.clearTimeout(navigationRetryTimerRef.current);
        navigationRetryTimerRef.current = window.setTimeout(() => {
          navigationRetryTimerRef.current = null;
          drainNavigationQueue();
        }, 50);
      } else {
        queueMicrotask(drainNavigationQueue);
      }
    };
    // The vendored navigator now releases its own lock on all known failure
    // paths. This remains a final guard against an unexpected lost IPC reply.
    const finishNavigation = (ok?: boolean, transport?: 'direct' | 'postMessage') => {
      if (finished || navigationTokenRef.current !== token) return;
      const completedHref = navigator.currentLocator?.href;
      if (ok && completedHref && completedHref !== warmNavigation.detail.href) {
        deferredHrefRef.current = completedHref;
        deferredDirectionRef.current = direction;
        void prepareAdjacentLayouts(completedHref, direction);
      }
      if (!isContinuousScroll(settingsRef.current)) {
        animatePageEntry(containerRef.current, settingsRef.current.pageTurnAnimation, direction, pageTransitionRef);
      }
      if (
        ok
        && isContinuousScroll(settingsRef.current)
        && completedHref
        && completedHref !== warmNavigation.detail.href
      ) {
        snapContinuousResourceBoundary(navigator, direction);
      }
      if (ok) scheduleStableAnchorCapture(navigator, 2);
      if (ok && inputStartedAt !== null) {
        requestAnimationFrame(() => recordReaderMetric({
          kind: 'navigation',
          name: 'input-to-next-frame',
          durationMs: performance.now() - inputStartedAt,
          hit: warmPath,
          detail: { navigationId, attempt, direction, warmPath, ...warmNavigation.detail },
        }));
      }
      unlock(ok, transport);
    };
    const navigate = () => {
      dispatchedAt = performance.now();
      navigationId = ++navigationIdRef.current;
      navigationUnlockTimerRef.current = window.setTimeout(() => finishNavigation(), 2500);
      const onNavigationFinished = (ok: boolean, transport?: 'direct' | 'postMessage', turnRequestId?: number) => {
        if (turnRequestId !== undefined) {
          navigationByTurnRequestRef.current.set(turnRequestId, navigationId);
          window.setTimeout(() => navigationByTurnRequestRef.current.delete(turnRequestId), 5000);
        }
        finishNavigation(ok, transport);
      };
      if (direction > 0) navigator.goForward(false, onNavigationFinished);
      else navigator.goBackward(false, onNavigationFinished);
    };
    try {
      if (isContinuousScroll(settingsRef.current)) navigate();
      else animatePageExit(containerRef.current, settingsRef.current.pageTurnAnimation, direction, pageTransitionRef, navigate);
    } catch (error) {
      unlock();
      console.warn('Readium page turn failed', error);
    }
  };

  const inspectWarmNavigationPath = (navigator: EpubNavigator, direction: -1 | 1) => {
    const publication = publicationRef.current;
    const container = containerRef.current;
    const locator = navigator.currentLocator;
    if (!publication || !container || !locator?.href) return { warm: false, detail: {} };
    const normalized = publication.readingOrder.findWithHref(locator.href)?.href || locator.href;
    const visible = navigator.viewport.progressions.get(normalized);
    const crossesResource = direction > 0 ? (visible?.end ?? 0) >= 0.999 : (visible?.start ?? 1) <= 0.001;
    if (!crossesResource) return { warm: true, detail: { href: normalized, crossesResource: false } };
    const index = publication.readingOrder.findIndexWithHref(normalized);
    const target = publication.readingOrder.items[index + direction];
    if (!target) return { warm: true, detail: { href: normalized, crossesResource: true } };
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    const key = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${target.href}`;
    const layoutReady = layoutCacheRef.current.isReady(key);
    const frameReady = navigatorHasPreparedFrame(navigator, target.href);
    const physicalReady = navigator.isPreparedReady(target.locator, key);
    const reservedHref = navigatorReservedHref(navigator);
    const reserved = reservedHref === target.href;
    const poolSize = navigatorPreparedPoolSize(navigator);
    const nearBoundary = isNearResourceBoundary(navigator, normalized, direction);
    return {
      warm: physicalReady,
      detail: { href: normalized, targetHref: target.href, crossesResource: true, layoutReady, frameReady, physicalReady, reserved, reservedCount: reservedHref ? 1 : 0, poolSize, nearBoundary },
    };
  };

  const canNavigateInDirection = (navigator: EpubNavigator, direction: -1 | 1) => {
    const publication = publicationRef.current;
    const locator = navigator.currentLocator;
    if (!publication || !locator?.href) return false;
    const normalized = publication.readingOrder.findWithHref(locator.href)?.href || locator.href;
    const visible = navigator.viewport.progressions.get(normalized);
    if (direction < 0 && (visible?.start ?? locator.locations?.progression ?? 0) > 0.001) return true;
    if (direction > 0 && (visible?.end ?? locator.locations?.progression ?? 1) < 0.999) return true;
    const index = publication.readingOrder.findIndexWithHref(normalized);
    return index >= 0 && index + direction >= 0 && index + direction < publication.readingOrder.items.length;
  };

  const closePreview = () => {
    if (savingImage) return;
    setPreviewImage(null);
    setSaveStatus('');
  };

  const savePreviewImage = async () => {
    if (!previewImage) return;
    try {
      setSavingImage(true);
      setSaveStatus('');
      await saveImageFromSource(previewImage.src, previewImage.name);
      setSaveStatus('已保存');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingImage(false);
    }
  };

  const goBackward = (event: React.MouseEvent | React.PointerEvent) => {
    event.stopPropagation();
    navigatePage(-1);
  };

  const goForward = (event: React.MouseEvent | React.PointerEvent) => {
    event.stopPropagation();
    navigatePage(1);
  };

  if (loadError) {
    return <ReaderLoadError message={loadError} onRetry={() => setReloadToken((value) => value + 1)} />;
  }

  return (
    <div className="group relative h-full w-full select-none overflow-hidden">
      <div
        className="absolute inset-0 box-border"
        style={{
          paddingLeft: `min(${settings.pageMargins.left}px, 35vw)`,
          paddingRight: `min(${settings.pageMargins.right}px, 35vw)`,
          paddingTop: `min(${settings.pageMargins.top}px, 30vh)`,
          paddingBottom: `min(${settings.pageMargins.bottom}px, 30vh)`,
        }}
      >
        <div className="relative h-full w-full min-h-0 min-w-0">
          <div ref={containerRef} className={`readium-container h-full w-full ${loading ? 'readium-initializing' : ''}`} />
          <div ref={resourceStripHostRef} className={`zenith-resource-strip-host ${loading ? 'zenith-resource-strip-initializing' : ''}`} aria-hidden="true" />
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-1/2 z-40 -translate-y-1/2">
        <button
          className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[5px] border border-black/10 bg-white/75 shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-[#1C1C1E]/75 ${chromeVisible ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          onClick={goBackward}
          onPointerDown={(event) => event.stopPropagation()}
          title="上一页"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="pointer-events-none absolute right-3 top-1/2 z-40 -translate-y-1/2">
        <button
          className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[5px] border border-black/10 bg-white/75 shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-[#1C1C1E]/75 ${chromeVisible ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          onClick={goForward}
          onPointerDown={(event) => event.stopPropagation()}
          title="下一页"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {pageLabel && (
        <div className={`absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-[5px] border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-black/55 shadow-sm backdrop-blur-xl transition-opacity dark:border-white/10 dark:bg-[#1C1C1E]/70 dark:text-white/55 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`}>
          {pageLabel}
        </div>
      )}

      <ReaderPageCounter value={pageCounter} />

      {loading && (
        txtPreview ? (
          <div
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-inherit"
            style={{
              paddingLeft: `min(${settings.pageMargins.left}px, 35vw)`,
              paddingRight: `min(${settings.pageMargins.right}px, 35vw)`,
              paddingTop: `min(${settings.pageMargins.top}px, 30vh)`,
              paddingBottom: `min(${settings.pageMargins.bottom}px, 30vh)`,
            }}
          >
            <div
              className="h-full overflow-hidden whitespace-pre-wrap"
              style={{
                color: readerThemeColors(settings.theme).text,
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                letterSpacing: `${settings.letterSpacing}em`,
                lineHeight: settings.lineHeight,
              }}
            >
              {txtPreview}
            </div>
          </div>
        ) : <ReaderLoading overlay />
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <motion.div
              className="relative max-h-[92vh] max-w-[96vw]"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="max-h-[86vh] max-w-[96vw] rounded-[5px] object-contain shadow-2xl"
                draggable={false}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <button
                  onClick={savePreviewImage}
                  disabled={savingImage}
                  className="flex h-10 items-center gap-2 rounded-[5px] border border-white/50 bg-white/88 px-3 text-sm font-medium text-[#1C1C1E] shadow-lg backdrop-blur-xl transition-all hover:bg-white active:scale-95 disabled:opacity-70"
                >
                  {savingImage ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saveStatus === '已保存' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  {saveStatus === '已保存' ? '已保存' : '保存'}
                </button>
                <button
                  onClick={closePreview}
                  className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-white/50 bg-white/88 text-[#1C1C1E] shadow-lg backdrop-blur-xl transition-all hover:bg-white active:scale-95"
                  title="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {saveStatus && saveStatus !== '已保存' && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[5px] bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                  {saveStatus}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function toTocItems(publication: ReadiumPublicationLike): ReaderTocItem[] {
  const source = publication.toc.items.length > 0 ? publication.toc.items : publication.readingOrder.items;
  return source.map((link, index) => ({
    id: `${link.href}-${index}`,
    title: link.title || `章节 ${index + 1}`,
    href: link.href,
    index,
  }));
}

function currentTocItemId(
  locator: { href: string; locations?: { progression?: number } },
  publication: ReadiumPublicationLike,
  document?: Document,
) {
  const items = toTocItems(publication);
  if (items.length === 0) return null;
  const href = publication.readingOrder.findWithHref(locator.href)?.href || locator.href.split('#')[0];
  const resourceIndex = publication.readingOrder.findIndexWithHref(href);
  let current = items[0];
  for (const item of items) {
    if (!item.href) continue;
    const itemHref = publication.readingOrder.findWithHref(item.href)?.href || item.href.split('#')[0];
    const itemResourceIndex = publication.readingOrder.findIndexWithHref(itemHref);
    if (itemResourceIndex > resourceIndex) break;
    if (itemResourceIndex === resourceIndex && document) {
      const fragment = item.href.split('#')[1];
      const element = fragment ? document.getElementById(safeDecodeFragment(fragment)) : undefined;
      const progression = element ? elementProgression(element, document) : 0;
      if (progression > (locator.locations?.progression ?? 0) + 0.02) continue;
    }
    current = item;
  }
  return current.id;
}

function safeDecodeFragment(fragment: string) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function elementProgression(element: HTMLElement, document: Document) {
  const scroller = document.scrollingElement;
  const rect = element.getBoundingClientRect();
  if (!scroller) return 0;
  if (scroller.scrollWidth > document.defaultView!.innerWidth * 1.25) {
    return Math.max(0, Math.min(1, (Math.abs(scroller.scrollLeft) + rect.left) / Math.max(1, scroller.scrollWidth)));
  }
  return Math.max(0, Math.min(1, (scroller.scrollTop + rect.top) / Math.max(1, scroller.scrollHeight)));
}

function createReadiumPreferences(settings: ReturnType<typeof useAppContext>['settings'], bookType: 'epub' | 'txt') {
  const columns = isContinuousScroll(settings) ? null : settings.pageMode === 'double' ? 2 : 1;
  const lineLengths = readiumLineLengths(isContinuousScroll(settings) ? 'single' : settings.pageMode);
  return {
    backgroundColor: readerThemeColors(settings.theme).background,
    textColor: readerThemeColors(settings.theme).text,
    fontFamily: settings.fontFamily,
    fontSize: readiumFontScale(settings.fontSize, bookType),
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    columnCount: columns,
    pageGutter: 0,
    scroll: isContinuousScroll(settings),
    scrollPaddingTop: 0,
    scrollPaddingRight: 0,
    scrollPaddingBottom: 0,
    scrollPaddingLeft: 0,
    ...lineLengths,
  };
}

function readiumLineLengths(pageMode: AppSettings['pageMode']) {
  if (pageMode === 'double') {
    return {
      optimalLineLength: 38,
      minimalLineLength: 24,
      maximalLineLength: null,
    };
  }

  return {
    optimalLineLength: 68,
    minimalLineLength: 35,
    maximalLineLength: 95,
  };
}

function createReadiumDefaults(settings: ReturnType<typeof useAppContext>['settings'], bookType: 'epub' | 'txt') {
  return {
    ...createReadiumPreferences(settings, bookType),
  };
}

function legacyProgressPosition(progress: number | undefined, publication: ReadiumPublicationLike) {
  if (progress === undefined || publication.positions.length === 0) return undefined;
  return locatorAtProgress(publication, progress);
}

function normalizeLocatorToPublicationPosition(
  locator: ReadiumLocatorLike | undefined,
  publication: ReadiumPublicationLike,
) {
  if (!locator) return undefined;
  if (typeof locator.locations?.position === 'number') return locator;
  const normalizedHref = publication.readingOrder.findWithHref(locator.href)?.href || locator.href.split('#')[0];
  const range = publication.positions.filter((position) => {
    const href = publication.readingOrder.findWithHref(position.href)?.href || position.href.split('#')[0];
    return href === normalizedHref;
  });
  if (range.length === 0) return publication.positions[0];
  const progression = typeof locator.locations?.progression === 'number' ? locator.locations.progression : 0;
  const selected = range[Math.min(range.length - 1, Math.max(0, Math.floor(progression * range.length)))];
  return selected.copyWithLocations({
    ...locator.locations,
    ...selected.locations,
    progression,
  });
}

function snapshotLocator(locator?: ReadiumLocator) {
  return locator ? deserializeReadiumLocator(serializeReadiumLocator(locator)) : undefined;
}

function snapshotVisibleTextLocator(navigator: EpubNavigator, settings: AppSettings) {
  const fallback = snapshotLocator(navigator.currentLocator);
  if (!fallback) return undefined;
  const frame = currentReadiumFrame(navigator);
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const doc = wnd?.document;
  if (!wnd || !doc?.body) return fallback;

  const horizontal = doc.documentElement.scrollWidth > wnd.innerWidth * 1.25;
  // Keep one definition of the user's visual reading position in every mode.
  // Choosing the left-page centre for a spread made double -> single/scroll
  // transitions jump by an entire physical page even though the old viewport
  // centre was still visible immediately before the switch.
  const targetX = wnd.innerWidth * 0.5;
  const targetY = wnd.innerHeight * 0.5;
  const candidates = Array.from(doc.body.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
    .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
    .filter(({ element, rect }) => element.textContent?.trim() && rect.right > 0 && rect.left < wnd.innerWidth && rect.bottom > 0 && rect.top < wnd.innerHeight)
    .sort((a, b) => distanceToRectCenter(a.rect, targetX, targetY) - distanceToRectCenter(b.rect, targetX, targetY));
  const selected = candidates[0];
  const element = selected?.element;
  const probeX = selected ? Math.max(selected.rect.left + 1, Math.min(targetX, selected.rect.right - 1)) : targetX;
  const probeY = selected ? Math.max(selected.rect.top + 1, Math.min(targetY, selected.rect.bottom - 1)) : targetY;
  const text = element
    ? textAnchorNearPoint(element, probeX, probeY) || firstSentence(element.textContent || '')
    : '';
  const anchorRect = element && text ? textRangeRect(element, text) || selected?.rect : selected?.rect;
  const selectorGenerator = (wnd as Window & {
    _readium_cssSelectorGenerator?: { getCssSelector: (element: Element) => string };
  })._readium_cssSelectorGenerator;
  if (!element || !text || !selectorGenerator) return fallback;

  try {
    const serialized = JSON.parse(serializeReadiumLocator(fallback));
    serialized.locations = {
      ...serialized.locations,
      cssSelector: selectorGenerator.getCssSelector(element),
      zenithAnchorText: text,
      zenithViewportX: anchorRect ? ((anchorRect.left + anchorRect.right) / 2) / wnd.innerWidth : 0.5,
      zenithViewportY: anchorRect ? ((anchorRect.top + anchorRect.bottom) / 2) / wnd.innerHeight : 0.5,
    };
    serialized.text = { highlight: text };
    return deserializeReadiumLocator(JSON.stringify(serialized)) || fallback;
  } catch {
    return fallback;
  }
}

function retargetLocatorViewport(locator: ReadiumLocator, settings: AppSettings) {
  try {
    const serialized = JSON.parse(serializeReadiumLocator(locator));
    serialized.locations = {
      ...serialized.locations,
      zenithViewportX: 0.5,
      zenithViewportY: 0.5,
    };
    return deserializeReadiumLocator(JSON.stringify(serialized)) || locator;
  } catch {
    return locator;
  }
}

function distanceToRectCenter(rect: DOMRect, x: number, y: number) {
  const dx = (rect.left + rect.right) / 2 - x;
  const dy = (rect.top + rect.bottom) / 2 - y;
  return dx * dx + dy * dy;
}

function firstSentence(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.match(/^.*?[。！？!?](?:[”’」』】》])?/)?.[0] || normalized.slice(0, 160);
}

function textAnchorNearPoint(element: Element, x: number, y: number) {
  const doc = element.ownerDocument as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const caretPosition = doc.caretPositionFromPoint?.(x, y);
  const caretRange = caretPosition ? undefined : doc.caretRangeFromPoint?.(x, y);
  const node = caretPosition?.offsetNode || caretRange?.startContainer;
  const nodeOffset = caretPosition?.offset ?? caretRange?.startOffset;
  if (!node || nodeOffset === undefined || !element.contains(node)) return undefined;

  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let combined = '';
  let caretOffset = -1;
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text;
    if (textNode === node) caretOffset = combined.length + Math.min(nodeOffset, textNode.length);
    combined += textNode.data;
  }
  if (caretOffset < 0 || !combined.trim()) return undefined;

  const boundary = /[。！？!?\n]/;
  let start = caretOffset;
  while (start > 0 && caretOffset - start < 120 && !boundary.test(combined[start - 1])) start -= 1;
  let end = caretOffset;
  while (end < combined.length && end - caretOffset < 120) {
    const character = combined[end++];
    if (boundary.test(character)) break;
  }
  const anchor = combined.slice(start, end).replace(/\s+/g, ' ').trim();
  return anchor || undefined;
}

function textRangeRect(element: Element, text: string) {
  const rects = textRangeRects(element, text);
  return rects.length > 0 ? rects[Math.floor((rects.length - 1) / 2)] : undefined;
}

function textRangeRects(element: Element, text: string) {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let combined = '';
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push(node);
    combined += node.data;
  }
  const normalizedTarget = text.replace(/\s+/g, ' ').trim();
  if (!normalizedTarget) return [];
  const normalized = combined.replace(/\s+/g, ' ');
  const normalizedIndex = normalized.indexOf(normalizedTarget);
  if (normalizedIndex < 0) return [];
  const rawStart = rawOffsetForNormalizedOffset(combined, normalizedIndex);
  const rawEnd = rawOffsetForNormalizedOffset(combined, normalizedIndex + normalizedTarget.length);
  const start = textPositionAt(nodes, rawStart);
  const end = textPositionAt(nodes, rawEnd);
  if (!start || !end) return [];
  const range = element.ownerDocument.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  const rects = Array.from(range.getClientRects());
  if (rects.length > 0) return rects;
  const fallback = range.getBoundingClientRect();
  return fallback.width > 0 || fallback.height > 0 ? [fallback] : [];
}

function rawOffsetForNormalizedOffset(text: string, target: number) {
  if (target <= 0) return 0;
  let normalized = 0;
  let whitespace = false;
  for (let index = 0; index < text.length; index++) {
    const currentWhitespace = /\s/.test(text[index]);
    if (!currentWhitespace || !whitespace) normalized += 1;
    whitespace = currentWhitespace;
    if (normalized >= target) return index + 1;
  }
  return text.length;
}

function textPositionAt(nodes: Text[], offset: number) {
  let remaining = offset;
  for (const node of nodes) {
    if (remaining <= node.length) return { node, offset: remaining };
    remaining -= node.length;
  }
  const node = nodes.at(-1);
  return node ? { node, offset: node.length } : undefined;
}

function navigateToLocator(navigator: EpubNavigator, locator: ReadiumLocator, beforeCorrection?: () => void) {
  return new Promise<void>((resolve) => {
    const directNavigator = navigator as EpubNavigator & {
      loadLocator?: (locator: ReadiumLocator, callback: (ok: boolean) => void) => void;
    };
    const currentHref = navigator.currentLocator?.href?.split('#')[0];
    const targetHref = locator.href?.split('#')[0];
    const canRelocateCurrentFrame = Boolean(currentHref && currentHref === targetHref && directNavigator.loadLocator);
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeoutId);
      beforeCorrection?.();
      requestAnimationFrame(() => {
        beforeCorrection?.();
        requestAnimationFrame(() => {
          beforeCorrection?.();
          restoreAnchorOffset(navigator, locator);
          // A rebuilt iframe can report its first usable geometry one frame
          // before ReadiumCSS has finished applying the final column/scroll
          // measurements. Re-apply both layout and semantic correction against
          // that final geometry before unlocking page turns.
          requestAnimationFrame(() => {
            beforeCorrection?.();
            restoreAnchorOffset(navigator, locator);
            resolve();
          });
        });
      });
    };
    // A large uncached TXT reflow can legitimately exceed 700ms. Unlocking the
    // layout transaction while Readium is still navigating lets the next
    // setting or page turn mutate the old frame and corrupts its position.
    // Only recover after the navigator has actually gone idle; force-release
    // the private guard solely as a final lost-callback failsafe.
    const timeoutId = window.setTimeout(async () => {
      if (!canRelocateCurrentFrame) {
        await waitUntil(() => !readiumNavigationInFlight(navigator), 1800);
        if (readiumNavigationInFlight(navigator)) {
          (navigator as EpubNavigator & { _isNavigating?: boolean })._isNavigating = false;
        }
      }
      finish();
    }, 1800);
    try {
      if (canRelocateCurrentFrame) directNavigator.loadLocator!(locator, finish);
      else navigator.go(locator, false, finish);
    } catch {
      finish();
    }
  });
}

function readiumNavigationInFlight(navigator: EpubNavigator) {
  return Boolean((navigator as EpubNavigator & { _isNavigating?: boolean })._isNavigating);
}

function waitUntil(predicate: () => boolean, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const poll = () => {
      if (predicate() || performance.now() - startedAt >= timeoutMs) resolve();
      else window.setTimeout(poll, 4);
    };
    poll();
  });
}

function restoreAnchorOffset(navigator: EpubNavigator, locator: ReadiumLocator) {
  let locations: Record<string, unknown> | undefined;
  let serializedText: Record<string, unknown> | undefined;
  try {
    const serialized = JSON.parse(serializeReadiumLocator(locator));
    locations = serialized.locations;
    serializedText = serialized.text;
  } catch {
    return;
  }
  const frame = currentReadiumFrame(navigator);
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const scroller = wnd?.document.scrollingElement;
  if (!wnd || !scroller) return;
  const horizontal = scroller.scrollWidth > wnd.innerWidth * 1.25;
  if (horizontal) {
    snapPaginatedFrameOffset(wnd, scroller);
    // Readium's text navigation makes the semantic anchor visible, but after a
    // scroll/single/double reflow it can land in the right page or at a stale
    // half-spread offset. Place the same text on the intended physical page,
    // then snap once more to eliminate sub-column geometry drift.
    const selector = readiumAnchorSelector(locator, locations);
    const anchorText = readiumAnchorText(locator, locations, serializedText);
    const viewportX = typeof locations?.zenithViewportX === 'number' ? locations.zenithViewportX : 0.5;
    const viewportY = typeof locations?.zenithViewportY === 'number' ? locations.zenithViewportY : 0.5;
    {
      const element = findAnchorElement(wnd.document, selector, anchorText);
      const rect = element && anchorText
        ? textRangeRect(element, anchorText) || element.getBoundingClientRect()
        : element?.getBoundingClientRect();
      if (rect) {
        const targetX = viewportX * wnd.innerWidth;
        const targetY = viewportY * wnd.innerHeight;
        const rects = element && anchorText
          ? textRangeRects(element, anchorText)
          : [rect];
        const anchorRect = rects
          .filter((candidate) => candidate.width > 0 && candidate.height > 0)
          .sort((a, b) => distanceToRectCenter(a, targetX, targetY) - distanceToRectCenter(b, targetX, targetY))[0] || rect;
        const stride = paginatedPhysicalStride(wnd);
        if (stride > 1) {
          const deltaColumns = Math.round((((anchorRect.left + anchorRect.right) / 2) - targetX) / stride);
          if (deltaColumns !== 0) {
            const elementScroller = scroller as HTMLElement;
            elementScroller.scrollLeft += deltaColumns * stride;
          }
        }
      }
    }
    snapPaginatedFrameOffset(wnd, scroller);
    return;
  }

  const selector = readiumAnchorSelector(locator, locations);
  const anchorText = readiumAnchorText(locator, locations, serializedText);
  const viewportY = typeof locations?.zenithViewportY === 'number' ? locations.zenithViewportY : 0.5;
  const element = findAnchorElement(wnd.document, selector, anchorText);
  const rect = element && anchorText
    ? textRangeRect(element, anchorText) || element.getBoundingClientRect()
    : element?.getBoundingClientRect();
  if (!rect) return;
  if (scroller.scrollHeight > wnd.innerHeight * 1.25) {
    scroller.scrollTop += (rect.top + rect.bottom) / 2 - viewportY * wnd.innerHeight;
  }
}

function readiumAnchorSelector(locator: ReadiumLocator, locations?: Record<string, unknown>) {
  if (typeof locations?.cssSelector === 'string') return locations.cssSelector;
  const accessor = (locator.locations as { getCssSelector?: () => string | undefined } | undefined)?.getCssSelector;
  return typeof accessor === 'function' ? accessor.call(locator.locations) : undefined;
}

function readiumAnchorText(
  locator: ReadiumLocator,
  locations?: Record<string, unknown>,
  serializedText?: Record<string, unknown>,
) {
  if (typeof locations?.zenithAnchorText === 'string') return locations.zenithAnchorText;
  if (typeof serializedText?.highlight === 'string') return serializedText.highlight;
  const highlight = (locator.text as { highlight?: string } | undefined)?.highlight;
  return typeof highlight === 'string' ? highlight : undefined;
}

function findAnchorElement(doc: Document, selector?: string, anchorText?: string) {
  if (selector) {
    try {
      const selected = doc.querySelector(selector);
      if (selected && (!anchorText || normalizeAnchorText(selected.textContent || '').includes(normalizeAnchorText(anchorText)))) {
        return selected;
      }
    } catch {
      // Fall through to text matching for stale or publication-specific selectors.
    }
  }
  if (!anchorText) return undefined;
  const normalized = normalizeAnchorText(anchorText);
  return Array.from(doc.body?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || [])
    .find((element) => normalizeAnchorText(element.textContent || '').includes(normalized));
}

function normalizeAnchorText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function snapPaginatedFrameOffset(wnd: Window, scroller: Element) {
  const stride = paginatedPhysicalStride(wnd);
  if (!Number.isFinite(stride) || stride <= 1) return;

  const current = (scroller as HTMLElement).scrollLeft;
  const normalized = Math.abs(current);
  const snapped = Math.round(normalized / stride) * stride;
  // Preserve the browser's RTL scrollLeft convention. At zero there is no
  // direction information to preserve and no correction is needed.
  (scroller as HTMLElement).scrollLeft = current < 0 ? -snapped : snapped;
}

function paginatedPhysicalStride(wnd: Window) {
  const rootStyle = wnd.getComputedStyle(wnd.document.documentElement);
  const columnCount = Number.parseInt(rootStyle.columnCount, 10) || 1;
  const columnGap = Number.parseFloat(rootStyle.columnGap) || 0;
  // window.innerWidth is the full spread. In double-page mode each physical
  // column occupies half of (viewport + the center gap).
  return (wnd.innerWidth + (columnCount > 1 ? columnGap : 0)) / columnCount;
}

function currentReadiumFrame(navigator: EpubNavigator) {
  const frames = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes || [];
  return frames.find((frame) => {
    const iframe = getLiveReadiumIframe(frame);
    return iframe && getComputedStyle(iframe).visibility === 'visible';
  }) || frames[0];
}

function snapContinuousResourceBoundary(navigator: EpubNavigator, direction: -1 | 1, remainingFrames = 6) {
  window.requestAnimationFrame(() => {
    // Use the navigator's active frame directly. The outgoing frame is kept
    // visible during handoff and therefore cannot be selected by visibility.
    const handle = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes?.[0];
    const wnd = getLiveReadiumIframe(handle)?.contentWindow;
    const scroller = wnd?.document.scrollingElement;
    if (scroller && wnd) {
      scroller.scrollTop = direction > 0
        ? 0
        : Math.max(0, scroller.scrollHeight - wnd.innerHeight);
    }
    if (remainingFrames > 1) snapContinuousResourceBoundary(navigator, direction, remainingFrames - 1);
  });
}

function navigatorHasPreparedFrame(navigator: EpubNavigator, href: string) {
  const framePool = (navigator as EpubNavigator & {
    framePool?: { pool?: Map<string, unknown> };
  }).framePool;
  if (!framePool?.pool) return false;
  if (framePool.pool.has(href)) return true;
  const normalized = href.split('#')[0];
  return Array.from(framePool.pool.keys()).some((key) => key.split('#')[0] === normalized);
}

function navigatorReservedHref(navigator: EpubNavigator) {
  return (navigator as EpubNavigator & { framePool?: { reservedHref?: string } }).framePool?.reservedHref;
}

function navigatorPreparedPoolSize(navigator: EpubNavigator) {
  return (navigator as EpubNavigator & { framePool?: { pool?: Map<string, unknown> } }).framePool?.pool?.size || 0;
}

function isNearResourceBoundary(navigator: EpubNavigator, href: string, direction: -1 | 1) {
  const normalized = href.split('#')[0];
  const viewportEntry = Array.from(navigator.viewport.progressions.entries())
    .find(([key]) => key.split('#')[0] === normalized)?.[1];
  if (!viewportEntry) return true;
  const frame = currentReadiumFrame(navigator);
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const scroller = wnd?.document.scrollingElement;
  let pageFraction = 0.2;
  if (wnd && scroller) {
    const horizontal = scroller.scrollWidth > wnd.innerWidth * 1.25;
    const extent = horizontal ? scroller.scrollWidth : scroller.scrollHeight;
    const viewportSize = horizontal ? wnd.innerWidth : wnd.innerHeight;
    if (extent > 0) pageFraction = Math.min(1, viewportSize / extent);
  }
  return direction > 0
    ? viewportEntry.end >= 1 - pageFraction
    : viewportEntry.start <= pageFraction;
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function waitForLayoutFrames() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function waitForFrameReadiness(doc: Document, bookType: 'epub' | 'txt') {
  const fontSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (fontSet) await withTimeout(fontSet.ready.then(() => undefined), 500);
  if (bookType === 'txt') return;
  const images = Array.from(doc.images).slice(0, 8);
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return withTimeout(image.decode().catch(() => {}), 350);
  }));
}

async function waitForCurrentFrameReadiness(navigator: EpubNavigator, bookType: 'epub' | 'txt') {
  const doc = getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentDocument;
  if (doc) await waitForFrameReadiness(doc, bookType);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T | undefined>((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), timeoutMs);
    promise.then((value) => {
      window.clearTimeout(timer);
      resolve(value);
    }, () => {
      window.clearTimeout(timer);
      resolve(undefined);
    });
  });
}

function yieldForReaderPreparation() {
  const taskScheduler = (globalThis as typeof globalThis & {
    scheduler?: { postTask?: (task: () => void, options: { priority: 'background'; delay?: number }) => Promise<void> };
  }).scheduler;
  if (taskScheduler?.postTask) {
    return taskScheduler.postTask(() => {}, { priority: 'background' });
  }
  return new Promise<void>((resolve) => window.requestIdleCallback(() => resolve(), { timeout: 120 }));
}

function createProgressPayload(bookId: string, location: string) {
  return {
    bookId,
    location,
    updatedAt: Date.now(),
  };
}

function applyReadiumFrameSettingsToNavigator(navigator: EpubNavigator, settings: AppSettings, bookType: 'epub' | 'txt') {
  const internal = navigator as EpubNavigator & {
    _cframes?: ReadiumFrameHandle[];
  };
  let layoutChanged = false;
  for (const frame of internal._cframes || []) {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    if (doc) layoutChanged = applyReadiumFrameSettings(doc, settings, bookType) || layoutChanged;
  }
  return layoutChanged;
}

function applyReadiumFrameSettings(doc: Document, settings: AppSettings, bookType: 'epub' | 'txt') {
  const root = doc.documentElement;
  const before = frameLayoutFingerprint(root);
  applyReaderDocumentStyles(doc, settings, bookType, isContinuousScroll(settings) ? 'continuous' : 'paged');
  if (isContinuousScroll(settings)) {
    root.style.removeProperty('--USER__colCount');
    root.style.removeProperty('--RS__colCount');
    root.style.removeProperty('--RS__colGap');
  } else {
    const columns = settings.pageMode === 'double' ? 2 : 1;
    root.style.setProperty('--USER__colCount', String(columns));
    root.style.setProperty('--RS__colCount', String(columns));
    root.style.setProperty('--RS__colGap', `${readiumCenterGap(settings)}px`);
  }
  root.style.removeProperty('--RS__colWidth');
  root.style.setProperty('--RS__pageGutter', '0px');
  root.style.setProperty('--RS__scrollPaddingTop', '0px');
  root.style.setProperty('--RS__scrollPaddingRight', '0px');
  root.style.setProperty('--RS__scrollPaddingBottom', '0px');
  root.style.setProperty('--RS__scrollPaddingLeft', '0px');
  const layoutChanged = before !== frameLayoutFingerprint(root);
  if (layoutChanged) readiumPageGeometryCache.delete(doc);
  return layoutChanged;
}

function frameLayoutFingerprint(root: HTMLElement) {
  return [
    '--USER__fontFamily',
    '--USER__fontSize',
    '--USER__lineHeight',
    '--USER__paraSpacing',
    '--USER__letterSpacing',
    '--USER__colCount',
    '--RS__colCount',
    '--RS__colGap',
    '--RS__colWidth',
    '--RS__pageGutter',
    '--RS__scrollPaddingTop',
    '--RS__scrollPaddingRight',
    '--RS__scrollPaddingBottom',
    '--RS__scrollPaddingLeft',
  ].map((property) => root.style.getPropertyValue(property)).join('|');
}

function isContinuousScroll(settings: AppSettings) {
  return settings.pageTurnAnimation === 'scroll';
}

function normalizeWheelDelta(event: WheelEvent, container: HTMLElement | null) {
  const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return dominantDelta * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return dominantDelta * Math.max(1, container?.clientHeight || window.innerHeight);
  }
  return dominantDelta;
}

function readiumCenterGap(settings: AppSettings) {
  return !isContinuousScroll(settings) && settings.pageMode === 'double' ? DOUBLE_PAGE_CENTER_GAP : 0;
}

function animatePageExit(
  element: HTMLElement | null,
  animation: AppSettings['pageTurnAnimation'],
  direction: -1 | 1,
  animationRef: React.MutableRefObject<Animation | null>,
  navigate: () => void,
) {
  if (!element || animation === 'minimal' || animation === 'scroll' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    navigate();
    return;
  }
  animationRef.current?.cancel();
  const horizontal = animation === 'slide-horizontal';
  const distance = direction * -Math.min(horizontal ? element.clientWidth : element.clientHeight, 72);
  const transform = horizontal ? `translate3d(${distance}px, 0, 0)` : `translate3d(0, ${distance}px, 0)`;
  const running = element.animate(
    [{ transform: 'translate3d(0, 0, 0)', opacity: 1 }, { transform, opacity: 0.15 }],
    { duration: 130, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
  );
  animationRef.current = running;
  running.finished.then(navigate, navigate);
}

function animatePageEntry(
  element: HTMLElement | null,
  animation: AppSettings['pageTurnAnimation'],
  direction: -1 | 1,
  animationRef: React.MutableRefObject<Animation | null>,
) {
  if (!element || (animation !== 'slide-horizontal' && animation !== 'slide-vertical')) return;
  animationRef.current?.cancel();
  const horizontal = animation === 'slide-horizontal';
  const distance = direction * Math.min(horizontal ? element.clientWidth : element.clientHeight, 72);
  const transform = horizontal ? `translate3d(${distance}px, 0, 0)` : `translate3d(0, ${distance}px, 0)`;
  animationRef.current = element.animate(
    [{ transform, opacity: 0.15 }, { transform: 'translate3d(0, 0, 0)', opacity: 1 }],
    { duration: 210, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' },
  );
}

function installReadiumWheel(
  wnd: Window,
  onPagedWheel: (event: WheelEvent) => void,
  onScrollBoundary: (event: WheelEvent, wnd: Window) => void,
  settingsRef: React.MutableRefObject<AppSettings>,
) {
  const doc = wnd.document;
  if (doc.documentElement.dataset.zenithReadiumWheelBound === 'true') return;
  doc.documentElement.dataset.zenithReadiumWheelBound = 'true';
  const handler = (event: WheelEvent) => {
    if (isContinuousScroll(settingsRef.current)) onScrollBoundary(event, wnd);
    else onPagedWheel(event);
  };
  wnd.addEventListener('wheel', handler, { passive: false, capture: true });
}

function installImagePreview(
  wnd: Window,
  onOpen: (image: { src: string; name: string }) => void,
) {
  const doc = wnd.document;
  installReadiumFrameStyles(doc);
  if (!doc || doc.body.dataset.zenithReadiumImageBound === 'true') return;
  doc.body.dataset.zenithReadiumImageBound = 'true';
  let lastOpenedAt = 0;

  const isImageEvent = (event: Event) => {
    const target = event.target as Element | null;
    return target?.closest?.('img, svg image') as Element | null;
  };

  const isPrimaryActivation = (event: Event) => {
    if ('button' in event && typeof event.button === 'number') return event.button === 0;
    return true;
  };

  const stopImagePointer = (event: Event) => {
    if (!isPrimaryActivation(event) || !isImageEvent(event)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const openFromEvent = (event: Event) => {
    if (!isPrimaryActivation(event)) return;
    const image = isImageEvent(event);
    if (!image) return;
    const now = Date.now();
    if (now - lastOpenedAt < 260) return;
    lastOpenedAt = now;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const src = getImageSource(image);
    if (src) {
      onOpen({ src, name: getImageName(image) });
    }
  };

  doc.addEventListener('contextmenu', (event) => event.stopPropagation(), true);
  doc.addEventListener('pointerdown', stopImagePointer, true);
  doc.addEventListener('click', openFromEvent, true);
}

function handleReadiumClick(event: ReadiumFrameClickEvent, onOpen: (image: { src: string; name: string }) => void) {
  const image = imageFromInteractiveElement(event.interactiveElement);
  if (!image) return false;
  onOpen(image);
  return true;
}

function imageFromInteractiveElement(value?: string) {
  if (!value || (!value.includes('<img') && !value.includes('<image'))) return null;
  const doc = new DOMParser().parseFromString(value, 'text/html');
  const image = doc.querySelector('img, svg image');
  const src = image ? getImageSource(image) : '';
  if (!src) return null;
  return {
    src,
    name: image ? getImageName(image) : 'image',
  };
}

function getImageSource(image: Element) {
  const tagName = image.tagName.toLowerCase();
  if (tagName === 'img') {
    return image.getAttribute('currentSrc') || (image as HTMLImageElement).currentSrc || image.getAttribute('src') || (image as HTMLImageElement).src || '';
  }
  return image.getAttribute('href') || image.getAttribute('xlink:href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
}

function getImageName(image: Element) {
  const tagName = image.tagName.toLowerCase();
  if (tagName === 'img') {
    return image.getAttribute('alt') || image.getAttribute('title') || image.getAttribute('aria-label') || 'image';
  }
  return image.getAttribute('aria-label') || image.getAttribute('title') || 'image';
}

function formatProgressLabel(progress: number) {
  return `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`;
}

function formatResourceStripPageCounter(locator: ReadiumLocator, publication: ReadiumPublicationLike) {
  const page = pageFromLocator(locator, publication);
  const percent = Math.max(0, Math.min(100, Math.round(progressionFromLocator(locator, publication) * 100)));
  return `全书位置 ${page.current} / ${page.total} · ${percent}%`;
}

function formatEpubPageCounter(navigator: EpubNavigator, locator: ReadiumLocator, publication: ReadiumPublicationLike) {
  const iframe = getLiveReadiumIframe(currentReadiumFrame(navigator));
  const wnd = iframe?.contentWindow;
  const doc = iframe?.contentDocument;
  let geometry = doc ? readiumPageGeometryCache.get(doc) : undefined;
  if (!geometry) {
    const viewportWidth = Math.max(1, wnd?.innerWidth || doc?.documentElement.clientWidth || 1);
    const viewportHeight = Math.max(1, wnd?.innerHeight || doc?.documentElement.clientHeight || 1);
    const scrollWidth = Math.max(viewportWidth, doc?.documentElement.scrollWidth || 0, doc?.body?.scrollWidth || 0);
    const scrollHeight = Math.max(viewportHeight, doc?.documentElement.scrollHeight || 0, doc?.body?.scrollHeight || 0);
    const rootStyle = wnd && doc ? wnd.getComputedStyle(doc.documentElement) : undefined;
    const columnCount = Math.max(1, Number.parseInt(rootStyle?.columnCount || '', 10) || 1);
    const columnGap = Math.max(0, Number.parseFloat(rootStyle?.columnGap || '') || 0);
    const horizontal = scrollWidth > viewportWidth * 1.1;
    geometry = {
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      columnCount,
      columnGap,
      horizontal,
      stride: horizontal ? (viewportWidth + (columnCount > 1 ? columnGap : 0)) / columnCount : viewportHeight,
    };
    if (doc) readiumPageGeometryCache.set(doc, geometry);
  }
  const scroller = doc?.scrollingElement as HTMLElement | null;
  const offset = geometry.horizontal ? Math.abs(scroller?.scrollLeft || wnd?.scrollX || 0) : Math.max(0, scroller?.scrollTop || wnd?.scrollY || 0);
  const extent = geometry.horizontal ? geometry.scrollWidth : geometry.scrollHeight;
  const chapterTotal = Math.max(1, Math.ceil((extent - 1) / geometry.stride));
  const chapterCurrent = Math.max(1, Math.min(chapterTotal, Math.floor((offset + 1) / geometry.stride) + 1));
  const visibleCount = geometry.horizontal ? geometry.columnCount : 1;
  const chapterEnd = Math.min(chapterTotal, chapterCurrent + visibleCount - 1);
  const chapterRange = chapterEnd > chapterCurrent ? `${chapterCurrent}–${chapterEnd}` : String(chapterCurrent);
  const page = pageFromLocator(locator, publication);
  const percent = Math.round((page.current / page.total) * 100);
  return `本章${geometry.horizontal ? '页' : '屏'} ${chapterRange} / ${chapterTotal} · 全书位置 ${page.current} / ${page.total} · ${percent}%`;
}

function invalidateReadiumPageGeometry(navigator: EpubNavigator) {
  const frames = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes || [];
  frames.forEach((frame) => {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    if (doc) readiumPageGeometryCache.delete(doc);
  });
}

function watchReadiumFrameLayout(wnd: Window, onLayout: () => void) {
  const doc = wnd.document;
  const invalidateAndNotify = () => {
    readiumPageGeometryCache.delete(doc);
    onLayout();
  };
  wnd.addEventListener('load', invalidateAndNotify, { once: true });
  doc.fonts?.ready.then(invalidateAndNotify).catch(() => {});
  doc.querySelectorAll('img').forEach((image) => {
    if (!(image as HTMLImageElement).complete) {
      image.addEventListener('load', invalidateAndNotify, { once: true });
      image.addEventListener('error', invalidateAndNotify, { once: true });
    }
  });
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function installReadiumFrameStyles(doc: Document) {
  if (!doc?.head || doc.getElementById('zenith-readium-frame-style')) return;
  const style = doc.createElement('style');
  style.id = 'zenith-readium-frame-style';
  style.textContent = `
    :root {
      -webkit-column-gap: var(--RS__colGap, 0px) !important;
      -moz-column-gap: var(--RS__colGap, 0px) !important;
      column-gap: var(--RS__colGap, 0px) !important;
    }

    :root:not([style*="readium-scroll-on"]) body {
      padding-block-start: 0 !important;
      padding-inline-end: 0 !important;
      padding-block-end: 0 !important;
      padding-inline-start: 0 !important;
    }

    img {
      border-radius: 5px !important;
      cursor: zoom-in !important;
      display: block;
      height: auto;
      max-width: 100%;
      object-fit: contain;
    }

    body > img,
    body > picture,
    body > svg {
      margin-inline: auto !important;
    }

    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) {
      align-items: center !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 28px !important;
      justify-content: center !important;
      min-height: 100vh !important;
      padding: 24px !important;
    }

    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) img {
      margin: 0 auto !important;
      max-height: calc(100vh - 48px) !important;
      width: auto !important;
    }

    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) > *,
    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) :is(div, section, figure) {
      align-items: center !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 28px !important;
      justify-content: center !important;
      margin-inline: auto !important;
      max-width: 100% !important;
    }
  `;
  doc.head.appendChild(style);
}

function revealReadiumFrames(container: HTMLElement | null, navigator: EpubNavigator | null) {
  if (!container || !navigator) return;
  const activeFrames = (navigator as EpubNavigator & {
    _cframes?: ReadiumFrameHandle[];
  })._cframes || [];
  const activeIframes = new Set(activeFrames
    .map((frame) => getLiveReadiumIframe(frame))
    .filter((iframe): iframe is HTMLIFrameElement => Boolean(iframe && container.contains(iframe))));
  // Layout changes replace the frame pool. Readium can leave the former
  // paginated iframe visible while the new scrolling (or new column-count)
  // frame is already active but hidden. Always make visibility an exact
  // projection of _cframes so stale geometry can never cover the live reader.
  container.querySelectorAll<HTMLIFrameElement>('.readium-navigator-iframe').forEach((iframe) => {
    if (activeIframes.has(iframe)) return;
    iframe.style.visibility = 'hidden';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
  });
  activeFrames.forEach((frame) => {
    const iframe = getLiveReadiumIframe(frame);
    if (!iframe || !container.contains(iframe)) return;
    iframe.style.removeProperty('visibility');
    iframe.style.removeProperty('opacity');
    iframe.style.removeProperty('pointer-events');
    iframe.removeAttribute('aria-hidden');
  });
}

function createScrollTransitionSnapshot(source: HTMLIFrameElement, container: HTMLElement) {
  const sourceDoc = source.contentDocument;
  const sourceWindow = source.contentWindow;
  if (!sourceDoc || !sourceWindow) return undefined;
  const snapshot = document.createElement('iframe');
  snapshot.className = 'zenith-scroll-transition-snapshot';
  snapshot.setAttribute('aria-hidden', 'true');
  snapshot.setAttribute('sandbox', 'allow-same-origin');
  const bounds = container.getBoundingClientRect();
  snapshot.style.left = `${bounds.left}px`;
  snapshot.style.top = `${bounds.top}px`;
  snapshot.style.width = `${bounds.width}px`;
  snapshot.style.height = `${bounds.height}px`;
  // The navigator replaces and prunes iframe children during a resource swap.
  // Mount the visual snapshot outside that managed subtree so it survives the
  // exact interval it is intended to cover.
  document.body.appendChild(snapshot);
  const snapshotDoc = snapshot.contentDocument;
  if (!snapshotDoc) {
    snapshot.remove();
    return undefined;
  }
  const root = sourceDoc.documentElement.cloneNode(true) as HTMLElement;
  root.querySelectorAll('script').forEach((script) => script.remove());
  const base = snapshotDoc.createElement('base');
  base.href = sourceDoc.baseURI;
  (root.querySelector('head') || root).prepend(base);
  snapshotDoc.replaceChild(root, snapshotDoc.documentElement);
  const scrollTop = sourceDoc.scrollingElement?.scrollTop || 0;
  const scrollLeft = sourceDoc.scrollingElement?.scrollLeft || 0;
  const syncScroll = () => {
    if (snapshot.contentDocument?.scrollingElement) {
      snapshot.contentDocument.scrollingElement.scrollTop = scrollTop;
      snapshot.contentDocument.scrollingElement.scrollLeft = scrollLeft;
    }
  };
  syncScroll();
  window.requestAnimationFrame(syncScroll);
  return snapshot;
}

type ReadiumFrameHandle = {
  destroyed?: boolean;
  frame?: HTMLIFrameElement;
  msg?: { ready?: boolean };
};

function getLiveReadiumIframe(handle?: ReadiumFrameHandle) {
  if (!handle || handle.destroyed) return undefined;
  const iframe = handle.frame;
  return iframe?.contentWindow ? iframe : undefined;
}

function isReadiumNavigationReady(navigator: EpubNavigator) {
  const handle = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes?.[0];
  return Boolean(getLiveReadiumIframe(handle) && handle?.msg?.ready);
}
