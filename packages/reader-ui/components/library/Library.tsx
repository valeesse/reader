import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Book, BookType, Series } from '../../types';
import { useAppContext, useProgressContext } from '../../store/AppStore';
import { ArrowDownAZ, ArrowUpAZ, BookOpen, Check, Clock3, Grid2X2, List, RotateCcw, Search, SearchX, Settings2, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { BookCover } from './BookCover';
import { displayBookFileName, seriesCoverBook, sortBooksInSeries } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../features/reader/runtime/readerWarmup';
import { BookListItem, BookTile, SeriesDetailView, SeriesListItem, SeriesTile } from './LibraryTiles';
import { ScrollToTopButton } from './ScrollToTopButton';
import { runtimeCapabilities } from '../../lib/backend';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type SortKey = 'fileName' | 'addedAt' | 'recent';
type SortOrder = 'asc' | 'desc';
type TypeFilter = 'all' | BookType;
type LayoutMode = 'grid' | 'list';
export type LibraryEntry =
  | { kind: 'book'; id: string; type: BookType; title: string; fileName: string; addedAt: number; recentAt: number; book: Book }
  | { kind: 'series'; id: string; type: 'epub' | 'txt' | 'mixed'; title: string; fileName: string; addedAt: number; recentAt: number; series: Series; books: Book[]; coverBook: Book };

const BOOK_BATCH_SIZE = 72;

export function Library({ onReadBook, onOpenSettings }: { onReadBook: (book: Book) => void; onOpenSettings: () => void }) {
  const { books, series, deleteBooks } = useAppContext();
  const progress = useProgressContext();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BOOK_BATCH_SIZE);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const showScrollTopRef = useRef(false);

  const progressByBookId = useMemo(
    () => new Map(progress.map((item) => [item.bookId, item])),
    [progress],
  );

  const recentBook = useMemo(() => {
    const recentProgress = progress.reduce((latest, item) => !latest || item.updatedAt > latest.updatedAt ? item : latest, progress[0]);
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
      const coverBook = seriesCoverBook(item, booksById) || groupedBooks[0];
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
    const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
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
  }, [deferredQuery, libraryEntries, sortKey, sortOrder, typeFilter]);

  const visibleEntries = filteredEntries.slice(0, visibleCount);
  const filteredBookCount = filteredEntries.reduce((total, entry) => total + (entry.kind === 'series' ? entry.books.length : 1), 0);
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

  useEffect(() => {
    document.documentElement.classList.toggle('series-detail-open', Boolean(selectedSeriesId));
    return () => document.documentElement.classList.remove('series-detail-open');
  }, [selectedSeriesId]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const leaveSelectionMode = () => {
    setSelectionMode(false);
    setSelectedBookIds(new Set());
  };

  const toggleBookIds = (bookIds: string[]) => {
    setSelectedBookIds((current) => {
      const next = new Set(current);
      const allSelected = bookIds.every((id) => next.has(id));
      bookIds.forEach((id) => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const handleLibraryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const nextShowScrollTop = target.scrollTop > 480;
    if (nextShowScrollTop !== showScrollTopRef.current) {
      showScrollTopRef.current = nextShowScrollTop;
      setShowScrollTop(nextShowScrollTop);
    }
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 420) {
      setVisibleCount((current) => Math.min(filteredEntries.length, current + BOOK_BATCH_SIZE));
    }
  };

  if (books.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#FBFAF7]/80 px-6 text-center dark:bg-[#171916]/80">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#087DF1]/10 text-[#087DF1]">
          <BookOpen className="h-10 w-10" strokeWidth={1.4} />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">建立你的书架</h2>
        <p className="max-w-md text-sm leading-6 text-black/60 dark:text-white/60">
          {runtimeCapabilities.mutableLibraryRoot
            ? '选择本地书库目录，Zenith 会扫描其中的 EPUB 与 TXT。'
            : '服务器书库当前没有可读取的 EPUB 或 TXT，可前往设置重新建立索引。'}
        </p>
        <button onClick={onOpenSettings} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#087DF1] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#006ED6]">
          <Settings2 className="h-4 w-4" />
          前往内容库设置
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex relative overflow-hidden">
      <div
        className={`flex-1 flex flex-col relative bg-[#FBFAF7]/80 dark:bg-[#171916]/80 ${selectedSeriesEntry ? 'pointer-events-none select-none' : ''}`}
        aria-hidden={selectedSeriesEntry ? true : undefined}
        inert={selectedSeriesEntry ? true : undefined}
      >
        <header className="h-14 sm:h-16 border-b border-black/[0.045] dark:border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#FBFAF7]/85 dark:bg-[#171916]/85 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-lg font-semibold tracking-[0.06em] text-[#1C1C1E] dark:text-white">所有书籍</h1>
          <span className="text-xs tabular-nums text-black/55 dark:text-white/55">
            {filteredEntries.length} 个条目 · {filteredBookCount} 本书
          </span>
        </header>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-4 min-[380px]:px-4 sm:p-6 lg:p-8" onScroll={handleLibraryScroll}>
          <div className="mx-auto w-full max-w-[1800px] space-y-5 sm:space-y-7">
            {recentBook && (
              <button
                onPointerDown={() => prewarmWebReaderOnIntent(recentBook)}
                onFocus={() => prewarmWebReaderOnIntent(recentBook)}
                onClick={() => onReadBook(recentBook)}
                className="app-card w-full overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-[#087DF1]/20 hover:shadow-[0_14px_34px_rgba(35,40,33,0.12)] lg:max-w-4xl"
              >
                <div className="flex items-center gap-4 bg-gradient-to-r from-[#087DF1]/[0.075] to-transparent p-3 sm:gap-5 sm:p-4">
                  <div className="h-[82px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-[#e4e5df] shadow-[0_8px_22px_rgba(35,40,33,0.15)] sm:h-[112px] sm:w-[84px]">
                    <BookCover book={recentBook} className="w-full h-full object-cover" compact />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#087DF1]">
                      <Clock3 className="w-4 h-4" />
                      最近阅读
                    </div>
                    <h2 className="mt-1 text-base sm:text-xl font-semibold text-[#1C1C1E] dark:text-white line-clamp-1">{recentBook.title}</h2>
                    <p className="mt-1 text-sm text-black/50 dark:text-white/50 truncate">{recentBook.author}</p>
                    {typeof progressByBookId.get(recentBook.id)?.scrollPercentage === 'number' && (
                      <div className="mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div className="h-full rounded-full bg-[#087DF1]" style={{ width: `${Math.round((progressByBookId.get(recentBook.id)?.scrollPercentage || 0) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )}

            <div className="app-card flex flex-col gap-2.5 p-2.5 sm:p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 lg:w-96 lg:shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 dark:text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索书名、作者、文件名或系列名"
                  className="w-full h-10 rounded-xl bg-black/[0.035] dark:bg-white/10 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                <div className="grid w-full min-w-0 grid-cols-3 gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10 sm:w-auto sm:flex-[1.15] lg:w-[13rem] lg:flex-none">
                  {(['all', 'epub', 'txt'] as TypeFilter[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setTypeFilter(value)}
                      aria-pressed={typeFilter === value}
                      className={`h-8 whitespace-nowrap px-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-colors ${typeFilter === value ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-[#1C1C1E] dark:text-white' : 'text-black/50 dark:text-white/50'}`}
                    >
                      {value === 'all' ? '全部' : value.toUpperCase()}
                    </button>
                  ))}
                </div>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  aria-label="排序方式"
                  className="h-10 min-w-[6.25rem] flex-1 rounded-xl bg-black/[0.035] px-2 text-xs outline-none focus:ring-2 focus:ring-[#087DF1]/35 dark:bg-white/10 sm:px-3 sm:text-sm lg:w-[7.75rem] lg:flex-none"
                >
                  <option value="recent">最近阅读</option>
                  <option value="fileName">文件名</option>
                  <option value="addedAt">加入时间</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  aria-label={sortOrder === 'asc' ? '当前升序，点击切换为降序' : '当前降序，点击切换为升序'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                  title={sortOrder === 'asc' ? '升序' : '降序'}
                >
                  {sortOrder === 'asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
                </button>
                <div className="flex h-10 shrink-0 items-center rounded-xl bg-black/5 p-1 dark:bg-white/10" aria-label="展示方式">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    aria-label="封面网格"
                    aria-pressed={layoutMode === 'grid'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${layoutMode === 'grid' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('list')}
                    aria-label="列表"
                    aria-pressed={layoutMode === 'list'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${layoutMode === 'list' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => selectionMode ? leaveSelectionMode() : setSelectionMode(true)}
                  aria-label={selectionMode ? '退出选择' : '选择要删除的书籍'}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${selectionMode ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-black/5 text-black/50 hover:text-red-600 dark:bg-white/10 dark:text-white/50'}`}
                >
                  {selectionMode ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {selectionMode && (
              <div className="app-card sticky top-0 z-[8] flex flex-wrap items-center gap-2 border-red-500/15 p-2.5 sm:p-3">
                <span className="mr-auto px-1 text-sm font-medium text-[#1C1C1E] dark:text-white">已选择 {selectedBookIds.size} 本</span>
                <button type="button" onClick={() => setSelectedBookIds(new Set(visibleEntries.flatMap((entry) => entry.kind === 'series' ? entry.books.map((book) => book.id) : [entry.book.id])))} className="h-9 rounded-xl bg-black/5 px-3 text-xs font-medium hover:bg-black/10 dark:bg-white/10">选择当前结果</button>
                <button type="button" onClick={() => setSelectedBookIds(new Set())} className="h-9 rounded-xl bg-black/5 px-3 text-xs font-medium hover:bg-black/10 dark:bg-white/10">清空</button>
                <button type="button" disabled={selectedBookIds.size === 0} onClick={() => setConfirmDelete(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />永久删除</button>
              </div>
            )}

            <div className={layoutMode === 'grid'
              ? 'library-grid grid content-start gap-x-3 gap-y-5 min-[380px]:gap-x-4 sm:gap-x-5 sm:gap-y-7 lg:gap-x-6 lg:gap-y-8'
              : 'grid grid-cols-1 content-start gap-2 sm:gap-3'}
            >
              {visibleEntries.map((entry) => (
                <SelectableLibraryEntry
                  key={`${entry.kind}-${entry.id}`}
                  active={selectionMode}
                  selected={(entry.kind === 'series' ? entry.books.map((book) => book.id) : [entry.book.id]).every((id) => selectedBookIds.has(id))}
                  label={`选择${entry.title}`}
                  onToggle={() => toggleBookIds(entry.kind === 'series' ? entry.books.map((book) => book.id) : [entry.book.id])}
                >
                  {entry.kind === 'series' ? (
                    layoutMode === 'grid'
                      ? <SeriesTile entry={entry} onOpenSeries={() => setSelectedSeriesId(entry.id)} />
                      : <SeriesListItem entry={entry} onOpenSeries={() => setSelectedSeriesId(entry.id)} />
                  ) : (
                    layoutMode === 'grid'
                      ? <BookTile book={entry.book} onReadBook={onReadBook} />
                      : <BookListItem book={entry.book} onReadBook={onReadBook} />
                  )}
                </SelectableLibraryEntry>
              ))}
            </div>

            {filteredEntries.length === 0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <SearchX className="mb-4 h-12 w-12 text-black/20 dark:text-white/20" />
                <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">没有匹配的书籍</h2>
                <p className="mt-2 text-sm text-black/55 dark:text-white/55">尝试更换关键词或重置当前筛选条件。</p>
                <button
                  onClick={() => { setQuery(''); setTypeFilter('all'); }}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-black/5 px-4 text-sm font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  <RotateCcw className="h-4 w-4" />
                  重置筛选
                </button>
              </div>
            )}

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
        <ScrollToTopButton
          visible={showScrollTop}
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
      {selectedSeriesEntry && (
        <SeriesDetailView
          entry={selectedSeriesEntry}
          onBack={() => setSelectedSeriesId(null)}
          onReadBook={onReadBook}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title={`永久删除 ${selectedBookIds.size} 本书？`}
          description="此操作会直接删除书库目录中的原始文件，并从书架和相关系列中移除。删除后无法恢复，请确认你已备份需要保留的文件。"
          confirmLabel="确认永久删除"
          busy={isDeleting}
          onCancel={() => !isDeleting && setConfirmDelete(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await deleteBooks(Array.from(selectedBookIds));
              setConfirmDelete(false);
              leaveSelectionMode();
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}

function SelectableLibraryEntry({
  active,
  selected,
  label,
  onToggle,
  children,
}: {
  active: boolean;
  selected: boolean;
  label: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative min-w-0 ${selected ? 'rounded-2xl ring-2 ring-[#087DF1] ring-offset-2 ring-offset-[#FBFAF7] dark:ring-offset-[#171916]' : ''}`}>
      {children}
      {active && (
        <button type="button" onClick={onToggle} aria-label={label} aria-pressed={selected} className="absolute inset-0 z-10 rounded-2xl bg-transparent">
          <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm ${selected ? 'border-[#087DF1] bg-[#087DF1] text-white' : 'border-white bg-black/35 text-transparent'}`}><Check className="h-4 w-4" /></span>
        </button>
      )}
    </div>
  );
}
