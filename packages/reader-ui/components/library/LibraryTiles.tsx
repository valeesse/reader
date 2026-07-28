import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, Check, Grid2X2, Layers, List, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Book } from '../../types';
import { displayBookFileName } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../features/reader/runtime/readerWarmup';
import { BookCover } from './BookCover';
import type { LibraryEntry, LibraryLayoutMode } from './Library';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useAppContext, useProgressContext } from '../../store/AppStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AppSelect } from '../ui/AppSelect';

export function SeriesTile({
  entry,
  onOpenSeries,
}: {
  entry: Extract<LibraryEntry, { kind: 'series' }>;
  onOpenSeries: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpenSeries}
      className="group flex min-w-0 cursor-pointer flex-col gap-2 rounded-xl text-left focus-visible:outline-offset-4 sm:gap-3"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#e4e5df] shadow-[0_8px_24px_rgba(35,40,33,0.12)] transition-shadow duration-300 group-hover:shadow-[0_14px_34px_rgba(35,40,33,0.2)] dark:bg-[#30332f]">
        <BookCover book={entry.coverBook} className="w-full h-full object-cover" />
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <Layers className="w-3 h-3" />
          {entry.books.length}
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {entry.type === 'mixed' ? 'SERIES' : entry.type}
        </div>
      </div>
      <div className="min-w-0 px-0.5 sm:px-1">
        <h3 className="font-semibold text-[13px] sm:text-sm leading-5 text-[#1C1C1E] dark:text-white line-clamp-2">{entry.title}</h3>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50 line-clamp-1">{displayBookFileName(entry.coverBook)}</p>
      </div>
    </motion.button>
  );
}

export function BookTile({ book, onReadBook }: { book: Book; onReadBook: (book: Book) => void }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onPointerDown={() => prewarmWebReaderOnIntent(book)}
      onFocus={() => prewarmWebReaderOnIntent(book)}
      onClick={() => onReadBook(book)}
      className="group flex min-w-0 cursor-pointer flex-col gap-2 rounded-xl text-left focus-visible:outline-offset-4 sm:gap-3"
    >
      <div className="aspect-[3/4] rounded-xl shadow-[0_8px_24px_rgba(35,40,33,0.12)] group-hover:shadow-[0_12px_30px_rgba(35,40,33,0.17)] transition-shadow duration-300 bg-[#e4e5df] dark:bg-[#30332f] overflow-hidden relative">
        <BookCover book={book} className="w-full h-full object-cover" showMeta />
        <div className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {book.type}
        </div>
      </div>
      <div className="min-w-0 px-0.5 sm:px-1">
        <h3 className="font-semibold text-[13px] sm:text-sm leading-5 text-[#1C1C1E] dark:text-white line-clamp-2">{book.title}</h3>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50 line-clamp-2">{displayBookFileName(book)}</p>
      </div>
    </motion.button>
  );
}

export function LongPressSelectable({
  active,
  selected,
  label,
  onLongPress,
  onToggle,
  children,
}: {
  active: boolean;
  selected: boolean;
  label: string;
  onLongPress: () => void;
  onToggle: () => void;
  children: ReactNode;
}) {
  const timerRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const cancelLongPress = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPointRef.current = null;
  };

  useEffect(() => cancelLongPress, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (active || (event.pointerType === 'mouse' && event.button !== 0)) return;
    cancelLongPress();
    startPointRef.current = { x: event.clientX, y: event.clientY };
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      startPointRef.current = null;
      suppressClickRef.current = true;
      onLongPress();
      navigator.vibrate?.(12);
    }, 520);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const startPoint = startPointRef.current;
    if (!startPoint) return;
    if (Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) > 10) {
      cancelLongPress();
    }
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (active) return;
    cancelLongPress();
    onLongPress();
  };

  return (
    <div
      className={`relative min-w-0 select-none ${selected ? 'rounded-2xl ring-2 ring-[#087DF1] ring-offset-2 ring-offset-[#FBFAF7] dark:ring-offset-[#171916]' : ''}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onClickCapture={handleClickCapture}
      onContextMenu={handleContextMenu}
    >
      {children}
      {active && (
        <button type="button" onClick={onToggle} aria-label={label} aria-pressed={selected} className="absolute inset-0 z-10 rounded-2xl bg-transparent">
          <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${selected ? 'border-[#087DF1] bg-[#087DF1] text-white' : 'border-white bg-black/35 text-transparent'}`}><Check className="h-4 w-4" /></span>
        </button>
      )}
    </div>
  );
}

