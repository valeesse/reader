import React, { useEffect, useMemo, useState } from 'react';
import { Book, BookType } from '../types';
import { useAppContext } from '../store/AppStore';
import { ArrowDownAZ, ArrowUpAZ, BookOpen, Clock3, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { BookCover } from './BookCover';

type SortKey = 'fileName' | 'addedAt' | 'recent';
type SortOrder = 'asc' | 'desc';
type TypeFilter = 'all' | BookType;
const BOOK_BATCH_SIZE = 72;

export function Library({ onReadBook }: { onReadBook: (book: Book) => void }) {
  const { books, progress } = useAppContext();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [visibleCount, setVisibleCount] = useState(BOOK_BATCH_SIZE);

  const progressByBookId = useMemo(
    () => new Map(progress.map((item) => [item.bookId, item])),
    [progress],
  );

  const recentBook = useMemo(() => {
    const recentProgress = [...progress].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return recentProgress ? books.find((book) => book.id === recentProgress.bookId) : undefined;
  }, [books, progress]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = books.filter((book) => {
      if (typeFilter !== 'all' && book.type !== typeFilter) return false;
      if (!normalizedQuery) return true;
      return [book.title, book.author, book.fileName, book.seriesName]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));
    });

    return result.sort((a, b) => {
      let value = 0;
      if (sortKey === 'fileName') {
        value = (a.fileName || a.title).localeCompare(b.fileName || b.title, 'zh-Hans-CN');
      } else if (sortKey === 'addedAt') {
        value = a.addedAt - b.addedAt;
      } else {
        value = (progressByBookId.get(a.id)?.updatedAt || 0) - (progressByBookId.get(b.id)?.updatedAt || 0);
      }
      return sortOrder === 'asc' ? value : -value;
    });
  }, [books, progressByBookId, query, sortKey, sortOrder, typeFilter]);

  const visibleBooks = filteredBooks.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(BOOK_BATCH_SIZE);
  }, [query, sortKey, sortOrder, typeFilter, books.length]);

  const toggleSortOrder = () => {
    setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
  };

  const handleLibraryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 420) {
      setVisibleCount((current) => Math.min(filteredBooks.length, current + BOOK_BATCH_SIZE));
    }
  };

  if (books.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#121212]/70">
        <BookOpen className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">暂无书籍</h2>
        <p className="text-sm">请前往设置中添加本地文件夹以扫描 EPUB 和 TXT 文件。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-white/70 dark:bg-[#121212]/70">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#1C1C1E] dark:text-white">所有书籍</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" onScroll={handleLibraryScroll}>
        {recentBook && (
          <button
            onClick={() => onReadBook(recentBook)}
            className="w-full text-left rounded-2xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/10 p-4 shadow-sm hover:bg-white dark:hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-[74px] rounded-xl overflow-hidden bg-gradient-to-br from-[#007AFF] to-[#AF52DE] shrink-0 shadow-md">
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

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white/65 dark:bg-white/10 p-3">
          <div className="relative min-w-0 xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 dark:text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索书名、作者或文件名"
              className="w-full h-10 rounded-xl bg-black/5 dark:bg-white/10 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"
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
              className="h-10 rounded-xl bg-black/5 dark:bg-white/10 px-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-7 content-start">
          {visibleBooks.map((book) => (
            <BookTile key={book.id} book={book} onReadBook={onReadBook} />
          ))}
        </div>

        {visibleCount < filteredBooks.length && (
          <button
            onClick={() => setVisibleCount((current) => Math.min(filteredBooks.length, current + BOOK_BATCH_SIZE))}
            className="mx-auto block rounded-xl bg-black/5 px-4 py-2 text-sm font-medium text-black/55 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
}

function BookTile({ book, onReadBook }: { book: Book, onReadBook: (book: Book) => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onReadBook(book)}
      className="flex flex-col gap-3 cursor-pointer group"
    >
      <div className="aspect-[3/4] rounded-xl shadow-xl border border-black/5 dark:border-white/10 group-hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[#007AFF] to-[#AF52DE] overflow-hidden relative">
        <BookCover book={book} className="w-full h-full object-cover" showMeta />
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
          {book.type}
        </div>
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-sm text-[#1C1C1E] dark:text-white line-clamp-1">{book.title}</h3>
        <p className="text-xs text-black/50 dark:text-white/50 line-clamp-1">{book.author}</p>
      </div>
    </motion.div>
  );
}
