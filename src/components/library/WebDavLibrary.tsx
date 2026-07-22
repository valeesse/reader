import React, { useEffect, useMemo, useState } from 'react';
import { Book, WebDavBook } from '../../types';
import { useAppContext } from '../../store/AppStore';
import { downloadWebDavBook, listWebDavBooks } from '../../lib/backend';
import { Cloud, Download, FolderTree, LoaderCircle, RefreshCw, Search } from 'lucide-react';

export function WebDavLibrary({ onReadBook: _onReadBook }: { onReadBook: (book: Book) => void }) {
  const { settings } = useAppContext();
  const [books, setBooks] = useState<WebDavBook[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);

  const canBrowse =
    settings.webDavConfig.enabled &&
    settings.webDavConfig.url.trim() &&
    settings.webDavConfig.username.trim();

  const loadBooks = async () => {
    if (!canBrowse) {
      setBooks([]);
      setStatus('请先在设置中启用并填写 WebDAV 配置。');
      return;
    }

    try {
      setLoading(true);
      setStatus('正在读取 WebDAV 书库...');
      const remoteBooks = await listWebDavBooks(settings.webDavConfig);
      setBooks(remoteBooks);
      setStatus(remoteBooks.length > 0 ? `已发现 ${remoteBooks.length} 本云端图书。` : '当前 WebDAV 下没有可读取的 EPUB 或 TXT。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '读取 WebDAV 书库失败。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [settings.webDavConfig.enabled, settings.webDavConfig.url, settings.webDavConfig.username, settings.webDavConfig.password]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = normalizedQuery
      ? books.filter((book) =>
          [book.title, book.author, book.fileName, book.remotePath]
            .filter(Boolean)
            .some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
        )
      : books;

    return [...result].sort((a, b) => {
      const modifiedDiff = (b.modifiedAt || 0) - (a.modifiedAt || 0);
      if (modifiedDiff !== 0) return modifiedDiff;
      return a.fileName.localeCompare(b.fileName, 'zh-Hans-CN');
    });
  }, [books, query]);

  const downloadRemoteBook = async (book: WebDavBook) => {
    try {
      setDownloadingBookId(book.id);
      setStatus(`正在下载 ${book.title}...`);
      await downloadWebDavBook(settings.webDavConfig, book.remotePath, book.fileName || `${book.title}.${book.type}`);
      setStatus(`已完成 ${book.title} 的下载。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '下载云端图书失败。');
    } finally {
      setDownloadingBookId(null);
    }
  };

  if (!canBrowse && books.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#121212]/70 px-8 text-center">
        <Cloud className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">WebDAV 尚未配置</h2>
        <p className="text-sm">前往设置页启用 WebDAV，并填写服务器地址、用户名和密码后即可直接浏览云端图书。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-white/70 dark:bg-[#121212]/70">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#1C1C1E] dark:text-white">WebDAV 书库</h1>
        </div>
        <button
          onClick={loadBooks}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-2 text-sm font-medium text-[#1C1C1E] dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          刷新
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-white/65 dark:bg-white/10 p-3">
          <div className="relative min-w-0 xl:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 dark:text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索书名、文件名或远端路径"
              className="w-full h-10 rounded-xl bg-black/5 dark:bg-white/10 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-black/45 dark:text-white/45">
            <FolderTree className="w-4 h-4" />
            仅显示 EPUB / TXT
          </div>
        </div>

        {status && (
          <p className="text-sm text-black/50 dark:text-white/50">{status}</p>
        )}

        {filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-10 text-center text-sm text-black/45 dark:text-white/45">
            {loading ? '正在读取云端书库...' : '没有匹配的图书。'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/10 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#007AFF]">
                      <Cloud className="w-4 h-4" />
                      WebDAV
                      <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 uppercase text-[10px] text-black/50 dark:text-white/50">
                        {book.type}
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-[#1C1C1E] dark:text-white">{book.title}</h2>
                    <p className="mt-1 text-sm text-black/50 dark:text-white/50">{book.author}</p>
                    <p className="mt-2 break-all text-xs text-black/40 dark:text-white/40">{book.remotePath}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-black/40 dark:text-white/40">下载后放入书库目录即可阅读</span>
                    <button
                      onClick={() => downloadRemoteBook(book)}
                      disabled={downloadingBookId === book.id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-4 py-2 text-sm font-medium text-[#1C1C1E] dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-60"
                    >
                      {downloadingBookId === book.id ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      下载
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
