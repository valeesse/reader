import { get, keys, set } from 'idb-keyval';
import {
  getWebProgress,
  getWebState,
  runtimeCapabilities,
  listBooks,
  putWebReadingState,
  putWebStateSection,
} from './backend';
import { AppSettings, Book, defaultSettings, ReadingProgress, Series, SyncSnapshot } from '../types';

export interface StartupSnapshot {
  version: 2;
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

export const KEYS = {
  BOOKS: 'zenith_v2_books',
  SERIES: 'zenith_v2_series',
  PROGRESS: 'zenith_v2_progress_',
  BOOK_COVER: 'zenith_v2_book_cover_',
  SETTINGS: 'zenith_v2_settings',
  LAST_READ: 'zenith_v2_last_read',
  LAST_READ_UPDATED_AT: 'zenith_v2_last_read_updated_at',
  STARTUP_SNAPSHOT: 'zenith_startup_snapshot_v2',
};

const SESSION_WEBDAV_PASSWORD = 'zenith_session_webdav_password';

type WebState = {
  progress?: Record<string, ReadingProgress>;
  settings?: AppSettings;
  series?: Series[];
  lastRead?: { bookId?: string; updatedAt?: number } | string;
};

let progressWriteQueue = Promise.resolve();
let webStateRequest: Promise<WebState> | undefined;

export async function saveBooks(books: Book[]) {
  updateStartupSnapshot({ books: books.map(stripBookCover) });
  await Promise.all([
    set(KEYS.BOOKS, books.map(stripBookCover)),
    ...books.filter((book) => Boolean(book.cover)).map((book) => saveBookCover(book.id, book.cover!)),
  ]);
}

export async function getBooks(): Promise<Book[]> {
  const cached = ((await get<Book[]>(KEYS.BOOKS)) || []).filter(isCurrentBook);
  const cachedById = new Map(cached.map((book) => [book.resourceId, book]));
  try {
    const books = (await listBooks()).map((book) => {
      const cachedBook = cachedById.get(book.resourceId);
      return {
        ...cachedBook,
        ...book,
        seriesName: book.seriesName ?? cachedBook?.seriesName,
        seriesIndex: book.seriesIndex ?? cachedBook?.seriesIndex,
      };
    });
    await set(KEYS.BOOKS, books.map(stripBookCover));
    return books;
  } catch (error) {
    if (!runtimeCapabilities.desktopShell) throw error;
    return cached.map(stripBookCover);
  }
}

export async function saveBookCover(bookId: string, cover: string) {
  await set(`${KEYS.BOOK_COVER}${bookId}`, cover);
}

export async function getBookCover(bookId: string): Promise<string | undefined> {
  return get<string>(`${KEYS.BOOK_COVER}${bookId}`);
}

export async function saveSeries(series: Series[]) {
  updateStartupSnapshot({ series });
  await set(KEYS.SERIES, series);
  if (runtimeCapabilities.remoteState) await putWebStateSection('series', series);
}

export async function getSeries(): Promise<Series[]> {
  if (runtimeCapabilities.remoteState) return (await loadWebState()).series || [];
  return (await get<Series[]>(KEYS.SERIES)) || [];
}

export function saveProgress(progress: ReadingProgress, options?: { urgent?: boolean }) {
  if (options?.urgent && runtimeCapabilities.remoteState) {
    void putWebReadingState({
      progress,
      lastRead: { bookId: progress.bookId, updatedAt: progress.updatedAt },
    }, true).catch((error) => console.warn('Failed to urgently persist Web reading progress', error));
  }
  const write = progressWriteQueue.catch(() => {}).then(() => saveProgressInOrder(progress));
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
  if (runtimeCapabilities.remoteState) {
    await putWebReadingState({
      progress,
      lastRead: becomesLastRead ? { bookId: progress.bookId, updatedAt: progress.updatedAt } : undefined,
    });
  }
  window.dispatchEvent(new CustomEvent('zenith:progress-saved', {
    detail: { progress, lastReadBookId: becomesLastRead ? progress.bookId : undefined } satisfies ProgressSavedDetail,
  }));
}

export async function getProgress(bookId: string): Promise<ReadingProgress | undefined> {
  if (runtimeCapabilities.remoteState) {
    const local = await get<ReadingProgress>(`${KEYS.PROGRESS}${bookId}`);
    const remotePromise = getWebProgress<ReadingProgress | null>(bookId)
      .then(async (remote) => {
        if (!remote || (local && local.updatedAt >= remote.updatedAt)) return local;
        await set(`${KEYS.PROGRESS}${bookId}`, remote);
        window.dispatchEvent(new CustomEvent('zenith:progress-saved', {
          detail: { progress: remote } satisfies ProgressSavedDetail,
        }));
        return remote;
      });
    if (local) {
      void remotePromise.catch((error) => console.warn('Failed to reconcile Web reading progress', error));
      return local;
    }
    return (await remotePromise.catch(() => undefined)) || undefined;
  }
  return get<ReadingProgress>(`${KEYS.PROGRESS}${bookId}`);
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  if (runtimeCapabilities.remoteState) {
    const progress = Object.values((await loadWebState()).progress || {});
    await Promise.all(progress.map((item) => set(`${KEYS.PROGRESS}${item.bookId}`, item)));
    return progress;
  }
  const allKeys = await keys();
  const progressKeys = allKeys.filter((key): key is string => typeof key === 'string' && key.startsWith(KEYS.PROGRESS));
  const values = await Promise.all(progressKeys.map((key) => get<ReadingProgress>(key)));
  return values.filter((value): value is ReadingProgress => Boolean(value));
}

export async function getLastReadBookId(): Promise<string | undefined> {
  if (runtimeCapabilities.remoteState) {
    const lastRead = (await loadWebState()).lastRead;
    return typeof lastRead === 'string' ? lastRead : lastRead?.bookId;
  }
  return get<string>(KEYS.LAST_READ);
}

/**
 * Record the selected book before its first locator is available.  This keeps
 * the synchronous startup snapshot authoritative even when the application is
 * closed during the first page or an older background reload completes later.
 */
export function markLastReadBook(bookId: string) {
  const updatedAt = Date.now();
  updateStartupSnapshot({ lastReadBookId: bookId });
  window.dispatchEvent(new CustomEvent('zenith:progress-saved', {
    detail: { lastReadBookId: bookId } satisfies ProgressSavedDetail,
  }));
  return Promise.all([
    set(KEYS.LAST_READ, bookId),
    set(KEYS.LAST_READ_UPDATED_AT, updatedAt),
    runtimeCapabilities.remoteState
      ? putWebStateSection('lastRead', { bookId, updatedAt })
      : Promise.resolve(),
  ]).then(() => undefined);
}

export function getLastReadBookIdSync() {
  return getStartupSnapshotSync()?.lastReadBookId;
}

export async function saveSettings(settings: AppSettings) {
  const normalized = normalizeSettings(settings);
  persistSessionPassword(normalized.webDavConfig.password);
  const durable = withoutSecrets(normalized);
  updateStartupSnapshot({ settings: durable });
  await set(KEYS.SETTINGS, durable);
  if (runtimeCapabilities.remoteState) await putWebStateSection('settings', durable);
}

export async function getSettings(): Promise<AppSettings> {
  const durable = runtimeCapabilities.remoteState
    ? normalizeSettings((await loadWebState()).settings)
    : normalizeSettings(await get<AppSettings>(KEYS.SETTINGS));
  return withSessionPassword(durable);
}

export function getStartupSnapshotSync(): StartupSnapshot | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const snapshot = JSON.parse(window.localStorage.getItem(KEYS.STARTUP_SNAPSHOT) || 'null') as StartupSnapshot | null;
    if (snapshot?.version !== 2) return undefined;
    return { ...snapshot, books: snapshot.books.filter(isCurrentBook), settings: normalizeSettings(snapshot.settings) };
  } catch {
    return undefined;
  }
}

