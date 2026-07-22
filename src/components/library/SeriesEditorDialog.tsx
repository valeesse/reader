import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Book } from '../../types';

const PAGE_SIZE = 12;

export function SeriesEditorDialog({
  books,
  initialName = '',
  initialBookIds = [],
  mode,
  onCancel,
  onSubmit,
}: {
  books: Book[];
  initialName?: string;
  initialBookIds?: string[];
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (name: string, bookIds: string[]) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialBookIds));
  const [submitting, setSubmitting] = useState(false);
  const orderedBooks = useMemo(
    () => [...books].sort((a, b) => (
      (a.fileName || a.title).localeCompare(b.fileName || b.title, 'zh-Hans-CN')
    )),
    [books],
  );
  const filteredBooks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return orderedBooks;
    return orderedBooks.filter((book) => (
      [book.title, book.author, book.fileName, book.relativePath]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalized))
    ));
  }, [orderedBooks, query]);
  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageBooks = filteredBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allPageSelected = pageBooks.length > 0 && pageBooks.every((book) => selectedIds.has(book.id));

  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel, submitting]);

  const toggleBook = (bookId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const toggleCurrentPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const book of pageBooks) {
        if (allPageSelected) next.delete(book.id);
        else next.add(book.id);
      }
      return next;
    });
  };

  const submit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || selectedIds.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmedName, orderedBooks.filter((book) => selectedIds.has(book.id)).map((book) => book.id));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-editor-title"
        className="flex max-h-[min(780px,calc(100vh-1.5rem))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#FBFAF7] shadow-2xl dark:border-white/10 dark:bg-[#1C1C1E]"
      >
        <header className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10 sm:px-6">
          <div>
            <h2 id="series-editor-title" className="font-semibold text-[#1C1C1E] dark:text-white">
              {mode === 'edit' ? '编辑系列' : '创建系列'}
            </h2>
            <p className="mt-0.5 text-xs text-black/45 dark:text-white/45">已选择 {selectedIds.size} 本，翻页和搜索不会清除选择</p>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} title="关闭" aria-label="关闭" className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 border-b border-black/5 p-4 dark:border-white/10 sm:px-6">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="系列名称"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/40 dark:border-white/10 dark:bg-white/10"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35 dark:text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索书名、作者、文件名或路径"
                className="h-10 w-full rounded-xl bg-black/[0.04] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]/35 dark:bg-white/10"
              />
            </div>
            <button type="button" onClick={toggleCurrentPage} disabled={pageBooks.length === 0} className="h-10 rounded-xl bg-black/5 px-4 text-sm font-medium hover:bg-black/10 disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/15">
              {allPageSelected ? '取消本页' : '选择本页'}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          {pageBooks.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-black/45 dark:text-white/45">没有匹配的书籍</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {pageBooks.map((book) => (
                <label key={book.id} className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:bg-black/[0.035] has-[:checked]:border-[#007AFF]/25 has-[:checked]:bg-[#007AFF]/8 dark:hover:bg-white/[0.06]">
                  <input type="checkbox" checked={selectedIds.has(book.id)} onChange={() => toggleBook(book.id)} className="h-4 w-4 shrink-0 accent-[#007AFF]" />
                  <BookOpen className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#1C1C1E] dark:text-white">{book.title}</span>
                    <span className="block truncate text-xs text-black/40 dark:text-white/40">{book.relativePath || book.fileName || book.author}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-black/5 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1} title="上一页" aria-label="上一页" className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 disabled:opacity-30 dark:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center tabular-nums text-black/55 dark:text-white/55">{currentPage} / {pageCount}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage >= pageCount} title="下一页" aria-label="下一页" className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 disabled:opacity-30 dark:bg-white/10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 rounded-xl bg-black/5 px-4 py-2 text-sm hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 sm:flex-none">取消</button>
            <button type="button" onClick={submit} disabled={!name.trim() || selectedIds.size === 0 || submitting} className="flex-1 rounded-xl bg-[#007AFF] px-5 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-40 sm:flex-none">
              {submitting ? '保存中…' : mode === 'edit' ? '保存' : '创建'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
