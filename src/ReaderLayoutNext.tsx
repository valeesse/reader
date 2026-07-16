import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Book, ReaderSeekRequest, ReaderTocItem } from './types';
import { useAppContext } from './store/AppStore';
import AlignJustify from 'lucide-react/dist/esm/icons/align-justify.mjs';
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right.mjs';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down.mjs';
import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.mjs';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs';
import Columns2 from 'lucide-react/dist/esm/icons/columns-2.mjs';
import List from 'lucide-react/dist/esm/icons/list.mjs';
import Monitor from 'lucide-react/dist/esm/icons/monitor.mjs';
import Moon from 'lucide-react/dist/esm/icons/moon.mjs';
import Settings2 from 'lucide-react/dist/esm/icons/settings-2.mjs';
import StepForward from 'lucide-react/dist/esm/icons/step-forward.mjs';
import Sun from 'lucide-react/dist/esm/icons/sun.mjs';
import Zap from 'lucide-react/dist/esm/icons/zap.mjs';
import { AnimatePresence, motion } from 'motion/react';
import { ReadiumReaderViewer } from './ReadiumReaderViewer';
import { READER_FONT_OPTIONS, READING_SETTING_LIMITS } from './lib/readingSettings';

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
          <motion.div
            initial={{ opacity: 0, x: 10, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
            style={{ transformOrigin: 'top right' }}
            className="reader-settings-panel absolute top-16 right-5 w-[min(410px,calc(100vw-32px))] max-h-[calc(100vh-92px)] overflow-y-auto bg-[#F7F7F5]/94 dark:bg-[#171816]/94 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.09] shadow-2xl z-50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-20 border-b border-black/[0.06] bg-[#F7F7F5]/90 px-5 py-4 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#171816]/90">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1C1E] dark:text-white">阅读设置</h2>
            </div>

            <div className="space-y-3 p-4">
              <SettingsSection title="主题">
                <Segmented className="grid grid-cols-3">
                  {[
                    { value: 'light', icon: Sun, label: '浅色' },
                    { value: 'sepia', icon: Monitor, label: '护眼' },
                    { value: 'dark', icon: Moon, label: '深色' },
                  ].map((item) => (
                    <SegmentButton
                      key={item.value}
                      active={settings.theme === item.value}
                      onClick={() => updateSettings({ theme: item.value as any })}
                      title={item.label}
                      layoutId="reader-theme-segment"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </SegmentButton>
                  ))}
                </Segmented>
              </SettingsSection>

              <SettingsSection title="阅读方式">
                <div className="space-y-3">
                  <div>
                    <PanelLabel>页面布局</PanelLabel>
                    <Segmented className="mt-2 grid grid-cols-2">
                      <SegmentButton
                        active={settings.pageMode === 'single'}
                        onClick={() => updateSettings({ pageMode: 'single' })}
                        title="单页"
                        layoutId="reader-page-segment"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs">单页</span>
                      </SegmentButton>
                      <SegmentButton
                        active={settings.pageMode === 'double'}
                        onClick={() => updateSettings({ pageMode: 'double' })}
                        disabled={settings.pageTurnAnimation === 'scroll'}
                        title="双页"
                        layoutId="reader-page-segment"
                      >
                        <Columns2 className="w-4 h-4" />
                        <span className="text-xs">双页</span>
                      </SegmentButton>
                    </Segmented>
                  </div>
                  <div className="h-px bg-black/[0.055] dark:bg-white/[0.07]" />
                  <div>
                    <PanelLabel>翻页动画</PanelLabel>
                    <Segmented className="mt-2 grid grid-cols-2">
                      {PAGE_TURN_OPTIONS.map((item) => (
                        <SegmentButton
                          key={item.value}
                          active={settings.pageTurnAnimation === item.value}
                          onClick={() => updateSettings(item.value === 'scroll'
                            ? { pageTurnAnimation: item.value, pageMode: 'single' }
                            : { pageTurnAnimation: item.value })}
                          title={item.description}
                          layoutId="reader-page-turn-segment"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-xs">{item.label}</span>
                        </SegmentButton>
                      ))}
                    </Segmented>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="文字排版">
                <div className="relative">
                  <select
                    value={settings.fontFamily}
                    onChange={(event) => updateSettings({ fontFamily: event.target.value })}
                    className="reader-settings-select h-11 w-full appearance-none border border-black/[0.06] bg-black/[0.035] px-3 pr-10 text-sm text-[#1C1C1E] outline-none transition focus:border-[#007AFF]/40 focus:ring-2 focus:ring-[#007AFF]/15 dark:border-white/[0.07] dark:bg-white/[0.055] dark:text-white"
                    style={{ fontFamily: settings.fontFamily }}
                  >
                    {READER_FONT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={{ fontFamily: option.value, fontSize: '14px' }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
                </div>
                <div className="mt-3 divide-y divide-black/[0.055] dark:divide-white/[0.07]">
                  <SliderRow label="文字大小" value={settings.fontSize} {...READING_SETTING_LIMITS.fontSize} unit="px" onChange={(value) => updateSettings({ fontSize: value })} />
                  <SliderRow label="段间距" value={settings.paragraphSpacing} {...READING_SETTING_LIMITS.paragraphSpacing} unit="em" onChange={(value) => updateSettings({ paragraphSpacing: value })} />
                  <SliderRow label="行间距" value={settings.lineHeight} {...READING_SETTING_LIMITS.lineHeight} onChange={(value) => updateSettings({ lineHeight: value })} />
                  <SliderRow label="字间距" value={settings.letterSpacing} {...READING_SETTING_LIMITS.letterSpacing} unit="em" onChange={(value) => updateSettings({ letterSpacing: value })} />
                </div>
              </SettingsSection>

              <SettingsSection title="页面留白">
                <div className="grid grid-cols-2 gap-2">
                  <MarginInput
                    label="水平"
                    value={settings.pageMargins.left}
                    limits={READING_SETTING_LIMITS.horizontalMargin}
                    onChange={(horizontal) => updateSettings({ pageMargins: { ...settings.pageMargins, left: horizontal, right: horizontal } })}
                  />
                  <MarginInput
                    label="垂直"
                    value={(settings.pageMargins.top + settings.pageMargins.bottom) / 2}
                    onChange={(vertical) => updateSettings({ pageMargins: { ...settings.pageMargins, top: vertical, bottom: vertical } })}
                  />
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-black/35 dark:text-white/35">水平留白同时作为双页模式的中缝宽度。</p>
              </SettingsSection>
            </div>
          </motion.div>
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

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium text-black/40 dark:text-white/40">{children}</div>;
}

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="reader-settings-card border border-black/[0.055] bg-white/82 p-3.5 shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:border-white/[0.065] dark:bg-white/[0.045]">
      <h3 className="mb-3 px-0.5 text-[11px] font-semibold tracking-[0.08em] text-black/45 dark:text-white/45">{title}</h3>
      {children}
    </section>
  );
}

