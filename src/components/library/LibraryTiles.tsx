import { ArrowLeft, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Book } from '../../types';
import { displayBookFileName } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../reader/readerWarmup';
import { BookCover } from './BookCover';
import type { LibraryEntry } from './Library';
import { ScrollToTopButton } from './ScrollToTopButton';

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

export function SeriesDetailView({
  entry,
  onBack,
  onReadBook,
}: {
  entry: Extract<LibraryEntry, { kind: 'series' }>;
  onBack: () => void;
  onReadBook: (book: Book) => void;
}) {
  const uniqueAuthors = Array.from(new Set(entry.books.map((book) => book.author).filter(Boolean)));
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);
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
        onScroll={(event) => setShowScrollTop(event.currentTarget.scrollTop > 480)}
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1C1C1E] dark:text-white">系列书籍</h3>
            <p className="text-sm text-black/45 dark:text-white/45">按卷序 / 文件名排序</p>
          </div>
          <div className="grid grid-cols-2 min-[520px]:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {entry.books.map((book, index) => (
              <motion.button key={book.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }} onPointerDown={() => prewarmWebReaderOnIntent(book)} onFocus={() => prewarmWebReaderOnIntent(book)} onClick={() => onReadBook(book)} className="group text-left overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-white/10 shadow-sm transition-colors hover:bg-white dark:hover:bg-white/15">
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
            ))}
          </div>
        </section>
      </div>
      <ScrollToTopButton
        visible={showScrollTop}
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}

function formatSeriesIndex(book: Book, index: number) {
  return typeof book.seriesIndex === 'number' && Number.isFinite(book.seriesIndex)
    ? String(book.seriesIndex)
    : String(index + 1);
}
