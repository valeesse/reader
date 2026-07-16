import React from 'react';
import { Book as BookIcon, Cloud, Settings as SettingsIcon, BookOpen, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store/AppStore';
import { runtimeCapabilities } from '../lib/backend';

interface SidebarProps {
  currentView: 'library' | 'webdav' | 'series' | 'settings';
  onChangeView: (view: 'library' | 'webdav' | 'series' | 'settings') => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const { books, series } = useAppContext();

  return (
    <aside className="w-16 min-[760px]:w-48 min-[1100px]:w-56 h-full shrink-0 rounded-2xl glass-surface flex flex-col pt-5 pb-2 transition-[width,background-color] duration-300 overflow-hidden">

      <div className="px-3 min-[760px]:px-5 pb-7">
        <h1 className="h-9 text-lg font-semibold tracking-[0.08em] text-[#30352f] dark:text-[#f0f0eb] flex items-center justify-center min-[760px]:justify-start gap-2.5">
          <BookOpen className="w-5 h-5 shrink-0 text-[#718273]" strokeWidth={1.7} />
          <span className="hidden min-[760px]:block truncate">Zenith</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2.5">
        <div className="hidden min-[760px]:block text-[10px] font-medium text-black/35 dark:text-white/35 px-3 pb-2 uppercase tracking-[0.18em]">
          书库
        </div>
        {runtimeCapabilities.webDav && <button
          onClick={() => onChangeView('library')}
          className={cn(
            "w-full h-10 flex items-center justify-center min-[760px]:justify-start gap-3 px-3 text-sm rounded-lg font-medium transition-colors",
            currentView === 'library' 
              ? "bg-[#718273] text-white shadow-sm"
              : "text-black/60 dark:text-white/65 hover:bg-black/[0.045] dark:hover:bg-white/[0.06]"
          )}
          title="所有书籍"
        >
          <BookIcon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="hidden min-[760px]:block truncate">所有书籍</span>
          <span className={cn(
            "hidden min-[900px]:block ml-auto py-0.5 px-2 rounded-full text-xs tabular-nums",
            currentView === 'library' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{books.length}</span>
        </button>}

        <button
          onClick={() => onChangeView('webdav')}
          className={cn(
            "w-full h-10 flex items-center justify-center min-[760px]:justify-start gap-3 px-3 text-sm rounded-lg font-medium transition-colors",
            currentView === 'webdav'
              ? "bg-[#718273] text-white shadow-sm"
              : "text-black/60 dark:text-white/65 hover:bg-black/[0.045] dark:hover:bg-white/[0.06]"
          )}
          title="WebDAV"
        >
          <Cloud className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="hidden min-[760px]:block truncate">WebDAV</span>
        </button>
        
        <button
          onClick={() => onChangeView('series')}
          className={cn(
            "w-full h-10 flex items-center justify-center min-[760px]:justify-start gap-3 px-3 text-sm rounded-lg font-medium transition-colors",
            currentView === 'series' 
              ? "bg-[#718273] text-white shadow-sm"
              : "text-black/60 dark:text-white/65 hover:bg-black/[0.045] dark:hover:bg-white/[0.06]"
          )}
          title="系列"
        >
          <Layers className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="hidden min-[760px]:block truncate">系列</span>
          <span className={cn(
            "hidden min-[900px]:block ml-auto py-0.5 px-2 rounded-full text-xs tabular-nums",
            currentView === 'series' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{series.length}</span>
        </button>
      </nav>

      <div className="mt-auto h-14 px-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-center min-[760px]:justify-start">
        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            "w-10 h-10 rounded-xl transition-colors flex items-center justify-center",
            currentView === 'settings' 
              ? "bg-[#718273]/15 text-[#536456] dark:bg-white/10 dark:text-white shadow-sm"
              : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
          )}
          title="设置"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
