import { Book } from '../../../types';
import { runtimeCapabilities } from '../../../lib/backend';

export function prewarmWebReaderOnIntent(book: Book) {
  if (runtimeCapabilities.resourceTransport === 'asset-url') return;
  void import('./readerPublication')
    .then(({ prewarmReaderPublication }) => prewarmReaderPublication(book))
    .catch(() => {});
}
