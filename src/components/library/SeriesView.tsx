import React, { useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../store/AppStore';
import { Book } from '../../types';
import { GitMerge, Layers, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { BookCover } from './BookCover';
import { sortBooksInSeries } from '../../lib/series';
import { prewarmWebReaderOnIntent } from '../../reader/readerWarmup';
import { SeriesEditorDialog } from './SeriesEditorDialog';
import { ScrollToTopButton } from './ScrollToTopButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SeriesMergeDialog } from './SeriesMergeDialog';

export function SeriesView({ onReadBook }: { onReadBook: (book: Book) => void }) {
  const { series, books, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries } = useAppContext();
  const [editorSeriesId, setEditorSeriesId] = useState<string | null | undefined>();
  const [draggingSeriesId, setDraggingSeriesId] = useState<string | undefined>();
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [autoCreateMessage, setAutoCreateMessage] = useState('');
  const [query, setQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string>();
  const [mergeSourceId, setMergeSourceId] = useState<string>();
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
        onScroll={(event) => setShowScrollTop(event.currentTarget.scrollTop > 480)}
      >
        <div className="min-w-0 space-y-5">
          <div className="app-card flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索系列或系列内书籍"
                className="h-10 w-full rounded-xl bg-black/[0.035] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35 dark:bg-white/10"
              />
            </div>
            <span className="px-1 text-xs tabular-nums text-black/55 dark:text-white/55">{filteredSeries.length} 个系列 · {filteredSeries.reduce((count, item) => count + item.bookIds.length, 0)} 本书</span>
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
                  className={`app-card relative min-w-0 overflow-hidden p-4 transition-colors sm:p-5 ${
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
                      <p className="text-sm text-black/50 dark:text-white/50">{seriesBooks.length} 本书籍</p>
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
                  <div className="relative z-20 mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {seriesBooks.map((book, index) => (
                      <button
                        key={book.id}
                        onPointerDown={() => prewarmWebReaderOnIntent(book)}
                        onFocus={() => prewarmWebReaderOnIntent(book)}
                        onClick={() => onReadBook(book)}
                        className="flex w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-xl bg-white/75 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:bg-white/10 dark:hover:bg-white/15"
                      >
                        <div className="w-8 h-10 rounded-[5px] bg-[#e4e5df] dark:bg-[#30332f] shrink-0 overflow-hidden">
                          <BookCover book={book} className="w-full h-full object-cover" compact />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="text-[11px] text-black/40 dark:text-white/40">第 {book.seriesIndex ?? index + 1} 卷</div>
                          <div className="block w-full truncate text-sm font-medium text-[#1C1C1E] dark:text-white">{book.title}</div>
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
