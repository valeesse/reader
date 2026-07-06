import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { AppSettings, Book } from '../types';

type NativeBook = Book;

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
  totalChars: number;
  totalBytes: number;
  chapters: NativeTxtChapter[];
}

export interface NativeTxtWindow {
  start: number;
  end: number;
  text: string;
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

export interface NativeEpubResource {
  href: string;
  mediaType: string;
  text?: string;
  base64?: string;
  filePath?: string;
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
  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择本地书库文件夹',
  });

  return typeof selected === 'string' ? selected : undefined;
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

export async function readTxtWindow(path: string, start: number, end: number): Promise<NativeTxtWindow> {
  return invoke<NativeTxtWindow>('read_txt_window', { path, start, end });
}

export async function closeTxtBook(path: string) {
  if (!isTauriApp()) return;
  await invoke('close_txt_book', { path });
}

export async function openEpubBook(path: string, fallbackTitle: string): Promise<NativeEpubBookInfo> {
  return invoke<NativeEpubBookInfo>('open_epub_book', { path, fallbackTitle });
}

export async function readEpubResource(path: string, href: string): Promise<NativeEpubResource> {
  return invoke<NativeEpubResource>('read_epub_resource', { path, href });
}

export async function prefetchEpubResources(path: string, hrefs: string[]) {
  if (!isTauriApp() || hrefs.length === 0) return;
  await invoke('prefetch_epub_resources', { path, hrefs });
}

export async function closeEpubBook(path: string) {
  if (!isTauriApp()) return;
  await invoke('close_epub_book', { path });
}

export function toLocalAssetUrl(path: string) {
  return convertFileSrc(path);
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
