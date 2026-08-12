import React from 'react';
import { Book, ReaderSeekRequest, ReaderTocItem } from '../../../types';

export interface ReaderViewerProps {
  book: Book;
  onClose: () => void;
  onProgressChange: (progress: number) => void;
  onToggleChrome: () => void;
  onTocChange: (items: ReaderTocItem[]) => void;
  onCurrentTocChange: (itemId: string | null) => void;
  tocTarget: ReaderTocItem | null;
  seekRequest: ReaderSeekRequest | null;
  onPresentable?: () => void;
}

export function ReaderLoadError({
  message,
  onClose,
  onRetry,
}: {
  message: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="max-w-lg text-sm text-red-600 dark:text-red-400">{message}</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-[5px] bg-black/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          返回书库
        </button>
        <button
          type="button"
          className="rounded-[5px] bg-[#007AFF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          onClick={(event) => {
            event.stopPropagation();
            onRetry();
          }}
        >
          重新加载
        </button>
      </div>
    </div>
  );
}

export function ReaderPageCounter({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div data-reader-page-counter className="pointer-events-none absolute bottom-5 right-5 z-30 leading-4 text-[11px] font-medium text-black/50 dark:text-white/50">
      {value}
    </div>
  );
}
