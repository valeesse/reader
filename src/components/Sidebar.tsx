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
    <aside className="fixed inset-x-2 bottom-2 z-40 h-[calc(2.75rem+env(safe-area-inset-bottom))] shrink-0 rounded-2xl glass-surface flex flex-row items-start px-1 pb-[env(safe-area-inset-bottom)] transition-[width,background-color] duration-300 overflow-hidden sm:static sm:w-16 min-[1100px]:w-56 sm:h-full sm:flex-col sm:px-0 sm:pt-5 sm:pb-2">

      <div className="hidden sm:block px-3 min-[1100px]:px-5 pb-7">
        <h1 className="h-9 text-lg font-semibold tracking-[0.08em] text-[#1C1C1E] dark:text-[#f0f0eb] flex items-center justify-center min-[1100px]:justify-start gap-2.5">
          <BookOpen className="w-5 h-5 shrink-0 text-[#007AFF]" strokeWidth={1.7} />
          <span className="hidden min-[1100px]:block truncate">Zenith</span>
        </h1>
      </div>

      <nav className="flex-1 h-11 flex items-stretch gap-0.5 overflow-hidden sm:block sm:h-auto sm:space-y-1.5 sm:overflow-y-auto px-0 sm:px-2.5">
        <div className="hidden min-[1100px]:block text-[10px] font-medium text-black/35 dark:text-white/35 px-3 pb-2 uppercase tracking-[0.18em]">
          书库
        </div>
        <button
          onClick={() => onChangeView('library')}
          className={cn(
            "flex-1 h-11 sm:w-full sm:h-10 flex items-center justify-center min-[1100px]:justify-start sm:gap-3 px-1 sm:px-3 text-[13px] sm:text-sm rounded-lg transition-colors",
            currentView === 'library' 
              ? "font-semibold text-[#1C1C1E] dark:text-white sm:bg-[#007AFF] sm:text-white sm:font-medium sm:shadow-sm"
              : "font-normal text-black/45 dark:text-white/45 sm:text-black/60 sm:dark:text-white/65 sm:hover:bg-black/[0.045] sm:dark:hover:bg-white/[0.06]"
          )}
          title="所有书籍"
          aria-current={currentView === 'library' ? 'page' : undefined}
        >
          <BookIcon className="hidden sm:block w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="sm:hidden">书架</span>
          <span className="hidden min-[1100px]:block truncate">所有书籍</span>
          <span className={cn(
            "hidden min-[1100px]:block ml-auto py-0.5 px-2 rounded-full text-xs tabular-nums",
            currentView === 'library' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{books.length}</span>
        </button>

        {runtimeCapabilities.webDav && <button
          onClick={() => onChangeView('webdav')}
          className={cn(
            "flex-1 h-11 sm:w-full sm:h-10 flex items-center justify-center min-[1100px]:justify-start sm:gap-3 px-1 sm:px-3 text-[13px] sm:text-sm rounded-lg transition-colors",
            currentView === 'webdav'
              ? "font-semibold text-[#1C1C1E] dark:text-white sm:bg-[#007AFF] sm:text-white sm:font-medium sm:shadow-sm"
              : "font-normal text-black/45 dark:text-white/45 sm:text-black/60 sm:dark:text-white/65 sm:hover:bg-black/[0.045] sm:dark:hover:bg-white/[0.06]"
          )}
          title="WebDAV"
          aria-current={currentView === 'webdav' ? 'page' : undefined}
        >
          <Cloud className="hidden sm:block w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="sm:hidden">云端</span>
          <span className="hidden min-[1100px]:block truncate">WebDAV</span>
        </button>}
        
        <button
          onClick={() => onChangeView('series')}
          className={cn(
            "flex-1 h-11 sm:w-full sm:h-10 flex items-center justify-center min-[1100px]:justify-start sm:gap-3 px-1 sm:px-3 text-[13px] sm:text-sm rounded-lg transition-colors",
            currentView === 'series' 
              ? "font-semibold text-[#1C1C1E] dark:text-white sm:bg-[#007AFF] sm:text-white sm:font-medium sm:shadow-sm"
              : "font-normal text-black/45 dark:text-white/45 sm:text-black/60 sm:dark:text-white/65 sm:hover:bg-black/[0.045] sm:dark:hover:bg-white/[0.06]"
          )}
          title="系列"
          aria-current={currentView === 'series' ? 'page' : undefined}
        >
          <Layers className="hidden sm:block w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span className="sm:hidden">系列</span>
          <span className="hidden min-[1100px]:block truncate">系列</span>
          <span className={cn(
            "hidden min-[1100px]:block ml-auto py-0.5 px-2 rounded-full text-xs tabular-nums",
            currentView === 'series' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{series.length}</span>
        </button>

        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            "flex-1 h-11 sm:hidden flex items-center justify-center px-1 text-[13px] rounded-lg transition-colors",
            currentView === 'settings'
              ? "font-semibold text-[#1C1C1E] dark:text-white"
              : "font-normal text-black/45 dark:text-white/45"
          )}
          title="设置"
          aria-current={currentView === 'settings' ? 'page' : undefined}
        >
          <span>设置</span>
        </button>
      </nav>

      <div className="hidden sm:flex mt-auto h-14 px-2.5 border-t border-black/5 dark:border-white/5 items-center justify-center min-[1100px]:justify-start">
        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            "w-10 h-10 rounded-xl transition-colors flex items-center justify-center",
            currentView === 'settings'
              ? "bg-[#007AFF]/12 text-[#007AFF] dark:bg-white/10 dark:text-white shadow-sm"
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
