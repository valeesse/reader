import {
  clearCache,
  desktopFileSrc,
  desktopInvoke,
  epubCommand,
  getCacheStats,
  isDesktopRuntime,
  ReaderCacheStats,
  txtCommand,
} from './backend';
export { saveImageFromSource } from './nativeImage';
export {
  cacheWebDavBook,
  downloadWebDavBook,
  downloadWebDavSnapshot,
  listWebDavBooks,
  uploadWebDavSnapshot,
} from './nativeWebDav';

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
  lineBreaks: number[];
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
  positionCounts: NativeEpubPositionCount[];
}

export interface NativeEpubPositionCount {
  href: string;
  count: number;
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
    await desktopInvoke('startup_shell_ready');
  } catch (error) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().show();
    } catch (fallbackError) {
      console.warn('Failed to show main window', error, fallbackError);
    }
  }
}

export async function selectLibraryDirectory(): Promise<string | undefined> {
  const defaultPath = await libraryDialogDirectory();
  try {
    const selected = await desktopInvoke<string | null>('pick_library_directory_fast');
    return selected || undefined;
  } catch (error) {
    console.info('Fast directory picker unavailable; using Tauri dialog', error);
  }
  const { open } = await import('@tauri-apps/plugin-dialog');
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
  fallbackDialogDirectoryPromise ||= import('@tauri-apps/api/path')
    .then(({ homeDir }) => homeDir())
    .catch(() => '');
  return fallbackDialogDirectoryPromise;
}

export async function openTxtBook(resourceId: string): Promise<NativeTxtBookInfo> {
  return txtCommand('open', 'open_txt_book', { resourceId });
}

export async function readTxtPreview(resourceId: string, maxChars = 12000): Promise<NativeTxtPreview> {
  return txtCommand('preview', 'read_txt_preview', { resourceId, maxChars });
}

export async function readTxtWindow(
  resourceId: string,
  sessionId: string,
  start: number,
  end: number,
  signal?: AbortSignal,
): Promise<NativeTxtWindow> {
  return txtCommand('read', 'read_txt_window', { resourceId, sessionId, start, end }, signal);
}

export async function closeTxtBook(resourceId: string, sessionId: string) {
  await txtCommand('close', 'close_txt_book', { resourceId, sessionId });
}

export async function openEpubBook(resourceId: string, fallbackTitle: string): Promise<NativeEpubOpenResult> {
  return epubCommand('open', 'open_epub_book', { resourceId, fallbackTitle });
}

export async function readEpubResource(
  resourceId: string,
  sessionId: string,
  href: string,
  signal?: AbortSignal,
): Promise<NativeEpubResource> {
  return epubCommand('read', 'read_epub_resource', { resourceId, sessionId, href }, signal);
}

export async function prefetchEpubResources(
  resourceId: string,
  sessionId: string,
  hrefs: string[],
  signal?: AbortSignal,
) {
  if (hrefs.length === 0) return;
  await epubCommand('prefetch', 'prefetch_epub_resources', { resourceId, sessionId, hrefs }, signal);
}

export async function getEpubPositionCounts(
  resourceId: string,
  sessionId: string,
  signal?: AbortSignal,
) {
  return epubCommand<NativeEpubPositionCount[]>(
    'positions',
    'epub_position_counts',
    { resourceId, sessionId },
    signal,
  );
}

export async function closeEpubBook(resourceId: string, sessionId: string) {
  await epubCommand('close', 'close_epub_book', { resourceId, sessionId });
}

export function toLocalAssetUrl(path: string) {
  return desktopFileSrc(path);
}

export async function getReaderCacheStats() {
  return getCacheStats();
}

export async function clearReaderCache() {
  await clearCache();
}
