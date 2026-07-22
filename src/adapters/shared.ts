import type { Book } from '../types';

export type BackendBook = Omit<Book, 'addedAt' | 'resourceId' | 'contentId'> & {
  resourceId: string;
  contentId?: string;
  fingerprint?: string;
  addedAt?: number;
  modifiedAt?: number;
};

export function normalizeBook(book: BackendBook, coverUrl: (cover: string) => string): Book {
  return {
    id: book.resourceId,
    resourceId: book.resourceId,
    contentId: book.contentId || book.fingerprint || book.resourceId,
    title: book.title,
    author: book.author,
    cover: book.cover ? coverUrl(book.cover) : undefined,
    type: book.type,
    fileName: book.fileName,
    relativePath: book.relativePath,
    seriesName: book.seriesName,
    seriesIndex: book.seriesIndex,
    addedAt: book.addedAt ?? book.modifiedAt ?? Date.now(),
  };
}

export async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: string; code?: string };
    const value = new Error(error.error || `请求失败 (${response.status})`) as Error & { code?: string };
    value.code = error.code;
    throw value;
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
  return response.json() as Promise<T>;
}