export function saveStartupSnapshot(snapshot: Omit<StartupSnapshot, 'version' | 'updatedAt'>) {
  writeStartupSnapshot({ ...snapshot, books: snapshot.books.map(stripBookCover), version: 2, updatedAt: Date.now() });
}

export async function createSyncSnapshot(): Promise<SyncSnapshot> {
  const [books, series, settings, progress, lastReadBookId] = await Promise.all([
    getBooks(), getSeries(), getSettings(), getAllProgress(), getLastReadBookId(),
  ]);
  return {
    version: 2,
    books,
    series,
    settings: { ...settings, webDavConfig: { ...settings.webDavConfig, password: undefined } },
    progress,
    lastReadBookId,
    updatedAt: Date.now(),
  };
}

export async function applySyncSnapshot(snapshot: SyncSnapshot) {
  const localBooks = await getBooks();
  const available = new Set(localBooks.map((book) => book.id));
  const series = (snapshot.series || []).map((item) => ({
    ...item,
    bookIds: item.bookIds.filter((id) => available.has(id)),
  })).filter((item) => item.bookIds.length > 0);
  const settings = normalizeSettings(snapshot.settings);
  await Promise.all([saveSeries(series), saveSettings(settings)]);
  await Promise.all(
    (snapshot.progress || [])
      .filter((item) => available.has(item.bookId))
      .map((item) => saveProgress(item)),
  );
}

