import { Book, Series } from '../types';

export interface AutoCreateSeriesResult {
  createdCount: number;
  updatedCount: number;
  eligibleGroups: number;
}

interface ParsedFileSeries {
  directory: string;
  name: string;
  index: number;
}

interface SeriesCandidate extends ParsedFileSeries {
  book: Book;
}

/**
 * Only accepts: <series name> <numeric index> <title or other text>.txt|epub
 * The relative directory is part of the grouping key, so identically named
 * series in different folders never merge automatically.
 */
export function parseStrictFileSeries(book: Book): ParsedFileSeries | undefined {
  if (!book.relativePath) return undefined;
  const normalizedPath = book.relativePath.replace(/\\/g, '/');
  const segments = normalizedPath.split('/');
  const fileName = segments.pop() || '';
  if (!/\.(?:txt|epub)$/iu.test(fileName)) return undefined;
  const stem = fileName.replace(/\.(?:txt|epub)$/iu, '');
  const match = stem.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+(.+)$/u);
  if (!match) return undefined;

  const name = match[1].replace(/\s+/g, ' ').trim();
  const index = Number(match[2]);
  const remainder = match[3].trim();
  if (!name || !remainder || !Number.isFinite(index)) return undefined;
  return { directory: segments.join('/'), name, index };
}

export function createMetadataSeries(books: Book[], existingSeries: Series[]) {
  const parsedByBookId = new Map<string, SeriesCandidate>();
  const groups = new Map<string, SeriesCandidate[]>();

  for (const book of books) {
    const parsed = parseStrictFileSeries(book);
    if (!parsed) continue;
    const candidate = { book, ...parsed };
    parsedByBookId.set(book.id, candidate);
    const key = groupKey(parsed.directory, parsed.name);
    groups.set(key, [...(groups.get(key) || []), candidate]);
  }

  if (groups.size === 0) {
    return { books, series: existingSeries, stats: emptyAutoCreateSeriesResult() };
  }

  const nextBooks = books.map((book) => {
    const parsed = parsedByBookId.get(book.id);
    return parsed ? { ...book, seriesName: parsed.name, seriesIndex: parsed.index } : book;
  });
  const autoBookIds = new Set(parsedByBookId.keys());
  const availableBookIds = new Set(books.map((book) => book.id));
  const nextSeries = existingSeries
    .map((item) => ({
      ...item,
      bookIds: item.bookIds.filter((bookId) => availableBookIds.has(bookId) && !autoBookIds.has(bookId)),
    }))
    .filter((item) => item.bookIds.length > 0);
  const claimedSeriesIds = new Set<string>();
  let createdCount = 0;
  let updatedCount = 0;

  for (const groupedBooks of groups.values()) {
    groupedBooks.sort((a, b) => (
      a.index - b.index
      || (a.book.fileName || a.book.title).localeCompare(b.book.fileName || b.book.title, 'zh-Hans-CN')
    ));
    const orderedIds = groupedBooks.map(({ book }) => book.id);
    const existing = existingSeries.find((item) => (
      !claimedSeriesIds.has(item.id)
      && item.bookIds.some((bookId) => orderedIds.includes(bookId))
    ));

    if (existing) {
      claimedSeriesIds.add(existing.id);
      const retained = nextSeries.find((item) => item.id === existing.id)?.bookIds || [];
      const updated: Series = {
        ...existing,
        name: groupedBooks[0].name,
        bookIds: [...orderedIds, ...retained.filter((bookId) => !orderedIds.includes(bookId))],
      };
      const targetIndex = nextSeries.findIndex((item) => item.id === existing.id);
      if (targetIndex >= 0) nextSeries[targetIndex] = updated;
      else nextSeries.push(updated);
      if (updated.name !== existing.name || !sameIds(updated.bookIds, existing.bookIds)) updatedCount += 1;
      continue;
    }

    nextSeries.push({
      id: `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: groupedBooks[0].name,
      bookIds: orderedIds,
    });
    createdCount += 1;
  }

  return {
    books: nextBooks,
    series: nextSeries,
    stats: { createdCount, updatedCount, eligibleGroups: groups.size },
  };
}

function groupKey(directory: string, name: string) {
  return `${directory.toLocaleLowerCase()}\u0000${name.toLocaleLowerCase()}`;
}

function sameIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function emptyAutoCreateSeriesResult(): AutoCreateSeriesResult {
  return { createdCount: 0, updatedCount: 0, eligibleGroups: 0 };
}
