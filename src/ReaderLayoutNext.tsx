import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Book, ReaderSeekRequest, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs';
import List from 'lucide-react/dist/esm/icons/list.mjs';
import Settings2 from 'lucide-react/dist/esm/icons/settings-2.mjs';
import StepForward from 'lucide-react/dist/esm/icons/step-forward.mjs';
import { AnimatePresence, motion } from 'motion/react';
import { ReadiumReaderViewer } from './ReadiumReaderViewer';
import { ReaderSettingsPanel } from './components/reader/ReaderSettingsPanel';

interface ReaderLayoutProps {
  book: Book;
  onClose: () => void;
  onOpenBook: (book: Book) => void;
  onPresentable?: () => void;
}
export function ReaderLayout({ book, onClose, onOpenBook, onPresentable }: ReaderLayoutProps) {
  const { books, series, settings, updateSettings } = useAppContext();
  const [chromeVisible, setChromeVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [tocItems, setTocItems] = useState<ReaderTocItem[]>([]);
  const [currentTocId, setCurrentTocId] = useState<string | null>(null);
  const [tocTarget, setTocTarget] = useState<ReaderTocItem | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [seekRequest, setSeekRequest] = useState<ReaderSeekRequest | null>(null);
  const seekingRef = useRef(false);
  const contentProgressRef = useRef(0);
  const seekRequestIdRef = useRef(0);
  const seekReleaseTimerRef = useRef<number | null>(null);
  const tocItemRefs = useRef(new Map<string, HTMLButtonElement>());
  const currentSeries = series.find((item) => item.bookIds.includes(book.id));
  const currentIndex = currentSeries ? currentSeries.bookIds.indexOf(book.id) : -1;
  const nextBook = currentSeries && currentIndex >= 0
    ? books.find((item) => item.id === currentSeries.bookIds[currentIndex + 1])
    : undefined;

  useEffect(() => {
    setChromeVisible(false);
    setShowSettings(false);
    setShowToc(false);
    setTocItems([]);
    setCurrentTocId(null);
    setTocTarget(null);
    setReadingProgress(0);
    setSeekRequest(null);
  }, [book.id]);

  useEffect(() => {
    if (!showToc || !currentTocId) return;
    requestAnimationFrame(() => tocItemRefs.current.get(currentTocId)?.scrollIntoView({ block: 'center' }));
  }, [showToc, currentTocId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showToc) setShowToc(false);
        else if (!chromeVisible) setChromeVisible(true);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chromeVisible, showSettings, showToc, onClose]);

  const toggleChrome = useCallback(() => {
    setChromeVisible((visible) => !visible);
    setShowSettings(false);
    setShowToc(false);
  }, []);

  const openTocItem = (item: ReaderTocItem) => {
    setTocTarget({ ...item });
    setShowToc(false);
  };

  const handleProgressChange = (progress: number) => {
    contentProgressRef.current = progress;
    if (!seekingRef.current) setReadingProgress(progress);
  };

  const handleSeek = (value: number, phase: ReaderSeekRequest['phase']) => {
    const progress = Math.max(0, Math.min(1, value));
    seekingRef.current = true;
    setReadingProgress(progress);
    setSeekRequest({ progress, phase, requestId: ++seekRequestIdRef.current });
    if (phase === 'commit') {
      if (seekReleaseTimerRef.current !== null) window.clearTimeout(seekReleaseTimerRef.current);
      seekReleaseTimerRef.current = window.setTimeout(() => {
        seekReleaseTimerRef.current = null;
        seekingRef.current = false;
        setReadingProgress(contentProgressRef.current);
      }, 500);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ${
      settings.theme === 'dark' ? 'bg-[#121212] text-gray-200' :
      settings.theme === 'sepia' ? 'bg-[#FDFCF8] text-[#333333]' :
      'bg-[#FBFAF7] text-[#1C1C1E]'
    }`}>
      <AnimatePresence>
        {chromeVisible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 backdrop-blur-xl bg-[#FBFAF7]/80 dark:bg-[#121212]/80 z-40"
          >
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="返回"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowToc((visible) => !visible);
                  setShowSettings(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="目录"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <div className="font-medium text-sm truncate max-w-md">{book.title}</div>
            <div className="flex items-center gap-2">
              {nextBook && (
                <button
                  onClick={() => onOpenBook(nextBook)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title={`继续阅读 ${nextBook.title}`}
                >
                  <StepForward className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowToc(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 relative"
                title="阅读设置"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToc && chromeVisible && (
          <motion.aside
            initial={{ x: -24, opacity: 0, filter: 'blur(8px)' }}
            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ x: -24, opacity: 0, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="absolute left-4 top-16 bottom-5 z-50 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-[5px] border border-black/10 bg-white/88 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#1C1C1E]/88"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 items-center border-b border-black/5 px-4 text-sm font-semibold dark:border-white/10">
              目录
            </div>
            <div className="h-[calc(100%-48px)] overflow-y-auto p-2">
              {tocItems.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-black/45 dark:text-white/45">
                  暂无目录
                </div>
              ) : (
                tocItems.map((item) => (
                  <button
                    key={item.id}
                    ref={(element) => {
                      if (element) tocItemRefs.current.set(item.id, element);
                      else tocItemRefs.current.delete(item.id);
                    }}
                    onClick={() => openTocItem(item)}
                    aria-current={item.id === currentTocId ? 'location' : undefined}
                    className={`block w-full truncate rounded-[5px] px-3 py-2.5 text-left text-sm transition-colors ${item.id === currentTocId
                      ? 'bg-[#007AFF]/12 font-semibold text-[#007AFF] dark:bg-[#0A84FF]/18 dark:text-[#64AFFF]'
                      : 'text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10'}`}
                    title={item.title}
                  >
                    {item.title}
                  </button>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && chromeVisible && (
          <ReaderSettingsPanel settings={settings} updateSettings={updateSettings} />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
        <div className="w-full h-full min-w-0 cursor-auto" onClick={(event) => event.stopPropagation()}>
          <ReadiumReaderViewer
            key={book.id}
            book={book}
            chromeVisible={chromeVisible}
            onProgressChange={handleProgressChange}
            onToggleChrome={toggleChrome}
            onTocChange={setTocItems}
            onCurrentTocChange={setCurrentTocId}
            tocTarget={tocTarget}
            seekRequest={seekRequest}
            onPresentable={onPresentable}
          />
        </div>
      </div>

      <AnimatePresence>
        {chromeVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute bottom-4 left-1/2 z-40 w-[min(560px,calc(100vw-48px))] -translate-x-1/2"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(Math.max(0, Math.min(1, readingProgress)) * 1000)}
              onChange={(event) => handleSeek(Number(event.target.value) / 1000, 'preview')}
              onPointerUp={(event) => handleSeek(Number(event.currentTarget.value) / 1000, 'commit')}
              onPointerCancel={(event) => handleSeek(Number(event.currentTarget.value) / 1000, 'commit')}
              onKeyUp={(event) => handleSeek(Number(event.currentTarget.value) / 1000, 'commit')}
              onBlur={(event) => {
                if (seekingRef.current) handleSeek(Number(event.currentTarget.value) / 1000, 'commit');
              }}
              className="reader-progress-range h-5 w-full"
              aria-label="阅读进度"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
