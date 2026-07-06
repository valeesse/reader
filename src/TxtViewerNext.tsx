import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Book, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import { getProgress, saveProgress } from './lib/storage';
import { LoaderCircle } from 'lucide-react';
import { closeTxtBook, NativeTxtBookInfo, readTxtWindow, openTxtBook } from './lib/native';

const TXT_OVERSCAN_PAGES = 5;
const TXT_MIN_WINDOW_CHARS = 24000;
const TXT_MAX_WINDOW_CHARS = 140000;

export function TxtViewerNext({
  book,
  nextBook,
  onOpenBook,
  onProgressChange,
  onToggleChrome,
  onTocChange,
  tocTarget,
  seekProgress,
}: {
  book: Book;
  chromeVisible: boolean;
  nextBook?: Book;
  onOpenBook?: (book: Book) => void;
  onProgressChange: (progress: number) => void;
  onToggleChrome: () => void;
  onTocChange: (items: ReaderTocItem[]) => void;
  tocTarget: ReaderTocItem | null;
  seekProgress: number | null;
}) {
  const { settings } = useAppContext();
  const [bookInfo, setBookInfo] = useState<NativeTxtBookInfo | null>(null);
  const [textWindow, setTextWindow] = useState({ start: 0, end: 0, text: '' });
  const [loading, setLoading] = useState(true);
  const [layoutReady, setLayoutReady] = useState(false);
  const [pageMetrics, setPageMetrics] = useState({ pageWidth: 0, pageStep: 1, spreadCount: 1 });
  const contentRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const pageMetricsRef = useRef(pageMetrics);
  const latestProgressRef = useRef(0);
  const pendingChapterPartRef = useRef(0);
  const pendingPersistProgressRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const progressFrameRef = useRef<number | undefined>(undefined);
  const persistTimerRef = useRef<number | undefined>(undefined);
  const windowRefreshTimerRef = useRef<number | undefined>(undefined);
  const windowRequestIdRef = useRef(0);
  const latestWindowRef = useRef(textWindow);
  const totalCharsRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const wheelReadyAtRef = useRef(0);
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
  const visibleRange = useMemo(() => ({ start: textWindow.start, end: textWindow.end }), [textWindow.start, textWindow.end]);
  const visibleText = textWindow.text;
  const paragraphHtml = useMemo(() => textToParagraphHtml(visibleText), [visibleText]);

  useEffect(() => {
    latestWindowRef.current = textWindow;
  }, [textWindow]);

  useEffect(() => {
    totalCharsRef.current = bookInfo?.totalChars || 0;
  }, [bookInfo?.totalChars]);

  useEffect(() => {
    pageMetricsRef.current = pageMetrics;
  }, [pageMetrics]);

  useEffect(() => {
    let cancelled = false;
    const loadText = async () => {
      try {
        setLoading(true);
        setLayoutReady(false);
        const info = await openTxtBook(book.path);
        if (cancelled) return;
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
        pendingChapterPartRef.current = restoredProgress;
        await loadWindowForProgress(restoredProgress, true, info.totalChars);
        if (cancelled) return;
        updateProgress(restoredProgress);
      } catch (err) {
        console.error('Failed to load txt', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadText();
    return () => {
      cancelled = true;
      onTocChange([]);
      closeTxtBook(book.path).catch(() => {});
    };
  }, [book.id, book.path]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== undefined) cancelAnimationFrame(animationFrameRef.current);
      if (progressFrameRef.current !== undefined) cancelAnimationFrame(progressFrameRef.current);
      if (persistTimerRef.current !== undefined) window.clearTimeout(persistTimerRef.current);
      if (windowRefreshTimerRef.current !== undefined) window.clearTimeout(windowRefreshTimerRef.current);
      flushPersistProgress();
    };
  }, []);

  useEffect(() => {
    if (!tocTarget || tocTarget.index === undefined) return;
    const chapter = bookInfo?.chapters[tocTarget.index];
    if (!chapter || !bookInfo.totalChars) return;
    goToGlobalProgress(chapter.startIndex / bookInfo.totalChars, true);
  }, [tocTarget, bookInfo]);

  useEffect(() => {
    if (seekProgress === null || !totalCharsRef.current) return;
    goToGlobalProgress(seekProgress, true);
  }, [seekProgress]);

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
    const nextMetrics = { pageWidth, pageStep, spreadCount };
    pageMetricsRef.current = nextMetrics;
    setPageMetrics((current) => (
      current.pageWidth === pageWidth && current.pageStep === pageStep && current.spreadCount === spreadCount
        ? current
        : nextMetrics
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

    const observer = new ResizeObserver(recalculatePages);
    observer.observe(element);
    return () => observer.disconnect();
  }, [visibleText, recalculatePages, layoutKey]);

  useEffect(() => {
    const element = contentRef.current;
    const globalProgress = pendingChapterPartRef.current;
    if (!element) return;
    const totalChars = totalCharsRef.current;
    const windowProgress = progressToWindowProgress(globalProgress, visibleRange, totalChars);
    if (isPagedFlow) {
      const maxSpreadIndex = Math.max(0, pageMetrics.spreadCount - 1);
      const nextSpreadIndex = Math.round(windowProgress * maxSpreadIndex);
      element.scrollLeft = nextSpreadIndex * pageMetrics.pageStep * pagesPerSpread;
    } else {
      const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
      element.scrollTop = maxScroll * windowProgress;
    }
  }, [visibleRange, isPagedFlow, pageMetrics, pagesPerSpread]);

  useEffect(() => {
    const progress = latestProgressRef.current;
    window.requestAnimationFrame(() => goToGlobalProgress(progress, false));
  }, [layoutKey]);

  const updateProgress = (progress: number) => {
    const next = Math.max(0, Math.min(1, progress));
    latestProgressRef.current = next;
    onProgressChange(next);
  };

  const estimateCharsPerPage = () => {
    const rangeLength = Math.max(1, latestWindowRef.current.end - latestWindowRef.current.start);
    const element = contentRef.current;
    if (isPagedFlow) {
      const pageCount = Math.max(1, pageMetricsRef.current.spreadCount * pagesPerSpread);
      return Math.max(500, Math.min(4500, Math.round(rangeLength / pageCount)));
    }

    const pages = element ? Math.max(1, element.scrollHeight / Math.max(1, element.clientHeight)) : 1;
    return Math.max(500, Math.min(4500, Math.round(rangeLength / pages)));
  };

  const rangeForProgress = (progress: number, totalChars = totalCharsRef.current) => {
    if (totalChars <= 0) return { start: 0, end: 0 };
    const target = Math.round(Math.max(0, Math.min(1, progress)) * totalChars);
    const charsPerPage = estimateCharsPerPage();
    const visiblePages = Math.max(1, pagesPerSpread);
    const naturalWindow = Math.ceil(charsPerPage * (TXT_OVERSCAN_PAGES * 2 + visiblePages + 2));
    const windowSize = Math.max(TXT_MIN_WINDOW_CHARS, Math.min(TXT_MAX_WINDOW_CHARS, naturalWindow, totalChars));
    const before = Math.min(Math.floor(windowSize * 0.46), charsPerPage * TXT_OVERSCAN_PAGES);
    const preferredStart = target - before;
    const start = Math.max(0, Math.min(preferredStart, Math.max(0, totalChars - windowSize)));
    return {
      start,
      end: Math.min(totalChars, start + windowSize),
    };
  };

  const loadWindow = async (range: { start: number; end: number }, progress: number) => {
    const requestId = windowRequestIdRef.current + 1;
    windowRequestIdRef.current = requestId;
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    isAnimatingRef.current = false;
    setLayoutReady(false);
    const nextWindow = await readTxtWindow(book.path, range.start, range.end);
    if (requestId !== windowRequestIdRef.current) return;
    pendingChapterPartRef.current = progress;
    latestWindowRef.current = nextWindow;
    setTextWindow(nextWindow);
  };

  const loadWindowForProgress = async (progress: number, force = false, totalChars = totalCharsRef.current) => {
    const range = rangeForProgress(progress, totalChars);
    const current = latestWindowRef.current;
    if (!force && current.start === range.start && current.end === range.end && current.text) return;
    await loadWindow(range, progress);
  };

  const ensureWindowAroundProgress = (progress: number, immediate = false) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return;
    const current = latestWindowRef.current;
    if (!current.text) {
      loadWindowForProgress(progress, true, totalChars).catch((error) => console.warn('Failed to load TXT window', error));
      return;
    }

    const target = Math.round(progress * totalChars);
    const charsPerPage = estimateCharsPerPage();
    const beforePages = Math.floor((target - current.start) / Math.max(1, charsPerPage));
    const afterPages = Math.floor((current.end - target) / Math.max(1, charsPerPage));
    if (beforePages >= TXT_OVERSCAN_PAGES && afterPages >= TXT_OVERSCAN_PAGES + pagesPerSpread) return;

    const refresh = () => {
      windowRefreshTimerRef.current = undefined;
      loadWindowForProgress(progress, false, totalChars).catch((error) => console.warn('Failed to refresh TXT window', error));
    };
    if (windowRefreshTimerRef.current !== undefined) {
      window.clearTimeout(windowRefreshTimerRef.current);
      windowRefreshTimerRef.current = undefined;
    }
    if (immediate) refresh();
    else windowRefreshTimerRef.current = window.setTimeout(refresh, 80);
  };

  const persistProgress = (scrollPercentage: number) => {
    pendingPersistProgressRef.current = undefined;
    saveProgress({
      bookId: book.id,
      chapterIndex: 0,
      scrollPercentage,
      updatedAt: Date.now(),
    });
  };

  const schedulePersistProgress = (scrollPercentage: number) => {
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

  const chapterPartFromElement = (element: HTMLDivElement) => {
    if (isPagedFlow) {
      const metrics = pageMetricsRef.current;
      const maxSpreadIndex = Math.max(0, metrics.spreadCount - 1);
      const spreadIndex = metrics.pageStep > 0
        ? Math.round(element.scrollLeft / (metrics.pageStep * pagesPerSpread))
        : 0;
      return maxSpreadIndex > 0 ? spreadIndex / maxSpreadIndex : 0;
    }

    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    return maxScroll > 0 ? element.scrollTop / maxScroll : 0;
  };

  const globalProgressFromElement = (element: HTMLDivElement) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return 0;
    const localProgress = chapterPartFromElement(element);
    const rangeLength = Math.max(1, visibleRange.end - visibleRange.start);
    return Math.max(0, Math.min(1, (visibleRange.start + localProgress * rangeLength) / totalChars));
  };

  const syncProgressFromElement = (persist: boolean) => {
    const element = contentRef.current;
    if (!element || !totalCharsRef.current) return;
    const scrollPercentage = globalProgressFromElement(element);
    pendingChapterPartRef.current = scrollPercentage;
    updateProgress(scrollPercentage);
    ensureWindowAroundProgress(scrollPercentage);
    if (persist) schedulePersistProgress(scrollPercentage);
  };

  const animateScrollTo = (target: number, axis: 'x' | 'y', onComplete?: () => void) => {
    const element = contentRef.current;
    if (!element) return;
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const start = axis === 'x' ? element.scrollLeft : element.scrollTop;
    const max = axis === 'x'
      ? Math.max(0, element.scrollWidth - element.clientWidth)
      : Math.max(0, element.scrollHeight - element.clientHeight);
    const end = Math.max(0, Math.min(max, target));
    const distance = end - start;
    if (Math.abs(distance) < 1) return;

    isAnimatingRef.current = true;
    const duration = Math.min(240, Math.max(140, Math.abs(distance) * 0.13));
    const startedAt = performance.now();
    const easeOutQuint = (value: number) => 1 - Math.pow(1 - value, 5);

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const next = start + distance * easeOutQuint(elapsed);
      if (axis === 'x') element.scrollLeft = next;
      else element.scrollTop = next;

      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        if (axis === 'x') element.scrollLeft = end;
        else element.scrollTop = end;
        isAnimatingRef.current = false;
        animationFrameRef.current = undefined;
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const goToGlobalProgress = (progress: number, persist: boolean) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return;
    const bookProgress = Math.max(0, Math.min(1, progress));
    pendingChapterPartRef.current = bookProgress;
    const nextRange = rangeForProgress(bookProgress, totalChars);
    if (nextRange.start !== visibleRange.start || nextRange.end !== visibleRange.end) {
      loadWindow(nextRange, bookProgress).catch((error) => console.warn('Failed to load TXT window', error));
    }
    window.requestAnimationFrame(() => {
      const element = contentRef.current;
      if (!element) return;
      const activeRange = latestWindowRef.current.start === nextRange.start && latestWindowRef.current.end === nextRange.end
        ? nextRange
        : visibleRange;
      const windowProgress = progressToWindowProgress(bookProgress, activeRange, totalChars);
      if (isPagedFlow) {
        const metrics = pageMetricsRef.current;
        const maxSpreadIndex = Math.max(0, metrics.spreadCount - 1);
        const nextSpreadIndex = Math.round(windowProgress * maxSpreadIndex);
        element.scrollLeft = nextSpreadIndex * metrics.pageStep * pagesPerSpread;
      } else {
        const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
        element.scrollTop = maxScroll * windowProgress;
      }
      updateProgress(bookProgress);
      if (persist) persistProgress(bookProgress);
    });
  };

  const handleScroll = () => {
    const element = contentRef.current;
    if (!element || !totalCharsRef.current) return;
    if (isAnimatingRef.current) return;
    if (progressFrameRef.current !== undefined) return;

    progressFrameRef.current = requestAnimationFrame(() => {
      progressFrameRef.current = undefined;
      const activeElement = contentRef.current;
      if (!activeElement || !totalCharsRef.current) return;
      syncProgressFromElement(true);
    });
  };

  const openNextBook = () => {
    if (nextBook && onOpenBook) {
      onOpenBook(nextBook);
    }
  };

  const moveWindow = (direction: 1 | -1) => {
    const totalChars = totalCharsRef.current;
    if (!totalChars) return false;
    const pageDistance = Math.max(1, Math.round(estimateCharsPerPage() * (isPagedFlow ? pagesPerSpread : 1)));
    const targetIndex = direction > 0
      ? visibleRange.end
      : Math.max(0, visibleRange.start - pageDistance);
    if (direction > 0 && targetIndex >= totalChars) return false;
    if (direction < 0 && visibleRange.start <= 0) return false;
    const nextProgress = Math.max(0, Math.min(1, targetIndex / totalChars));
    const nextRange = rangeForProgress(nextProgress, totalChars);
    pendingChapterPartRef.current = nextProgress;
    loadWindow(nextRange, nextProgress).catch((error) => console.warn('Failed to move TXT window', error));
    updateProgress(nextProgress);
    schedulePersistProgress(nextProgress);
    return true;
  };

  const turnBackward = () => {
    const element = contentRef.current;
    if (!element || !layoutReady) return;
    if (isPagedFlow) {
      if (element.scrollLeft <= 4) {
        moveWindow(-1);
        return;
      }
      const metrics = pageMetricsRef.current;
      animateScrollTo(
        element.scrollLeft - metrics.pageStep * pagesPerSpread,
        'x',
        () => syncProgressFromElement(true),
      );
      return;
    }

    if (element.scrollTop <= 4) {
      moveWindow(-1);
      return;
    }
    else animateScrollTo(
      element.scrollTop - element.clientHeight * 0.86,
      'y',
      () => syncProgressFromElement(true),
    );
  };

  const turnForward = () => {
    const element = contentRef.current;
    if (!element || !layoutReady) return;
    if (isPagedFlow) {
      const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
      if (element.scrollLeft >= maxScroll - 4) {
        if (!moveWindow(1)) openNextBook();
        return;
      }
      const metrics = pageMetricsRef.current;
      animateScrollTo(
        element.scrollLeft + metrics.pageStep * pagesPerSpread,
        'x',
        () => syncProgressFromElement(true),
      );
      return;
    }

    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    if (element.scrollTop >= maxScroll - 4) {
      if (!moveWindow(1)) openNextBook();
      return;
    }
    else animateScrollTo(
      element.scrollTop + element.clientHeight * 0.86,
      'y',
      () => syncProgressFromElement(true),
    );
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isPagedFlow) return;
    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 20) return;

    event.preventDefault();
    const now = performance.now();
    if (now < wheelReadyAtRef.current || isAnimatingRef.current) return;
    wheelReadyAtRef.current = now + 190;
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
      {!layoutReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-inherit">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#007AFF]" />
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

function progressToWindowProgress(progress: number, range: { start: number; end: number }, textLength: number) {
  if (textLength <= 0) return 0;
  const target = Math.max(0, Math.min(textLength, progress * textLength));
  const rangeLength = Math.max(1, range.end - range.start);
  return Math.max(0, Math.min(1, (target - range.start) / rangeLength));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
