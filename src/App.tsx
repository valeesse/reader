import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AppProvider, useAppContext } from './store/AppStore';
import { Book } from './types';
import { markLastReadBook } from './lib/storage';
import './reader-overrides.css';

let readerLayoutModulePromise: Promise<typeof import('./ReaderLayoutNext')> | undefined;
const loadReaderLayout = () => readerLayoutModulePromise ||= import('./ReaderLayoutNext');
const ReaderLayout = lazy(() => loadReaderLayout().then((module) => ({ default: module.ReaderLayout })));
const LibraryShell = lazy(() => import('./LibraryShell').then((module) => ({ default: module.LibraryShell })));

function MainLayout() {
  const { books, settings, isLoading, stateReconciled, lastReadBookId } = useAppContext();
  const initialReadingBook = !isLoading && lastReadBookId
    ? books.find((item) => item.id === lastReadBookId) || null
    : null;
  const [readingBook, setReadingBook] = useState<Book | null>(() => initialReadingBook);
  const [keepLibraryMounted, setKeepLibraryMounted] = useState(false);
  const [startupResolved, setStartupResolved] = useState(() => Boolean(initialReadingBook));
  const startupResumePendingRef = useRef(true);

  const presentApplication = useCallback(() => {
    const startup = (window as Window & { __ZENITH_STARTUP__?: { hideOverlay?: () => void } }).__ZENITH_STARTUP__;
    startup?.hideOverlay?.();
  }, []);

  useEffect(() => {
    if (isLoading || !startupResumePendingRef.current) return;
    const book = lastReadBookId ? books.find((item) => item.id === lastReadBookId) : undefined;
    if (book) {
      setReadingBook(book);
      setStartupResolved(true);
      startupResumePendingRef.current = false;
    } else if (stateReconciled) {
      setStartupResolved(true);
      startupResumePendingRef.current = false;
    }
  }, [books, isLoading, lastReadBookId, stateReconciled]);

  useEffect(() => {
    if (!readingBook || readingBook.id === lastReadBookId) return;
    void markLastReadBook(readingBook.id).catch((error) => {
      console.warn('Failed to record last-read book', error);
    });
  }, [lastReadBookId, readingBook?.id]);

  useEffect(() => {
    document.documentElement.classList.remove('startup-dark', 'startup-sepia');
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else if (settings.theme === 'sepia') document.documentElement.classList.add('sepia');
    else document.documentElement.classList.remove('dark', 'sepia');
    if (settings.theme !== 'dark') document.documentElement.classList.remove('dark');
    if (settings.theme !== 'sepia') document.documentElement.classList.remove('sepia');
  }, [settings.theme]);

  useEffect(() => {
    if (readingBook) return;
    const idleId = window.requestIdleCallback(() => {
      void loadReaderLayout();
    }, { timeout: 300 });
    return () => window.cancelIdleCallback(idleId);
  }, [readingBook]);

  const closeReader = () => {
    startupResumePendingRef.current = false;
    setReadingBook(null);
  };

  const openBookFromLibrary = (book: Book) => {
    setKeepLibraryMounted(true);
    setReadingBook(book);
  };

  if (isLoading || !startupResolved) return <StartupSplash theme={settings.theme} />;

  return (
    <div className="h-screen w-full flex gap-2 overflow-hidden bg-[#eeeee9] dark:bg-[#111210] text-[#242722] dark:text-[#ecece7] selection:bg-[#718273]/25 font-sans transition-colors duration-500 p-2">
      {(!readingBook || keepLibraryMounted) && (
        <div className="contents">
          <Suspense fallback={<StartupSplash theme={settings.theme} />}>
            <LibraryShell onReadBook={openBookFromLibrary} onPresentable={presentApplication} />
          </Suspense>
        </div>
      )}
      {readingBook && (
        <Suspense fallback={null}>
          <ReaderLayout
            book={readingBook}
            onClose={closeReader}
            onOpenBook={setReadingBook}
            onPresentable={presentApplication}
          />
        </Suspense>
      )}
    </div>
  );
}

function StartupSplash({ theme }: { theme: 'light' | 'dark' | 'sepia' }) {
  const background = theme === 'dark' ? 'bg-[#121212]' : theme === 'sepia' ? 'bg-[#FDFCF8]' : 'bg-[#F2F2F7]';
  return <div className={`fixed inset-0 ${background}`} />;
}

export default function App() {
  return <AppProvider><MainLayout /></AppProvider>;
}
