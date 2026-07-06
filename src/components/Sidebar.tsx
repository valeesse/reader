import React from 'react';
import { Book as BookIcon, Folder, Settings as SettingsIcon, BookOpen, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store/AppStore';

interface SidebarProps {
  currentView: 'library' | 'series' | 'settings';
  onChangeView: (view: 'library' | 'series' | 'settings') => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const { books, series } = useAppContext();

  return (
    <aside className="w-64 h-full rounded-2xl glass-surface flex flex-col pt-6 pb-2 transition-colors overflow-hidden">
      
      <div className="px-6 pb-6">
        <h1 className="text-xl font-bold tracking-tight text-[#1C1C1E] dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#007AFF]" />
          Zenith
        </h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3">
        <div className="text-[11px] font-semibold text-black/40 dark:text-white/40 px-3 pb-1 uppercase tracking-wider">
          书库
        </div>
        <button
          onClick={() => onChangeView('library')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors",
            currentView === 'library' 
              ? "bg-[#007AFF] text-white shadow-sm" 
              : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          <BookIcon className="w-4 h-4" />
          所有书籍
          <span className={cn(
            "ml-auto py-0.5 px-2 rounded-full text-xs font-mono",
            currentView === 'library' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{books.length}</span>
        </button>
        
        <button
          onClick={() => onChangeView('series')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors",
            currentView === 'series' 
              ? "bg-[#007AFF] text-white shadow-sm" 
              : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          <Layers className="w-4 h-4" />
          系列
          <span className={cn(
            "ml-auto py-0.5 px-2 rounded-full text-xs font-mono",
            currentView === 'series' ? "bg-black/20" : "bg-black/5 dark:bg-white/10"
          )}>{series.length}</span>
        </button>
      </nav>

      <div className="mt-auto h-12 px-3 border-t border-black/5 dark:border-white/5 flex items-center">
        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            "w-10 h-10 rounded-xl transition-colors flex items-center justify-center",
            currentView === 'settings' 
              ? "bg-black/10 dark:bg-white/10 text-black dark:text-white shadow-sm" 
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
