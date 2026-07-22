import { desktopInvoke, runtimeCapabilities } from './backend';

export async function saveImageFromSource(src: string, suggestedName = 'image') {
  const response = await fetch(src);
  if (!response.ok) throw new Error('图片读取失败');

  const blob = await response.blob();
  const extension = extensionFromMime(blob.type) || extensionFromUrl(src) || 'png';
  const fileName = `${sanitizeFileName(suggestedName)}.${extension}`;

  if (!runtimeCapabilities.nativeExport) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const { save } = await import('@tauri-apps/plugin-dialog');
  const targetPath = await save({
    title: '保存图片',
    defaultPath: fileName,
    filters: [{ name: 'Image', extensions: [extension] }],
  });
  if (!targetPath) return;

  const base64 = await blobToBase64(blob);
  await desktopInvoke('authorize_export_path', { path: targetPath, kind: 'image' });
  await desktopInvoke('write_binary_file', { path: targetPath, base64Data: base64 });
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
  return cleanUrl.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
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
