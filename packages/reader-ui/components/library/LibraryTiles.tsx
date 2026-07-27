import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, Check, Grid2X2, Layers, List, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Book } from '../../types';
import { displayBookFileName } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../features/reader/runtime/readerWarmup';
import { BookCover } from './BookCover';
import type { LibraryEntry } from './Library';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useAppContext } from '../../store/AppStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';

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

export function BookListItem({ book, onReadBook }: { book: Book; onReadBook: (book: Book) => void }) {
  return (
    <button
      type="button"
      onPointerDown={() => prewarmWebReaderOnIntent(book)}
      onFocus={() => prewarmWebReaderOnIntent(book)}
      onClick={() => onReadBook(book)}
      className="app-card group flex w-full min-w-0 items-center gap-3 p-2.5 text-left transition-colors hover:border-[#087DF1]/20 hover:bg-white sm:gap-4 sm:p-3 dark:hover:bg-white/10"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#e4e5df] shadow-sm dark:bg-[#30332f] sm:h-[76px] sm:w-[57px]">
        <BookCover book={book} className="h-full w-full object-cover" compact />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-[#1C1C1E] dark:text-white sm:text-base">{book.title}</h3>
        <p className="mt-1 truncate text-xs text-black/50 dark:text-white/50 sm:text-sm">{book.author || '未知作者'}</p>
        <p className="mt-1 truncate text-xs text-black/40 dark:text-white/40">{displayBookFileName(book)}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase text-black/45 dark:bg-white/10 dark:text-white/45">{book.type}</span>
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
      className="app-card group flex w-full min-w-0 items-center gap-3 p-2.5 text-left transition-colors hover:border-[#087DF1]/20 hover:bg-white sm:gap-4 sm:p-3 dark:hover:bg-white/10"
    >
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#e4e5df] shadow-sm dark:bg-[#30332f] sm:h-[76px] sm:w-[57px]">
        <BookCover book={entry.coverBook} className="h-full w-full object-cover" compact />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#087DF1]"><Layers className="h-3.5 w-3.5" />系列</div>
        <h3 className="mt-1 truncate text-sm font-semibold text-[#1C1C1E] dark:text-white sm:text-base">{entry.title}</h3>
        <p className="mt-1 truncate text-xs text-black/45 dark:text-white/45">{displayBookFileName(entry.coverBook)}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-[#087DF1]/10 px-2.5 py-1 text-xs font-semibold text-[#087DF1]">{entry.books.length} 本</span>
    </button>
  );
}

export function SeriesDetailView({
  entry,
  onBack,
  onReadBook,
}: {
  entry: Extract<LibraryEntry, { kind: 'series' }>;
  onBack: () => void;
  onReadBook: (book: Book) => void;
}) {
  const { deleteBooks } = useAppContext();
  const uniqueAuthors = Array.from(new Set(entry.books.map((book) => book.author).filter(Boolean)));
  const [visibleCount, setVisibleCount] = useState(72);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortKey, setSortKey] = useState<'series' | 'title' | 'addedAt'>('series');
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
  const sortedBooks = useMemo(() => [...entry.books].sort((a, b) => {
    let value = 0;
    if (sortKey === 'title') value = a.title.localeCompare(b.title, 'zh-Hans-CN');
    else if (sortKey === 'addedAt') value = a.addedAt - b.addedAt;
    else value = (a.seriesIndex ?? Number.MAX_SAFE_INTEGER) - (b.seriesIndex ?? Number.MAX_SAFE_INTEGER)
      || displayBookFileName(a).localeCompare(displayBookFileName(b), 'zh-Hans-CN');
    return sortOrder === 'asc' ? value : -value;
  }), [entry.books, sortKey, sortOrder]);
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
        className="flex-1 overflow-y-auto p-3 min-[380px]:p-4 sm:p-6 space-y-6 sm:space-y-8"
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
            <div className="flex min-w-0 items-center gap-2">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as 'series' | 'title' | 'addedAt')}
                aria-label="系列书籍排序方式"
                className="h-9 min-w-0 rounded-xl bg-black/5 px-2 text-xs outline-none dark:bg-white/10 sm:px-3"
              >
                <option value="series">卷序 / 文件名</option>
                <option value="title">书名</option>
                <option value="addedAt">加入时间</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((value) => value === 'asc' ? 'desc' : 'asc')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10"
                aria-label="切换排序方向"
              >
                {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
              </button>
              <div className="flex h-9 shrink-0 rounded-xl bg-black/5 p-0.5 dark:bg-white/10">
                <button type="button" onClick={() => setLayoutMode('grid')} aria-label="封面网格" aria-pressed={layoutMode === 'grid'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'grid' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><Grid2X2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => setLayoutMode('list')} aria-label="列表" aria-pressed={layoutMode === 'list'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'list' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><List className="h-4 w-4" /></button>
              </div>
              <button type="button" onClick={() => { setSelectionMode((value) => !value); setSelectedBookIds(new Set()); }} aria-label={selectionMode ? '退出选择' : '选择要删除的书籍'} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selectionMode ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-black/5 text-black/45 dark:bg-white/10 dark:text-white/45'}`}>{selectionMode ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}</button>
            </div>
          </div>
          {selectionMode && (
            <div className="app-card flex flex-wrap items-center gap-2 border-red-500/15 p-2.5">
              <span className="mr-auto px-1 text-sm font-medium">已选择 {selectedBookIds.size} 本</span>
              <button type="button" onClick={() => setSelectedBookIds(new Set(sortedBooks.slice(0, visibleCount).map((book) => book.id)))} className="h-9 rounded-xl bg-black/5 px-3 text-xs font-medium dark:bg-white/10">全选已显示</button>
              <button type="button" disabled={selectedBookIds.size === 0} onClick={() => setConfirmDelete(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />永久删除</button>
            </div>
          )}
          <div className={layoutMode === 'grid' ? 'grid grid-cols-2 gap-3 min-[520px]:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6' : 'grid grid-cols-1 gap-2'}>
            {sortedBooks.slice(0, visibleCount).map((book, index) => (
              <div key={book.id} className={`relative min-w-0 ${selectedBookIds.has(book.id) ? 'rounded-2xl ring-2 ring-[#087DF1] ring-offset-2 ring-offset-[#FBFAF7] dark:ring-offset-[#171916]' : ''}`}>
              {layoutMode === 'grid' ? (
              <motion.button key={book.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }} onPointerDown={() => prewarmWebReaderOnIntent(book)} onFocus={() => prewarmWebReaderOnIntent(book)} onClick={() => onReadBook(book)} className="group overflow-hidden rounded-2xl border border-black/5 bg-white/85 text-left shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
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
                <BookListItem key={book.id} book={book} onReadBook={onReadBook} />
              )
              }
              {selectionMode && (
                <button
                  type="button"
                  onClick={() => setSelectedBookIds((current) => {
                    const next = new Set(current);
                    next.has(book.id) ? next.delete(book.id) : next.add(book.id);
                    return next;
                  })}
                  aria-label={`选择${book.title}`}
                  aria-pressed={selectedBookIds.has(book.id)}
                  className="absolute inset-0 z-10 rounded-2xl"
                >
                  <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${selectedBookIds.has(book.id) ? 'border-[#087DF1] bg-[#087DF1] text-white' : 'border-white bg-black/35 text-transparent'}`}><Check className="h-4 w-4" /></span>
                </button>
              )}
              </div>
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
