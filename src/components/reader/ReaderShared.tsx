import React from 'react';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle.mjs';
import { Book, ReaderSeekRequest, ReaderTocItem } from '../../types';

export interface ReaderViewerProps {
  book: Book;
  onProgressChange: (progress: number) => void;
  onToggleChrome: () => void;
  onTocChange: (items: ReaderTocItem[]) => void;
  onCurrentTocChange: (itemId: string | null) => void;
  tocTarget: ReaderTocItem | null;
  seekRequest: ReaderSeekRequest | null;
  onPresentable?: () => void;
}

export function ReaderLoading({ overlay = false }: { overlay?: boolean }) {
  return (
    <div className={`${overlay ? 'absolute inset-0 bg-inherit' : 'h-full w-full'} flex items-center justify-center`}>
      <LoaderCircle className="h-7 w-7 animate-spin text-[#007AFF]" />
    </div>
  );
}

export function ReaderLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="max-w-lg text-sm text-red-600 dark:text-red-400">{message}</div>
      <button
        type="button"
        className="rounded-[5px] bg-[#007AFF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        onClick={onRetry}
      >
        重新加载
      </button>
    </div>
  );
}

export function ReaderPageCounter({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div data-reader-page-counter className="absolute bottom-5 right-5 z-30 text-[11px] font-medium text-black/50 dark:text-white/50">
      {value}
    </div>
  );
}
