import type { Capabilities, FileAssociationStatus, ReaderCacheStats, ReaderFontPack, ReaderGateway, ScanProgress, WebDavConfig } from '../contracts/readerGateway';
import type { Book, WebDavBook } from '../types';
import { normalizeBook, type BackendBook } from './shared';

export class TauriReaderGateway implements ReaderGateway {
  private libraryDialogDirectoryPromise?: Promise<string>;

  readonly capabilities: Capabilities = {
    desktopShell: true,
    mutableLibraryRoot: true,
    librarySources: ['managed', 'folder', 'webdav'],
    remoteState: true,
    scanProgress: 'event',
    secretStore: false,
    nativeExport: true,
    shareSheet: false,
    windowManagement: true,
    resourceTransport: 'asset-url',
  };

  async getCapabilities() { return this.capabilities; }
  async getLibraryRoot() { return (await this.invokeHost<string | null>('get_library_root')) || undefined; }
  async setLibraryRoot(root: string) { await this.invokeHost('set_library_root', { root }); }
  async pickLibraryRoot() {
    try {
      return (await this.invokeHost<string | null>('pick_library_directory_fast')) || undefined;
    } catch {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择本地书库文件夹',
        defaultPath: await this.libraryDialogDirectory(),
      });
      return typeof selected === 'string' ? selected : undefined;
    }
  }
  prewarmLibraryPicker() { void this.libraryDialogDirectory(); }
  async importBooks(): Promise<Book[]> {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      multiple: true,
      directory: false,
      title: '导入 EPUB / TXT 到当前书库',
      filters: [{ name: 'Books', extensions: ['epub', 'txt'] }],
    });
    const paths = Array.isArray(selected) ? selected : selected ? [selected] : [];
    if (paths.length === 0) return [];
    return (await this.invokeHost<BackendBook[]>('import_managed_books', { paths }))
      .map((book) => normalizeBook(book, (cover) => this.fileUrl(cover)));
  }
  drainPendingOpenFiles() {
    return this.invokeHost<string[]>('drain_pending_open_files');
  }
  async openExternalBooks(paths: string[]): Promise<Book[]> {
    return (await this.invokeHost<BackendBook[]>('open_external_books', { paths }))
      .map((book) => normalizeBook(book, (cover) => this.fileUrl(cover)));
  }
  async listBooks(): Promise<Book[]> {
    return (await this.invokeHost<BackendBook[]>('reader_books')).map((book) => normalizeBook(book, (cover) => this.fileUrl(cover)));
  }
  async resolveBookCover(resourceId: string) {
    return this.fileUrl(await this.invokeHost<string>('reader_cover', { resourceId }));
  }
  async scanBooks(onProgress?: (progress: ScanProgress) => void): Promise<Book[]> {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = onProgress
      ? await listen<ScanProgress>('library-scan://progress', (event) => onProgress(event.payload))
      : undefined;
    try {
      return (await this.invokeHost<BackendBook[]>('scan_library')).map((book) => normalizeBook(book, (cover) => this.fileUrl(cover)));
    } finally {
      unlisten?.();
    }
  }
  readerCommand<T>(_kind: 'txt' | 'epub', _route: string, command: string, body: Record<string, unknown>) {
    return this.invokeHost<T>(command, body);
  }
  getCacheStats() { return this.invokeHost<ReaderCacheStats>('reader_cache_stats'); }
  async clearCache() { await this.invokeHost('clear_reader_cache'); }
  readerFontPacks() { return this.invokeHost<ReaderFontPack[]>('reader_font_packs'); }
  downloadReaderFontPack(id: string) { return this.invokeHost<ReaderFontPack>('download_reader_font_pack', { id }); }
  removeReaderFontPack(id: string) { return this.invokeHost<ReaderFontPack[]>('remove_reader_font_pack', { id }); }
  fileAssociationStatus() { return this.invokeHost<FileAssociationStatus>('file_association_status'); }
  async openFileAssociationSettings() { await this.invokeHost('open_file_association_settings'); }
  getState<T>(): Promise<T> { return this.invokeHost<T>('state_get'); }
  getProgress<T>(bookId: string): Promise<T> { return this.invokeHost<T>('state_get_progress', { bookId }); }
  putStateSection<T>(section: 'progress' | 'settings' | 'series' | 'lastRead', value: unknown): Promise<T> {
    return this.invokeHost<T>('state_put_section', { section, value });
  }
  putReadingState<T>(value: unknown, _keepalive = false): Promise<T> {
    return this.invokeHost<T>('state_put_reading', { value });
  }
  async uploadWebDavSnapshot(config: WebDavConfig, snapshot: string) {
    await this.invokeHost('webdav_upload_snapshot', { config, snapshot });
  }
  downloadWebDavSnapshot(config: WebDavConfig) {
    return this.invokeHost<string | null>('webdav_download_snapshot', { config });
  }
  listWebDavBooks(config: WebDavConfig) {
    return this.invokeHost<WebDavBook[]>('webdav_list_books', { config });
  }
  async downloadWebDavBook(config: WebDavConfig, remotePath: string, suggestedName: string) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const targetPath = await save({ title: '下载 WebDAV 图书', defaultPath: suggestedName });
    if (!targetPath) return;
    await this.invokeHost('authorize_export_path', { path: targetPath, kind: 'book' });
    await this.invokeHost('webdav_download_book_to_path', { config, remotePath, targetPath });
  }
  fileUrl(path: string) {
    const internals = (window as Window & { __TAURI_INTERNALS__?: { convertFileSrc(filePath: string, protocol: string): string } }).__TAURI_INTERNALS__;
    return internals ? internals.convertFileSrc(normalizeDesktopFilePath(path), 'asset') : path;
  }
  async invokeHost<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
  }

  private libraryDialogDirectory() {
    this.libraryDialogDirectoryPromise ||= import('@tauri-apps/api/path')
      .then(({ homeDir }) => homeDir())
      .catch(() => '');
    return this.libraryDialogDirectoryPromise;
  }
}

function normalizeDesktopFilePath(path: string) {
  if (path.startsWith('\\\\?\\UNC\\')) return `\\\\${path.slice(8)}`;
  if (path.startsWith('\\\\?\\')) return path.slice(4);
  return path;
}
