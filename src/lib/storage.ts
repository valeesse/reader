import { set, get, keys } from 'idb-keyval';
import { Book, Series, ReadingProgress, AppSettings, SyncSnapshot, defaultSettings } from '../types';

export interface StartupSnapshot {
  version: 1;
  books: Book[];
  series: Series[];
  settings: AppSettings;
  lastReadBookId?: string;
  updatedAt: number;
}

// Store keys
export const KEYS = {
  BOOKS: 'zenith_books',
  SERIES: 'zenith_series',
  PROGRESS: 'zenith_progress_',
  BOOK_COVER: 'zenith_book_cover_',
  SETTINGS: 'zenith_settings',
  LAST_READ: 'zenith_last_read',
  STARTUP_SNAPSHOT: 'zenith_startup_snapshot_v1',
};

export async function saveBooks(books: Book[]) {
  updateStartupSnapshot({ books: books.map(stripBookCover) });
  await Promise.all([
    set(KEYS.BOOKS, books.map(stripBookCover)),
    ...books
      .filter((book) => Boolean(book.cover))
      .map((book) => saveBookCover(book.id, book.cover!)),
  ]);
}

export async function getBooks(): Promise<Book[]> {
  const books = (await get<Book[]>(KEYS.BOOKS)) || [];
  if (books.some((book) => Boolean(book.cover))) {
    void migrateEmbeddedCovers(books);
  }
  return books.map(stripBookCover);
}

export async function saveBookCover(bookId: string, cover: string) {
  await set(`${KEYS.BOOK_COVER}${bookId}`, cover);
}

export async function getBookCover(bookId: string): Promise<string | undefined> {
  return await get<string>(`${KEYS.BOOK_COVER}${bookId}`);
}

export async function saveSeries(series: Series[]) {
  updateStartupSnapshot({ series });
  await set(KEYS.SERIES, series);
}

export async function getSeries(): Promise<Series[]> {
  return (await get<Series[]>(KEYS.SERIES)) || [];
}

export async function saveProgress(progress: ReadingProgress) {
  updateStartupSnapshot({ lastReadBookId: progress.bookId });
  await set(`${KEYS.PROGRESS}${progress.bookId}`, progress);
  await set(KEYS.LAST_READ, progress.bookId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zenith:progress-saved', { detail: progress }));
  }
}

export async function getProgress(bookId: string): Promise<ReadingProgress | undefined> {
  return await get<ReadingProgress>(`${KEYS.PROGRESS}${bookId}`);
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  const allKeys = await keys();
  const progressKeys = allKeys.filter(
    (key): key is string => typeof key === 'string' && key.startsWith(KEYS.PROGRESS),
  );
  const values = await Promise.all(progressKeys.map((key) => get<ReadingProgress>(key)));
  return values.filter((value): value is ReadingProgress => Boolean(value));
}

export async function getLastReadBookId(): Promise<string | undefined> {
  return await get<string>(KEYS.LAST_READ);
}

export function getLastReadBookIdSync(): string | undefined {
  return getStartupSnapshotSync()?.lastReadBookId;
}

export async function saveSettings(settings: AppSettings) {
  updateStartupSnapshot({ settings: normalizeSettings(settings) });
  await set(KEYS.SETTINGS, settings);
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await get<AppSettings>(KEYS.SETTINGS);
  return normalizeSettings(settings);
}

export function getStartupSnapshotSync(): StartupSnapshot | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(KEYS.STARTUP_SNAPSHOT);
    if (!raw) return undefined;
    const snapshot = JSON.parse(raw) as Partial<StartupSnapshot>;
    if (snapshot.version !== 1) return undefined;

    return {
      version: 1,
      books: (snapshot.books || []).map(stripBookCover),
      series: snapshot.series || [],
      settings: normalizeSettings(snapshot.settings),
      lastReadBookId: snapshot.lastReadBookId,
      updatedAt: snapshot.updatedAt || 0,
    };
  } catch (error) {
    console.warn('Failed to read startup snapshot', error);
    return undefined;
  }
}

export function saveStartupSnapshot(snapshot: Omit<StartupSnapshot, 'version' | 'updatedAt'>) {
  writeStartupSnapshot({
    version: 1,
    books: snapshot.books.map(stripBookCover),
    series: snapshot.series,
    settings: normalizeSettings(snapshot.settings),
    lastReadBookId: snapshot.lastReadBookId,
    updatedAt: Date.now(),
  });
}

export async function createSyncSnapshot(): Promise<SyncSnapshot> {
  const [books, series, settings, progress, lastReadBookId] = await Promise.all([
    getBooks(),
    getSeries(),
    getSettings(),
    getAllProgress(),
    getLastReadBookId(),
  ]);

  return {
    version: 1,
    books,
    series,
    settings: {
      ...settings,
      webDavConfig: {
        ...settings.webDavConfig,
        password: undefined,
      },
    },
    progress,
    lastReadBookId,
    updatedAt: Date.now(),
  };
}

export async function applySyncSnapshot(snapshot: SyncSnapshot) {
  const localSettings = await getSettings();
  const nextSettings = {
    ...defaultSettings,
    ...snapshot.settings,
    webDavConfig: {
      ...defaultSettings.webDavConfig,
      ...snapshot.settings?.webDavConfig,
      password: localSettings.webDavConfig.password,
    },
  };

  saveStartupSnapshot({
    books: snapshot.books || [],
    series: snapshot.series || [],
    settings: nextSettings,
    lastReadBookId: snapshot.lastReadBookId,
  });

  await saveBooks(snapshot.books || []);
  await saveSeries(snapshot.series || []);
  await saveSettings(nextSettings);

  await Promise.all((snapshot.progress || []).map((progress) => set(`${KEYS.PROGRESS}${progress.bookId}`, progress)));
  if (snapshot.lastReadBookId) {
    await set(KEYS.LAST_READ, snapshot.lastReadBookId);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zenith:progress-saved'));
  }
}

function stripBookCover(book: Book): Book {
  if (!book.cover) return book;
  const { cover: _cover, ...lightBook } = book;
  return lightBook;
}

function normalizeSettings(settings?: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...settings,
    pageMargins: {
      ...defaultSettings.pageMargins,
      ...settings?.pageMargins,
    },
    webDavConfig: {
      ...defaultSettings.webDavConfig,
      ...settings?.webDavConfig,
    },
  };
}

function updateStartupSnapshot(partial: Partial<Omit<StartupSnapshot, 'version' | 'updatedAt'>>) {
  const current = getStartupSnapshotSync();
  writeStartupSnapshot({
    version: 1,
    books: (partial.books || current?.books || []).map(stripBookCover),
    series: partial.series || current?.series || [],
    settings: normalizeSettings(partial.settings || current?.settings),
    lastReadBookId: partial.lastReadBookId ?? current?.lastReadBookId,
    updatedAt: Date.now(),
  });
}

function writeStartupSnapshot(snapshot: StartupSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEYS.STARTUP_SNAPSHOT, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to write startup snapshot', error);
  }
}

async function migrateEmbeddedCovers(books: Book[]) {
  try {
    await Promise.all([
      set(KEYS.BOOKS, books.map(stripBookCover)),
      ...books
        .filter((book) => Boolean(book.cover))
        .map((book) => saveBookCover(book.id, book.cover!)),
    ]);
  } catch (error) {
    console.warn('Failed to migrate embedded book covers', error);
  }
}