const PAGE_TURN_OPTIONS = [
  { value: 'scroll', label: '连续滚动', description: '上下连续滚动加载', icon: AlignJustify },
  { value: 'minimal', label: '极简切换', description: '直接重新加载文字', icon: Zap },
  { value: 'slide-horizontal', label: '左右滑动', description: '页面整体左右平滑切换', icon: ArrowLeftRight },
  { value: 'slide-vertical', label: '上下滑动', description: '页面整体上下平滑切换', icon: ArrowUpDown },
] as const;

function Segmented({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`reader-settings-segmented gap-1 bg-black/[0.045] p-1 dark:bg-black/20 ${className}`}>{children}</div>;
}

function SegmentButton({
  active,
  children,
  onClick,
  title,
  layoutId,
  disabled = false,
}: {
  active: boolean,
  children: React.ReactNode,
  onClick: () => void,
  title: string,
  layoutId: string,
  disabled?: boolean,
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`reader-settings-option relative flex h-10 flex-1 items-center justify-center gap-2 border border-transparent transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35 ${
        active ? 'text-[#1C1C1E] dark:text-white' : 'text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="reader-settings-option-active absolute inset-0 border border-black/[0.045] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:border-white/[0.07] dark:bg-white/[0.11]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  unit?: string,
  onChange: (value: number) => void,
}) {
  const [draft, setDraft] = useState(value);
  const commitTimerRef = useRef<number | null>(null);
  const pendingValueRef = useRef(value);

  useEffect(() => {
    setDraft(value);
    pendingValueRef.current = value;
  }, [value]);
  useEffect(() => () => {
    if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
  }, []);

  const scheduleCommit = (next: number) => {
    setDraft(next);
    pendingValueRef.current = next;
    if (commitTimerRef.current !== null) return;
    commitTimerRef.current = window.setTimeout(() => {
      commitTimerRef.current = null;
      onChange(pendingValueRef.current);
    }, 32);
  };

  const commitNow = () => {
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    onChange(pendingValueRef.current);
  };

  return (
    <label className="flex items-center gap-3 px-0.5 py-3">
      <span className="w-14 text-xs font-medium text-black/55 dark:text-white/55">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(event) => scheduleCommit(parseFloat(event.target.value))}
        onPointerUp={commitNow}
        onKeyUp={commitNow}
        className="reader-setting-range min-w-0 flex-1"
        style={{ '--range-progress': `${((draft - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
      <span className="w-12 text-right text-xs tabular-nums text-black/45 dark:text-white/45">
        {Number.isInteger(draft) ? draft : draft.toFixed(step < 0.1 ? 2 : 1)}{unit}
      </span>
    </label>
  );
}

function MarginInput({
  label,
  value,
  limits = READING_SETTING_LIMITS.pageMargin,
  onChange,
}: {
  label: string,
  value: number,
  limits?: { min: number, max: number, step: number },
  onChange: (value: number) => void,
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) onChange(parsed);
    else setDraft(String(value));
  };

  return (
    <label className="reader-settings-input flex items-center justify-between border border-black/[0.055] bg-black/[0.025] px-3 py-2.5 dark:border-white/[0.065] dark:bg-white/[0.035]">
      <span className="text-xs font-medium text-black/55 dark:text-white/55">{label}</span>
      <span className="flex items-baseline gap-1">
        <input
          type="number"
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          className="w-[3ch] bg-transparent text-right text-xs tabular-nums outline-none"
        />
        <span className="text-xs text-black/35 dark:text-white/35">px</span>
      </span>
    </label>
  );
}
