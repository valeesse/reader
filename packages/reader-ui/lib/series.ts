import { Book, Series } from '../types';

export function sortBooksInSeries(books: Book[]) {
  return [...books].sort((a, b) => {
    const indexA = a.seriesIndex ?? Number.MAX_SAFE_INTEGER;
    const indexB = b.seriesIndex ?? Number.MAX_SAFE_INTEGER;
    if (indexA !== indexB) return indexA - indexB;
    return preferredBookFileName(a).localeCompare(preferredBookFileName(b), 'zh-Hans-CN');
  });
}

export function seriesCoverBook(series: Series, books: Book[]) {
  const seriesBooks = sortBooksInSeries(
    series.bookIds
      .map((bookId) => books.find((book) => book.id === bookId))
      .filter((book): book is Book => Boolean(book)),
  );
  return [...seriesBooks].sort((a, b) => {
    const compare = preferredBookFileName(a).localeCompare(preferredBookFileName(b), 'zh-Hans-CN');
    if (compare !== 0) return compare;
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  })[0];
}

export function displayBookFileName(book: Book) {
  return preferredBookFileStem(book);
}

export function preferredBookFileName(book: Book) {
  return book.fileName || book.title;
}

function preferredBookFileStem(book: Book) {
  return preferredBookFileName(book).replace(/\.[a-z0-9]+$/i, '').trim();
}
