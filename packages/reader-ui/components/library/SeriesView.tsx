import React, { useDeferredValue, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../store/AppStore';
import { Book } from '../../types';
import { ArrowDownAZ, ArrowUpAZ, GitMerge, Grid2X2, Layers, List, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { BookCover } from './BookCover';
import { sortBooksInSeries } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../features/reader/runtime/readerWarmup';
import { SeriesEditorDialog } from './SeriesEditorDialog';
import { ScrollToTopButton } from './ScrollToTopButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SeriesMergeDialog } from './SeriesMergeDialog';
import type { LibraryLayoutMode } from './Library';

export function SeriesView({
  layoutMode,
  onLayoutModeChange,
  onReadBook,
}: {
  layoutMode: LibraryLayoutMode;
  onLayoutModeChange: (mode: LibraryLayoutMode) => void;
  onReadBook: (book: Book) => void;
}) {
  const { series, books, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries } = useAppContext();
  const [editorSeriesId, setEditorSeriesId] = useState<string | null | undefined>();
  const [draggingSeriesId, setDraggingSeriesId] = useState<string | undefined>();
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [autoCreateMessage, setAutoCreateMessage] = useState('');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sortKey, setSortKey] = useState<'name' | 'bookCount' | 'addedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleSeriesCount, setVisibleSeriesCount] = useState(8);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string>();
const [mergeSourceId, setMergeSourceId] = useState<string>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const showScrollTopRef = useRef(false);
  const booksById = useMemo(() => new Map(books.map((book) => [book.id, book])), [books]);
  const [visibleBySeriesId, setVisibleBySeriesId] = useState<Record<string, number>>({});
  const editingSeries = typeof editorSeriesId === 'string'
    ? series.find((item) => item.id === editorSeriesId)
    : undefined;
  const filteredSeries = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase();
    const result = !normalized ? [...series] : series.filter((item) => (
      item.name.toLocaleLowerCase().includes(normalized)
      || item.bookIds.some((bookId) => {
        const book = booksById.get(bookId);
        return book
          ? [book.title, book.author, book.fileName, book.relativePath]
            .filter(Boolean)
            .some((value) => value!.toLocaleLowerCase().includes(normalized))
          : false;
      })
    ));
    return result.sort((a, b) => {
      let value = 0;
      if (sortKey === 'bookCount') value = a.bookIds.length - b.bookIds.length;
      else if (sortKey === 'addedAt') {
        const aAdded = Math.max(...a.bookIds.map((id) => booksById.get(id)?.addedAt || 0), 0);
        const bAdded = Math.max(...b.bookIds.map((id) => booksById.get(id)?.addedAt || 0), 0);
        value = aAdded - bAdded;
      } else value = a.name.localeCompare(b.name, 'zh-Hans-CN');
      return sortOrder === 'asc' ? value : -value;
    });
  }, [booksById, deferredQuery, series, sortKey, sortOrder]);
  const visibleSeries = filteredSeries.slice(0, visibleSeriesCount);
  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase();
  const booksBySeriesId = useMemo(() => new Map(series.map((item) => [
    item.id,
    sortBooksInSeries(item.bookIds.map((bookId) => booksById.get(bookId)).filter((book): book is Book => Boolean(book))),
  ])), [booksById, series]);

  const submitEditor = async (name: string, selectedBookIds: string[]) => {
    if (editingSeries) {
      await updateSeries({ ...editingSeries, name, bookIds: selectedBookIds });
    } else {
      await createSeries(name, selectedBookIds);
    }
    setEditorSeriesId(undefined);
  };

  const handleAutoCreateSeries = async () => {
    if (isAutoCreating) return;
    setIsAutoCreating(true);
    setAutoCreateMessage('正在按路径和文件名规则分析...');
    try {
      const result = await autoCreateMetadataSeries();
      if (result.createdCount > 0 || result.updatedCount > 0) {
        setAutoCreateMessage(`已创建 ${result.createdCount} 个系列，更新 ${result.updatedCount} 个系列。`);
      } else if (result.eligibleGroups === 0) {
        setAutoCreateMessage('没有找到符合指定文件名格式的书籍。');
      } else {
        setAutoCreateMessage('系列已是最新。');
      }
    } catch (error) {
      console.warn('Auto create series failed', error);
      setAutoCreateMessage('自动创建失败，请稍后重试。');
    } finally {
      setIsAutoCreating(false);
    }
  };

  const mergeSourceIdFor = (event: React.DragEvent) => {
    return event.dataTransfer.getData('text/plain') || draggingSeriesId;
  };

  const canAcceptMerge = (sourceId: string | undefined, targetId: string) => {
    return Boolean(sourceId) && sourceId !== targetId;
  };

  const handleMergeDrop = async (sourceId: string | undefined, targetId: string) => {
    setDraggingSeriesId(undefined);
    if (!canAcceptMerge(sourceId, targetId)) return;
    await mergeSeries(sourceId!, targetId);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const visible = target.scrollTop > 480;
    if (visible !== showScrollTopRef.current) {
      showScrollTopRef.current = visible;
      setShowScrollTop(visible);
    }
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 600) {
      setVisibleSeriesCount((current) => Math.min(filteredSeries.length, current + 8));
    }
  };

  return (
    <div className="glass-surface relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-10 flex min-h-14 min-w-0 items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-white/5 dark:bg-[#121212]/80 sm:px-8">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">系列</h1>
          <p className="hidden text-xs text-black/55 dark:text-white/55 sm:block">整理多卷作品，保持连续阅读顺序</p>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {autoCreateMessage && (
            <span className="hidden max-w-xs truncate text-xs text-black/60 dark:text-white/60 sm:block" role="status">
              {autoCreateMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditorSeriesId(null)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[#1C1C1E] transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            title="创建系列"
            aria-label="创建系列"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="group relative">
            <button
              type="button"
              onClick={handleAutoCreateSeries}
              disabled={isAutoCreating}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#087DF1] text-white transition-colors hover:bg-[#006ED6] disabled:cursor-wait disabled:opacity-60"
              aria-label="自动创建系列"
            >
              <Sparkles className={`h-4 w-4 ${isAutoCreating ? 'animate-pulse' : ''}`} />
            </button>
            <div className="pointer-events-none absolute right-0 top-12 z-20 w-72 rounded-xl bg-[#1C1C1E] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-[#1C1C1E]">
              仅识别同一文件夹中的「&lt;系列名&gt; &lt;系列序号&gt; [可选标题或其他文本].txt/.epub」；标题内容格式不限，按系列名分组、序号排序，其他文件不处理。
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8"
        onScroll={handleScroll}
      >
        <div className="min-w-0 space-y-5">
          <div className="app-card flex min-w-0 flex-col gap-2 p-2.5 sm:p-3 min-[1280px]:flex-row min-[1280px]:items-center min-[1280px]:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索系列或系列内书籍"
                className="h-10 w-full rounded-xl bg-black/[0.035] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35 dark:bg-white/10"
              />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="mr-auto px-1 text-xs tabular-nums text-black/55 dark:text-white/55">{filteredSeries.length} 个系列 · {filteredSeries.reduce((count, item) => count + item.bookIds.length, 0)} 本书</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as 'name' | 'bookCount' | 'addedAt')} aria-label="系列排序方式" className="h-9 min-w-0 rounded-xl bg-black/5 px-2 text-xs outline-none dark:bg-white/10">
                <option value="name">系列名</option>
                <option value="bookCount">书籍数量</option>
                <option value="addedAt">最近加入</option>
              </select>
              <button type="button" onClick={() => setSortOrder((value) => value === 'asc' ? 'desc' : 'asc')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10" aria-label="切换排序方向">
                {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
              </button>
              <div className="flex h-9 shrink-0 rounded-xl bg-black/5 p-0.5 dark:bg-white/10">
                <button type="button" onClick={() => onLayoutModeChange('grid')} aria-label="卡片网格" aria-pressed={layoutMode === 'grid'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'grid' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><Grid2X2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => onLayoutModeChange('list')} aria-label="紧凑列表" aria-pressed={layoutMode === 'list'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${layoutMode === 'list' ? 'bg-white text-[#087DF1] shadow-sm dark:bg-[#2C2C2E]' : 'text-black/45 dark:text-white/45'}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          {series.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#087DF1]/10 text-[#087DF1]"><Layers className="h-10 w-10" /></div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">创建第一个系列</h2>
              <p className="max-w-sm text-sm leading-6">把多卷作品整理在一起，Zenith 会按卷序衔接阅读。</p>
              <button onClick={() => setEditorSeriesId(null)} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#087DF1] px-5 text-sm font-semibold text-white hover:bg-[#006ED6]"><Plus className="h-4 w-4" />创建系列</button>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Search className="mb-4 h-12 w-12 opacity-20" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">没有匹配的系列</h2>
              <p className="mt-2 text-sm">请尝试其他系列名或书籍关键词。</p>
              <button onClick={() => setQuery('')} className="mt-5 rounded-xl bg-black/5 px-4 py-2 text-sm font-medium hover:bg-black/10 dark:bg-white/10">清除搜索</button>
            </div>
          ) : (
            visibleSeries.map((item) => {
              const seriesBooks = booksBySeriesId.get(item.id) || [];
              const matchingBooks = normalizedQuery && !item.name.toLocaleLowerCase().includes(normalizedQuery)
                ? seriesBooks.filter((book) => bookMatchesQuery(book, normalizedQuery))
                : seriesBooks;
              const visibleCount = visibleBySeriesId[item.id] || (normalizedQuery ? 36 : 12);
              const visibleBooks = matchingBooks.slice(0, visibleCount);
              const isDropTarget = draggingSeriesId && draggingSeriesId !== item.id;

              return (
                <section
                  key={item.id}
                  draggable
                  className={`series-section app-card relative min-w-0 overflow-hidden p-4 transition-colors sm:p-5 ${
                    isDropTarget
                      ? 'border-[#007AFF]/60 bg-[#007AFF]/8'
                      : 'border-black/5 dark:border-white/5'
                  }`}
                  onDragStart={(event) => {
                    setDraggingSeriesId(item.id);
                    event.dataTransfer.setData('text/plain', item.id);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => setDraggingSeriesId(undefined)}
                >
                  {isDropTarget && (
                    <div
                      className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-[#007AFF]/70 bg-[#007AFF]/8"
                      onDragEnter={(event) => {
                        if (!canAcceptMerge(mergeSourceIdFor(event), item.id)) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                      onDragOver={(event) => {
                        if (!canAcceptMerge(mergeSourceIdFor(event), item.id)) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={async (event) => {
                        event.preventDefault();
                        await handleMergeDrop(mergeSourceIdFor(event), item.id);
                      }}
                    />
                  )}
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="relative z-20 min-w-0 flex-1">
                      <h3 className="break-words text-lg font-semibold text-[#1C1C1E] [overflow-wrap:anywhere] dark:text-white">{item.name}</h3>
                      <p className="text-sm text-black/50 dark:text-white/50">{matchingBooks.length} 本书籍</p>
                    </div>
                    <div className="relative z-20 flex shrink-0 gap-2">
                      {isDropTarget && (
                        <div className="flex h-8 items-center gap-1 rounded-lg bg-[#007AFF]/10 px-2 text-xs text-[#007AFF]">
                          <GitMerge className="h-3.5 w-3.5" />
                          合并到此
                        </div>
                      )}
                      {series.length > 1 && (
                        <button
                          onClick={() => setMergeSourceId(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-black/55 transition-colors hover:bg-white hover:text-[#087DF1] dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
                          title="合并系列"
                          aria-label={`合并系列 ${item.name}`}
                        >
                          <GitMerge className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditorSeriesId(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
                        title="编辑系列"
                        aria-label="编辑系列"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidateId(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:bg-white/10"
                        title="删除系列"
                        aria-label={`删除系列 ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`relative z-20 mt-4 grid min-w-0 gap-3 ${layoutMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {visibleBooks.map((book, index) => (
                      <button
                        key={book.id}
                        onPointerDown={() => prewarmWebReaderOnIntent(book)}
                        onFocus={() => prewarmWebReaderOnIntent(book)}
                        onClick={() => onReadBook(book)}
                        className={`flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-xl bg-white/75 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:bg-white/10 dark:hover:bg-white/15 ${layoutMode === 'grid' ? 'gap-3 p-3' : 'gap-2 px-2 py-1.5'}`}
                      >
                        <div className={`${layoutMode === 'grid' ? 'h-10 w-8' : 'h-9 w-7'} shrink-0 overflow-hidden rounded-[5px] bg-[#e4e5df] dark:bg-[#30332f]`}>
                          <BookCover book={book} className="w-full h-full object-cover" compact />
                        </div>
                        <div className={`min-w-0 flex-1 overflow-hidden ${layoutMode === 'list' ? 'flex items-center gap-2' : ''}`}>
                          <div className="shrink-0 text-[10px] text-black/40 dark:text-white/40">第 {book.seriesIndex ?? index + 1} 卷</div>
                          <div className="block min-w-0 flex-1 truncate text-sm font-medium text-[#1C1C1E] dark:text-white">{book.title}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {visibleBooks.length < matchingBooks.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleBySeriesId((current) => ({ ...current, [item.id]: visibleCount + 72 }))}
                      className="relative z-20 mx-auto mt-4 block rounded-xl bg-black/5 px-4 py-2 text-sm font-medium text-black/55 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
                    >
                      加载更多（已显示 {visibleBooks.length} / {matchingBooks.length}）
                    </button>
                  )}
                </section>
              );
            })
          )}
          {visibleSeriesCount < filteredSeries.length && (
            <button
              type="button"
              onClick={() => setVisibleSeriesCount((current) => Math.min(filteredSeries.length, current + 8))}
              className="mx-auto block rounded-xl bg-black/5 px-4 py-2 text-sm font-medium text-black/55 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15"
            >
              加载更多系列
            </button>
          )}
        </div>
      </div>
      <ScrollToTopButton
        visible={showScrollTop}
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      {editorSeriesId !== undefined && (
        <SeriesEditorDialog
          key={editingSeries?.id || 'create'}
          books={books}
          initialName={editingSeries?.name}
          initialBookIds={editingSeries?.bookIds}
          mode={editingSeries ? 'edit' : 'create'}
          onCancel={() => setEditorSeriesId(undefined)}
          onSubmit={submitEditor}
        />
      )}
      {deleteCandidateId && (
        <ConfirmDialog
          title="删除系列关系？"
          description={`“${series.find((item) => item.id === deleteCandidateId)?.name || '该系列'}”将从系列列表中移除，书籍原文件和阅读进度不会被删除。`}
          confirmLabel="删除系列"
          onCancel={() => setDeleteCandidateId(undefined)}
          onConfirm={async () => {
            await deleteSeries(deleteCandidateId);
            setDeleteCandidateId(undefined);
          }}
        />
      )}
      {mergeSourceId && series.find((item) => item.id === mergeSourceId) && (
        <SeriesMergeDialog
          source={series.find((item) => item.id === mergeSourceId)!}
          series={series}
          onCancel={() => setMergeSourceId(undefined)}
          onMerge={async (targetId) => {
            await mergeSeries(mergeSourceId, targetId);
            setMergeSourceId(undefined);
            setAutoCreateMessage('系列合并完成。');
          }}
        />
      )}
    </div>
  );
}

function bookMatchesQuery(book: Book, query: string) {
  return [book.title, book.author, book.fileName, book.relativePath]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(query));
}
