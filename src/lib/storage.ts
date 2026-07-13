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

export interface ProgressSavedDetail {
  progress?: ReadingProgress;
  lastReadBookId?: string;
}

// Store keys
export const KEYS = {
  BOOKS: 'zenith_books',
  SERIES: 'zenith_series',
  PROGRESS: 'zenith_progress_',
  BOOK_COVER: 'zenith_book_cover_',
  SETTINGS: 'zenith_settings',
  LAST_READ: 'zenith_last_read',
  LAST_READ_UPDATED_AT: 'zenith_last_read_updated_at',
  STARTUP_SNAPSHOT: 'zenith_startup_snapshot_v1',
};

let progressWriteQueue = Promise.resolve();

export async function saveBooks(books: Book[]) {
  updateStartupSnapshot({ books: books.map(stripBookCover) });
  await migrateProgressToLocalBooks(books);
  await Promise.all([
    set(KEYS.BOOKS, books.map(stripBookCover)),
    ...books
      .filter((book) => Boolean(book.cover))
      .map((book) => saveBookCover(book.id, book.cover!)),
  ]);
}

export async function getBooks(): Promise<Book[]> {
  const books = ((await get<Book[]>(KEYS.BOOKS)) || []).map(normalizeStoredBook);
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

export function saveProgress(progress: ReadingProgress) {
  const write = progressWriteQueue
    .catch(() => {})
    .then(() => saveProgressInOrder(progress));
  progressWriteQueue = write;
  return write;
}

async function saveProgressInOrder(progress: ReadingProgress) {
  const current = await get<ReadingProgress>(`${KEYS.PROGRESS}${progress.bookId}`);
  if (current && current.updatedAt > progress.updatedAt) return;
  await set(`${KEYS.PROGRESS}${progress.bookId}`, progress);

  const lastReadUpdatedAt = (await get<number>(KEYS.LAST_READ_UPDATED_AT)) || 0;
  const becomesLastRead = progress.updatedAt >= lastReadUpdatedAt;
  if (becomesLastRead) {
    await Promise.all([
      set(KEYS.LAST_READ, progress.bookId),
      set(KEYS.LAST_READ_UPDATED_AT, progress.updatedAt),
    ]);
    updateStartupSnapshot({ lastReadBookId: progress.bookId });
  }
  if (typeof window !== 'undefined') {
    const detail: ProgressSavedDetail = {
      progress,
      lastReadBookId: becomesLastRead ? progress.bookId : undefined,
    };
    window.dispatchEvent(new CustomEvent('zenith:progress-saved', { detail }));
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
      books: (snapshot.books || []).map(normalizeStoredBook).map(stripBookCover),
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
    books: snapshot.books.map(normalizeStoredBook).map(stripBookCover),
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
    version: 2,
    books: books.map(toSyncedBook),
    series,
    settings: {
      ...settings,
      webDavConfig: {
        ...settings.webDavConfig,
        password: undefined,
      },
    },
    progress: progress.map((item) => ({
      ...item,
      bookFingerprint: item.bookFingerprint || books.find((book) => book.id === item.bookId)?.fingerprint,
    })),
    lastReadBookId,
    updatedAt: Date.now(),
  };
}

export async function applySyncSnapshot(snapshot: SyncSnapshot) {
  await progressWriteQueue.catch(() => {});
  const [localSettings, localBooks, localSeries] = await Promise.all([
    getSettings(),
    getBooks(),
    getSeries(),
  ]);
  const [localLastReadBookId, localLastReadUpdatedAt] = await Promise.all([
    getLastReadBookId(),
    get<number>(KEYS.LAST_READ_UPDATED_AT),
  ]);
  const localByFingerprint = new Map(localBooks
    .filter((book) => book.fingerprint)
    .map((book) => [book.fingerprint!, book]));
  const localById = new Map(localBooks.map((book) => [book.id, book]));
  const remoteToLocalId = new Map<string, string>();
  const mergedBooks = [...localBooks];
  for (const remoteBook of snapshot.books || []) {
    const local = (remoteBook.fingerprint && localByFingerprint.get(remoteBook.fingerprint))
      || (snapshot.version === 1 ? localById.get(remoteBook.id) : undefined);
    if (!local) continue;
    remoteToLocalId.set(remoteBook.id, local.id);
    const index = mergedBooks.findIndex((book) => book.id === local.id);
    mergedBooks[index] = {
      ...remoteBook,
      ...local,
      title: remoteBook.title || local.title,
      author: remoteBook.author || local.author,
      seriesName: remoteBook.seriesName ?? local.seriesName,
      seriesIndex: remoteBook.seriesIndex ?? local.seriesIndex,
    };
  }
  const mergedSeries = mergeSyncedSeries(localSeries, snapshot.series || [], remoteToLocalId);
  const nextSettings = {
    ...defaultSettings,
    ...snapshot.settings,
    webDavConfig: {
      ...defaultSettings.webDavConfig,
      ...snapshot.settings?.webDavConfig,
      password: localSettings.webDavConfig.password,
    },
  };

  const remoteLastReadUpdatedAt = (snapshot.progress || [])
    .find((progress) => progress.bookId === snapshot.lastReadBookId)
    ?.updatedAt || snapshot.updatedAt;
  const acceptRemoteLastRead = Boolean(snapshot.lastReadBookId)
    && remoteLastReadUpdatedAt >= (localLastReadUpdatedAt || 0);
  const mappedRemoteLastReadId = snapshot.lastReadBookId
    ? remoteToLocalId.get(snapshot.lastReadBookId)
    : undefined;
  const nextLastReadBookId = acceptRemoteLastRead && mappedRemoteLastReadId
    ? mappedRemoteLastReadId
    : localLastReadBookId;

  saveStartupSnapshot({
    books: mergedBooks,
    series: mergedSeries,
    settings: nextSettings,
    lastReadBookId: nextLastReadBookId,
  });

  await saveBooks(mergedBooks);
  await saveSeries(mergedSeries);
  await saveSettings(nextSettings);

  await Promise.all((snapshot.progress || []).map(async (progress) => {
    const mappedBook = (progress.bookFingerprint && localByFingerprint.get(progress.bookFingerprint))
      || (remoteToLocalId.has(progress.bookId) ? localById.get(remoteToLocalId.get(progress.bookId)!) : undefined);
    const mappedProgress = mappedBook
      ? { ...progress, bookId: mappedBook.id, bookFingerprint: mappedBook.fingerprint }
      : progress;
    const local = await get<ReadingProgress>(`${KEYS.PROGRESS}${mappedProgress.bookId}`);
    if (!local || progress.updatedAt >= local.updatedAt) {
      await set(`${KEYS.PROGRESS}${mappedProgress.bookId}`, mappedProgress);
    }
  }));
  if (acceptRemoteLastRead && mappedRemoteLastReadId) {
    await Promise.all([
      set(KEYS.LAST_READ, mappedRemoteLastReadId),
      set(KEYS.LAST_READ_UPDATED_AT, remoteLastReadUpdatedAt),
    ]);
  }

  if (typeof window !== 'undefined') {
    const detail: ProgressSavedDetail = { lastReadBookId: nextLastReadBookId };
    window.dispatchEvent(new CustomEvent('zenith:progress-saved', { detail }));
  }
}

function toSyncedBook(book: Book): Book {
  return {
    ...book,
    path: '',
    localResourceId: undefined,
    cover: undefined,
  };
}

function mergeSyncedSeries(localSeries: Series[], remoteSeries: Series[], idMap: Map<string, string>) {
  const merged = new Map(localSeries.map((item) => [item.name.trim().toLocaleLowerCase(), item]));
  for (const remote of remoteSeries) {
    const mappedIds = remote.bookIds.map((id) => idMap.get(id)).filter((id): id is string => Boolean(id));
    if (mappedIds.length === 0) continue;
    const key = remote.name.trim().toLocaleLowerCase();
    const local = merged.get(key);
    merged.set(key, local
      ? { ...local, bookIds: Array.from(new Set([...local.bookIds, ...mappedIds])) }
      : { ...remote, bookIds: mappedIds });
  }
  return Array.from(merged.values());
}

async function migrateProgressToLocalBooks(books: Book[]) {
  const localByFingerprint = new Map(books
    .filter((book) => book.fingerprint)
    .map((book) => [book.fingerprint!, book]));
  if (localByFingerprint.size === 0) return;
  const allKeys = await keys();
  const progressKeys = allKeys.filter(
    (key): key is string => typeof key === 'string' && key.startsWith(KEYS.PROGRESS),
  );
  await Promise.all(progressKeys.map(async (key) => {
    const progress = await get<ReadingProgress>(key);
    if (!progress?.bookFingerprint) return;
    const localBook = localByFingerprint.get(progress.bookFingerprint);
    if (!localBook || progress.bookId === localBook.id) return;
    const targetKey = `${KEYS.PROGRESS}${localBook.id}`;
    const current = await get<ReadingProgress>(targetKey);
    if (!current || progress.updatedAt >= current.updatedAt) {
      await set(targetKey, { ...progress, bookId: localBook.id });
    }
  }));
}

function stripBookCover(book: Book): Book {
  if (!book.cover) return book;
  const { cover: _cover, ...lightBook } = book;
  return lightBook;
}

function normalizeStoredBook(book: Book): Book {
  const normalized = {
    ...book,
    source: (book.source as string | undefined) === 'local' ? 'external' : book.source,
    localResourceId: book.localResourceId || book.path || undefined,
  };
  if (normalized.fileName?.trim()) return normalized;
  const fileName = fileNameFromPath(book.path);
  return fileName ? { ...normalized, fileName } : normalized;
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

function fileNameFromPath(path: string) {
  const normalized = path.replace(/[\\/]+/g, '/');
  const segments = normalized.split('/');
  return segments[segments.length - 1]?.trim() || '';
}
