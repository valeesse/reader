import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Book } from '../../types';
import { useAppContext } from '../../store/AppStore';
import { Sidebar } from './Sidebar';
import { Library } from '../library/Library';
import { SettingsView } from '../settings/SettingsView';
import { WebDavLibrary } from '../library/WebDavLibrary';
import { SeriesView } from '../library/SeriesView';
import { getLibraryRoot, importBooks, pickLibraryRoot, prewarmLibraryPicker, rescanBooks, runtimeCapabilities, setLibraryRoot } from '../../lib/backend';
import { cancelReaderIdle, scheduleReaderIdle } from '../../lib/readerScheduler';

export function LibraryShell({ onReadBook, onPresentable }: { onReadBook: (book: Book) => void; onPresentable: () => void }) {
  const { addBooks } = useAppContext();
  const [currentView, setCurrentView] = useState<'library' | 'webdav' | 'series' | 'settings'>('library');
  const [scanMessage, setScanMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    onPresentable();
    const idleId = scheduleReaderIdle(prewarmLibraryPicker, { timeout: 1800 });
    return () => cancelReaderIdle(idleId);
  }, [onPresentable]);

  const scanLibrary = async (changeRoot: boolean) => {
    try {
      setIsScanning(true);
      const needsRoot = runtimeCapabilities.mutableLibraryRoot && !(await getLibraryRoot());
      if (runtimeCapabilities.mutableLibraryRoot && (changeRoot || needsRoot)) {
        setScanMessage('正在打开文件夹选择器...');
        await nextPaint();
        const root = await pickLibraryRoot();
        if (!root) return;
        await setLibraryRoot(root);
      }
      setScanMessage('正在准备扫描 EPUB / TXT...');
      const scannedBooks = await rescanBooks((progress) => {
        const fileName = progress.currentPath.split(/[\\/]/).pop();
        setScanMessage(`正在扫描：已检查 ${progress.visited} 项，发现 ${progress.matched} 本${fileName ? `，当前 ${fileName}` : ''}`);
      });
      await addBooks(scannedBooks);
      setScanMessage(`扫描完成，发现 ${scannedBooks.length} 本书。`);
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : '扫描失败，请检查路径权限。');
    } finally {
      setIsScanning(false);
    }
  };

  const importManagedBooks = async () => {
    try {
      setIsScanning(true);
      setScanMessage('正在导入到受管书库...');
      const imported = await importBooks();
      if (imported.length === 0) return setScanMessage('未选择书籍。');
      await addBooks(imported);
      setScanMessage(`已导入并扫描 ${imported.length} 本书。`);
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : '导入失败。');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 flex min-w-0 overflow-hidden rounded-none sm:rounded-2xl glass-surface pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
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
            {currentView === 'webdav' && runtimeCapabilities.librarySources.includes('webdav') && <WebDavLibrary onReadBook={onReadBook} />}
            {currentView === 'series' && <SeriesView onReadBook={onReadBook} />}
            {currentView === 'settings' && (
              <SettingsView
                onRescan={() => scanLibrary(false)}
                onChangeLibraryRoot={() => scanLibrary(true)}
                onImportBooks={importManagedBooks}
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
