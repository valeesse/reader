import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { homeDir } from '@tauri-apps/api/path';
import { AppSettings, Book, WebDavBook } from '../types';

type NativeBook = Book;
let fallbackDialogDirectoryPromise: Promise<string> | undefined;

export interface ScanProgress {
  visited: number;
  matched: number;
  currentPath: string;
}

export interface NativeTxtChapter {
  id: string;
  title: string;
  startIndex: number;
}

export interface NativeTxtBookInfo {
  sessionId: string;
  totalChars: number;
  totalBytes: number;
  chapters: NativeTxtChapter[];
}

export interface NativeTxtWindow {
  start: number;
  end: number;
  text: string;
}

export interface NativeTxtPreview {
  text: string;
  encoding: string;
}

export interface NativeEpubLink {
  href: string;
  mediaType: string;
  title?: string;
  rels: string[];
  properties: string[];
}

export interface NativeEpubBookInfo {
  metadata: {
    title: string;
    author?: string;
    language: string;
    layout: string;
    readingProgression: string;
  };
  readingOrder: NativeEpubLink[];
  resources: NativeEpubLink[];
  toc: NativeEpubLink[];
}

export interface NativeEpubOpenResult {
  sessionId: string;
  cacheKey: string;
  book: NativeEpubBookInfo;
}

export interface NativeEpubResource {
  href: string;
  mediaType: string;
  text?: string | null;
  base64?: string | null;
  filePath?: string | null;
}

export interface ReaderCacheStats {
  bytes: number;
  files: number;
  maxBytes: number;
}

export function isTauriApp() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function showMainWindow() {
  if (!isTauriApp()) return;
  try {
    await getCurrentWindow().show();
  } catch (error) {
    console.warn('Failed to show main window', error);
  }
}

export async function selectLibraryDirectory(): Promise<string | undefined> {
  const defaultPath = await libraryDialogDirectory();
  try {
    const selected = await invoke<string | null>('pick_library_directory_fast');
    return selected || undefined;
  } catch (error) {
    console.info('Fast directory picker unavailable; using Tauri dialog', error);
  }
  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择本地书库文件夹',
    defaultPath,
  });

  if (typeof selected !== 'string') return undefined;
  return selected;
}

export async function selectBookFiles(): Promise<string[]> {
  const defaultPath = await libraryDialogDirectory();
  try {
    return await invoke<string[]>('pick_book_files_fast', { initialDirectory: defaultPath });
  } catch (error) {
    console.info('Fast file picker unavailable; using Tauri dialog', error);
  }
  const selected = await open({
    directory: false,
    multiple: true,
    title: '导入 EPUB / TXT',
    filters: [{ name: 'Books', extensions: ['epub', 'txt'] }],
    defaultPath,
  });
  const paths = Array.isArray(selected) ? selected : typeof selected === 'string' ? [selected] : [];
  return paths;
}

export function prewarmLibraryDialogDirectory() {
  void libraryDialogDirectory();
}

async function libraryDialogDirectory() {
  fallbackDialogDirectoryPromise ||= homeDir().catch(() => '');
  return fallbackDialogDirectoryPromise;
}

export async function importManagedBooks(paths: string[]): Promise<Book[]> {
  if (paths.length === 0) return [];
  return invoke<NativeBook[]>('import_managed_books', { paths });
}

export async function identifyLocalBooks(paths: string[]) {
  if (paths.length === 0) return [];
  return invoke<Array<{ path: string; fingerprint: string; localResourceId: string }>>('identify_local_books', { paths });
}

export async function scanLibraryPath(path: string): Promise<Book[]> {
  return invoke<NativeBook[]>('scan_library', { path });
}

export async function onLibraryScanProgress(callback: (progress: ScanProgress) => void) {
  return listen<ScanProgress>('library-scan://progress', (event) => callback(event.payload));
}

export async function openTxtBook(path: string): Promise<NativeTxtBookInfo> {
  return invoke<NativeTxtBookInfo>('open_txt_book', { path });
}

