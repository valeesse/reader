import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AppProvider, useAppContext } from './store/AppStore';
import { Book } from './types';
import { getReaderResumeBookIdSync, markLastReadBook, setReaderResumeBookIdSync } from './lib/storage';
import { cancelReaderIdle, scheduleReaderIdle } from './lib/readerScheduler';
import { drainPendingOpenFiles, openExternalBooks, runtimeCapabilities } from './lib/backend';
import { installOptionalReaderFontStyles } from './lib/fontPacks';
import './features/reader/styles.css';

let readerLayoutModulePromise: Promise<typeof import('./features/reader/ui/ReaderLayout')> | undefined;
const loadReaderLayout = () => readerLayoutModulePromise ||= import('./features/reader/ui/ReaderLayout');
const ReaderLayout = lazy(() => loadReaderLayout().then((module) => ({ default: module.ReaderLayout })));
const LibraryShell = lazy(() => import('./components/shell/LibraryShell').then((module) => ({ default: module.LibraryShell })));

function MainLayout() {
  const { books, settings, isLoading, stateReconciled, lastReadBookId, addBooks } = useAppContext();
  const resumeBookIdRef = useRef(getReaderResumeBookIdSync());
  const initialReadingBook = !runtimeCapabilities.desktopShell && !isLoading && resumeBookIdRef.current
    ? books.find((item) => item.id === resumeBookIdRef.current) || null
    : null;
  const [readingBook, setReadingBook] = useState<Book | null>(() => initialReadingBook);
  const [startupResolved, setStartupResolved] = useState(() => Boolean(initialReadingBook));
  const startupResumePendingRef = useRef(true);
  const addBooksRef = useRef(addBooks);
  const stateReconciledRef = useRef(stateReconciled);
  const stateReconciliationWaitersRef = useRef<Array<() => void>>([]);
  const [externalOpenError, setExternalOpenError] = useState<string>();
  addBooksRef.current = addBooks;

  useEffect(() => {
    stateReconciledRef.current = stateReconciled;
    if (!stateReconciled) return;
    stateReconciliationWaitersRef.current.splice(0).forEach((resolve) => resolve());
  }, [stateReconciled]);

  useEffect(() => {
    if (!runtimeCapabilities.desktopShell) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    let pipeline = Promise.resolve();

    const waitForStateReconciliation = () => stateReconciledRef.current
      ? Promise.resolve()
      : new Promise<void>((resolve) => stateReconciliationWaitersRef.current.push(resolve));
    const consumePendingFiles = () => {
      pipeline = pipeline.then(async () => {
        const paths = await drainPendingOpenFiles();
        if (paths.length === 0 || disposed) return;
        const openedBooks = await openExternalBooks(paths);
        if (openedBooks.length === 0 || disposed) return;
        await waitForStateReconciliation();
        if (disposed) return;
        await addBooksRef.current(openedBooks);
        if (disposed) return;
        startupResumePendingRef.current = false;
        setReadingBook(openedBooks[0]);
        setExternalOpenError(undefined);
      }).catch((error) => {
        if (!disposed) {
          setExternalOpenError(error instanceof Error ? error.message : '无法打开所选书籍。');
        }
      });
    };

    void import('@tauri-apps/api/event').then(async ({ listen }) => {
      const stopListening = await listen('open-files://available', consumePendingFiles);
      if (disposed) {
        stopListening();
        return;
      }
      unlisten = stopListening;
      consumePendingFiles();
    }).catch((error) => {
      if (!disposed) console.warn('Failed to listen for files opened by the operating system', error);
    });

    return () => {
      disposed = true;
      unlisten?.();
      stateReconciliationWaitersRef.current.splice(0).forEach((resolve) => resolve());
    };
  }, []);

  const presentApplication = useCallback(() => {
    const startup = (window as Window & { __ZENITH_STARTUP__?: { hideOverlay?: () => void } }).__ZENITH_STARTUP__;
    startup?.hideOverlay?.();
  }, []);

  const presentReader = useCallback(() => {
    presentApplication();
  }, [presentApplication]);

  useEffect(() => {
    if (isLoading || !startupResumePendingRef.current) return;
    const book = resumeBookIdRef.current ? books.find((item) => item.id === resumeBookIdRef.current) : undefined;
    if (book) {
      setReadingBook(book);
      setStartupResolved(true);
      startupResumePendingRef.current = false;
    } else if (stateReconciled) {
      resumeBookIdRef.current = undefined;
      setReaderResumeBookIdSync();
      setStartupResolved(true);
      startupResumePendingRef.current = false;
    }
  }, [books, isLoading, stateReconciled]);

  useEffect(() => {
    if (!readingBook) return;
    resumeBookIdRef.current = readingBook.id;
    setReaderResumeBookIdSync(readingBook.id);
    if (readingBook.id === lastReadBookId) return;
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
    void installOptionalReaderFontStyles(document, settings.fontFamily);
  }, [settings.fontFamily]);

  useEffect(() => {
    if (readingBook) return;
    const idleId = scheduleReaderIdle(() => {
      void loadReaderLayout();
    }, { timeout: 300 });
    return () => cancelReaderIdle(idleId);
  }, [readingBook]);

  const closeReader = () => {
    startupResumePendingRef.current = false;
    resumeBookIdRef.current = undefined;
    setReaderResumeBookIdSync();
    setReadingBook(null);
  };

  const openBookFromLibrary = (book: Book) => {
    resumeBookIdRef.current = book.id;
    setReaderResumeBookIdSync(book.id);
    setReadingBook(book);
  };

  if (isLoading || !startupResolved) return <StartupSplash theme={settings.theme} />;

  return (
    <div className="h-screen w-full flex gap-0 sm:gap-2 overflow-hidden bg-[#F7F5F0] dark:bg-[#111210] text-[#1C1C1E] dark:text-[#ecece7] selection:bg-[#087DF1]/20 font-sans transition-colors duration-500 p-0 sm:p-2">
      <div
        className={readingBook ? 'hidden' : 'contents'}
        aria-hidden={readingBook ? true : undefined}
        inert={readingBook ? true : undefined}
      >
        <Suspense fallback={<StartupSplash theme={settings.theme} />}>
          <LibraryShell onReadBook={openBookFromLibrary} onPresentable={presentApplication} />
        </Suspense>
      </div>
      {readingBook && (
        <Suspense fallback={null}>
          <ReaderLayout
            book={readingBook}
            onClose={closeReader}
            onOpenBook={openBookFromLibrary}
            onPresentable={presentReader}
          />
        </Suspense>
      )}
      {externalOpenError && (
        <div className="fixed left-1/2 top-3 z-[90] flex w-[min(92vw,560px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-red-500/15 bg-[#FFF8F5]/95 px-4 py-3 text-sm text-red-800 shadow-[0_14px_44px_rgba(96,30,20,0.16)] backdrop-blur-xl dark:bg-[#2A1D1B]/95 dark:text-red-200" role="alert">
          <span className="min-w-0 flex-1">打开书籍失败：{externalOpenError}</span>
          <button type="button" onClick={() => setExternalOpenError(undefined)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-red-500/10">关闭</button>
        </div>
      )}
    </div>
  );
}

function StartupSplash({ theme }: { theme: 'light' | 'dark' | 'sepia' }) {
  const background = theme === 'dark' ? 'bg-[#121212]' : theme === 'sepia' ? 'bg-[#FDFCF8]' : 'bg-[#FBFAF7]';
  return <div className={`fixed inset-0 ${background}`} />;
}

export default function App() {
  return <AppProvider><MainLayout /></AppProvider>;
}
