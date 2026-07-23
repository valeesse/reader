import type { Capabilities, ReaderCacheStats, ReaderGateway, ScanProgress, WebDavConfig } from '../contracts/readerGateway';
import type { Book, WebDavBook } from '../types';
import { normalizeBook, readJson, type BackendBook } from './shared';

type ServerCapabilities = Partial<{
  authentication: boolean;
  managedLibrary: boolean;
  folderLibrary: boolean;
  webDav: boolean;
}>;

type WebScanStatus = {
  running: boolean;
  visited: number;
  matched: number;
  currentRelativePath: string;
  error?: string;
};

export class HttpReaderGateway implements ReaderGateway {
  private apiToken = initialApiToken();
  readonly capabilities: Capabilities = {
    desktopShell: false,
    mutableLibraryRoot: false,
    librarySources: ['folder'],
    remoteState: true,
    scanProgress: 'poll',
    secretStore: false,
    nativeExport: false,
    shareSheet: false,
    windowManagement: false,
    resourceTransport: 'http-url',
  };

  async getCapabilities() {
    const remote = await this.http<ServerCapabilities>('/api/capabilities');
    this.capabilities.librarySources = [
      ...(remote.managedLibrary ? ['managed' as const] : []),
      ...(remote.folderLibrary === false ? [] : ['folder' as const]),
      ...(remote.webDav ? ['webdav' as const] : []),
    ];
    return this.capabilities;
  }
  async getLibraryRoot() {
    const config = await this.http<{ root: string | null }>('/api/library/config');
    return config.root || undefined;
  }
  async setLibraryRoot(_root: string) { throw new Error('Web 书库目录由服务器固定配置'); }
  async pickLibraryRoot() { return undefined; }
  prewarmLibraryPicker() {}
  async importBooks(): Promise<Book[]> { throw new Error('当前服务器未启用受管书库导入'); }
  async listBooks(): Promise<Book[]> {
    return (await this.http<BackendBook[]>('/api/books')).map((book) => normalizeBook(book, (cover) => cover));
  }
  async resolveBookCover(resourceId: string) { return `/api/covers?resourceId=${encodeURIComponent(resourceId)}`; }
  async scanBooks(onProgress?: (progress: ScanProgress) => void): Promise<Book[]> {
    await this.http('/api/rescan', { method: 'POST' });
    while (true) {
      const status = await this.http<WebScanStatus>('/api/scan/status');
      onProgress?.({ ...status, currentPath: status.currentRelativePath });
      if (!status.running) {
        if (status.error) throw new Error(status.error);
        return this.listBooks();
      }
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
  }
  readerCommand<T>(kind: 'txt' | 'epub', route: string, _command: string, body: Record<string, unknown>, signal?: AbortSignal) {
    return this.http<T>(`/api/${kind}/${route}`, { method: 'POST', body: JSON.stringify(body), signal });
  }
  getCacheStats() { return this.http<ReaderCacheStats>('/api/cache/stats'); }
  async clearCache() { await this.http('/api/cache', { method: 'DELETE' }); }
  getState<T>() { return this.http<T>('/api/state'); }
  getProgress<T>(bookId: string) { return this.http<T>(`/api/state/progress/${encodeURIComponent(bookId)}`); }
  putStateSection<T>(section: 'progress' | 'settings' | 'series' | 'lastRead', value: unknown) {
    return this.http<T>(`/api/state/${section}`, { method: 'PUT', body: JSON.stringify(value) });
  }
  putReadingState<T>(value: unknown, keepalive = false) {
    return this.http<T>('/api/state/reading', { method: 'PUT', body: JSON.stringify(value), keepalive });
  }
  uploadWebDavSnapshot(_config: WebDavConfig, _snapshot: string): Promise<void> { return this.unsupportedWebDav(); }
  downloadWebDavSnapshot(_config: WebDavConfig): Promise<string | null> { return this.unsupportedWebDav(); }
  listWebDavBooks(_config: WebDavConfig): Promise<WebDavBook[]> { return this.unsupportedWebDav(); }
  downloadWebDavBook(_config: WebDavConfig, _remotePath: string, _suggestedName: string): Promise<void> { return this.unsupportedWebDav(); }
  fileUrl(path: string) { return path; }
  invokeHost<T>(_command: string, _args?: Record<string, unknown>): Promise<T> { return Promise.reject(new Error('当前环境不支持原生主机命令')); }

  private unsupportedWebDav<T>(): Promise<T> {
    return Promise.reject(new Error('当前服务器未提供 WebDAV 代理能力'));
  }

  private async http<T>(url: string, init?: RequestInit): Promise<T> {
    const request = (token: string) => fetch(url, {
      ...init,
      headers: {
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    const requestedToken = this.apiToken;
    let response = await request(requestedToken);
    if (response.status === 401 && typeof window !== 'undefined') {
      if (this.apiToken !== requestedToken) {
        response = await request(this.apiToken);
      } else {
        const supplied = window.prompt('请输入 Zenith Reader 服务访问令牌')?.trim();
        if (supplied) {
          this.apiToken = supplied;
          persistApiToken(supplied);
          response = await request(supplied);
        }
      }
    }
    return readJson<T>(response);
  }
}

function initialApiToken() {
  if (typeof window === 'undefined') return '';
  const query = new URLSearchParams(window.location.search).get('token')?.trim();
  if (query) {
    persistApiToken(query);
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState(null, '', url);
    return query;
  }
  const stored = window.sessionStorage.getItem('zenith_api_token') || '';
  if (stored) persistApiToken(stored);
  return stored;
}

function persistApiToken(token: string) {
  window.sessionStorage.setItem('zenith_api_token', token);
  document.cookie = `zenith_token=${encodeURIComponent(token)}; Path=/; SameSite=Strict`;
}
