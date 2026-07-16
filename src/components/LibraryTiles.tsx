import { ArrowLeft, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Book } from '../types';
import { displayBookFileName } from '../lib/series';
import { prewarmWebReaderOnIntent } from '../lib/readerWarmup';
import { BookCover } from './BookCover';
import type { LibraryEntry } from './Library';

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
      className="flex min-w-0 flex-col gap-2 sm:gap-3 cursor-pointer group text-left"
    >
      <div className="aspect-[3/4] rounded-xl shadow-[0_8px_24px_rgba(35,40,33,0.12)] group-hover:shadow-[0_12px_30px_rgba(35,40,33,0.17)] transition-shadow duration-300 bg-[#e4e5df] dark:bg-[#30332f] overflow-hidden relative">
        <BookCover book={entry.coverBook} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {entry.books.length}
        </div>
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
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
      className="flex min-w-0 flex-col gap-2 sm:gap-3 cursor-pointer group text-left"
    >
      <div className="aspect-[3/4] rounded-xl shadow-[0_8px_24px_rgba(35,40,33,0.12)] group-hover:shadow-[0_12px_30px_rgba(35,40,33,0.17)] transition-shadow duration-300 bg-[#e4e5df] dark:bg-[#30332f] overflow-hidden relative">
        <BookCover book={book} className="w-full h-full object-cover" showMeta />
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
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
  return (
    <div className="glass-surface absolute inset-0 z-20 flex flex-col">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center gap-3 px-4 sm:px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="返回书库">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="min-w-0 truncate text-lg font-bold text-[#1C1C1E] dark:text-white">{entry.title}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-3 min-[380px]:p-4 sm:p-6 space-y-6 sm:space-y-8">
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/10 p-4 sm:p-6 shadow-sm">
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
            <p className="mt-4 max-w-4xl text-sm leading-7 text-black/55 dark:text-white/55">
              该系列共收录 {entry.books.length} 本书。点击下方任意卷册即可进入正常阅读，封面选择的是系列内按名称正序排序后的第一本。
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
    </div>
  );
}

function formatSeriesIndex(book: Book, index: number) {
  return typeof book.seriesIndex === 'number' && Number.isFinite(book.seriesIndex)
    ? String(book.seriesIndex)
    : String(index + 1);
}
