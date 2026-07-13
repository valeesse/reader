import { Book } from '../types';
import { createReadiumPublicationFromPath, ReadiumPublicationLike } from './readiumPublication';
import { createTxtReadiumPublication } from './txtReadiumPublication';

const PREWARM_TTL_MS = 30_000;
const prewarmedPublications = new Map<string, {
  promise: Promise<ReadiumPublicationLike>;
  timer: number;
}>();

export function createReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  const prewarmed = prewarmedPublications.get(book.path);
  if (prewarmed) {
    prewarmedPublications.delete(book.path);
    window.clearTimeout(prewarmed.timer);
    return prewarmed.promise;
  }
  return openReaderPublication(book);
}

export function prewarmReaderPublication(book: Book) {
  const existing = prewarmedPublications.get(book.path);
  if (existing) return existing.promise;
  const opening = openReaderPublication(book).catch((error) => {
    if (prewarmedPublications.get(book.path)?.promise === opening) prewarmedPublications.delete(book.path);
    throw error;
  });
  const timer = window.setTimeout(() => {
    const entry = prewarmedPublications.get(book.path);
    if (entry?.promise !== opening) return;
    prewarmedPublications.delete(book.path);
    opening.then((publication) => publication.close()).catch(() => {});
  }, PREWARM_TTL_MS);
  prewarmedPublications.set(book.path, { promise: opening, timer });
  return opening;
}

function openReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  if (book.type === 'txt') {
    return createTxtReadiumPublication(book.path, book.title, book.author);
  }
  return createReadiumPublicationFromPath(book.path, book.title);
}
