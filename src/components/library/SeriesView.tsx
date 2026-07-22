import React, { useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../store/AppStore';
import { Book } from '../../types';
import { GitMerge, Layers, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { BookCover } from './BookCover';
import { sortBooksInSeries } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../reader/readerWarmup';
import { SeriesEditorDialog } from './SeriesEditorDialog';
import { ScrollToTopButton } from './ScrollToTopButton';

export function SeriesView({ onReadBook }: { onReadBook: (book: Book) => void }) {
  const { series, books, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries } = useAppContext();
  const [editorSeriesId, setEditorSeriesId] = useState<string | null | undefined>();
  const [draggingSeriesId, setDraggingSeriesId] = useState<string | undefined>();
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [autoCreateMessage, setAutoCreateMessage] = useState('');
  const [query, setQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editingSeries = typeof editorSeriesId === 'string'
    ? series.find((item) => item.id === editorSeriesId)
    : undefined;
  const filteredSeries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return series;
    const booksById = new Map(books.map((book) => [book.id, book]));
    return series.filter((item) => (
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
  }, [books, query, series]);

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

  return (
    <div className="glass-surface flex-1 flex flex-col relative">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#1C1C1E] dark:text-white">系列</h1>
        <div className="flex items-center gap-3">
          {autoCreateMessage && (
            <span className="text-xs text-black/45 dark:text-white/45" role="status">
              {autoCreateMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditorSeriesId(null)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] bg-black/5 text-[#1C1C1E] transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] bg-[#007AFF] text-white transition-colors hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
              aria-label="自动创建系列"
            >
              <Sparkles className={`h-4 w-4 ${isAutoCreating ? 'animate-pulse' : ''}`} />
            </button>
            <div className="pointer-events-none absolute right-0 top-11 z-20 w-72 rounded-[5px] bg-[#1C1C1E] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-[#1C1C1E]">
              仅识别同一文件夹中的「&lt;系列名&gt; &lt;系列序号&gt; &lt;标题、其他文本&gt;.txt/.epub」；按系列名分组、序号排序，其他文件不处理。
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8"
        onScroll={(event) => setShowScrollTop(event.currentTarget.scrollTop > 480)}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-2 rounded-2xl border border-black/[0.05] bg-white/45 p-2.5 dark:border-white/10 dark:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:p-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35 dark:text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索系列或系列内书籍"
                className="h-10 w-full rounded-xl bg-black/[0.035] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35 dark:bg-white/10"
              />
            </div>
            <span className="px-1 text-xs tabular-nums text-black/40 dark:text-white/40">{filteredSeries.length} 个系列</span>
          </div>
          {series.length === 0 ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Layers className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">暂无系列</h2>
              <p className="text-sm">选择多本书，创建连续阅读的多卷小说系列。</p>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Search className="mb-4 h-12 w-12 opacity-20" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">没有匹配的系列</h2>
              <p className="mt-2 text-sm">请尝试其他系列名或书籍关键词。</p>
            </div>
          ) : (
            filteredSeries.map((item) => {
              const seriesBooks = sortBooksInSeries(
                item.bookIds
                  .map((bookId) => books.find((book) => book.id === bookId))
                  .filter((book): book is Book => Boolean(book)),
              );
              const isDropTarget = draggingSeriesId && draggingSeriesId !== item.id;

              return (
                <section
                  key={item.id}
                  draggable
                  className={`relative rounded-[5px] bg-[#F2F2F7]/80 dark:bg-[#1C1C1E]/80 border p-5 shadow-sm transition-colors ${
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
                      className="absolute inset-0 z-10 rounded-[5px] border-2 border-dashed border-[#007AFF]/70 bg-[#007AFF]/8"
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative z-20">
                      <h3 className="font-semibold text-lg text-[#1C1C1E] dark:text-white">{item.name}</h3>
                      <p className="text-sm text-black/50 dark:text-white/50">{seriesBooks.length} 本书籍</p>
                    </div>
                    <div className="relative z-20 flex gap-2">
                      {isDropTarget && (
                        <div className="flex h-8 items-center gap-1 rounded-[5px] bg-[#007AFF]/10 px-2 text-xs text-[#007AFF]">
                          <GitMerge className="h-3.5 w-3.5" />
                          合并到此
                        </div>
                      )}
                      <button
                        onClick={() => setEditorSeriesId(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-white/70 transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
                        title="编辑系列"
                        aria-label="编辑系列"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSeries(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-[5px] text-red-500 bg-white/70 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors"
                        title="删除系列"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative z-20 mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {seriesBooks.map((book, index) => (
                      <button
                        key={book.id}
                        onPointerDown={() => prewarmWebReaderOnIntent(book)}
                        onFocus={() => prewarmWebReaderOnIntent(book)}
                        onClick={() => onReadBook(book)}
                        className="text-left flex items-center gap-3 rounded-[5px] bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 p-3 transition-colors"
                      >
                        <div className="w-8 h-10 rounded-[5px] bg-[#e4e5df] dark:bg-[#30332f] shrink-0 overflow-hidden">
                          <BookCover book={book} className="w-full h-full object-cover" compact />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] text-black/40 dark:text-white/40">第 {book.seriesIndex ?? index + 1} 卷</div>
                          <div className="text-sm font-medium truncate text-[#1C1C1E] dark:text-white">{book.title}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
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
    </div>
  );
}
