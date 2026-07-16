import React, { useEffect, useMemo, useState } from 'react';
import { Book, BookType, Series } from '../types';
import { useAppContext } from '../store/AppStore';
import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, BookOpen, Clock3, Layers, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { BookCover } from './BookCover';
import { prewarmReaderPublication } from '../lib/readerPublication';
import { displayBookFileName, seriesCoverBook, sortBooksInSeries } from '../lib/series';

type SortKey = 'fileName' | 'addedAt' | 'recent';
type SortOrder = 'asc' | 'desc';
type TypeFilter = 'all' | BookType;
type LibraryEntry =
  | { kind: 'book'; id: string; type: BookType; title: string; fileName: string; addedAt: number; recentAt: number; book: Book }
  | { kind: 'series'; id: string; type: 'epub' | 'txt' | 'mixed'; title: string; fileName: string; addedAt: number; recentAt: number; series: Series; books: Book[]; coverBook: Book };

const BOOK_BATCH_SIZE = 72;

export function Library({ onReadBook }: { onReadBook: (book: Book) => void }) {
  const { books, progress, series } = useAppContext();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [visibleCount, setVisibleCount] = useState(BOOK_BATCH_SIZE);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  const progressByBookId = useMemo(
    () => new Map(progress.map((item) => [item.bookId, item])),
    [progress],
  );

  const recentBook = useMemo(() => {
    const recentProgress = [...progress].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return recentProgress ? books.find((book) => book.id === recentProgress.bookId) : undefined;
  }, [books, progress]);

  const libraryEntries = useMemo(() => {
    const booksById = new Map(books.map((book) => [book.id, book]));

    const consumedBookIds = new Set<string>();
    const entries: LibraryEntry[] = [];

    for (const item of series) {
      const groupedBooks = sortBooksInSeries(
        item.bookIds
          .map((bookId) => booksById.get(bookId))
          .filter((book): book is Book => Boolean(book)),
      );
      if (groupedBooks.length === 0) continue;
      const coverBook = seriesCoverBook(item, books) || groupedBooks[0];
      if (!coverBook) continue;
      for (const book of groupedBooks) consumedBookIds.add(book.id);
      const recentAt = Math.max(...groupedBooks.map((book) => progressByBookId.get(book.id)?.updatedAt || 0), 0);
      const addedAt = Math.min(...groupedBooks.map((book) => book.addedAt));
      const type = groupedBooks.every((book) => book.type === groupedBooks[0].type) ? groupedBooks[0].type : 'mixed';
      entries.push({
        kind: 'series',
        id: item.id,
        type,
        title: item.name,
        fileName: displayBookFileName(coverBook),
        addedAt,
        recentAt,
        series: item,
        books: groupedBooks,
        coverBook,
      });
    }

    for (const book of books) {
      if (consumedBookIds.has(book.id)) continue;
      entries.push({
        kind: 'book',
        id: book.id,
        type: book.type,
        title: book.title,
        fileName: displayBookFileName(book),
        addedAt: book.addedAt,
        recentAt: progressByBookId.get(book.id)?.updatedAt || 0,
        book,
      });
    }

    return entries;
  }, [books, progressByBookId, series]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = libraryEntries.filter((entry) => {
      const entryTypes = entry.kind === 'series' ? new Set(entry.books.map((book) => book.type)) : new Set([entry.book.type]);
      if (typeFilter !== 'all' && !entryTypes.has(typeFilter)) return false;
      if (!normalizedQuery) return true;

      if (entry.kind === 'series') {
        return [
          entry.title,
          entry.fileName,
          ...entry.books.flatMap((book) => [book.title, book.fileName || '', book.author, book.seriesName || '']),
        ]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      }

      return [entry.title, entry.book.author, entry.fileName, entry.book.seriesName]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
    });

    return result.sort((a, b) => {
      let value = 0;
      if (sortKey === 'fileName') {
        value = a.fileName.localeCompare(b.fileName, 'zh-Hans-CN');
      } else if (sortKey === 'addedAt') {
        value = a.addedAt - b.addedAt;
      } else {
        value = a.recentAt - b.recentAt;
      }
      return sortOrder === 'asc' ? value : -value;
    });
  }, [libraryEntries, query, sortKey, sortOrder, typeFilter]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const selectedSeriesEntry = useMemo(
    () => libraryEntries.find((entry): entry is Extract<LibraryEntry, { kind: 'series' }> => entry.kind === 'series' && entry.id === selectedSeriesId) || null,
    [libraryEntries, selectedSeriesId],
  );

  useEffect(() => {
    setVisibleCount(BOOK_BATCH_SIZE);
  }, [query, sortKey, sortOrder, typeFilter, libraryEntries.length]);

  useEffect(() => {
    if (selectedSeriesId && !libraryEntries.some((entry) => entry.kind === 'series' && entry.id === selectedSeriesId)) {
      setSelectedSeriesId(null);
    }
  }, [libraryEntries, selectedSeriesId]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const handleLibraryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 420) {
      setVisibleCount((current) => Math.min(filteredEntries.length, current + BOOK_BATCH_SIZE));
    }
  };

  if (books.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-black/45 dark:text-gray-400 bg-[#FBFAF7]/80 dark:bg-[#171916]/80">
        <BookOpen className="w-14 h-14 mb-5 opacity-25" strokeWidth={1.3} />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">暂无书籍</h2>
        <p className="text-sm">请前往设置中添加本地文件夹以扫描 EPUB 和 TXT 文件。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex relative overflow-hidden">
      <div className="flex-1 flex flex-col relative bg-[#FBFAF7]/80 dark:bg-[#171916]/80">
        <header className="h-16 border-b border-black/[0.045] dark:border-white/5 flex items-center justify-between px-5 sm:px-8 bg-[#FBFAF7]/85 dark:bg-[#171916]/85 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-lg font-semibold tracking-[0.06em] text-[#1C1C1E] dark:text-white">所有书籍</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7" onScroll={handleLibraryScroll}>
        {recentBook && (
          <button
            onPointerEnter={() => prewarmBook(recentBook)}
            onFocus={() => prewarmBook(recentBook)}
            onClick={() => onReadBook(recentBook)}
            className="w-full text-left rounded-2xl border border-black/[0.055] dark:border-white/10 bg-white/55 dark:bg-white/[0.07] p-4 hover:bg-white/85 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-[74px] rounded-xl overflow-hidden bg-[#e4e5df] dark:bg-[#30332f] shrink-0 shadow-[0_6px_18px_rgba(35,40,33,0.12)]">
                <BookCover book={recentBook} className="w-full h-full object-cover" compact />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#007AFF]">
                  <Clock3 className="w-4 h-4" />
                  最近阅读
                </div>
                <h2 className="mt-1 text-xl font-semibold text-[#1C1C1E] dark:text-white truncate">{recentBook.title}</h2>
                <p className="mt-1 text-sm text-black/50 dark:text-white/50 truncate">{recentBook.author}</p>
              </div>
            </div>
          </button>
        )}

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-2xl border border-black/[0.05] dark:border-white/10 bg-white/45 dark:bg-white/[0.06] p-3">
          <div className="relative min-w-0 xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 dark:text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索书名、作者、文件名或系列名"
              className="w-full h-10 rounded-xl bg-black/[0.035] dark:bg-white/10 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-black/5 dark:bg-white/10 p-1">
              {(['all', 'epub', 'txt'] as TypeFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setTypeFilter(value)}
                  className={`h-8 px-3 rounded-lg text-sm transition-colors ${typeFilter === value ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-[#1C1C1E] dark:text-white' : 'text-black/50 dark:text-white/50'}`}
                >
                  {value === 'all' ? '全部' : value.toUpperCase()}
                </button>
              ))}
            </div>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 rounded-xl bg-black/[0.035] dark:bg-white/10 px-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35"
            >
              <option value="recent">最近阅读</option>
              <option value="fileName">文件名</option>
              <option value="addedAt">加入时间</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="h-10 w-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              {sortOrder === 'asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-8 content-start">
          {visibleEntries.map((entry) => (
            entry.kind === 'series' ? (
              <SeriesTile key={entry.id} entry={entry} onOpenSeries={() => setSelectedSeriesId(entry.id)} />
            ) : (
              <BookTile key={entry.id} book={entry.book} onReadBook={onReadBook} />
            )
          ))}
        </div>

        {visibleCount < filteredEntries.length && (
          <button
            onClick={() => setVisibleCount((current) => Math.min(filteredEntries.length, current + BOOK_BATCH_SIZE))}
            className="mx-auto block rounded-xl bg-black/5 px-4 py-2 text-sm font-medium text-black/55 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
          >
            加载更多
          </button>
        )}
        </div>
      </div>
      {selectedSeriesEntry && (
        <SeriesDetailView
          entry={selectedSeriesEntry}
          onBack={() => setSelectedSeriesId(null)}
          onReadBook={onReadBook}
        />
      )}
    </div>
  );
}

