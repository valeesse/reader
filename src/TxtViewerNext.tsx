import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Book, ReaderSeekRequest, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import { getProgress, saveProgress } from './lib/storage';
import { closeTxtBook, NativeTxtBookInfo, openTxtBook, readTxtWindow } from './lib/native';

const TXT_OVERSCAN_PAGES = 5;
const TXT_MIN_WINDOW_CHARS = 24000;
const TXT_MAX_WINDOW_CHARS = 140000;
const TXT_LAYOUT_DEBOUNCE_MS = 180;
const TXT_PREFETCH_DEBOUNCE_MS = 120;

type TxtWindow = { start: number; end: number; text: string };
type PageMetrics = { pageWidth: number; pageStep: number; spreadCount: number };

export function TxtViewerNext({
  book,
  nextBook,
  onOpenBook,
  onProgressChange,
  onToggleChrome,
  onTocChange,
  tocTarget,
  seekRequest,
}: {
  book: Book;
  chromeVisible: boolean;
  nextBook?: Book;
  onOpenBook?: (book: Book) => void;
  onProgressChange: (progress: number) => void;
  onToggleChrome: () => void;
  onTocChange: (items: ReaderTocItem[]) => void;
  tocTarget: ReaderTocItem | null;
  seekRequest: ReaderSeekRequest | null;
}) {
  const { settings } = useAppContext();
  const [bookInfo, setBookInfo] = useState<NativeTxtBookInfo | null>(null);
  const [textWindow, setTextWindow] = useState<TxtWindow>({ start: 0, end: 0, text: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const [pageMetrics, setPageMetrics] = useState<PageMetrics>({ pageWidth: 0, pageStep: 1, spreadCount: 1 });
  const [pageCounter, setPageCounter] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const latestWindowRef = useRef<TxtWindow>(textWindow);
  const pageMetricsRef = useRef<PageMetrics>(pageMetrics);
  const totalCharsRef = useRef(0);
  const activeAnchorCharRef = useRef(0);
  const activePageIndexRef = useRef(0);
  const pendingPersistProgressRef = useRef<number | undefined>(undefined);
  const persistTimerRef = useRef<number | undefined>(undefined);
  const prefetchTimerRef = useRef<number | undefined>(undefined);
  const layoutTimerRef = useRef<number | undefined>(undefined);
  const progressFrameRef = useRef<number | undefined>(undefined);
  const windowRequestIdRef = useRef(0);
  const isLoadingWindowRef = useRef(false);
  const windowCacheRef = useRef(new Map<string, TxtWindow>());
  const windowRequestsRef = useRef(new Map<string, Promise<TxtWindow>>());
  const wheelGestureTimerRef = useRef<number | undefined>(undefined);
  const wheelGestureLockedRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const sessionIdRef = useRef('');

  const layoutKey = JSON.stringify({
    pageMode: settings.pageMode,
    txtReadingFlow: settings.txtReadingFlow,
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    pageMargins: settings.pageMargins,
  });
  const isPagedFlow = settings.txtReadingFlow === 'paged';
  const pagesPerSpread = settings.pageMode === 'double' ? 2 : 1;
  const pageGap = settings.pageMode === 'double' ? 44 : 32;
  const progressReserve = 44;
  const topInset = settings.pageMargins.top + progressReserve / 2;
  const bottomInset = settings.pageMargins.bottom + progressReserve / 2;
  const visibleText = textWindow.text;
  const paragraphHtml = useMemo(() => textToParagraphHtml(visibleText), [visibleText]);

  useEffect(() => {
    latestWindowRef.current = textWindow;
  }, [textWindow]);

  useEffect(() => {
    pageMetricsRef.current = pageMetrics;
  }, [pageMetrics]);

  useEffect(() => {
    totalCharsRef.current = bookInfo?.totalChars || 0;
  }, [bookInfo?.totalChars]);

  useEffect(() => {
    let cancelled = false;
    let openedSessionId = '';
    const loadText = async () => {
      try {
        setLoading(true);
        setLoadError('');
        setLayoutReady(false);
        windowCacheRef.current.clear();
        windowRequestsRef.current.clear();
        const info = await openTxtBook(book.path);
        openedSessionId = info.sessionId;
        if (cancelled) {
          closeTxtBook(book.path, openedSessionId).catch(() => {});
          return;
        }

        sessionIdRef.current = openedSessionId;
        setBookInfo(info);
        totalCharsRef.current = info.totalChars;
        onTocChange(info.chapters.map((chapter, index) => ({
          id: chapter.id,
          title: chapter.title,
          index,
        })));

        const progress = await getProgress(book.id);
        if (cancelled) return;
        const restoredProgress = Math.max(0, Math.min(1, progress?.scrollPercentage || 0));
        const restoredAnchor = Math.round(restoredProgress * info.totalChars);
        activeAnchorCharRef.current = restoredAnchor;
        await loadWindowForAnchor(restoredAnchor, true, info.totalChars);
        if (cancelled) return;
        updateProgressFromAnchor(restoredAnchor);
        scheduleWindowPrefetch(restoredAnchor);
      } catch (error) {
        console.error('Failed to load txt', error);
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'TXT 加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadText();
    return () => {
      cancelled = true;
      windowRequestIdRef.current += 1;
      windowRequestsRef.current.clear();
      onTocChange([]);
      if (openedSessionId) closeTxtBook(book.path, openedSessionId).catch(() => {});
      if (sessionIdRef.current === openedSessionId) sessionIdRef.current = '';
    };
  }, [book.id, book.path, reloadToken]);

  useEffect(() => {
    const handlePageHide = () => flushPersistProgress();
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      if (progressFrameRef.current !== undefined) cancelAnimationFrame(progressFrameRef.current);
      if (persistTimerRef.current !== undefined) window.clearTimeout(persistTimerRef.current);
      if (prefetchTimerRef.current !== undefined) window.clearTimeout(prefetchTimerRef.current);
      if (layoutTimerRef.current !== undefined) window.clearTimeout(layoutTimerRef.current);
      if (wheelGestureTimerRef.current !== undefined) window.clearTimeout(wheelGestureTimerRef.current);
      flushPersistProgress();
    };
  }, []);

  useEffect(() => {
    if (!tocTarget || tocTarget.index === undefined) return;
    const chapter = bookInfo?.chapters[tocTarget.index];
    if (!chapter) return;
    goToAnchor(chapter.startIndex, true, true);
  }, [tocTarget, bookInfo]);

  useEffect(() => {
    if (!seekRequest || !totalCharsRef.current) return;
    const pagination = getBookPagination(activeAnchorCharRef.current);
    const targetPage = Math.max(1, Math.ceil(clamp(seekRequest.progress, 0, 1) * pagination.total));
    goToAnchor(Math.min(totalCharsRef.current, (targetPage - 1) * pagination.charsPerPage), true, true);
  }, [seekRequest, bookInfo]);

  const recalculatePages = useCallback(() => {
    const element = contentRef.current;
    const flow = flowRef.current;
    if (!element || !flow) return;

    const readingWidth = Math.max(1, element.clientWidth - settings.pageMargins.left - settings.pageMargins.right);
    const pageWidth = pagesPerSpread === 2
      ? Math.max(240, Math.floor((readingWidth - pageGap) / 2))
      : Math.max(240, readingWidth);
    const pageStep = pageWidth + pageGap;

    if (isPagedFlow) {
      flow.style.height = `${Math.max(1, element.clientHeight - topInset - bottomInset)}px`;
      flow.style.columnWidth = `${pageWidth}px`;
      flow.style.columnGap = `${pageGap}px`;
      flow.style.columnCount = '';
    } else {
      flow.style.height = '';
      flow.style.columnWidth = '';
      flow.style.columnGap = `${pageGap}px`;
      flow.style.columnCount = String(pagesPerSpread);
    }

    const visibleWidth = pagesPerSpread * pageWidth + (pagesPerSpread - 1) * pageGap;
    const maxScroll = Math.max(0, flow.scrollWidth - visibleWidth);
    const spreadCount = Math.max(1, Math.ceil(maxScroll / (pageStep * pagesPerSpread)) + 1);
    const metrics = { pageWidth, pageStep, spreadCount };
    pageMetricsRef.current = metrics;
    setPageMetrics((current) => (
      current.pageWidth === metrics.pageWidth && current.pageStep === metrics.pageStep && current.spreadCount === metrics.spreadCount
        ? current
        : metrics
    ));
    setLayoutReady(true);

    window.requestAnimationFrame(() => {
      const refreshedMaxScroll = Math.max(0, flow.scrollWidth - visibleWidth);
      const refreshedSpreadCount = Math.max(1, Math.ceil(refreshedMaxScroll / (pageStep * pagesPerSpread)) + 1);
      if (refreshedSpreadCount === pageMetricsRef.current.spreadCount) return;
      const refreshedMetrics = { pageWidth, pageStep, spreadCount: refreshedSpreadCount };
      pageMetricsRef.current = refreshedMetrics;
      setPageMetrics(refreshedMetrics);
    });
  }, [isPagedFlow, pageGap, pagesPerSpread, settings.pageMargins.bottom, settings.pageMargins.left, settings.pageMargins.right, settings.pageMargins.top, topInset, bottomInset]);

  useLayoutEffect(() => {
    setLayoutReady(false);
    recalculatePages();
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setLayoutReady(false);
      if (layoutTimerRef.current !== undefined) {
        window.clearTimeout(layoutTimerRef.current);
      }
      layoutTimerRef.current = window.setTimeout(() => {
        layoutTimerRef.current = undefined;
        recalculatePages();
        scrollToAnchor(activeAnchorCharRef.current);
        scheduleWindowPrefetch(activeAnchorCharRef.current);
      }, TXT_LAYOUT_DEBOUNCE_MS);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visibleText, recalculatePages, layoutKey]);

  useLayoutEffect(() => {
    if (!textWindow.text) return;
    scrollToAnchor(activeAnchorCharRef.current);
    scheduleWindowPrefetch(activeAnchorCharRef.current);
  }, [textWindow, pageMetrics, isPagedFlow]);

  const updatePageCounter = (anchor: number) => {
    const page = getBookPagination(anchor);
    setPageCounter(`全书 ${page.current} / ${page.total} · ${Math.round(page.progress * 100)}%`);
  };

  const updateProgressFromAnchor = (anchor: number) => {
    onProgressChange(getBookPagination(anchor).progress);
    updatePageCounter(anchor);
  };

  const persistProgress = (scrollPercentage: number) => {
    pendingPersistProgressRef.current = undefined;
    saveProgress({
      bookId: book.id,
      chapterIndex: 0,
      scrollPercentage,
      updatedAt: Date.now(),
    }).catch((error) => {
      console.warn('Failed to save TXT progress', error);
    });
  };

  const schedulePersistProgress = (anchor: number) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return;
    const scrollPercentage = clamp(anchor / totalChars, 0, 1);
    pendingPersistProgressRef.current = scrollPercentage;
    if (persistTimerRef.current !== undefined) {
      window.clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      persistTimerRef.current = undefined;
      persistProgress(scrollPercentage);
    }, 180);
  };

  const flushPersistProgress = () => {
    if (persistTimerRef.current !== undefined) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = undefined;
    }
    const progress = pendingPersistProgressRef.current;
    if (progress !== undefined) {
      persistProgress(progress);
    }
  };

  const estimateCharsPerSpread = () => {
    const rangeLength = Math.max(1, latestWindowRef.current.end - latestWindowRef.current.start);
    const element = contentRef.current;
    if (isPagedFlow) {
      return Math.max(500, Math.min(9000, Math.round(rangeLength / Math.max(1, pageMetricsRef.current.spreadCount))));
    }

    const pages = element ? Math.max(1, element.scrollHeight / Math.max(1, element.clientHeight)) : 1;
    return Math.max(500, Math.min(9000, Math.round((rangeLength / pages) * pagesPerSpread)));
  };

  const getBookPagination = (anchor: number) => {
    const totalChars = totalCharsRef.current;
    const charsPerPage = Math.max(1, estimateCharsPerSpread());
    const total = Math.max(1, Math.ceil(totalChars / charsPerPage));
    const current = Math.max(1, Math.min(total, Math.floor(clamp(anchor, 0, totalChars) / charsPerPage) + 1));
    const progress = current / total;
    return { current, total, progress, charsPerPage };
  };

  const rangeForAnchor = (anchor: number, totalChars = totalCharsRef.current) => {
    if (totalChars <= 0) return { start: 0, end: 0 };
    const target = Math.round(clamp(anchor, 0, totalChars));
    const charsPerSpread = estimateCharsPerSpread();
    const naturalWindow = Math.ceil(charsPerSpread * (TXT_OVERSCAN_PAGES * 2 + 3));
    const windowSize = Math.max(TXT_MIN_WINDOW_CHARS, Math.min(TXT_MAX_WINDOW_CHARS, naturalWindow, totalChars));
    const before = Math.min(Math.floor(windowSize * 0.46), charsPerSpread * TXT_OVERSCAN_PAGES);
    const start = Math.max(0, Math.min(target - before, Math.max(0, totalChars - windowSize)));
    return {
      start,
      end: Math.min(totalChars, start + windowSize),
    };
  };

  const cacheKeyForRange = (range: { start: number; end: number }) => `${range.start}:${range.end}`;

  const rememberWindow = (windowValue: TxtWindow) => {
    const cache = windowCacheRef.current;
    cache.set(cacheKeyForRange(windowValue), windowValue);
    while (cache.size > 6) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey === undefined) break;
      cache.delete(oldestKey);
    }
  };

  const requestWindow = (range: { start: number; end: number }) => {
    const key = cacheKeyForRange(range);
    const cached = windowCacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);
    const pending = windowRequestsRef.current.get(key);
    if (pending) return pending;
    const sessionId = sessionIdRef.current;
    if (!sessionId) return Promise.reject(new Error('TXT 阅读会话尚未就绪'));

    let request: Promise<TxtWindow>;
    request = readTxtWindow(book.path, sessionId, range.start, range.end)
      .then((windowValue) => {
        if (sessionId === sessionIdRef.current) rememberWindow(windowValue);
        return windowValue;
      })
      .finally(() => {
        if (windowRequestsRef.current.get(key) === request) {
          windowRequestsRef.current.delete(key);
        }
      });
    windowRequestsRef.current.set(key, request);
    return request;
  };

  const applyWindow = (windowValue: TxtWindow, anchor: number) => {
    activeAnchorCharRef.current = clamp(Math.round(anchor), 0, totalCharsRef.current);
    latestWindowRef.current = windowValue;
    setLayoutReady(false);
    setTextWindow(windowValue);
  };

  const loadWindow = async (range: { start: number; end: number }, anchor: number) => {
    const requestId = windowRequestIdRef.current + 1;
    windowRequestIdRef.current = requestId;
    isLoadingWindowRef.current = true;
    setLayoutReady(false);
    try {
      const nextWindow = await requestWindow(range);
      if (requestId !== windowRequestIdRef.current) return;
      applyWindow(nextWindow, anchor);
    } finally {
      if (requestId === windowRequestIdRef.current) {
        isLoadingWindowRef.current = false;
      }
    }
  };

  const loadWindowForAnchor = async (anchor: number, force = false, totalChars = totalCharsRef.current) => {
    const range = rangeForAnchor(anchor, totalChars);
    const current = latestWindowRef.current;
    if (current.text && current.start === range.start && current.end === range.end) {
      activeAnchorCharRef.current = clamp(Math.round(anchor), 0, totalChars);
      if (force) {
        recalculatePages();
        scrollToAnchor(activeAnchorCharRef.current);
      }
      return;
    }
    await loadWindow(range, anchor);
  };

  const prefetchWindowForAnchor = async (anchor: number) => {
    const range = rangeForAnchor(anchor);
    const current = latestWindowRef.current;
    if (current.text && current.start === range.start && current.end === range.end) return;
    const key = cacheKeyForRange(range);
    if (windowCacheRef.current.has(key)) return;

    await requestWindow(range);
  };

  const scheduleWindowPrefetch = (anchor: number) => {
    const totalChars = totalCharsRef.current;
    const current = latestWindowRef.current;
    if (!totalChars || !current.text) return;

    const charsPerSpread = Math.max(1, estimateCharsPerSpread());
    const beforePages = Math.floor((anchor - current.start) / charsPerSpread);
    const afterPages = Math.floor((current.end - anchor) / charsPerSpread);
    if (beforePages > TXT_OVERSCAN_PAGES && afterPages > TXT_OVERSCAN_PAGES) return;

    if (prefetchTimerRef.current !== undefined) {
      window.clearTimeout(prefetchTimerRef.current);
    }
    prefetchTimerRef.current = window.setTimeout(() => {
      prefetchTimerRef.current = undefined;
      if (isLoadingWindowRef.current) return;
      prefetchWindowForAnchor(activeAnchorCharRef.current).catch((error) => console.warn('Failed to prefetch TXT window', error));
    }, TXT_PREFETCH_DEBOUNCE_MS);
  };

  const setAnchor = (anchor: number, persist: boolean) => {
    const totalChars = totalCharsRef.current;
    const nextAnchor = clamp(Math.round(anchor), 0, totalChars);
    activeAnchorCharRef.current = nextAnchor;
    updateProgressFromAnchor(nextAnchor);
    if (persist) schedulePersistProgress(nextAnchor);
    scheduleWindowPrefetch(nextAnchor);
  };

  const pageIndexForAnchor = (anchor: number, windowValue = latestWindowRef.current) => {
    const metrics = pageMetricsRef.current;
    const maxPageIndex = Math.max(0, metrics.spreadCount - 1);
    const rangeLength = Math.max(1, windowValue.end - windowValue.start);
    const localProgress = clamp((anchor - windowValue.start) / rangeLength, 0, 1);
    return Math.max(0, Math.min(maxPageIndex, Math.round(localProgress * maxPageIndex)));
  };

  const anchorForPageIndex = (pageIndex: number, windowValue = latestWindowRef.current) => {
    const metrics = pageMetricsRef.current;
    const maxPageIndex = Math.max(0, metrics.spreadCount - 1);
    const safePageIndex = Math.max(0, Math.min(maxPageIndex, pageIndex));
    const rangeLength = Math.max(1, windowValue.end - windowValue.start);
    const localProgress = maxPageIndex > 0 ? safePageIndex / maxPageIndex : 0;
    return Math.round(windowValue.start + localProgress * rangeLength);
  };

  const scrollToAnchor = (anchor: number) => {
    const element = contentRef.current;
    if (!element) return;
    const metrics = pageMetricsRef.current;
    programmaticScrollRef.current = true;

    if (isPagedFlow) {
      const pageIndex = pageIndexForAnchor(anchor);
      activePageIndexRef.current = pageIndex;
      element.scrollLeft = pageIndex * metrics.pageStep * pagesPerSpread;
    } else {
      const windowValue = latestWindowRef.current;
      const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
      const localProgress = clamp((anchor - windowValue.start) / Math.max(1, windowValue.end - windowValue.start), 0, 1);
      element.scrollTop = maxScroll * localProgress;
    }
    updatePageCounter(anchor);

    window.requestAnimationFrame(() => {
      programmaticScrollRef.current = false;
    });
  };

  const syncAnchorFromElement = (persist: boolean) => {
    const element = contentRef.current;
    const totalChars = totalCharsRef.current;
    if (!element || !totalChars) return;

    let anchor: number;
    if (isPagedFlow) {
      const metrics = pageMetricsRef.current;
      const spreadStep = metrics.pageStep * pagesPerSpread;
      const maxPageIndex = Math.max(0, metrics.spreadCount - 1);
      const pageIndex = spreadStep > 0 ? Math.round(element.scrollLeft / spreadStep) : 0;
      activePageIndexRef.current = Math.max(0, Math.min(maxPageIndex, pageIndex));
      anchor = anchorForPageIndex(activePageIndexRef.current);
    } else {
      const windowValue = latestWindowRef.current;
      const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
      const localProgress = maxScroll > 0 ? element.scrollTop / maxScroll : 0;
      anchor = Math.round(windowValue.start + localProgress * Math.max(1, windowValue.end - windowValue.start));
    }

    setAnchor(anchor, persist);
  };

  const goToAnchor = (anchor: number, persist: boolean, forceWindow = false) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return;
    const nextAnchor = clamp(Math.round(anchor), 0, totalChars);
    activeAnchorCharRef.current = nextAnchor;
    const current = latestWindowRef.current;
    const shouldLoad = forceWindow || !current.text || nextAnchor < current.start || nextAnchor > current.end;
    if (shouldLoad) {
      loadWindowForAnchor(nextAnchor, forceWindow || !current.text, totalChars).catch((error) => console.warn('Failed to load TXT window', error));
    } else {
      scrollToAnchor(nextAnchor);
    }
    updateProgressFromAnchor(nextAnchor);
    if (persist) schedulePersistProgress(nextAnchor);
    scheduleWindowPrefetch(nextAnchor);
  };

  const handleScroll = () => {
    if (programmaticScrollRef.current) return;
    const element = contentRef.current;
    if (!element || !totalCharsRef.current) return;
    if (progressFrameRef.current !== undefined) return;

    progressFrameRef.current = requestAnimationFrame(() => {
      progressFrameRef.current = undefined;
      if (!contentRef.current || !totalCharsRef.current || programmaticScrollRef.current) return;
      syncAnchorFromElement(true);
    });
  };

  const openNextBook = () => {
    if (nextBook && onOpenBook) {
      onOpenBook(nextBook);
    }
  };

  const turnBackward = () => {
    const element = contentRef.current;
    if (!element || !layoutReady) return;
    if (isPagedFlow) {
      const pageIndex = pageIndexForAnchor(activeAnchorCharRef.current);
      if (pageIndex > 0) {
        const nextPageIndex = pageIndex - 1;
        const nextAnchor = anchorForPageIndex(nextPageIndex);
        activePageIndexRef.current = nextPageIndex;
        programmaticScrollRef.current = true;
        element.scrollLeft = nextPageIndex * pageMetricsRef.current.pageStep * pagesPerSpread;
        window.requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
        });
        setAnchor(nextAnchor, true);
        return;
      }

      const nextAnchor = Math.max(0, activeAnchorCharRef.current - estimateCharsPerSpread());
      if (nextAnchor === activeAnchorCharRef.current) return;
      goToAnchor(nextAnchor, true, true);
      return;
    }

    if (element.scrollTop <= 4) {
      const nextAnchor = Math.max(0, activeAnchorCharRef.current - estimateCharsPerSpread());
      goToAnchor(nextAnchor, true, true);
      return;
    }

    const nextTop = Math.max(0, element.scrollTop - element.clientHeight * 0.86);
    element.scrollTop = nextTop;
    syncAnchorFromElement(true);
  };

  const turnForward = () => {
    const element = contentRef.current;
    if (!element || !layoutReady) return;
    if (isPagedFlow) {
      const pageIndex = pageIndexForAnchor(activeAnchorCharRef.current);
      const maxPageIndex = Math.max(0, pageMetricsRef.current.spreadCount - 1);
      if (pageIndex < maxPageIndex) {
        const nextPageIndex = pageIndex + 1;
        const nextAnchor = anchorForPageIndex(nextPageIndex);
        activePageIndexRef.current = nextPageIndex;
        programmaticScrollRef.current = true;
        element.scrollLeft = nextPageIndex * pageMetricsRef.current.pageStep * pagesPerSpread;
        window.requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
        });
        setAnchor(nextAnchor, true);
        return;
      }

      const nextAnchor = Math.min(totalCharsRef.current, activeAnchorCharRef.current + estimateCharsPerSpread());
      if (nextAnchor >= totalCharsRef.current) {
        openNextBook();
        return;
      }
      goToAnchor(nextAnchor, true, true);
      return;
    }

    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    if (element.scrollTop >= maxScroll - 4) {
      const nextAnchor = Math.min(totalCharsRef.current, activeAnchorCharRef.current + estimateCharsPerSpread());
      if (nextAnchor >= totalCharsRef.current) {
        openNextBook();
        return;
      }
      goToAnchor(nextAnchor, true, true);
      return;
    }

    element.scrollTop = Math.min(maxScroll, element.scrollTop + element.clientHeight * 0.86);
    syncAnchorFromElement(true);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isPagedFlow) return;
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 20) return;

    event.preventDefault();
    if (wheelGestureTimerRef.current !== undefined) {
      window.clearTimeout(wheelGestureTimerRef.current);
    }
    wheelGestureTimerRef.current = window.setTimeout(() => {
      wheelGestureTimerRef.current = undefined;
      wheelGestureLockedRef.current = false;
    }, 260);
    if (wheelGestureLockedRef.current) return;

    wheelGestureLockedRef.current = true;
    if (dominantDelta > 0) turnForward();
    else turnBackward();
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#007AFF]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="max-w-lg text-sm text-red-600 dark:text-red-400">{loadError}</div>
        <button
          type="button"
          className="rounded-[5px] bg-[#007AFF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          onClick={() => setReloadToken((value) => value + 1)}
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        className={`flex-1 ${isPagedFlow ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
        ref={contentRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onContextMenu={(event) => event.stopPropagation()}
        style={{
          paddingLeft: `${settings.pageMargins.left}px`,
          paddingRight: `${settings.pageMargins.right}px`,
          paddingTop: `${topInset}px`,
          paddingBottom: `${bottomInset}px`,
        }}
        onClick={(event) => {
          if (event.button !== 0) return;
          const x = event.clientX;
          const width = window.innerWidth;
          if (isPagedFlow && x < width * 0.22) turnBackward();
          else if (isPagedFlow && x > width * 0.78) turnForward();
          else onToggleChrome();
        }}
      >
        <div
          ref={flowRef}
          className={isPagedFlow ? 'w-full max-w-none' : 'mx-auto w-full'}
          style={{
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}em`,
            ['--txt-paragraph-spacing' as string]: `${settings.paragraphSpacing}em`,
            maxWidth: isPagedFlow ? undefined : settings.pageMode === 'double' ? 'min(1120px, 100%)' : 'min(74ch, 100%)',
            columnFill: isPagedFlow ? 'auto' : 'balance',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: paragraphHtml }} />
        </div>
      </div>
      {!layoutReady && !textWindow.text && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-inherit">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#007AFF]" />
        </div>
      )}
      {pageCounter && (
        <div className="absolute bottom-5 right-5 z-30 text-[11px] font-medium text-black/50 dark:text-white/50">
          {pageCounter}
        </div>
      )}
    </div>
  );
}

function textToParagraphHtml(text: string) {
  return text
    .split('\n')
    .map((paragraph) => paragraph.trim()
      ? `<p class="txt-reader-paragraph whitespace-pre-wrap text-justify">${escapeHtml(paragraph)}</p>`
      : '')
    .join('');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
