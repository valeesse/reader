import React, { useEffect, useRef, useState } from 'react';
import { Book } from '../../types';
import { readerGateway, resolveBookCover } from '../../lib/backend';

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
  const hostRef = useRef<HTMLDivElement>(null);
  const [cover, setCover] = useState(book.cover);
  const [visible, setVisible] = useState(false);
  const attemptedLazyLoadRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '320px 0px' });
    observer.observe(host);
    return () => observer.disconnect();
  }, [book.id]);

  useEffect(() => {
    let cancelled = false;
    setCover(book.cover);
    attemptedLazyLoadRef.current = false;
    if (book.cover || book.type !== 'epub' || !visible) return;
    attemptedLazyLoadRef.current = true;
    void resolveBookCover(book.resourceId).then((resolvedCover) => {
      if (!cancelled && resolvedCover) setCover(resolvedCover);
    }).catch(() => {
      // A malformed EPUB may legitimately have no cover. The title fallback is
      // intentional and should not flood the startup console.
    });

    return () => {
      cancelled = true;
    };
  }, [book.cover, book.id, book.resourceId, book.type, visible]);

  if (cover) {
    return (
      <div ref={hostRef} className="contents">
        <img
          src={coverToSrc(cover)}
          alt={book.title}
          className={className}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (attemptedLazyLoadRef.current || book.type !== 'epub') {
              setCover(undefined);
              return;
            }
            attemptedLazyLoadRef.current = true;
            void resolveBookCover(book.resourceId).then((resolvedCover) => {
              if (resolvedCover && resolvedCover !== cover) setCover(resolvedCover);
              else setCover(undefined);
            }).catch(() => setCover(undefined));
          }}
        />
      </div>
    );
  }

  return (
    <div ref={hostRef} className={fallbackClassName || className}>
      <div className={`w-full h-full flex flex-col justify-end relative bg-[#E9E7E1] dark:bg-[#30352f] ${compact ? 'p-1.5' : 'p-4'}`}>
        <p className={`text-[#3e493f] dark:text-[#edf0e9] font-semibold leading-tight ${compact ? 'text-[10px] line-clamp-3' : 'line-clamp-3'}`}>{book.title}</p>
        {showMeta && <p className="text-[#3e493f]/60 dark:text-white/55 text-xs mt-1 line-clamp-1">{book.author}</p>}
      </div>
    </div>
  );
}

function coverToSrc(cover: string) {
  if (/^(data:|blob:|https?:|asset:)/i.test(cover)) return cover;
  return readerGateway.fileUrl(cover);
}
