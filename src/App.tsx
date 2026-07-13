import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from './store/AppStore';
import { Sidebar } from './components/Sidebar';
import { Library } from './components/Library';
import { SettingsView } from './components/SettingsView';
import { WebDavLibrary } from './components/WebDavLibrary';
import { SeriesView } from './SeriesViewNext';
import { Book } from './types';
import { isTauriApp, onLibraryScanProgress, scanLibraryPath, selectLibraryDirectory, showMainWindow } from './lib/native';
import { AnimatePresence, motion } from 'motion/react';
import './reader-overrides.css';

let readerLayoutModulePromise: Promise<typeof import('./ReaderLayoutNext')> | undefined;

function loadReaderLayout() {
  readerLayoutModulePromise ||= import('./ReaderLayoutNext');
  return readerLayoutModulePromise;
}

const ReaderLayout = lazy(() => loadReaderLayout().then((module) => ({ default: module.ReaderLayout })));

function MainLayout() {
  const { books, addBooks, settings, isLoading, lastReadBookId } = useAppContext();
  const initialReadingBook = !isLoading && lastReadBookId
    ? books.find((item) => item.id === lastReadBookId) || null
    : null;
  const [currentView, setCurrentView] = useState<'library' | 'webdav' | 'series' | 'settings'>('library');
  const [readingBook, setReadingBook] = useState<Book | null>(() => initialReadingBook);
  const [startupResolved, setStartupResolved] = useState(() => !isLoading && !initialReadingBook);
  const [readerPresentable, setReaderPresentable] = useState(() => !initialReadingBook);
  const [scanMessage, setScanMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const startupResumeCheckedRef = useRef(false);
  const didShowWindowRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const showWindowOnce = () => {
    if (didShowWindowRef.current) return;
    didShowWindowRef.current = true;
    void showMainWindow();
  };

  useEffect(() => {
    if (isLoading || startupResumeCheckedRef.current) return;
    startupResumeCheckedRef.current = true;

    const resolveStartup = async () => {
      try {
        const book = lastReadBookId ? books.find((item) => item.id === lastReadBookId) : undefined;
        if (book) {
          const publicationModulePromise = import('./lib/readerPublication');
          const layoutModulePromise = loadReaderLayout();
          const publicationModule = await publicationModulePromise;
          void publicationModule.prewarmReaderPublication(book).catch(() => {});
          await layoutModulePromise;
          if (mountedRef.current) {
            setReadingBook(book);
          }
        }
      } finally {
        if (mountedRef.current) setStartupResolved(true);
      }
    };

    void resolveStartup();
  }, [books, isLoading, lastReadBookId]);

  useEffect(() => {
    if (isLoading || !startupResolved || didShowWindowRef.current) return;
    if (readingBook && !readerPresentable) return;

    const readyTimerId = window.setTimeout(() => {
      console.info('[startup] first presentable screen ready', {
        elapsedMs: Math.round(performance.now()),
        route: readingBook ? 'reader' : 'library',
      });
      showWindowOnce();
    }, 0);

    return () => window.clearTimeout(readyTimerId);
  }, [isLoading, readerPresentable, readingBook, startupResolved]);

  useEffect(() => {
    if (!startupResolved || readingBook) return;
    const idleId = window.requestIdleCallback(() => void loadReaderLayout(), { timeout: 1800 });
    return () => window.cancelIdleCallback(idleId);
  }, [readingBook, startupResolved]);

  useEffect(() => {
    const fallbackId = window.setTimeout(() => {
      if (didShowWindowRef.current) return;
      console.warn('[startup] reader recovery timed out; showing library fallback', {
        elapsedMs: Math.round(performance.now()),
        isLoading,
        startupResolved,
      });
      setReadingBook(null);
      setReaderPresentable(true);
      setStartupResolved(true);
      showWindowOnce();
    }, 2500);

    return () => window.clearTimeout(fallbackId);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('sepia');
    } else if (settings.theme === 'sepia') {
      document.documentElement.classList.add('sepia');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark', 'sepia');
    }
  }, [settings.theme]);

  const handleAddFiles = async () => {
    let unlistenProgress: (() => void) | undefined;
    try {
      if (!isTauriApp()) {
        setScanMessage('请在 Tauri 桌面应用中添加本地路径。');
        return;
      }

      const path = await selectLibraryDirectory();
      if (!path) return;

      setIsScanning(true);
      setScanMessage('正在准备扫描 EPUB / TXT...');
      unlistenProgress = await onLibraryScanProgress((progress) => {
        const fileName = progress.currentPath.split(/[\\/]/).pop();
        setScanMessage(
          `正在扫描：已检查 ${progress.visited} 项，发现 ${progress.matched} 本${fileName ? `，当前 ${fileName}` : ''}`,
        );
      });

      const scannedBooks = await scanLibraryPath(path);
      await addBooks(scannedBooks);
      setScanMessage(`扫描完成，发现 ${scannedBooks.length} 本书。`);
    } catch (err) {
      console.warn("Directory picking cancelled or failed", err);
      setScanMessage(err instanceof Error ? err.message : '扫描失败，请检查路径权限。');
    } finally {
      unlistenProgress?.();
      setIsScanning(false);
    }
  };

  if (isLoading || !startupResolved) {
    return <StartupSplash theme={settings.theme} />;
  }

  return (
    <div className="h-screen w-full flex gap-2 overflow-hidden bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] selection:bg-[#007AFF]/30 font-sans transition-colors duration-500 p-2">
      
      {!readingBook && (
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
        />
      )}

      {!readingBook && (
        <main className="flex-1 flex overflow-hidden rounded-2xl glass-surface">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 12, scale: 0.995 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex-1 flex min-w-0"
            >
              {currentView === 'library' && <Library onReadBook={setReadingBook} />}
              {currentView === 'webdav' && <WebDavLibrary onReadBook={setReadingBook} />}
              {currentView === 'series' && <SeriesView onReadBook={setReadingBook} />}
              {currentView === 'settings' && <SettingsView onAddFiles={handleAddFiles} scanMessage={scanMessage} isScanning={isScanning} />}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {readingBook && (
        <Suspense fallback={null}>
          <ReaderLayout
            book={readingBook}
            onClose={() => setReadingBook(null)}
            onOpenBook={setReadingBook}
            onPresentable={() => setReaderPresentable(true)}
          />
        </Suspense>
      )}
    </div>
  );
}

function StartupSplash({ theme }: { theme: 'light' | 'dark' | 'sepia' }) {
  const background = theme === 'dark' ? 'bg-[#121212]' : theme === 'sepia' ? 'bg-[#FDFCF8]' : 'bg-[#F2F2F7]';
  return (
    <div className={`fixed inset-0 ${background}`} />
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
