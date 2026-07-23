import React from 'react';
import { Book as BookIcon, Cloud, Settings as SettingsIcon, BookOpen, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../store/AppStore';
import { runtimeCapabilities } from '../../lib/backend';

export type LibraryView = 'library' | 'webdav' | 'series' | 'settings';

interface SidebarProps {
  currentView: LibraryView;
  onChangeView: (view: LibraryView) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const { books, series } = useAppContext();
  const items = [
    { view: 'library' as const, label: '所有书籍', mobileLabel: '书架', icon: BookIcon, count: books.length },
    ...(runtimeCapabilities.librarySources.includes('webdav')
      ? [{ view: 'webdav' as const, label: 'WebDAV', mobileLabel: '云端', icon: Cloud }]
      : []),
    { view: 'series' as const, label: '系列', mobileLabel: '系列', icon: Layers, count: series.length },
  ];

  return (
    <aside className="app-sidebar fixed inset-x-2 bottom-2 z-40 flex h-[calc(3.75rem+env(safe-area-inset-bottom))] shrink-0 flex-row overflow-hidden rounded-2xl glass-surface px-1.5 pb-[env(safe-area-inset-bottom)] sm:static sm:h-full sm:flex-col sm:rounded-2xl sm:px-0 sm:pb-2 sm:pt-5">
      <div className="hidden px-3 pb-7 sm:block min-[1100px]:px-5">
        <h1 className="flex h-9 items-center justify-center gap-2.5 text-lg font-semibold text-[#1C1C1E] dark:text-[#f0f0eb] min-[1100px]:justify-start">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#087DF1]/10">
            <BookOpen className="h-5 w-5 shrink-0 text-[#087DF1]" strokeWidth={1.8} />
          </span>
          <span className="hidden truncate min-[1100px]:block">Zenith</span>
        </h1>
      </div>

      <nav aria-label="主导航" className="flex h-full flex-1 items-stretch gap-1 sm:block sm:h-auto sm:space-y-1.5 sm:overflow-y-auto sm:px-2.5">
        <div className="hidden px-3 pb-2 text-[11px] font-semibold text-black/50 dark:text-white/50 min-[1100px]:block">
          我的阅读
        </div>
        {items.map((item) => {
          const active = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={cn(
                'group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors sm:h-10 sm:w-full sm:flex-row sm:gap-3 sm:px-3 sm:text-sm min-[1100px]:justify-start',
                active
                  ? 'bg-[#087DF1]/12 text-[#087DF1] dark:bg-[#0A84FF]/20 dark:text-[#68B3FF] sm:bg-[#087DF1] sm:text-white sm:shadow-sm sm:dark:bg-[#0A84FF] sm:dark:text-white'
                  : 'text-black/60 hover:bg-black/[0.045] hover:text-black dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white',
              )}
              title={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-[19px] w-[19px] shrink-0" strokeWidth={1.8} />
              <span className="sm:hidden">{item.mobileLabel}</span>
              <span className="hidden truncate min-[1100px]:block">{item.label}</span>
              {typeof item.count === 'number' && (
                <span className={cn(
                  'ml-auto hidden rounded-full px-2 py-0.5 text-xs tabular-nums min-[1100px]:block',
                  active ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10',
                )}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium transition-colors sm:hidden',
            currentView === 'settings'
              ? 'bg-[#087DF1]/12 text-[#087DF1] dark:bg-[#0A84FF]/20 dark:text-[#68B3FF]'
              : 'text-black/60 dark:text-white/60',
          )}
          title="偏好设置"
          aria-current={currentView === 'settings' ? 'page' : undefined}
        >
          <SettingsIcon className="h-[19px] w-[19px]" strokeWidth={1.8} />
          <span>设置</span>
        </button>
      </nav>

      <div className="mt-auto hidden h-14 items-center justify-center border-t border-black/[0.06] px-2.5 dark:border-white/[0.06] sm:flex min-[1100px]:justify-start">
        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors min-[1100px]:w-full min-[1100px]:justify-start min-[1100px]:gap-3 min-[1100px]:px-3',
            currentView === 'settings'
              ? 'bg-[#087DF1]/12 text-[#087DF1] dark:bg-white/10 dark:text-white'
              : 'text-black/55 hover:bg-black/5 hover:text-black dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white',
          )}
          title="偏好设置"
          aria-current={currentView === 'settings' ? 'page' : undefined}
        >
          <SettingsIcon className="h-5 w-5 shrink-0" />
          <span className="hidden text-sm font-medium min-[1100px]:block">偏好设置</span>
        </button>
      </div>
    </aside>
  );
}
