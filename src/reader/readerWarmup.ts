import { Book } from '../types';
import { isDesktopRuntime } from '../lib/backend';

export function prewarmWebReaderOnIntent(book: Book) {
  if (isDesktopRuntime) return;
  void import('./readerPublication')
    .then(({ prewarmReaderPublication }) => prewarmReaderPublication(book))
    .catch(() => {});
}
