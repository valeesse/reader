import { Book } from '../types';
import { createReadiumPublication, ReadiumPublicationLike } from './readiumPublication';
import { createTxtReadiumPublication } from './txtReadiumPublication';

const PREWARM_TTL_MS = 30_000;
const prewarmedPublications = new Map<string, {
  promise: Promise<ReadiumPublicationLike>;
  timer: number;
}>();

export function createReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  const prewarmed = prewarmedPublications.get(book.resourceId);
  if (prewarmed) {
    prewarmedPublications.delete(book.resourceId);
    window.clearTimeout(prewarmed.timer);
    return prewarmed.promise;
  }
  return openReaderPublication(book);
}

export function prewarmReaderPublication(book: Book) {
  const existing = prewarmedPublications.get(book.resourceId);
  if (existing) return existing.promise;
  const opening = openReaderPublication(book).catch((error) => {
    if (prewarmedPublications.get(book.resourceId)?.promise === opening) prewarmedPublications.delete(book.resourceId);
    throw error;
  });
  const timer = window.setTimeout(() => {
    const entry = prewarmedPublications.get(book.resourceId);
    if (entry?.promise !== opening) return;
    prewarmedPublications.delete(book.resourceId);
    opening.then((publication) => publication.close()).catch(() => {});
  }, PREWARM_TTL_MS);
  prewarmedPublications.set(book.resourceId, { promise: opening, timer });
  return opening;
}

function openReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  if (book.type === 'txt') {
    return createTxtReadiumPublication(book.resourceId, book.title, book.author);
  }
  return createReadiumPublication(book.resourceId, book.title);
}
