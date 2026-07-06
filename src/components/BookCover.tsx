import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import { getBookCover } from '../lib/storage';
import { isTauriApp, toLocalAssetUrl } from '../lib/native';

export function BookCover({
  book,
  className,
  fallbackClassName = '',
  showMeta = false,
  compact = false,
}: {
  book: Book;
  className: string;
  fallbackClassName?: string;
  showMeta?: boolean;
  compact?: boolean;
}) {
  const [cover, setCover] = useState(book.cover);

  useEffect(() => {
    let cancelled = false;
    setCover(book.cover);
    if (book.cover) return;

    const timer = window.setTimeout(() => {
      getBookCover(book.id).then((storedCover) => {
        if (!cancelled && storedCover) setCover(storedCover);
      }).catch((error) => {
        console.warn('Failed to load book cover', error);
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [book.cover, book.id]);

  if (cover) {
    return <img src={coverToSrc(cover)} alt={book.title} className={className} loading="lazy" decoding="async" />;
  }

  return (
    <div className={fallbackClassName || className}>
      <div className={`w-full h-full flex flex-col justify-end relative bg-gradient-to-br from-[#007AFF] to-[#AF52DE] ${compact ? 'p-1.5' : 'p-4'}`}>
        <p className={`text-white font-bold leading-tight drop-shadow-sm ${compact ? 'text-[10px] line-clamp-3' : 'line-clamp-3'}`}>{book.title}</p>
        {showMeta && <p className="text-white/70 text-xs mt-1 line-clamp-1">{book.author}</p>}
      </div>
    </div>
  );
}

function coverToSrc(cover: string) {
  if (/^(data:|blob:|https?:|asset:)/i.test(cover)) return cover;
  return isTauriApp() ? toLocalAssetUrl(cover) : cover;
}
