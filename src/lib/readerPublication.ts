import { Book } from '../types';
import { createReadiumPublicationFromPath, ReadiumPublicationLike } from './readiumPublication';
import { createTxtReadiumPublication } from './txtReadiumPublication';

export function createReaderPublication(book: Book): Promise<ReadiumPublicationLike> {
  if (book.type === 'txt') {
    return createTxtReadiumPublication(book.path, book.title, book.author);
  }
  return createReadiumPublicationFromPath(book.path, book.title);
}
