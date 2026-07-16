import { AppSettings, WebDavBook } from '../types';
import { desktopInvoke } from './backend';

export async function uploadWebDavSnapshot(
  config: AppSettings['webDavConfig'],
  snapshot: string,
) {
  await desktopInvoke('webdav_upload_snapshot', { config, snapshot });
}

export function downloadWebDavSnapshot(config: AppSettings['webDavConfig']) {
  return desktopInvoke<string | null>('webdav_download_snapshot', { config });
}

export function listWebDavBooks(config: AppSettings['webDavConfig']) {
  return desktopInvoke<WebDavBook[]>('webdav_list_books', { config });
}

export function cacheWebDavBook(
  config: AppSettings['webDavConfig'],
  remotePath: string,
) {
  return desktopInvoke<{ resourceId: string }>('webdav_cache_book', { config, remotePath });
}

export async function downloadWebDavBook(
  config: AppSettings['webDavConfig'],
  remotePath: string,
  suggestedName: string,
) {
  const { save } = await import('@tauri-apps/plugin-dialog');
  const targetPath = await save({
    title: '下载 WebDAV 图书',
    defaultPath: suggestedName,
  });
  if (!targetPath) return;
  await desktopInvoke('authorize_export_path', { path: targetPath, kind: 'book' });
  await desktopInvoke('webdav_download_book_to_path', { config, remotePath, targetPath });
}
