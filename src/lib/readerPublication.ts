import { Book } from '../types';
import { createReadiumPublication, ReadiumPublicationLike } from './readiumPublication';
import { createTxtReadiumPublication } from './txtReadiumPublication';

const PREWARM_TTL_MS = 30_000;
const MAX_PREWARMED_PUBLICATIONS = 2;
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
  trimPrewarmedPublications(book.resourceId);
  return opening;
}

export function warmReaderPublication(book: Book) {
  void prewarmReaderPublication(book).catch(() => {});
}

function trimPrewarmedPublications(activeResourceId: string) {
  while (prewarmedPublications.size > MAX_PREWARMED_PUBLICATIONS) {
    const candidate = Array.from(prewarmedPublications).find(([resourceId]) => resourceId !== activeResourceId);
    if (!candidate) return;
    const [resourceId, entry] = candidate;
    prewarmedPublications.delete(resourceId);
    window.clearTimeout(entry.timer);
    entry.promise.then((publication) => publication.close()).catch(() => {});
  }
}

function openReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  if (book.type === 'txt') {
    return createTxtReadiumPublication(book.resourceId, book.title, book.author);
  }
  return createReadiumPublication(book.resourceId, book.title);
}
