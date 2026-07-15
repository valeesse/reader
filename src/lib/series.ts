import { Book, Series } from '../types';

export function sortBooksInSeries(books: Book[]) {
  return [...books].sort((a, b) => {
    const indexA = a.seriesIndex ?? Number.MAX_SAFE_INTEGER;
    const indexB = b.seriesIndex ?? Number.MAX_SAFE_INTEGER;
    if (indexA !== indexB) return indexA - indexB;
    return preferredBookFileName(a).localeCompare(preferredBookFileName(b), 'zh-Hans-CN');
  });
}

export function inferBookSeries(book: Book): { name: string; index: number } | undefined {
  const fileName = preferredBookFileStem(book);
  const normalized = fileName
    .replace(/[（(][^)）]*[)）]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const patterns = [
    /^(.*?)(?:\s*[【\[][^】\]]+[】\]])?\s+(\d+(?:\.\d+)?)\s*$/u,
    /^(.*?)(?:\s*[-_]\s*)?(?:第\s*)?(\d+(?:\.\d+)?)\s*(?:卷|巻|册|冊|集|话|話|部|章|篇|弹|冊目|卷特装版)?\s*$/iu,
    /^(.*?)(?:\s*[-_]\s*)?(?:vol(?:ume)?|v|episode|ep|part|book)\.?\s*(\d+(?:\.\d+)?)\s*$/iu,
    /^(.*?)(?:\s*[-_]\s*)?0*(\d{1,3}(?:\.\d+)?)\s*$/u,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const name = cleanSeriesName(match[1]);
    const index = Number(match[2]);
    if (name.length < 2 || !Number.isFinite(index)) continue;
    return { name, index };
  }

  return undefined;
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

function cleanSeriesName(value: string) {
  return value
    .replace(/[\s._-]+$/g, '')
    .replace(/[（(]\s*(?:完|全|番外|特典)\s*[)）]$/iu, '')
    .trim();
}

function preferredBookFileStem(book: Book) {
  return preferredBookFileName(book).replace(/\.[a-z0-9]+$/i, '').trim();
}
