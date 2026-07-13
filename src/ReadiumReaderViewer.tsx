import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Download, LoaderCircle, X } from 'lucide-react';
import { EpubNavigator, EpubPreferences, ReadiumFrameClickEvent, ReadiumLocator } from './vendor/readium-navigator';
import { AppSettings, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import { getProgress, saveProgress } from './lib/storage';
import {
  deserializeReadiumLocator,
  pageFromLocator,
  progressionFromLocator,
  ReadiumPublicationLike,
  serializeReadiumLocator,
} from './lib/readiumPublication';
import { createReaderPublication } from './lib/readerPublication';
import { readTxtPreview, saveImageFromSource } from './lib/native';
import { ReaderLoadError, ReaderLoading, ReaderPageCounter, ReaderViewerProps } from './components/reader/ReaderShared';
import { createReaderLayoutKey, createReaderSettingsLayoutFingerprint, ReaderLayoutCache } from './lib/readerLayoutCache';
import { recordReaderMetric } from './lib/readerPerformance';

const DOUBLE_PAGE_CENTER_GAP = 56;
const IMMEDIATE_PREFETCH_RADIUS = 1;
const STABLE_PREFETCH_RADIUS = 3;
const WHEEL_PAGE_THRESHOLD = 80;
const WHEEL_GESTURE_RESET_MS = 180;
// Readium's CJK stylesheet renders generated Chinese TXT at a 14px base,
// while typical EPUB content here renders at 16px with our 18px scale base.
// 15.75 keeps the same setting perceptually equal across both formats.
const TXT_FONT_SCALE_BASE = 15.75;
const readiumPageGeometryCache = new WeakMap<Document, { viewportWidth: number; scrollWidth: number }>();

export function ReadiumReaderViewer({
  book,
  chromeVisible,
  onProgressChange,
  onToggleChrome,
  onTocChange,
  tocTarget,
  seekRequest,
  onPresentable,
}: ReaderViewerProps & {
  chromeVisible: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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
  const onProgressChangeRef = useRef(onProgressChange);
  const onToggleChromeRef = useRef(onToggleChrome);
  const onPresentableRef = useRef(onPresentable);
  const loadingResolvedRef = useRef(false);
  const settingsApplyTimerRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const settingsRevisionRef = useRef(0);
  const settingsAnchorRef = useRef<ReturnType<typeof snapshotLocator>>(undefined);
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
  const navigationLockedRef = useRef(false);
  const pendingNavigationRef = useRef(0);
  const navigationUnlockTimerRef = useRef<number | null>(null);
  const navigationRetryTimerRef = useRef<number | null>(null);
  const navigationRetryCountRef = useRef(0);
  const stablePrefetchTimerRef = useRef<number | null>(null);
  const refinementTimerRef = useRef<number | null>(null);
  const refinementIdleRef = useRef<number | null>(null);
  const refinementAbortRef = useRef<AbortController | null>(null);
  const positionsRefinedRef = useRef(false);
  const deferredHrefRef = useRef('');
  const deferredDirectionRef = useRef<-1 | 0 | 1>(0);
  const layoutCacheRef = useRef(new ReaderLayoutCache(3));
  const navigationStartedAtRef = useRef<number | null>(null);
  const settingsLayoutFingerprintRef = useRef(createReaderSettingsLayoutFingerprint(settings, book.type));

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
    previewImageRef.current = previewImage;
  }, [previewImage]);

  useEffect(() => {
    let cancelled = false;
    let pageCounterFrame: number | null = null;

    const schedulePageCounter = (locator?: ReadiumLocator) => {
      if (!locator) return;
      if (pageCounterFrame !== null) cancelAnimationFrame(pageCounterFrame);
      pageCounterFrame = requestAnimationFrame(() => {
        pageCounterFrame = null;
        const navigator = navigatorRef.current;
        const publication = publicationRef.current;
        if (cancelled || !navigator || !publication) return;
        setPageCounter(formatEpubPageCounter(navigator, locator, publication));
      });
    };

    const flushProgressSave = () => {
      const payload = pendingProgressRef.current;
      if (!payload) return;
      pendingProgressRef.current = null;
      lastSavedLocationRef.current = payload.location;
      saveProgress(payload).catch((error) => {
        console.warn('Failed to save Readium progress', error);
      });
    };

    const queueProgressSave = (locator: ReadiumLocator) => {
      const location = serializeReadiumLocator(locator);
      if (!location || location === lastSavedLocationRef.current) return;
      pendingProgressRef.current = createProgressPayload(book.id, book.fingerprint, location);
      if (progressSaveTimerRef.current !== null) return;
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
        const container = containerRef.current;
        if (!container) return;

        const progressPromise = getProgress(book.id);
        const publicationStartedAt = performance.now();
        const publicationPromise = createReaderPublication(book);
        const storedProgress = await progressPromise;
        if (book.type === 'txt' && !storedProgress?.location && storedProgress?.scrollPercentage === undefined) {
          readTxtPreview(book.path, 12_000).then((preview) => {
            if (!cancelled && !loadingResolvedRef.current) {
              setTxtPreview(preview.text);
              onPresentableRef.current?.();
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
        onTocChange(toTocItems(publication));
        if (cancelled) {
          if (publicationRef.current === publication) publicationRef.current = null;
          publication.close();
          return;
        }
        lastSavedLocationRef.current = storedProgress?.location || '';
        const initialPosition = deserializeReadiumLocator(storedProgress?.location)
          || legacyProgressPosition(storedProgress?.scrollPercentage, publication);
        if (initialPosition?.href) {
          publication.prefetchAroundHref(initialPosition.href, IMMEDIATE_PREFETCH_RADIUS).catch(() => {});
        } else {
          publication.prefetchAroundHref(publication.readingOrder.items[0]?.href || '', IMMEDIATE_PREFETCH_RADIUS).catch(() => {});
        }
        const initialPreferences = createReadiumPreferences(settingsRef.current, book.type);
        const navigatorStartedAt = performance.now();
        const navigator = new EpubNavigator(
          container,
          publication,
          {
            frameLoaded: (wnd) => {
              applyReadiumFrameSettings(wnd.document, settingsRef.current, book.type);
              installImagePreview(wnd, openPreview);
              if (!isScrollingTxt(book.type, settingsRef.current)) installReadiumWheel(wnd, navigateByWheel);
              watchReadiumFrameLayout(wnd, () => schedulePageCounter(navigatorRef.current?.currentLocator));
              queueMicrotask(drainNavigationQueue);
            },
            positionChanged: (locator) => {
              if (layoutRestoringRef.current) return;
              const progress = progressionFromLocator(locator, publication);
              const previousProgress = lastEmittedProgressRef.current;
              const direction: -1 | 0 | 1 = previousProgress < 0 ? 0 : progress > previousProgress ? 1 : progress < previousProgress ? -1 : 0;
              // Navigation completion is the latency-critical path. Cache
              // maintenance is intentionally started after Readium has released
              // the turn callback; the current/adjacent resources are already
              // covered by the immediate L1 window.
              queueMicrotask(() => {
                if (publicationRef.current !== publication) return;
                publication.prefetchAroundHref(locator.href, IMMEDIATE_PREFETCH_RADIUS, direction).catch(() => {});
                scheduleDeferredWork(locator.href, direction, false);
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
            defaults: createReadiumDefaults(settingsRef.current, book.type),
          },
        );
        recordReaderMetric({
          kind: 'load',
          name: `${book.type}-navigator-constructor`,
          durationMs: performance.now() - navigatorStartedAt,
        });

        navigatorRef.current = navigator;
        const loadingFallback = window.setTimeout(() => resolveLoading(true), 1800);
        const navigatorLoadStartedAt = performance.now();
        navigator.load()
          .then(async () => {
            if (cancelled) return;
            applyReadiumFrameSettingsToNavigator(navigator, settingsRef.current, book.type);
            await navigator.resizeHandler?.();
            await waitForCurrentFrameReadiness(navigator, book.type);
            await waitForLayoutFrames();
            if (cancelled) return;
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-navigator-load`,
              durationMs: performance.now() - navigatorLoadStartedAt,
            });
            recordReaderMetric({
              kind: 'load',
              name: `${book.type}-presentable`,
              durationMs: performance.now() - initStartedAt,
            });
            resolveLoading(false);
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

    window.addEventListener('pagehide', flushProgressSave);
    init();

    return () => {
      cancelled = true;
      if (pageCounterFrame !== null) cancelAnimationFrame(pageCounterFrame);
      window.removeEventListener('pagehide', flushProgressSave);
      onTocChange([]);
      if (progressSaveTimerRef.current !== null) {
        window.clearTimeout(progressSaveTimerRef.current);
        progressSaveTimerRef.current = null;
      }
      if (navigationUnlockTimerRef.current !== null) {
        window.clearTimeout(navigationUnlockTimerRef.current);
        navigationUnlockTimerRef.current = null;
      }
      if (navigationRetryTimerRef.current !== null) {
        window.clearTimeout(navigationRetryTimerRef.current);
        navigationRetryTimerRef.current = null;
      }
      navigationLockedRef.current = false;
      pendingNavigationRef.current = 0;
      navigationRetryCountRef.current = 0;
      layoutCacheRef.current.invalidate();
      settingsAnchorRef.current = undefined;
      if (settingsApplyTimerRef.current !== null) window.clearTimeout(settingsApplyTimerRef.current);
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      cancelDeferredWork(true);
      flushProgressSave();
      const navigator = navigatorRef.current;
      navigatorRef.current = null;
      navigator?.destroy?.();
      publicationRef.current?.close();
      publicationRef.current = null;
    };
  }, [book.id, book.path, book.title, reloadToken]);

  useEffect(() => {
    const navigator = navigatorRef.current;
    if (!navigator) return;
    const layoutFingerprint = createReaderSettingsLayoutFingerprint(settings, book.type);
    const layoutChanged = settingsLayoutFingerprintRef.current !== layoutFingerprint;
    settingsLayoutFingerprintRef.current = layoutFingerprint;
    applyReadiumFrameSettingsToNavigator(navigator, settings, book.type);
    if (!layoutChanged) return;
    cancelDeferredWork(true);
    layoutCacheRef.current.invalidate();
    publicationRef.current?.advancePrefetchGeneration();
    const revision = ++settingsRevisionRef.current;
    const preferences = createReadiumPreferences(settings, book.type);
    settingsAnchorRef.current ||= snapshotVisibleTextLocator(navigator);
    if (settingsApplyTimerRef.current !== null) window.clearTimeout(settingsApplyTimerRef.current);
    settingsApplyTimerRef.current = window.setTimeout(() => {
      settingsApplyTimerRef.current = null;
      enqueueLayout(async () => {
        if (revision !== settingsRevisionRef.current || navigatorRef.current !== navigator) return;
        const before = settingsAnchorRef.current || snapshotLocator(navigator.currentLocator);
        layoutRestoringRef.current = true;
        try {
          suppressResizeUntilRef.current = performance.now() + 500;
          await navigator.submitPreferences(new EpubPreferences(preferences));
          await navigator.resizeHandler?.();
          await waitForLayoutFrames();
          if (navigatorRef.current !== navigator) return;
          const isLatest = revision === settingsRevisionRef.current;
          applyReadiumFrameSettingsToNavigator(navigator, isLatest ? settings : settingsRef.current, book.type);
          if (before) await navigateToLocator(navigator, before);
          revealReadiumFrames(containerRef.current, navigator);
          if (isLatest) {
            settingsAnchorRef.current = undefined;
            scheduleDeferredWork(navigator.currentLocator?.href || before?.href || '', 0, true);
          }
        } finally {
          layoutRestoringRef.current = false;
          drainNavigationQueue();
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
    let observedWidth = element.clientWidth;
    let observedHeight = element.clientHeight;
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box && Math.abs(box.width - observedWidth) < 0.5 && Math.abs(box.height - observedHeight) < 0.5) return;
      if (box) {
        observedWidth = box.width;
        observedHeight = box.height;
      }
      if (settingsApplyTimerRef.current !== null || performance.now() < suppressResizeUntilRef.current) return;
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        layoutCacheRef.current.invalidate();
        publicationRef.current?.advancePrefetchGeneration();
        resizeTimerRef.current = null;
        enqueueLayout(async () => {
          if (navigatorRef.current !== navigator) return;
          const before = snapshotVisibleTextLocator(navigator) || snapshotLocator(navigator.currentLocator);
          layoutRestoringRef.current = true;
          try {
            suppressResizeUntilRef.current = performance.now() + 350;
            await navigator.resizeHandler?.();
            await waitForLayoutFrames();
            if (navigatorRef.current !== navigator) return;
            if (before) await navigateToLocator(navigator, before);
            revealReadiumFrames(containerRef.current, navigator);
          } finally {
            layoutRestoringRef.current = false;
            drainNavigationQueue();
          }
        });
      }, 140);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }
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
    const shouldPrepareLayout = !deferredHrefRef.current
      || deferredHrefRef.current !== href
      || (direction !== 0 && deferredDirectionRef.current !== direction);
    const resourceChanged = Boolean(deferredHrefRef.current && deferredHrefRef.current !== href);
    if (resourceChanged) publication.advancePrefetchGeneration();
    deferredHrefRef.current = href;
    if (direction !== 0) deferredDirectionRef.current = direction;
    if (shouldPrepareLayout) void prepareAdjacentLayouts(href, direction);
    if (stablePrefetchTimerRef.current !== null) window.clearTimeout(stablePrefetchTimerRef.current);
    stablePrefetchTimerRef.current = window.setTimeout(() => {
      stablePrefetchTimerRef.current = null;
      publication.prefetchAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
      publication.prepareContentAroundHref(href, 2, direction).catch(() => {});
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
            if (navigator?.currentLocator) {
              setPageCounter(formatEpubPageCounter(navigator, navigator.currentLocator, publication));
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
    if (!publication || !navigator || !container || isScrollingTxt(book.type, settingsRef.current)) return;
    const currentIndex = publication.readingOrder.findIndexWithHref(href);
    if (currentIndex < 0) return;
    const offsets = direction < 0 ? [-1] : [1];
    const targets = offsets
      .map((offset) => publication.readingOrder.items[currentIndex + offset])
      .filter((link): link is NonNullable<typeof link> => Boolean(link));
    await yieldForReaderPreparation();
    if (publicationRef.current !== publication || navigatorRef.current !== navigator) return;
    await publication.prepareContentAroundHref(href, 1, direction).catch(() => {});
    if (publicationRef.current !== publication || navigatorRef.current !== navigator || deferredHrefRef.current !== href) return;
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    for (const link of targets) {
      if (publicationRef.current !== publication || navigatorRef.current !== navigator || deferredHrefRef.current !== href) return;
      const layoutKey = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${link.href}`;
      await layoutCacheRef.current.prepare(layoutKey, async () => {
        const frames = await navigator.prepare(link.locator);
        await Promise.all(frames.map(async (frameWindow) => {
          applyReadiumFrameSettings(frameWindow.document, settingsRef.current, book.type);
          await waitForFrameReadiness(frameWindow.document, book.type);
        }));
      });
      await yieldForReaderPreparation();
    }
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
      navigator.go(locator, false, () => {});
    }
  }, [tocTarget, loading]);

  useEffect(() => {
    if (!seekRequest) return;
    const publication = publicationRef.current;
    const navigator = navigatorRef.current;
    if (!publication || !navigator || publication.positions.length === 0) return;
    const index = Math.max(0, Math.min(publication.positions.length - 1, Math.ceil(seekRequest.progress * publication.positions.length) - 1));
    navigator.go(publication.positions[index], false, () => {});
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

  const navigateByWheel = (event: WheelEvent) => {
    if (event.ctrlKey || previewImageRef.current || isScrollingTxt(book.type, settingsRef.current)) return;
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

  const navigatePage = (direction: -1 | 1) => {
    // Keep a small bounded queue so clicks and key presses made while a chapter
    // or layout is settling are applied instead of being silently discarded.
    pendingNavigationRef.current = Math.max(-3, Math.min(3, pendingNavigationRef.current + direction));
    navigationStartedAtRef.current ??= performance.now();
    drainNavigationQueue();
  };

  const drainNavigationQueue = () => {
    const navigator = navigatorRef.current;
    const pending = pendingNavigationRef.current;
    if (!navigator || pending === 0 || layoutRestoringRef.current || navigationLockedRef.current || !isReadiumNavigationReady(navigator)) return;

    const direction: -1 | 1 = pending > 0 ? 1 : -1;
    const warmPath = isWarmNavigationPath(navigator, direction);
    pendingNavigationRef.current -= direction;
    navigationLockedRef.current = true;
    const dispatchedAt = performance.now();
    if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
    const unlock = (ok?: boolean) => {
      if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
      navigationUnlockTimerRef.current = null;
      navigationLockedRef.current = false;
      const shouldRetry = ok === false
        && navigationRetryCountRef.current < 2
        && canNavigateInDirection(navigator, direction);
      if (shouldRetry) {
        navigationRetryCountRef.current += 1;
        pendingNavigationRef.current = Math.max(-3, Math.min(3, pendingNavigationRef.current + direction));
      } else {
        navigationRetryCountRef.current = 0;
      }
      recordReaderMetric({
        kind: 'navigation',
        name: 'navigator-callback',
        durationMs: performance.now() - dispatchedAt,
        hit: warmPath,
        detail: { direction, warmPath, ok, retried: shouldRetry },
      });
      const started = navigationStartedAtRef.current;
      if (!shouldRetry) navigationStartedAtRef.current = null;
      if (!shouldRetry && started !== null) {
        requestAnimationFrame(() => recordReaderMetric({
          kind: 'navigation',
          name: 'input-to-next-frame',
          durationMs: performance.now() - started,
          hit: warmPath,
          detail: { direction, warmPath },
        }));
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
    navigationUnlockTimerRef.current = window.setTimeout(unlock, 2500);

    try {
      if (direction > 0) navigator.goForward(false, unlock);
      else navigator.goBackward(false, unlock);
    } catch (error) {
      unlock();
      console.warn('Readium page turn failed', error);
    }
  };

  const isWarmNavigationPath = (navigator: EpubNavigator, direction: -1 | 1) => {
    const publication = publicationRef.current;
    const container = containerRef.current;
    const locator = navigator.currentLocator;
    if (!publication || !container || !locator?.href) return false;
    const normalized = publication.readingOrder.findWithHref(locator.href)?.href || locator.href;
    const visible = navigator.viewport.progressions.get(normalized);
    const crossesResource = direction > 0 ? (visible?.end ?? 0) >= 0.999 : (visible?.start ?? 1) <= 0.001;
    if (!crossesResource) return true;
    const index = publication.readingOrder.findIndexWithHref(normalized);
    const target = publication.readingOrder.items[index + direction];
    if (!target) return true;
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    const key = `${createReaderLayoutKey(publication.contentKey, settingsRef.current, viewport, book.type)}:${target.href}`;
    return layoutCacheRef.current.isReady(key);
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
        <div ref={containerRef} className={`readium-container h-full w-full ${loading ? 'readium-initializing' : ''}`} />
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
                color: themeColors(settings.theme).text,
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

function createReadiumPreferences(settings: ReturnType<typeof useAppContext>['settings'], bookType: 'epub' | 'txt') {
  const columns = isScrollingTxt(bookType, settings) ? null : settings.pageMode === 'double' ? 2 : 1;
  const lineLengths = readiumLineLengths(settings.pageMode);
  return {
    backgroundColor: themeColors(settings.theme).background,
    textColor: themeColors(settings.theme).text,
    fontFamily: settings.fontFamily,
    fontSize: readiumFontScale(settings.fontSize, bookType),
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    columnCount: columns,
    pageGutter: 0,
    scroll: bookType === 'txt' && settings.txtReadingFlow === 'scroll',
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
  const index = Math.min(publication.positions.length - 1, Math.max(0, Math.round(progress * (publication.positions.length - 1))));
  return publication.positions[index];
}

function snapshotLocator(locator?: ReadiumLocator) {
  return locator ? deserializeReadiumLocator(serializeReadiumLocator(locator)) : undefined;
}

function snapshotVisibleTextLocator(navigator: EpubNavigator) {
  const fallback = snapshotLocator(navigator.currentLocator);
  if (!fallback) return undefined;
  const frame = (navigator as EpubNavigator & {
    _cframes?: ReadiumFrameHandle[];
  })._cframes?.[0];
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const doc = wnd?.document;
  if (!wnd || !doc?.body) return fallback;

  const horizontal = doc.documentElement.scrollWidth > wnd.innerWidth * 1.25;
  const candidates = Array.from(doc.body.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
    .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
    .filter(({ element, rect }) => element.textContent?.trim() && rect.right > 0 && rect.left < wnd.innerWidth && rect.bottom > 0 && rect.top < wnd.innerHeight)
    .sort((a, b) => horizontal
      ? Math.max(0, a.rect.left) - Math.max(0, b.rect.left) || Math.max(0, a.rect.top) - Math.max(0, b.rect.top)
      : Math.max(0, a.rect.top) - Math.max(0, b.rect.top) || Math.max(0, a.rect.left) - Math.max(0, b.rect.left));
  const element = candidates[0]?.element;
  const text = element?.textContent?.trim();
  const selectorGenerator = (wnd as Window & {
    _readium_cssSelectorGenerator?: { getCssSelector: (element: Element) => string };
  })._readium_cssSelectorGenerator;
  if (!element || !text || !selectorGenerator) return fallback;

  try {
    const serialized = JSON.parse(serializeReadiumLocator(fallback));
    serialized.locations = { ...serialized.locations, cssSelector: selectorGenerator.getCssSelector(element) };
    serialized.text = { highlight: text };
    return deserializeReadiumLocator(JSON.stringify(serialized)) || fallback;
  } catch {
    return fallback;
  }
}

function navigateToLocator(navigator: EpubNavigator, locator: ReadiumLocator) {
  return new Promise<void>((resolve) => navigator.go(locator, false, () => resolve()));
}

function waitForLayoutFrames() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function waitForFrameReadiness(doc: Document, bookType: 'epub' | 'txt') {
  if (bookType === 'txt') {
    await new Promise<void>((resolve) => (doc.defaultView || window).requestAnimationFrame(() => resolve()));
    return;
  }
  const fontSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (fontSet) await withTimeout(fontSet.ready.then(() => undefined), 500);
  const images = Array.from(doc.images).slice(0, 8);
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return withTimeout(image.decode().catch(() => {}), 350);
  }));
  await new Promise<void>((resolve) => {
    const view = doc.defaultView || window;
    view.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
  });
}

async function waitForCurrentFrameReadiness(navigator: EpubNavigator, bookType: 'epub' | 'txt') {
  const frames = (navigator as EpubNavigator & { _cframes?: ReadiumFrameHandle[] })._cframes || [];
  await Promise.all(frames.map((frame) => {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    return doc ? waitForFrameReadiness(doc, bookType) : Promise.resolve();
  }));
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

function themeColors(theme: 'light' | 'dark' | 'sepia') {
  if (theme === 'dark') return { background: '#121212', text: '#e5e7eb' };
  if (theme === 'sepia') return { background: '#FDFCF8', text: '#5b4636' };
  return { background: '#ffffff', text: '#111827' };
}

function createProgressPayload(bookId: string, bookFingerprint: string | undefined, location: string) {
  return {
    bookId,
    bookFingerprint,
    location,
    updatedAt: Date.now(),
  };
}

function applyReadiumFrameSettingsToNavigator(navigator: EpubNavigator, settings: AppSettings, bookType: 'epub' | 'txt') {
  const internal = navigator as EpubNavigator & {
    _cframes?: ReadiumFrameHandle[];
  };
  for (const frame of internal._cframes || []) {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    if (doc) applyReadiumFrameSettings(doc, settings, bookType);
  }
}

function applyReadiumFrameSettings(doc: Document, settings: AppSettings, bookType: 'epub' | 'txt') {
  readiumPageGeometryCache.delete(doc);
  const root = doc.documentElement;
  const colors = themeColors(settings.theme);
  root.style.setProperty('--USER__backgroundColor', colors.background);
  root.style.setProperty('--USER__textColor', colors.text);
  root.style.setProperty('--USER__fontFamily', settings.fontFamily);
  root.style.setProperty('--USER__fontSize', String(readiumFontScale(settings.fontSize, bookType)));
  root.style.setProperty('--USER__lineHeight', String(settings.lineHeight));
  root.style.setProperty('--USER__paraSpacing', `${settings.paragraphSpacing}em`);
  root.style.setProperty('--USER__letterSpacing', `${settings.letterSpacing}em`);
  if (isScrollingTxt(bookType, settings)) {
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
}

function isScrollingTxt(bookType: 'epub' | 'txt', settings: AppSettings) {
  return bookType === 'txt' && settings.txtReadingFlow === 'scroll';
}

function normalizeWheelDelta(event: WheelEvent, container: HTMLElement | null) {
  const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return dominantDelta * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return dominantDelta * Math.max(1, container?.clientHeight || window.innerHeight);
  }
  return dominantDelta;
}

function readiumFontScale(fontSize: number, bookType: 'epub' | 'txt') {
  return fontSize / (bookType === 'txt' ? TXT_FONT_SCALE_BASE : 18);
}

function readiumCenterGap(settings: AppSettings) {
  return settings.pageMode === 'double' ? DOUBLE_PAGE_CENTER_GAP : 0;
}

function installReadiumWheel(wnd: Window, onWheel: (event: WheelEvent) => void) {
  const doc = wnd.document;
  if (doc.documentElement.dataset.zenithReadiumWheelBound === 'true') return;
  doc.documentElement.dataset.zenithReadiumWheelBound = 'true';
  const handler = (event: WheelEvent) => onWheel(event);
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

function formatEpubPageCounter(navigator: EpubNavigator, locator: ReadiumLocator, publication: ReadiumPublicationLike) {
  const internal = navigator as EpubNavigator & {
    _cframes?: ReadiumFrameHandle[];
  };
  const iframe = internal._cframes?.map(getLiveReadiumIframe).find(Boolean);
  const wnd = iframe?.contentWindow;
  const doc = iframe?.contentDocument;
  let geometry = doc ? readiumPageGeometryCache.get(doc) : undefined;
  if (!geometry) {
    const viewportWidth = Math.max(1, wnd?.innerWidth || doc?.documentElement.clientWidth || 1);
    geometry = {
      viewportWidth,
      scrollWidth: Math.max(viewportWidth, doc?.documentElement.scrollWidth || 0, doc?.body?.scrollWidth || 0),
    };
    if (doc) readiumPageGeometryCache.set(doc, geometry);
  }
  const { viewportWidth, scrollWidth } = geometry;
  const chapterTotal = Math.max(1, Math.ceil((scrollWidth - 1) / viewportWidth));
  const localProgression = clampNumber(locator.locations?.progression ?? 0, 0, 0.999999999);
  const chapterCurrent = Math.max(1, Math.min(chapterTotal, Math.floor(localProgression * chapterTotal) + 1));
  const page = pageFromLocator(locator, publication);
  const percent = Math.round((page.current / page.total) * 100);
  return `本章 ${chapterCurrent} / ${chapterTotal} · 全书 ${page.current} / ${page.total} · ${percent}%`;
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
  activeFrames.forEach((frame) => {
    const iframe = getLiveReadiumIframe(frame);
    if (!iframe || !container.contains(iframe)) return;
    iframe.style.removeProperty('visibility');
    iframe.style.removeProperty('opacity');
    iframe.style.removeProperty('pointer-events');
    iframe.removeAttribute('aria-hidden');
  });
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
