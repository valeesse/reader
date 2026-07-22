import type { AppSettings, Book, WebDavBook } from '../types';

export type WebDavConfig = AppSettings['webDavConfig'];

export type ResourceTransport = 'asset-url' | 'http-url';
export type LibrarySourceKind = 'managed' | 'folder' | 'webdav';

export interface Capabilities {
  desktopShell: boolean;
  mutableLibraryRoot: boolean;
  librarySources: LibrarySourceKind[];
  remoteState: boolean;
  scanProgress: 'event' | 'poll';
  secretStore: boolean;
  nativeExport: boolean;
  shareSheet: boolean;
  windowManagement: boolean;
  resourceTransport: ResourceTransport;
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

export interface ReaderGateway {
  readonly capabilities: Capabilities;
  getCapabilities(): Promise<Capabilities>;
  getLibraryRoot(): Promise<string | undefined>;
  setLibraryRoot(root: string): Promise<void>;
  pickLibraryRoot(): Promise<string | undefined>;
  prewarmLibraryPicker(): void;
  importBooks(): Promise<Book[]>;
  listBooks(): Promise<Book[]>;
  resolveBookCover(resourceId: string): Promise<string | undefined>;
  scanBooks(onProgress?: (progress: ScanProgress) => void): Promise<Book[]>;
  readerCommand<T>(kind: 'txt' | 'epub', route: string, command: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T>;
  getCacheStats(): Promise<ReaderCacheStats>;
  clearCache(): Promise<void>;
  getState<T>(): Promise<T>;
  getProgress<T>(bookId: string): Promise<T>;
  putStateSection<T>(section: 'progress' | 'settings' | 'series' | 'lastRead', value: unknown): Promise<T>;
  putReadingState<T>(value: unknown, keepalive?: boolean): Promise<T>;
  uploadWebDavSnapshot(config: WebDavConfig, snapshot: string): Promise<void>;
  downloadWebDavSnapshot(config: WebDavConfig): Promise<string | null>;
  listWebDavBooks(config: WebDavConfig): Promise<WebDavBook[]>;
  downloadWebDavBook(config: WebDavConfig, remotePath: string, suggestedName: string): Promise<void>;
  fileUrl(path: string): string;
  invokeHost<T>(command: string, args?: Record<string, unknown>): Promise<T>;
}