export async function readTxtPreview(path: string, maxChars = 12000): Promise<NativeTxtPreview> {
  return invoke<NativeTxtPreview>('read_txt_preview', { path, maxChars });
}

export async function readTxtWindow(path: string, sessionId: string, start: number, end: number): Promise<NativeTxtWindow> {
  return invoke<NativeTxtWindow>('read_txt_window', { path, sessionId, start, end });
}

export async function closeTxtBook(path: string, sessionId: string) {
  if (!isTauriApp()) return;
  await invoke('close_txt_book', { path, sessionId });
}

export async function openEpubBook(path: string, fallbackTitle: string): Promise<NativeEpubOpenResult> {
  return invoke<NativeEpubOpenResult>('open_epub_book', { path, fallbackTitle });
}

export async function readEpubResource(path: string, sessionId: string, href: string): Promise<NativeEpubResource> {
  return invoke<NativeEpubResource>('read_epub_resource', { path, sessionId, href });
}

export async function prefetchEpubResources(path: string, sessionId: string, hrefs: string[]) {
  if (!isTauriApp() || hrefs.length === 0) return;
  await invoke('prefetch_epub_resources', { path, sessionId, hrefs });
}

export async function closeEpubBook(path: string, sessionId: string) {
  if (!isTauriApp()) return;
  await invoke('close_epub_book', { path, sessionId });
}

export function toLocalAssetUrl(path: string) {
  return convertFileSrc(path);
}

export async function getReaderCacheStats() {
  if (!isTauriApp()) return { bytes: 0, files: 0, maxBytes: 0 } satisfies ReaderCacheStats;
  return invoke<ReaderCacheStats>('reader_cache_stats');
}

export async function clearReaderCache() {
  if (!isTauriApp()) return;
  await invoke('clear_reader_cache');
}

export async function saveImageFromSource(src: string, suggestedName = 'image') {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error('图片读取失败');
  }

  const blob = await response.blob();
  const extension = extensionFromMime(blob.type) || extensionFromUrl(src) || 'png';
  const fileName = `${sanitizeFileName(suggestedName)}.${extension}`;

  if (!isTauriApp()) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const targetPath = await save({
    title: '保存图片',
    defaultPath: fileName,
    filters: [{ name: 'Image', extensions: [extension] }],
  });
  if (!targetPath) return;

  const base64 = await blobToBase64(blob);
  await invoke('authorize_export_path', { path: targetPath, kind: 'image' });
  await invoke('write_binary_file', { path: targetPath, base64Data: base64 });
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'image';
}

function extensionFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/svg+xml') return 'svg';
  return undefined;
}

function extensionFromUrl(url: string) {
  const cleanUrl = url.split(/[?#]/)[0];
  const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function uploadWebDavSnapshot(
  config: AppSettings['webDavConfig'],
  snapshot: string,
) {
  await invoke('webdav_upload_snapshot', { config, snapshot });
}

export async function downloadWebDavSnapshot(config: AppSettings['webDavConfig']) {
  return invoke<string | null>('webdav_download_snapshot', { config });
}

export async function listWebDavBooks(config: AppSettings['webDavConfig']) {
  return invoke<WebDavBook[]>('webdav_list_books', { config });
}

export async function cacheWebDavBook(
  config: AppSettings['webDavConfig'],
  remotePath: string,
) {
  return invoke<{ path: string; fingerprint: string; localResourceId: string }>('webdav_cache_book', { config, remotePath });
}

export async function downloadWebDavBook(
  config: AppSettings['webDavConfig'],
  remotePath: string,
  suggestedName: string,
) {
  const targetPath = await save({
    title: '下载 WebDAV 图书',
    defaultPath: suggestedName,
  });
  if (!targetPath) return;
  await invoke('authorize_export_path', { path: targetPath, kind: 'book' });
  await invoke('webdav_download_book_to_path', { config, remotePath, targetPath });
}