function loadWebState() {
  webStateRequest ||= getWebState<WebState>().finally(() => {
    window.setTimeout(() => { webStateRequest = undefined; }, 50);
  });
  return webStateRequest;
}

function normalizeSettings(settings?: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...settings,
    pageMargins: { ...defaultSettings.pageMargins, ...settings?.pageMargins },
    webDavConfig: { ...defaultSettings.webDavConfig, ...settings?.webDavConfig },
  };
}

function withoutSecrets(settings: AppSettings): AppSettings {
  return { ...settings, webDavConfig: { ...settings.webDavConfig, password: undefined } };
}

function persistSessionPassword(password?: string) {
  try {
    if (password) window.sessionStorage.setItem(SESSION_WEBDAV_PASSWORD, password);
    else window.sessionStorage.removeItem(SESSION_WEBDAV_PASSWORD);
  } catch {}
}

function withSessionPassword(settings: AppSettings): AppSettings {
  try {
    const password = window.sessionStorage.getItem(SESSION_WEBDAV_PASSWORD) || undefined;
    return password ? { ...settings, webDavConfig: { ...settings.webDavConfig, password } } : settings;
  } catch {
    return settings;
  }
}

function isCurrentBook(book: Book) {
  return Boolean(book?.resourceId && book.id === book.resourceId);
}

function stripBookCover(book: Book): Book {
  if (!book.cover) return book;
  const { cover: _cover, ...lightBook } = book;
  return lightBook;
}

function updateStartupSnapshot(partial: Partial<Omit<StartupSnapshot, 'version' | 'updatedAt'>>) {
  const current = getStartupSnapshotSync();
  writeStartupSnapshot({
    version: 2,
    books: (partial.books || current?.books || []).map(stripBookCover),
    series: partial.series || current?.series || [],
    settings: normalizeSettings(partial.settings || current?.settings),
    lastReadBookId: partial.lastReadBookId ?? current?.lastReadBookId,
    updatedAt: Date.now(),
  });
}

function writeStartupSnapshot(snapshot: StartupSnapshot) {
  try {
    window.localStorage.setItem(KEYS.STARTUP_SNAPSHOT, JSON.stringify({
      ...snapshot,
      settings: withoutSecrets(snapshot.settings),
    }));
  } catch (error) {
    console.warn('Failed to write startup snapshot', error);
  }
}
