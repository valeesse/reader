import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Book, Series, AppSettings, ReadingProgress, defaultSettings } from '../types';
import {
  AutoCreateSeriesResult,
  createMetadataSeries,
} from '../lib/metadataSeries';
export type { AutoCreateSeriesResult } from '../lib/metadataSeries';
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
  ProgressSavedDetail,
} from '../lib/storage';
import { normalizeSettings } from '../lib/readingSettings';
import { cancelReaderIdle, scheduleReaderIdle } from '../lib/readerScheduler';

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
  stateReconciled: boolean;
  stateError?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [startupSnapshot] = useState(() => getStartupSnapshotSync());
  const [books, setBooks] = useState<Book[]>(() => startupSnapshot?.books || []);
  const [series, setSeries] = useState<Series[]>(() => startupSnapshot?.series || []);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(() => normalizeSettings(startupSnapshot?.settings || defaultSettings));
  const [lastReadBookId, setLastReadBookId] = useState<string | undefined>(() => startupSnapshot?.lastReadBookId);
  const [isLoading, setIsLoading] = useState(!startupSnapshot);
  const [stateReconciled, setStateReconciled] = useState(false);
  const [stateError, setStateError] = useState<string>();
  const settingsRef = useRef(settings);
  const pendingSettingsSaveRef = useRef<AppSettings | null>(null);
  const settingsSaveTimerRef = useRef<number | undefined>(undefined);

  const reloadState = async () => {
    setStateError(undefined);
    if (!startupSnapshot) {
      setIsLoading(true);
    }
    try {
      const [storedBooks, loadedSeries, loadedSettings, loadedLastReadBookId] = await Promise.all([
        getBooks(),
        getSeries(),
        getSettings(),
        getLastReadBookId(),
      ]);
      const loadedBooks = storedBooks;
      setBooks(loadedBooks);
      setSeries(loadedSeries);
      const normalizedSettings = normalizeSettings(loadedSettings);
      settingsRef.current = normalizedSettings;
      setSettingsState(normalizedSettings);
      // A book may have been opened while this refresh was reading IDB. Never
      // let an older empty result erase the synchronous resume marker.
      const effectiveLastReadBookId = loadedLastReadBookId || getStartupSnapshotSync()?.lastReadBookId;
      setLastReadBookId(effectiveLastReadBookId);
      saveStartupSnapshot({
        books: loadedBooks,
        series: loadedSeries,
        settings: normalizedSettings,
        lastReadBookId: effectiveLastReadBookId,
      });
      loadProgressInIdle();
    } catch (error) {
      console.warn('Failed to reconcile persisted application state', error);
      setStateError(error instanceof Error ? error.message : '无法连接到书库服务，请稍后重试。');
    } finally {
      setStateReconciled(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!startupSnapshot || !startupSnapshot.lastReadBookId) {
      void reloadState();
      return;
    }
    const idleId = scheduleReaderIdle(() => void reloadState(), { timeout: 1500 });
    return () => cancelReaderIdle(idleId);
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

    scheduleReaderIdle(load, { timeout: 1200 });
  };

  useEffect(() => {
    const handleProgressSaved = (event: Event) => {
      const detail = (event as CustomEvent<ProgressSavedDetail | undefined>).detail;
      if (detail?.progress?.bookId) {
        const savedProgress = detail.progress;
        if (detail.lastReadBookId) setLastReadBookId(detail.lastReadBookId);
        setProgress((current) => {
          const next = current.filter((item) => item.bookId !== savedProgress.bookId);
          return [...next, savedProgress];
        });
      } else {
        if (detail?.lastReadBookId) setLastReadBookId(detail.lastReadBookId);
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
    const existingById = new Map(books.map((book) => [book.resourceId, book]));
    const newBooks = incomingBooks.map((book) => {
      const existingBook = existingById.get(book.resourceId);
      return {
        ...existingBook,
        ...book,
        id: book.resourceId,
        addedAt: existingBook?.addedAt ?? book.addedAt,
        cover: book.cover ?? existingBook?.cover,
        seriesName: book.seriesName ?? existingBook?.seriesName,
        seriesIndex: book.seriesIndex ?? existingBook?.seriesIndex,
      };
    }).sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
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
    setSeries(updatedSeries);
    await saveSeries(updatedSeries);
  };

  const updateSeries = async (nextSeries: Series) => {
    const updatedSeries = series.map((item) => item.id === nextSeries.id ? nextSeries : item);
    setSeries(updatedSeries);
    await saveSeries(updatedSeries);
  };

  const deleteSeries = async (seriesId: string) => {
    const updatedSeries = series.filter((item) => item.id !== seriesId);
    setSeries(updatedSeries);
    await saveSeries(updatedSeries);
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
    setSeries(updatedSeries);
    await saveSeries(updatedSeries);
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
    // Merge both fields from the same synchronous ref so the atomic
    // { pageTurnAnimation: 'scroll', pageMode: 'single' } update cannot be
    // overwritten by another setting click from the same render.
    const updated = normalizeSettings({ ...settingsRef.current, ...newSettings });
    if (JSON.stringify(updated) === JSON.stringify(settingsRef.current)) return;
    settingsRef.current = updated;
    setSettingsState(updated);
    scheduleSettingsSave(updated);
  };

  return (
    <AppContext.Provider value={{ books, series, progress, settings, addBook, addBooks, createSeries, updateSeries, deleteSeries, autoCreateMetadataSeries, mergeSeries, reloadState, refreshProgress, updateSettings, lastReadBookId, isLoading, stateReconciled, stateError }}>
      {children}
    </AppContext.Provider>
  );
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
