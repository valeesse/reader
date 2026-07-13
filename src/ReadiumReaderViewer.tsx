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

const DOUBLE_PAGE_CENTER_GAP = 56;
const IMMEDIATE_PREFETCH_RADIUS = 1;
const STABLE_PREFETCH_RADIUS = 3;
// Readium's CJK stylesheet renders generated Chinese TXT at a 14px base,
// while typical EPUB content here renders at 16px with our 18px scale base.
// 15.75 keeps the same setting perceptually equal across both formats.
const TXT_FONT_SCALE_BASE = 15.75;

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
  const navigationReadyAtRef = useRef(0);
  const navigationLockedRef = useRef(false);
  const navigationUnlockTimerRef = useRef<number | null>(null);
  const stablePrefetchTimerRef = useRef<number | null>(null);
  const refinementTimerRef = useRef<number | null>(null);
  const refinementIdleRef = useRef<number | null>(null);
  const refinementAbortRef = useRef<AbortController | null>(null);
  const positionsRefinedRef = useRef(false);
  const deferredHrefRef = useRef('');

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
      pendingProgressRef.current = createProgressPayload(book.id, location);
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
      try {
        setLoading(true);
        setLoadError('');
        setTxtPreview('');
        loadingResolvedRef.current = false;
        const container = containerRef.current;
        if (!container) return;

        const progressPromise = getProgress(book.id);
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
        const navigator = new EpubNavigator(
          container,
          publication,
          {
            frameLoaded: (wnd) => {
              installImagePreview(wnd, openPreview, () => resolveLoading(false));
              if (!isScrollingTxt(book.type, settingsRef.current)) installReadiumWheel(wnd, navigateByWheel);
              applyReadiumFrameSettings(wnd.document, settingsRef.current, book.type);
              watchReadiumFrameLayout(wnd, () => schedulePageCounter(navigatorRef.current?.currentLocator));
            },
            positionChanged: (locator) => {
              if (layoutRestoringRef.current) return;
              const progress = progressionFromLocator(locator, publication);
              const previousProgress = lastEmittedProgressRef.current;
              const direction: -1 | 0 | 1 = previousProgress < 0 ? 0 : progress > previousProgress ? 1 : progress < previousProgress ? -1 : 0;
              publication.prefetchAroundHref(locator.href, IMMEDIATE_PREFETCH_RADIUS, direction).catch(() => {});
              scheduleDeferredWork(locator.href, direction, false);
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

        navigatorRef.current = navigator;
        const loadingFallback = window.setTimeout(() => resolveLoading(true), 1800);
        navigator.load()
          .then(() => {
            if (cancelled) return;
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
      navigationLockedRef.current = false;
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
    cancelDeferredWork(true);
    const revision = ++settingsRevisionRef.current;
    const preferences = createReadiumPreferences(settings, book.type);
    settingsAnchorRef.current ||= snapshotVisibleTextLocator(navigator);
    applyReadiumFrameSettingsToNavigator(navigator, settings, book.type);
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
    const observer = new ResizeObserver(() => {
      if (settingsApplyTimerRef.current !== null || performance.now() < suppressResizeUntilRef.current) return;
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
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
    const resourceChanged = Boolean(deferredHrefRef.current && deferredHrefRef.current !== href);
    deferredHrefRef.current = href;
    if (stablePrefetchTimerRef.current !== null) window.clearTimeout(stablePrefetchTimerRef.current);
    stablePrefetchTimerRef.current = window.setTimeout(() => {
      stablePrefetchTimerRef.current = null;
      publication.prefetchAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
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
      navigator.go(link.locator, false, () => {});
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
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, select, textarea, button, [contenteditable="true"]')) return;
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
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 20) return;
    event.preventDefault();
    event.stopPropagation();

    navigatePage(dominantDelta > 0 ? 1 : -1, 280);
  };

  const navigatePage = (direction: -1 | 1, cooldown = 100) => {
    const navigator = navigatorRef.current;
    const now = performance.now();
    if (!navigator || navigationLockedRef.current || now < navigationReadyAtRef.current) return;

    navigationLockedRef.current = true;
    navigationReadyAtRef.current = now + cooldown;
    if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
    const unlock = () => {
      if (navigationUnlockTimerRef.current !== null) window.clearTimeout(navigationUnlockTimerRef.current);
      navigationUnlockTimerRef.current = window.setTimeout(() => {
        navigationUnlockTimerRef.current = null;
        navigationLockedRef.current = false;
      }, 80);
    };
    navigationUnlockTimerRef.current = window.setTimeout(unlock, 900);

    try {
      if (direction > 0) navigator.goForward(false, unlock);
      else navigator.goBackward(false, unlock);
    } catch (error) {
      unlock();
      console.warn('Readium page turn failed', error);
    }
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
        <div ref={containerRef} className="readium-container h-full w-full" />
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
    _cframes?: Array<{ iframe?: HTMLIFrameElement; window?: Window } | undefined>;
  })._cframes?.[0];
  const wnd = frame?.iframe?.contentWindow || frame?.window;
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

function themeColors(theme: 'light' | 'dark' | 'sepia') {
  if (theme === 'dark') return { background: '#121212', text: '#e5e7eb' };
  if (theme === 'sepia') return { background: '#FDFCF8', text: '#5b4636' };
  return { background: '#ffffff', text: '#111827' };
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
    _cframes?: Array<{ iframe?: HTMLIFrameElement; window?: Window } | undefined>;
  };
  for (const frame of internal._cframes || []) {
    if (!frame) continue;
    const doc = frame.iframe?.contentDocument || frame.window?.document;
    if (doc) applyReadiumFrameSettings(doc, settings, bookType);
  }
}

function applyReadiumFrameSettings(doc: Document, settings: AppSettings, bookType: 'epub' | 'txt') {
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
  onReady: () => void,
) {
  const doc = wnd.document;
  onReady();
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
    _cframes?: Array<{ iframe?: HTMLIFrameElement; window?: Window } | undefined>;
  };
  const frame = internal._cframes?.find(Boolean);
  const wnd = frame?.iframe?.contentWindow || frame?.window;
  const doc = frame?.iframe?.contentDocument || wnd?.document;
  const viewportWidth = Math.max(1, wnd?.innerWidth || doc?.documentElement.clientWidth || 1);
  const scrollWidth = Math.max(
    viewportWidth,
    doc?.documentElement.scrollWidth || 0,
    doc?.body?.scrollWidth || 0,
  );
  const chapterTotal = Math.max(1, Math.ceil((scrollWidth - 1) / viewportWidth));
  const localProgression = clampNumber(locator.locations?.progression ?? 0, 0, 0.999999999);
  const chapterCurrent = Math.max(1, Math.min(chapterTotal, Math.floor(localProgression * chapterTotal) + 1));
  const page = pageFromLocator(locator, publication);
  const percent = Math.round((page.current / page.total) * 100);
  return `本章 ${chapterCurrent} / ${chapterTotal} · 全书 ${page.current} / ${page.total} · ${percent}%`;
}

function watchReadiumFrameLayout(wnd: Window, onLayout: () => void) {
  const doc = wnd.document;
  wnd.addEventListener('load', onLayout, { once: true });
  doc.fonts?.ready.then(onLayout).catch(() => {});
  doc.querySelectorAll('img').forEach((image) => {
    if (!(image as HTMLImageElement).complete) {
      image.addEventListener('load', onLayout, { once: true });
      image.addEventListener('error', onLayout, { once: true });
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
    _cframes?: Array<{ iframe?: HTMLIFrameElement }>;
  })._cframes || [];
  activeFrames.forEach((frame) => {
    const iframe = frame.iframe;
    if (!iframe || !container.contains(iframe)) return;
    iframe.style.removeProperty('visibility');
    iframe.style.removeProperty('opacity');
    iframe.style.removeProperty('pointer-events');
    iframe.removeAttribute('aria-hidden');
  });
}
