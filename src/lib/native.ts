import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { homeDir } from '@tauri-apps/api/path';
import { AppSettings, WebDavBook } from '../types';
import { clearCache, epubCommand, getCacheStats, isDesktopRuntime, ReaderCacheStats, txtCommand } from './backend';

let fallbackDialogDirectoryPromise: Promise<string> | undefined;

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
  filePath?: string | null;
  binaryUrl?: string | null;
}

export type { ReaderCacheStats } from './backend';

export function isTauriApp() {
  return isDesktopRuntime;
}

export async function showMainWindow() {
  if (!isTauriApp()) return;
  try {
    await invoke('startup_shell_ready');
  } catch (error) {
    try {
      await getCurrentWindow().show();
    } catch (fallbackError) {
      console.warn('Failed to show main window', error, fallbackError);
    }
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

export function prewarmLibraryDialogDirectory() {
  void libraryDialogDirectory();
}

async function libraryDialogDirectory() {
  fallbackDialogDirectoryPromise ||= homeDir().catch(() => '');
  return fallbackDialogDirectoryPromise;
}

export async function openTxtBook(resourceId: string): Promise<NativeTxtBookInfo> {
  return txtCommand('open', 'open_txt_book', { resourceId });
}

export async function readTxtPreview(resourceId: string, maxChars = 12000): Promise<NativeTxtPreview> {
  return txtCommand('preview', 'read_txt_preview', { resourceId, maxChars });
}

export async function readTxtWindow(resourceId: string, sessionId: string, start: number, end: number): Promise<NativeTxtWindow> {
  return txtCommand('read', 'read_txt_window', { resourceId, sessionId, start, end });
}

export async function closeTxtBook(resourceId: string, sessionId: string) {
  await txtCommand('close', 'close_txt_book', { resourceId, sessionId });
}

export async function openEpubBook(resourceId: string, fallbackTitle: string): Promise<NativeEpubOpenResult> {
  return epubCommand('open', 'open_epub_book', { resourceId, fallbackTitle });
}

export async function readEpubResource(resourceId: string, sessionId: string, href: string): Promise<NativeEpubResource> {
  return epubCommand('read', 'read_epub_resource', { resourceId, sessionId, href });
}

export async function prefetchEpubResources(resourceId: string, sessionId: string, hrefs: string[]) {
  if (hrefs.length === 0) return;
  await epubCommand('prefetch', 'prefetch_epub_resources', { resourceId, sessionId, hrefs });
}

export async function closeEpubBook(resourceId: string, sessionId: string) {
  await epubCommand('close', 'close_epub_book', { resourceId, sessionId });
}

export function toLocalAssetUrl(path: string) {
  return convertFileSrc(path);
}

export async function getReaderCacheStats() {
  return getCacheStats();
}

export async function clearReaderCache() {
  await clearCache();
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
  return invoke<{ resourceId: string }>('webdav_cache_book', { config, remotePath });
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
