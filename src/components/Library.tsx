import React, { useEffect, useMemo, useState } from 'react';
import { Book, BookType, Series } from '../types';
import { useAppContext } from '../store/AppStore';
import { ArrowDownAZ, ArrowUpAZ, BookOpen, Clock3, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { BookCover } from './BookCover';
import { displayBookFileName, seriesCoverBook, sortBooksInSeries } from '../lib/series';
import { prewarmWebReaderOnIntent } from '../lib/readerWarmup';
import { BookTile, SeriesDetailView, SeriesTile } from './LibraryTiles';

type SortKey = 'fileName' | 'addedAt' | 'recent';
type SortOrder = 'asc' | 'desc';
type TypeFilter = 'all' | BookType;
export type LibraryEntry =
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
        <header className="h-14 sm:h-16 border-b border-black/[0.045] dark:border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#FBFAF7]/85 dark:bg-[#171916]/85 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-lg font-semibold tracking-[0.06em] text-[#1C1C1E] dark:text-white">所有书籍</h1>
          <span className="text-xs tabular-nums text-black/40 dark:text-white/40">{filteredEntries.length} 本</span>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4 min-[380px]:px-4 sm:p-6 lg:p-8" onScroll={handleLibraryScroll}>
          <div className="mx-auto w-full max-w-[1800px] space-y-5 sm:space-y-7">
            {recentBook && (
              <button
                onPointerDown={() => prewarmWebReaderOnIntent(recentBook)}
                onFocus={() => prewarmWebReaderOnIntent(recentBook)}
                onClick={() => onReadBook(recentBook)}
                className="w-full lg:max-w-4xl text-left rounded-2xl border border-black/[0.055] dark:border-white/10 bg-white/55 dark:bg-white/[0.07] p-3 sm:p-4 hover:bg-white/85 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-[74px] sm:w-20 sm:h-[106px] rounded-xl overflow-hidden bg-[#e4e5df] dark:bg-[#30332f] shrink-0 shadow-[0_6px_18px_rgba(35,40,33,0.12)]">
                    <BookCover book={recentBook} className="w-full h-full object-cover" compact />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#007AFF]">
                      <Clock3 className="w-4 h-4" />
                      最近阅读
                    </div>
                    <h2 className="mt-1 text-base sm:text-xl font-semibold text-[#1C1C1E] dark:text-white line-clamp-1">{recentBook.title}</h2>
                    <p className="mt-1 text-sm text-black/50 dark:text-white/50 truncate">{recentBook.author}</p>
                  </div>
                </div>
              </button>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3 rounded-2xl border border-black/[0.05] dark:border-white/10 bg-white/45 dark:bg-white/[0.06] p-2.5 sm:p-3">
              <div className="relative min-w-0 lg:w-80 lg:shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 dark:text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索书名、作者、文件名或系列名"
                  className="w-full h-10 rounded-xl bg-black/[0.035] dark:bg-white/10 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                <div className="grid min-w-[11.5rem] flex-1 grid-cols-3 rounded-xl bg-black/5 p-1 dark:bg-white/10 lg:w-[13rem] lg:flex-none">
                  {(['all', 'epub', 'txt'] as TypeFilter[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setTypeFilter(value)}
                      className={`h-8 whitespace-nowrap px-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-colors ${typeFilter === value ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-[#1C1C1E] dark:text-white' : 'text-black/50 dark:text-white/50'}`}
                    >
                      {value === 'all' ? '全部' : value.toUpperCase()}
                    </button>
                  ))}
                </div>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="h-10 w-[7.75rem] shrink-0 rounded-xl bg-black/[0.035] dark:bg-white/10 px-2 sm:px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                >
                  <option value="recent">最近阅读</option>
                  <option value="fileName">文件名</option>
                  <option value="addedAt">加入时间</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="h-10 w-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                  title={sortOrder === 'asc' ? '升序' : '降序'}
                >
                  {sortOrder === 'asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="library-grid grid gap-x-3 min-[380px]:gap-x-4 sm:gap-x-5 lg:gap-x-6 gap-y-5 sm:gap-y-7 lg:gap-y-8 content-start">
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
