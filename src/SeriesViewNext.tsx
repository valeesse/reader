import React, { useMemo, useState } from 'react';
import { useAppContext } from './store/AppStore';
import { Book } from './types';
import { BookOpen, GitMerge, Layers, Plus, Sparkles, Trash2 } from 'lucide-react';
import { BookCover } from './components/BookCover';
import { sortBooksInSeries } from './lib/series';
import { prewarmWebReaderOnIntent } from './lib/readerWarmup';

export function SeriesView({ onReadBook }: { onReadBook: (book: Book) => void }) {
  const { series, books, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries } = useAppContext();
  const [name, setName] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [editingSeriesId, setEditingSeriesId] = useState<string | undefined>();
  const [draggingSeriesId, setDraggingSeriesId] = useState<string | undefined>();
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [autoCreateMessage, setAutoCreateMessage] = useState('');
  const editingSeries = series.find((item) => item.id === editingSeriesId);
  const orderedBooks = useMemo(
    () => [...books].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN')),
    [books],
  );

  const toggleBook = (bookId: string) => {
    setSelectedBookIds((current) => (
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId]
    ));
  };

  const startEdit = (seriesId: string) => {
    const target = series.find((item) => item.id === seriesId);
    if (!target) return;
    setEditingSeriesId(target.id);
    setName(target.name);
    setSelectedBookIds(target.bookIds);
  };

  const resetForm = () => {
    setEditingSeriesId(undefined);
    setName('');
    setSelectedBookIds([]);
  };

  const submit = async () => {
    if (editingSeries) {
      await updateSeries({ ...editingSeries, name: name.trim(), bookIds: selectedBookIds });
    } else {
      await createSeries(name, selectedBookIds);
    }
    resetForm();
  };

  const handleAutoCreateSeries = async () => {
    if (isAutoCreating) return;
    setIsAutoCreating(true);
    setAutoCreateMessage('正在分析书籍元数据和文件名...');
    try {
      const result = await autoCreateMetadataSeries();
      if (result.createdCount > 0 || result.updatedCount > 0) {
        setAutoCreateMessage(`已创建 ${result.createdCount} 个系列，更新 ${result.updatedCount} 个系列。`);
      } else if (result.eligibleGroups === 0) {
        setAutoCreateMessage('没有找到可自动归类的系列信息。');
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
            <div className="pointer-events-none absolute right-0 top-11 z-20 w-max max-w-[220px] rounded-[5px] bg-[#1C1C1E] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-[#1C1C1E]">
              通过 EPUB 元数据或书名卷号自动创建系列
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 content-start">
        <div className="space-y-5">
          {series.length === 0 ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Layers className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">暂无系列</h2>
              <p className="text-sm">选择多本书，创建连续阅读的多卷小说系列。</p>
            </div>
          ) : (
            series.map((item) => {
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
                        onClick={() => startEdit(item.id)}
                        className="px-3 py-1.5 rounded-[5px] text-sm bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 transition-colors"
                      >
                        编辑
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
                          <div className="text-[11px] text-black/40 dark:text-white/40">第 {index + 1} 卷</div>
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

        <aside className="rounded-[5px] bg-[#F2F2F7]/90 dark:bg-[#1C1C1E]/90 border border-black/5 dark:border-white/5 p-5 shadow-sm h-fit sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-[5px] bg-[#007AFF]/10 text-[#007AFF]">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-[#1C1C1E] dark:text-white">{editingSeries ? '编辑系列' : '创建系列'}</h2>
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="系列名称"
            className="w-full bg-white/80 dark:bg-white/10 border border-transparent rounded-[5px] px-3 py-2 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
          />

          <div className="mt-4 max-h-[420px] overflow-y-auto space-y-1 pr-1">
            {orderedBooks.map((book) => (
              <label
                key={book.id}
                className="flex items-center gap-3 p-2 rounded-[5px] hover:bg-white/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedBookIds.includes(book.id)}
                  onChange={() => toggleBook(book.id)}
                  className="accent-[#007AFF]"
                />
                <BookOpen className="w-4 h-4 text-black/35 dark:text-white/35 shrink-0" />
                <span className="text-sm truncate text-[#1C1C1E] dark:text-white">{book.title}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={submit}
              disabled={!name.trim() || selectedBookIds.length === 0}
              className="flex-1 py-2 rounded-[5px] bg-[#007AFF] text-white text-sm font-medium disabled:opacity-40 hover:bg-blue-600 disabled:hover:bg-[#007AFF] transition-colors"
            >
              {editingSeries ? '保存' : '创建'}
            </button>
            {editingSeries && (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-[5px] bg-black/5 dark:bg-white/10 text-sm hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