export function BookListItem({ book, onReadBook }: { book: Book; onReadBook: (book: Book) => void }) {
  return (
    <button
      type="button"
      onPointerDown={() => prewarmWebReaderOnIntent(book)}
      onFocus={() => prewarmWebReaderOnIntent(book)}
      onClick={() => onReadBook(book)}
      className="app-card group flex w-full min-w-0 items-center gap-2.5 p-1.5 text-left transition-colors hover:border-[#087DF1]/20 hover:bg-white sm:p-2 dark:hover:bg-white/10"
    >
      <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-[#e4e5df] shadow-sm dark:bg-[#30332f]">
        <BookCover book={book} className="h-full w-full object-cover" compact />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold leading-5 text-[#1C1C1E] dark:text-white">{book.title}</h3>
        <p className="mt-0.5 truncate text-[11px] leading-4 text-black/45 dark:text-white/45">
          {book.author || '未知作者'} <span aria-hidden="true">·</span> {displayBookFileName(book)}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-black/45 dark:bg-white/10 dark:text-white/45">{book.type}</span>
    </button>
  );
}

export function SeriesListItem({
  entry,
  onOpenSeries,
}: {
  entry: Extract<LibraryEntry, { kind: 'series' }>;
  onOpenSeries: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenSeries}
      className="app-card group flex w-full min-w-0 items-center gap-2.5 p-1.5 text-left transition-colors hover:border-[#087DF1]/20 hover:bg-white sm:p-2 dark:hover:bg-white/10"
    >
      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-[#e4e5df] shadow-sm dark:bg-[#30332f]">
        <BookCover book={entry.coverBook} className="h-full w-full object-cover" compact />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#087DF1]"><Layers className="h-3 w-3" />系列</span>
          <h3 className="min-w-0 truncate text-sm font-semibold leading-5 text-[#1C1C1E] dark:text-white">{entry.title}</h3>
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-4 text-black/45 dark:text-white/45">{displayBookFileName(entry.coverBook)}</p>
      </div>
      <span className="shrink-0 rounded-md bg-[#087DF1]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#087DF1]">{entry.books.length} 本</span>
    </button>
  );
}

export function SeriesDetailView({
  entry,
  layoutMode,
  onLayoutModeChange,
  onBack,
  onReadBook,
}: {
  entry: Extract<LibraryEntry, { kind: 'series' }>;
  layoutMode: LibraryLayoutMode;
  onLayoutModeChange: (mode: LibraryLayoutMode) => void;
  onBack: () => void;
  onReadBook: (book: Book) => void;
}) {
  const { deleteBooks } = useAppContext();
  const progress = useProgressContext();
  const uniqueAuthors = Array.from(new Set(entry.books.map((book) => book.author).filter(Boolean)));
  const [visibleCount, setVisibleCount] = useState(72);
  const [sortKey, setSortKey] = useState<'series' | 'title' | 'addedAt' | 'recent'>('series');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const showScrollTopRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setVisibleCount(72);
  }, [entry.id]);
  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);
  const recentAtByBookId = useMemo(() => new Map(progress.map((item) => [item.bookId, item.updatedAt])), [progress]);
  const sortedBooks = useMemo(() => [...entry.books].sort((a, b) => {
    let value = 0;
    if (sortKey === 'title') value = a.title.localeCompare(b.title, 'zh-Hans-CN');
    else if (sortKey === 'addedAt') value = a.addedAt - b.addedAt;
    else if (sortKey === 'recent') value = (recentAtByBookId.get(a.id) || 0) - (recentAtByBookId.get(b.id) || 0);
    else value = (a.seriesIndex ?? Number.MAX_SAFE_INTEGER) - (b.seriesIndex ?? Number.MAX_SAFE_INTEGER)
      || displayBookFileName(a).localeCompare(displayBookFileName(b), 'zh-Hans-CN');
    return sortOrder === 'asc' ? value : -value;
  }), [entry.books, recentAtByBookId, sortKey, sortOrder]);
  const leaveSelectionMode = () => {
    setSelectionMode(false);
    setSelectedBookIds(new Set());
  };
  const enterSelectionMode = (bookId: string) => {
    setSelectionMode(true);
    setSelectedBookIds((current) => new Set(current).add(bookId));
  };
  const toggleBook = (bookId: string) => {
    setSelectedBookIds((current) => {
      const next = new Set(current);
      next.has(bookId) ? next.delete(bookId) : next.add(bookId);
      return next;
    });
  };
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="series-detail-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-[#FBFAF7] outline-none dark:bg-[#171916] sm:absolute sm:z-20 sm:rounded-2xl"
    >
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center gap-3 px-4 sm:px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="返回书库">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 id="series-detail-title" className="min-w-0 truncate text-lg font-semibold text-[#1C1C1E] dark:text-white">{entry.title}</h1>
      </header>
      <div
        ref={scrollContainerRef}
        className="min-w-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-3 min-[380px]:p-4 sm:space-y-8 sm:p-6"
        onScroll={(event) => {
          const visible = event.currentTarget.scrollTop > 480;
          if (visible !== showScrollTopRef.current) {
            showScrollTopRef.current = visible;
            setShowScrollTop(visible);
          }
        }}
      >
        <section className="app-card grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="w-full max-w-[160px] sm:max-w-[220px] mx-auto lg:mx-0">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#e4e5df] dark:bg-[#30332f] shadow-[0_10px_30px_rgba(35,40,33,0.14)]">
              <BookCover book={entry.coverBook} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#007AFF]">
              <span className="rounded-full bg-[#007AFF]/10 px-2.5 py-1">{entry.books.length} 本书</span>
              {entry.type !== 'mixed' && <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 uppercase text-black/55 dark:text-white/55">{entry.type}</span>}
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-white">{entry.title}</h2>
            {uniqueAuthors.length > 0 && <p className="mt-3 text-sm text-black/55 dark:text-white/55">作者：{uniqueAuthors.join(' / ')}</p>}
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60 dark:text-white/60">
              共收录 {entry.books.length} 本书，已按卷序和文件名整理。选择任意卷册即可开始阅读。
            </p>
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-white">系列书籍</h3>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <AppSelect
                value={sortKey}
                onChange={setSortKey}
                ariaLabel="系列书籍排序方式"
                options={[
                  { value: 'series', label: '卷序 / 文件名' },
                  { value: 'title', label: '书名' },
                  { value: 'addedAt', label: '加入时间' },
                  { value: 'recent', label: '最近阅读' },
                ]}
                className="h-9 min-w-[7.5rem] text-xs"
              />
              <button
                type="button"
                onClick={() => setSortOrder((value) => value === 'asc' ? 'desc' : 'asc')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10"
                aria-label="切换排序方向"
              >
                {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
              </button>
              <div className="flex h-9 shrink-0 rounded-xl bg-black/5 p-0.5 dark:bg-white/10">
                <button type="button" onClick={() => onLayoutModeChange('grid')} aria-label="封面网格" aria-pressed={layoutMode === 'grid'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'grid' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><Grid2X2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => onLayoutModeChange('list')} aria-label="列表" aria-pressed={layoutMode === 'list'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'list' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          {selectionMode && (
            <div className="app-card flex flex-wrap items-center gap-2 border-red-500/15 p-2.5">
              <button type="button" onClick={leaveSelectionMode} aria-label="退出选择" className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black/55 dark:bg-white/10 dark:text-white/60"><X className="h-4 w-4" /></button>
              <span className="mr-auto px-1 text-sm font-medium">已选择 {selectedBookIds.size} 本</span>
              <button type="button" onClick={() => setSelectedBookIds(new Set(sortedBooks.slice(0, visibleCount).map((book) => book.id)))} className="h-9 rounded-xl bg-black/5 px-3 text-xs font-medium dark:bg-white/10">全选已显示</button>
              <button type="button" disabled={selectedBookIds.size === 0} onClick={() => setConfirmDelete(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />永久删除</button>
            </div>
          )}
          <div className={layoutMode === 'grid' ? 'grid grid-cols-2 gap-3 min-[520px]:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6' : 'grid grid-cols-1 gap-2'}>
            {sortedBooks.slice(0, visibleCount).map((book, index) => (
              <LongPressSelectable
                key={book.id}
                active={selectionMode}
                selected={selectedBookIds.has(book.id)}
                label={`选择${book.title}`}
                onLongPress={() => enterSelectionMode(book.id)}
                onToggle={() => toggleBook(book.id)}
              >
              {layoutMode === 'grid' ? (
              <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }} onPointerDown={() => prewarmWebReaderOnIntent(book)} onFocus={() => prewarmWebReaderOnIntent(book)} onClick={() => onReadBook(book)} className="group overflow-hidden rounded-2xl border border-black/5 bg-white/85 text-left shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e4e5df] dark:bg-[#30332f]">
                  <BookCover book={book} className="h-full w-full object-cover" />
                  <div className="absolute right-0 top-0 border-l-[26px] border-t-[26px] border-l-transparent border-t-[#F59E0B]" />
                  <div className="absolute right-2 top-1.5 text-[10px] font-bold text-white">{formatSeriesIndex(book, index)}</div>
                </div>
                <div className="space-y-1 p-3">
                  <h4 className="line-clamp-2 text-sm font-semibold text-[#1C1C1E] dark:text-white">{book.title}</h4>
                  <p className="line-clamp-2 text-xs text-black/55 dark:text-white/55">{displayBookFileName(book)}</p>
                </div>
              </motion.button>
              ) : (
                <BookListItem book={book} onReadBook={onReadBook} />
              )
              }
              </LongPressSelectable>
            ))}
          </div>
          {visibleCount < sortedBooks.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => Math.min(sortedBooks.length, current + 72))}
              className="mx-auto block rounded-xl bg-black/5 px-4 py-2 text-sm font-medium text-black/55 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
            >
              加载更多（已显示 {visibleCount} / {sortedBooks.length}）
            </button>
          )}
        </section>
      </div>
      <ScrollToTopButton
        visible={showScrollTop}
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      {confirmDelete && (
        <ConfirmDialog
          title={`永久删除 ${selectedBookIds.size} 本书？`}
          description="此操作会直接删除书库目录中的原始文件，并从书架和系列中移除，且无法恢复。"
          confirmLabel="确认永久删除"
          busy={isDeleting}
          onCancel={() => !isDeleting && setConfirmDelete(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await deleteBooks(Array.from(selectedBookIds));
              setConfirmDelete(false);
              setSelectionMode(false);
              setSelectedBookIds(new Set());
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}

function formatSeriesIndex(book: Book, index: number) {
  return typeof book.seriesIndex === 'number' && Number.isFinite(book.seriesIndex)
    ? String(book.seriesIndex)
    : String(index + 1);
}
