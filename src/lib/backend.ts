import { Book } from '../types';

export interface BackendCapabilities {
  desktop: boolean;
  libraryRootMutable: boolean;
  webDav: boolean;
  scanProgressEvents: boolean;
}

export interface ScanProgress {
  running?: boolean;
  visited: number;
  matched: number;
  currentPath: string;
  error?: string;
}

export interface ReaderCacheStats {
  bytes: number;
  files: number;
  maxBytes: number;
}

export const isDesktopRuntime = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
export const runtimeCapabilities: BackendCapabilities = {
  desktop: isDesktopRuntime,
  libraryRootMutable: isDesktopRuntime,
  webDav: isDesktopRuntime,
  scanProgressEvents: isDesktopRuntime,
};

export async function getCapabilities() {
  if (isDesktopRuntime) return runtimeCapabilities;
  await http('/api/capabilities');
  return runtimeCapabilities;
}

export async function getLibraryRoot(): Promise<string | undefined> {
  if (isDesktopRuntime) return (await desktopInvoke<string | null>('get_library_root')) || undefined;
  const config = await http<{ root: string | null }>('/api/library/config');
  return config.root || undefined;
}

export async function setLibraryRoot(root: string) {
  if (!isDesktopRuntime) throw new Error('Web 书库目录由服务器固定配置');
  await desktopInvoke('set_library_root', { root });
}

export async function pickLibraryRoot(): Promise<string | undefined> {
  if (!isDesktopRuntime) return undefined;
  try {
    return (await desktopInvoke<string | null>('pick_library_directory_fast')) || undefined;
  } catch {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({ directory: true, multiple: false, title: '选择本地书库文件夹' });
    return typeof selected === 'string' ? selected : undefined;
  }
}

export async function listBooks(): Promise<Book[]> {
  const books = isDesktopRuntime
    ? await desktopInvoke<BackendBook[]>('reader_books')
    : await http<BackendBook[]>('/api/books');
  return books.map(normalizeBook);
}

export async function resolveBookCover(resourceId: string): Promise<string | undefined> {
  if (isDesktopRuntime) {
    const path = await desktopInvoke<string>('reader_cover', { resourceId });
    return desktopFileSrc(path);
  }
  return `/api/covers?resourceId=${encodeURIComponent(resourceId)}`;
}

export async function rescanBooks(): Promise<Book[]> {
  if (isDesktopRuntime) return (await desktopInvoke<BackendBook[]>('scan_library')).map(normalizeBook);
  await http('/api/rescan', { method: 'POST' });
  while (true) {
    const status = await http<WebScanStatus>('/api/scan/status');
    if (!status.running) {
      if (status.error) throw new Error(status.error);
      return listBooks();
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }
}

export async function onScanProgress(callback: (progress: ScanProgress) => void) {
  if (isDesktopRuntime) {
    const { listen } = await import('@tauri-apps/api/event');
    return listen<ScanProgress>('library-scan://progress', (event) => callback(event.payload));
  }
  let stopped = false;
  const poll = async () => {
    while (!stopped) {
      const status = await http<WebScanStatus>('/api/scan/status');
      callback({ ...status, currentPath: status.currentRelativePath });
      if (!status.running) return;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
  };
  void poll().catch(() => {});
  return () => { stopped = true; };
}

export function txtCommand<T>(
  route: string,
  command: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  return call<T>(`/api/txt/${route}`, command, body, signal);
}

export function epubCommand<T>(
  route: string,
  command: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  return call<T>(`/api/epub/${route}`, command, body, signal);
}

export async function getCacheStats() {
  return isDesktopRuntime
    ? desktopInvoke<ReaderCacheStats>('reader_cache_stats')
    : http<ReaderCacheStats>('/api/cache/stats');
}

export async function clearCache() {
  if (isDesktopRuntime) await desktopInvoke('clear_reader_cache');
  else await http('/api/cache', { method: 'DELETE' });
}

export function getWebState<T>() {
  return http<T>('/api/state');
}

export function getWebProgress<T>(bookId: string) {
  return http<T>(`/api/state/progress/${encodeURIComponent(bookId)}`);
}

export function putWebStateSection<T>(section: 'progress' | 'settings' | 'series' | 'lastRead', value: unknown) {
  return http<T>(`/api/state/${section}`, { method: 'PUT', body: JSON.stringify(value) });
}

export function putWebReadingState<T>(value: unknown, keepalive = false) {
  return http<T>('/api/state/reading', {
    method: 'PUT',
    body: JSON.stringify(value),
    keepalive,
  });
}

async function call<T>(
  route: string,
  command: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  return isDesktopRuntime
    ? desktopInvoke<T>(command, body)
    : http<T>(route, { method: 'POST', body: JSON.stringify(body), signal });
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json', ...init.headers } : init?.headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(error.error || `请求失败 (${response.status})`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
  return response.json() as Promise<T>;
}

type BackendBook = Omit<Book, 'addedAt' | 'resourceId'> & {
  resourceId: string;
  addedAt?: number;
  modifiedAt?: number;
};

type WebScanStatus = {
  running: boolean;
  visited: number;
  matched: number;
  currentRelativePath: string;
  error?: string;
};

function normalizeBook(book: BackendBook): Book {
  return {
    id: book.resourceId,
    resourceId: book.resourceId,
    title: book.title,
    author: book.author,
    cover: isDesktopRuntime && book.cover ? desktopFileSrc(book.cover) : book.cover,
    type: book.type,
    fileName: book.fileName,
    seriesName: book.seriesName,
    seriesIndex: book.seriesIndex,
    seriesId: book.seriesId,
    addedAt: book.addedAt ?? book.modifiedAt ?? Date.now(),
  };
}

export async function desktopInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export function desktopFileSrc(path: string, protocol = 'asset') {
  const internals = (window as Window & {
    __TAURI_INTERNALS__?: {
      convertFileSrc(filePath: string, protocol: string): string;
    };
  }).__TAURI_INTERNALS__;
  if (!internals) return path;
  return internals.convertFileSrc(path, protocol);
}
