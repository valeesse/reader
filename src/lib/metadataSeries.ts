import { Book, Series } from '../types';
import { inferBookSeries, sortBooksInSeries } from './series';

export interface AutoCreateSeriesResult {
  createdCount: number;
  updatedCount: number;
  eligibleGroups: number;
}

export function createMetadataSeries(books: Book[], existingSeries: Series[]) {
  const grouped = new Map<string, Array<{
    book: Book;
    seriesName: string;
    seriesIndex?: number;
    inferred: boolean;
  }>>();

  for (const book of books) {
    const inferredSeries = inferBookSeries(book);
    const seriesName = inferredSeries?.name || book.seriesName?.trim();
    if (!seriesName) continue;
    const key = seriesName.toLocaleLowerCase();
    grouped.set(key, [
      ...(grouped.get(key) || []),
      {
        book,
        seriesName,
        seriesIndex: inferredSeries?.index ?? book.seriesIndex,
        inferred: Boolean(inferredSeries),
      },
    ]);
  }

  if (grouped.size === 0) {
    return { books, series: existingSeries, stats: emptyAutoCreateSeriesResult() };
  }

  const groupedBookIds = new Set(
    Array.from(grouped.values()).flatMap((items) => items.map(({ book }) => book.id)),
  );
  const availableBookIds = new Set(books.map((book) => book.id));
  const nextSeries = existingSeries
    .map((item) => ({
      ...item,
      bookIds: item.bookIds.filter((bookId) => availableBookIds.has(bookId) && !groupedBookIds.has(bookId)),
    }))
    .filter((item) => item.bookIds.length > 0);
  const seriesByName = new Map(nextSeries.map((item) => [item.name.trim().toLocaleLowerCase(), { ...item }]));
  const bookSeriesMap = new Map<string, string>();
  let createdCount = 0;
  let updatedCount = 0;
  let eligibleGroups = 0;

  for (const [key, groupedBooks] of grouped) {
    if (groupedBooks.every((item) => item.inferred) && groupedBooks.length < 2) continue;
    eligibleGroups += 1;
    const orderedIds = sortBooksInSeries(groupedBooks.map(({ book, seriesIndex }) => ({
      ...book,
      seriesIndex: seriesIndex ?? book.seriesIndex,
    }))).map((book) => book.id);

    const existing = seriesByName.get(key);
    if (existing) {
      const mergedIds = Array.from(new Set([...existing.bookIds, ...orderedIds]));
      const changed = mergedIds.length !== existing.bookIds.length
        || mergedIds.some((bookId, index) => bookId !== existing.bookIds[index]);
      existing.bookIds = mergedIds;
      const targetIndex = nextSeries.findIndex((item) => item.id === existing.id);
      if (targetIndex >= 0) nextSeries[targetIndex] = existing;
      for (const bookId of mergedIds) bookSeriesMap.set(bookId, existing.id);
      if (changed) updatedCount += 1;
      continue;
    }

    const created: Series = {
      id: `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: groupedBooks[0].seriesName,
      bookIds: orderedIds,
    };
    nextSeries.push(created);
    seriesByName.set(key, created);
    createdCount += 1;
    for (const bookId of orderedIds) bookSeriesMap.set(bookId, created.id);
  }

  return {
    books: books.map((book) => {
      const seriesId = bookSeriesMap.get(book.id);
      if (seriesId) return { ...book, seriesId };
      if (groupedBookIds.has(book.id) && book.seriesId) return { ...book, seriesId: undefined };
      return book;
    }),
    series: nextSeries,
    stats: { createdCount, updatedCount, eligibleGroups },
  };
}

function emptyAutoCreateSeriesResult(): AutoCreateSeriesResult {
  return { createdCount: 0, updatedCount: 0, eligibleGroups: 0 };
}
