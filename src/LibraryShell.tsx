import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Book } from './types';
import { useAppContext } from './store/AppStore';
import { Sidebar } from './components/Sidebar';
import { Library } from './components/Library';
import { SettingsView } from './components/SettingsView';
import { WebDavLibrary } from './components/WebDavLibrary';
import { SeriesView } from './SeriesViewNext';
import { prewarmLibraryDialogDirectory } from './lib/native';
import { getLibraryRoot, onScanProgress, pickLibraryRoot, rescanBooks, runtimeCapabilities, setLibraryRoot } from './lib/backend';
import { cancelReaderIdle, scheduleReaderIdle } from './lib/readerScheduler';

export function LibraryShell({ onReadBook, onPresentable }: { onReadBook: (book: Book) => void; onPresentable: () => void }) {
  const { addBooks } = useAppContext();
  const [currentView, setCurrentView] = useState<'library' | 'webdav' | 'series' | 'settings'>('library');
  const [scanMessage, setScanMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    onPresentable();
    const idleId = scheduleReaderIdle(prewarmLibraryDialogDirectory, { timeout: 1800 });
    return () => cancelReaderIdle(idleId);
  }, [onPresentable]);

  const scanLibrary = async (changeRoot: boolean) => {
    let unlistenProgress: (() => void) | undefined;
    try {
      setIsScanning(true);
      const needsRoot = runtimeCapabilities.libraryRootMutable && !(await getLibraryRoot());
      if (runtimeCapabilities.libraryRootMutable && (changeRoot || needsRoot)) {
        setScanMessage('正在打开文件夹选择器...');
        await nextPaint();
        const root = await pickLibraryRoot();
        if (!root) return;
        await setLibraryRoot(root);
      }
      setScanMessage('正在准备扫描 EPUB / TXT...');
      unlistenProgress = await onScanProgress((progress) => {
        const fileName = progress.currentPath.split(/[\\/]/).pop();
        setScanMessage(`正在扫描：已检查 ${progress.visited} 项，发现 ${progress.matched} 本${fileName ? `，当前 ${fileName}` : ''}`);
      });
      const scannedBooks = await rescanBooks();
      await addBooks(scannedBooks);
      setScanMessage(`扫描完成，发现 ${scannedBooks.length} 本书。`);
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : '扫描失败，请检查路径权限。');
    } finally {
      unlistenProgress?.();
      setIsScanning(false);
    }
  };

  return (
    <>
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
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
            {currentView === 'library' && <Library onReadBook={onReadBook} />}
            {currentView === 'webdav' && runtimeCapabilities.webDav && <WebDavLibrary onReadBook={onReadBook} />}
            {currentView === 'series' && <SeriesView onReadBook={onReadBook} />}
            {currentView === 'settings' && (
              <SettingsView
                onRescan={() => scanLibrary(false)}
                onChangeLibraryRoot={() => scanLibrary(true)}
                scanMessage={scanMessage}
                isScanning={isScanning}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

function nextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)));
}