function SeriesTile({
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
      className="flex flex-col gap-3 cursor-pointer group text-left"
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
      <div className="px-1">
        <h3 className="font-semibold text-sm text-[#1C1C1E] dark:text-white line-clamp-2">{entry.title}</h3>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50 line-clamp-1">{displayBookFileName(entry.coverBook)}</p>
      </div>
    </motion.button>
  );
}

function BookTile({ book, onReadBook }: { book: Book; onReadBook: (book: Book) => void }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onPointerEnter={() => prewarmBook(book)}
      onFocus={() => prewarmBook(book)}
      onClick={() => onReadBook(book)}
      className="flex flex-col gap-3 cursor-pointer group text-left"
    >
      <div className="aspect-[3/4] rounded-xl shadow-[0_8px_24px_rgba(35,40,33,0.12)] group-hover:shadow-[0_12px_30px_rgba(35,40,33,0.17)] transition-shadow duration-300 bg-[#e4e5df] dark:bg-[#30332f] overflow-hidden relative">
        <BookCover book={book} className="w-full h-full object-cover" showMeta />
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
          {book.type}
        </div>
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-sm text-[#1C1C1E] dark:text-white line-clamp-2">{book.title}</h3>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50 line-clamp-2">{displayBookFileName(book)}</p>
      </div>
    </motion.button>
  );
}

