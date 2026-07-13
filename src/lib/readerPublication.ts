import { Book } from '../types';
import { createReadiumPublicationFromPath, ReadiumPublicationLike } from './readiumPublication';
import { createTxtReadiumPublication } from './txtReadiumPublication';

const prewarmedPublications = new Map<string, Promise<ReadiumPublicationLike>>();

export function createReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  const prewarmed = prewarmedPublications.get(book.path);
  if (prewarmed) {
    prewarmedPublications.delete(book.path);
    return prewarmed;
  }
  return openReaderPublication(book);
}

export function prewarmReaderPublication(book: Book) {
  const existing = prewarmedPublications.get(book.path);
  if (existing) return existing;
  const opening = openReaderPublication(book).catch((error) => {
    if (prewarmedPublications.get(book.path) === opening) prewarmedPublications.delete(book.path);
    throw error;
  });
  prewarmedPublications.set(book.path, opening);
  return opening;
}

function openReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  if (book.type === 'txt') {
    return createTxtReadiumPublication(book.path, book.title, book.author);
  }
  return createReadiumPublicationFromPath(book.path, book.title);
}
