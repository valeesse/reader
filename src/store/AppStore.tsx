import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Book, Series, AppSettings, ReadingProgress, defaultSettings } from '../types';
import {
  getAllProgress,
  getBooks,
  saveBooks,
  getSettings,
  saveSettings,
  getSeries,
  saveSeries,
  getLastReadBookId,
  getStartupSnapshotSync,
  saveStartupSnapshot,
} from '../lib/storage';

interface AppContextType {
  books: Book[];
  series: Series[];
  progress: ReadingProgress[];
  settings: AppSettings;
  addBook: (book: Book) => Promise<void>;
  addBooks: (books: Book[]) => Promise<void>;
  createSeries: (name: string, bookIds: string[]) => Promise<void>;
  updateSeries: (series: Series) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<void>;
  autoCreateMetadataSeries: () => Promise<AutoCreateSeriesResult>;
  mergeSeries: (sourceSeriesId: string, targetSeriesId: string) => Promise<void>;
  reloadState: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  lastReadBookId?: string;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface AutoCreateSeriesResult {
  createdCount: number;
  updatedCount: number;
  eligibleGroups: number;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [startupSnapshot] = useState(() => getStartupSnapshotSync());
  const [books, setBooks] = useState<Book[]>(() => startupSnapshot?.books || []);
  const [series, setSeries] = useState<Series[]>(() => startupSnapshot?.series || []);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(() => startupSnapshot?.settings || defaultSettings);
  const [lastReadBookId, setLastReadBookId] = useState<string | undefined>(() => startupSnapshot?.lastReadBookId);
  const [isLoading, setIsLoading] = useState(!startupSnapshot);
  const settingsRef = useRef(settings);
  const pendingSettingsSaveRef = useRef<AppSettings | null>(null);
  const settingsSaveTimerRef = useRef<number | undefined>(undefined);

  const reloadState = async () => {
    if (!startupSnapshot) {
      setIsLoading(true);
    }
    const [loadedBooks, loadedSeries, loadedSettings, loadedLastReadBookId] = await Promise.all([
      getBooks(),
      getSeries(),
      getSettings(),
      getLastReadBookId(),
    ]);
    setBooks(loadedBooks);
    setSeries(loadedSeries);
    settingsRef.current = loadedSettings;
    setSettingsState(loadedSettings);
    setLastReadBookId(loadedLastReadBookId);
    saveStartupSnapshot({
      books: loadedBooks,
      series: loadedSeries,
      settings: loadedSettings,
      lastReadBookId: loadedLastReadBookId,
    });
    setIsLoading(false);
    loadProgressInIdle();
  };

  useEffect(() => {
    reloadState();
  }, []);

  useEffect(() => {
    return () => {
      if (settingsSaveTimerRef.current !== undefined) {
        window.clearTimeout(settingsSaveTimerRef.current);
      }
      if (pendingSettingsSaveRef.current) {
        void saveSettings(pendingSettingsSaveRef.current);
      }
    };
  }, []);

  const refreshProgress = async () => {
    setProgress(await getAllProgress());
  };

  const loadProgressInIdle = () => {
    const load = () => {
      getAllProgress().then(setProgress).catch((error) => {
        console.warn('Failed to load reading progress', error);
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 1200 });
    } else {
      globalThis.setTimeout(load, 80);
    }
  };

  useEffect(() => {
    const handleProgressSaved = (event: Event) => {
      const detail = (event as CustomEvent<ReadingProgress | undefined>).detail;
      if (detail?.bookId) {
        setLastReadBookId(detail.bookId);
        setProgress((current) => {
          const next = current.filter((item) => item.bookId !== detail.bookId);
          return [...next, detail];
        });
      } else {
        loadProgressInIdle();
      }
    };
    window.addEventListener('zenith:progress-saved', handleProgressSaved);
    return () => window.removeEventListener('zenith:progress-saved', handleProgressSaved);
  }, []);

  const addBook = async (book: Book) => {
    const newBooks = [...books.filter(b => b.id !== book.id), book];
    setBooks(newBooks.map(stripBookCover));
    await saveBooks(newBooks);
  };

  const addBooks = async (incomingBooks: Book[]) => {
    const merged = new Map(books.map((book) => [book.path, book]));
    for (const book of incomingBooks) {
      const existingBook = merged.get(book.path);
      merged.set(book.path, {
        ...book,
        seriesId: existingBook?.seriesId,
        addedAt: existingBook?.addedAt ?? book.addedAt,
        cover: book.cover ?? existingBook?.cover,
        seriesName: book.seriesName ?? existingBook?.seriesName,
        seriesIndex: book.seriesIndex ?? existingBook?.seriesIndex,
      });
    }
    const newBooks = Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
    const { books: booksWithSeries, series: nextSeries } = createMetadataSeries(newBooks, series);
    setBooks(booksWithSeries.map(stripBookCover));
    setSeries(nextSeries);
    await Promise.all([saveBooks(booksWithSeries), saveSeries(nextSeries)]);
  };

  const createSeries = async (name: string, bookIds: string[]) => {
    const trimmedName = name.trim();
    if (!trimmedName || bookIds.length === 0) return;
    const newSeries: Series = {
      id: `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      bookIds,
    };
    const updatedSeries = [...series, newSeries];
    const assignedBooks = books.map((book) => (
      bookIds.includes(book.id) ? { ...book, seriesId: newSeries.id } : book
    ));
    setSeries(updatedSeries);
    setBooks(assignedBooks);
    await Promise.all([saveSeries(updatedSeries), saveBooks(assignedBooks)]);
  };

  const updateSeries = async (nextSeries: Series) => {
    const updatedSeries = series.map((item) => item.id === nextSeries.id ? nextSeries : item);
    const updatedBooks = books.map((book) => {
      if (nextSeries.bookIds.includes(book.id)) return { ...book, seriesId: nextSeries.id };
      if (book.seriesId === nextSeries.id) return { ...book, seriesId: undefined };
      return book;
    });
    setSeries(updatedSeries);
    setBooks(updatedBooks);
    await Promise.all([saveSeries(updatedSeries), saveBooks(updatedBooks)]);
  };

  const deleteSeries = async (seriesId: string) => {
    const updatedSeries = series.filter((item) => item.id !== seriesId);
    const updatedBooks = books.map((book) => book.seriesId === seriesId ? { ...book, seriesId: undefined } : book);
    setSeries(updatedSeries);
    setBooks(updatedBooks);
    await Promise.all([saveSeries(updatedSeries), saveBooks(updatedBooks)]);
  };

  const autoCreateMetadataSeries = async () => {
    const { books: booksWithSeries, series: nextSeries, stats } = createMetadataSeries(books, series);
    setBooks(booksWithSeries.map(stripBookCover));
    setSeries(nextSeries);
    await Promise.all([saveBooks(booksWithSeries), saveSeries(nextSeries)]);
    return stats;
  };

  const mergeSeries = async (sourceSeriesId: string, targetSeriesId: string) => {
    if (sourceSeriesId === targetSeriesId) return;
    const source = series.find((item) => item.id === sourceSeriesId);
    const target = series.find((item) => item.id === targetSeriesId);
    if (!source || !target) return;

    const mergedBookIds = Array.from(new Set([...target.bookIds, ...source.bookIds]));
    const updatedSeries = series
      .filter((item) => item.id !== sourceSeriesId)
      .map((item) => item.id === targetSeriesId ? { ...item, bookIds: mergedBookIds } : item);
    const updatedBooks = books.map((book) => (
      source.bookIds.includes(book.id) || target.bookIds.includes(book.id)
        ? { ...book, seriesId: targetSeriesId }
        : book
    ));

    setSeries(updatedSeries);
    setBooks(updatedBooks);
    await Promise.all([saveSeries(updatedSeries), saveBooks(updatedBooks)]);
  };

  const scheduleSettingsSave = (nextSettings: AppSettings) => {
    pendingSettingsSaveRef.current = nextSettings;
    if (settingsSaveTimerRef.current !== undefined) {
      window.clearTimeout(settingsSaveTimerRef.current);
    }
    settingsSaveTimerRef.current = window.setTimeout(() => {
      settingsSaveTimerRef.current = undefined;
      const pending = pendingSettingsSaveRef.current;
      pendingSettingsSaveRef.current = null;
      if (pending) {
        void saveSettings(pending);
      }
    }, 280);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settingsRef.current, ...newSettings };
    settingsRef.current = updated;
    setSettingsState(updated);
    scheduleSettingsSave(updated);
  };

  return (
    <AppContext.Provider value={{ books, series, progress, settings, addBook, addBooks, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries, reloadState, refreshProgress, updateSettings, lastReadBookId, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

function createMetadataSeries(books: Book[], existingSeries: Series[]) {
  const seriesByName = new Map(existingSeries.map((item) => [item.name.trim().toLocaleLowerCase(), { ...item }]));
  const grouped = new Map<string, Array<{ book: Book; seriesName: string; seriesIndex?: number; inferred: boolean }>>();

  for (const book of books) {
    const metadataSeriesName = book.seriesName?.trim();
    const inferredSeries = metadataSeriesName ? undefined : inferBookSeries(book);
    const seriesName = metadataSeriesName || inferredSeries?.name;
    if (!seriesName) continue;
    const key = seriesName.toLocaleLowerCase();
    grouped.set(key, [
      ...(grouped.get(key) || []),
      {
        book,
        seriesName,
        seriesIndex: book.seriesIndex ?? inferredSeries?.index,
        inferred: !metadataSeriesName,
      },
    ]);
  }

  if (grouped.size === 0) {
    return { books, series: existingSeries, stats: emptyAutoCreateSeriesResult() };
  }

  const bookSeriesMap = new Map<string, string>();
  const nextSeries = [...existingSeries];
  let createdCount = 0;
  let updatedCount = 0;
  let eligibleGroups = 0;

  for (const [key, groupedBooks] of grouped) {
    const onlyInferred = groupedBooks.every((item) => item.inferred);
    if (onlyInferred && groupedBooks.length < 2) continue;
    eligibleGroups += 1;

    const displayName = groupedBooks[0].seriesName;
    const orderedIds = [...groupedBooks]
      .sort((a, b) => {
        const indexA = a.seriesIndex ?? Number.MAX_SAFE_INTEGER;
        const indexB = b.seriesIndex ?? Number.MAX_SAFE_INTEGER;
        if (indexA !== indexB) return indexA - indexB;
        return (a.book.fileName || a.book.title).localeCompare(b.book.fileName || b.book.title, 'zh-Hans-CN');
      })
      .map(({ book }) => book.id);

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
      name: displayName,
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
      return seriesId ? { ...book, seriesId } : book;
    }),
    series: nextSeries,
    stats: {
      createdCount,
      updatedCount,
      eligibleGroups,
    },
  };
}

function emptyAutoCreateSeriesResult(): AutoCreateSeriesResult {
  return {
    createdCount: 0,
    updatedCount: 0,
    eligibleGroups: 0,
  };
}

function inferBookSeries(book: Book): { name: string; index: number } | undefined {
  const baseName = (book.fileName || book.title)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[［【（(][^］】）)]*[］】）)]\s*$/g, '')
    .trim();
  const patterns = [
    /^(.*?)(?:第\s*)?(\d+(?:\.\d+)?)\s*(?:卷|巻|册|冊|集|话|話|部|册目)?\s*$/u,
    /^(.*?)[\s._-]+(?:vol(?:ume)?\.?\s*)?(\d+(?:\.\d+)?)\s*$/iu,
  ];

  for (const pattern of patterns) {
    const match = baseName.match(pattern);
    if (!match) continue;
    const name = match[1].replace(/[\s._-]+$/g, '').trim();
    const index = Number(match[2]);
    if (name.length < 2 || !Number.isFinite(index)) continue;
    return { name, index };
  }

  return undefined;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

function stripBookCover(book: Book): Book {
  if (!book.cover) return book;
  const { cover: _cover, ...lightBook } = book;
  return lightBook;
}