function SeriesDetailView({
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
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center gap-3 px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="返回书库"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="min-w-0 truncate text-lg font-bold text-[#1C1C1E] dark:text-white">{entry.title}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/10 p-6 shadow-sm">
          <div className="w-full max-w-[220px]">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#e4e5df] dark:bg-[#30332f] shadow-[0_10px_30px_rgba(35,40,33,0.14)]">
              <BookCover book={entry.coverBook} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#007AFF]">
              <span className="rounded-full bg-[#007AFF]/10 px-2.5 py-1">{entry.books.length} 本书</span>
              {entry.type !== 'mixed' && (
                <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 uppercase text-black/55 dark:text-white/55">
                  {entry.type}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-white">{entry.title}</h2>
            {uniqueAuthors.length > 0 && (
              <p className="mt-3 text-sm text-black/55 dark:text-white/55">
                作者：{uniqueAuthors.join(' / ')}
              </p>
            )}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {entry.books.map((book, index) => (
              <motion.button
                key={book.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                onPointerEnter={() => prewarmBook(book)}
                onFocus={() => prewarmBook(book)}
                onClick={() => onReadBook(book)}
                className="group text-left overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-white/10 shadow-sm transition-colors hover:bg-white dark:hover:bg-white/15"
              >
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

function prewarmBook(book: Book) {
  void prewarmReaderPublication(book).catch(() => {});
}

function formatSeriesIndex(book: Book, index: number) {
  if (typeof book.seriesIndex === 'number' && Number.isFinite(book.seriesIndex)) {
    return String(book.seriesIndex);
  }
  return String(index + 1);
}
