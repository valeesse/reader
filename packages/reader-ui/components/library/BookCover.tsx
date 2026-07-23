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

  const palette = fallbackPalette(book);

  return (
    <div ref={hostRef} className={fallbackClassName || className}>
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden text-white ${compact ? 'justify-center p-1.5' : 'justify-between p-4 sm:p-5'}`}
        style={{ background: `linear-gradient(145deg, ${palette.start}, ${palette.end})` }}
      >
        <div aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/20 bg-white/10" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-2/3 w-[5px] bg-black/15" />
        {!compact && <div aria-hidden="true" className="relative mx-auto h-px w-10 bg-white/45" />}
        <div className="relative">
          <div aria-hidden="true" className={`${compact ? 'mb-1 h-3 w-3 text-[8px]' : 'mb-3 h-8 w-8 text-sm'} flex items-center justify-center rounded-full bg-white/16 font-semibold ring-1 ring-white/20`}>
            {book.title.trim().slice(0, 1).toLocaleUpperCase() || '书'}
          </div>
          <p className={`font-semibold leading-tight text-white [text-wrap:balance] ${compact ? 'line-clamp-3 text-[9px]' : 'line-clamp-4 text-sm sm:text-base'}`}>
            {book.title}
          </p>
          {showMeta && book.author && (
            <p className="mt-2 line-clamp-1 text-[11px] text-white/68">{book.author}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function coverToSrc(cover: string) {
  if (/^(data:|blob:|https?:|asset:)/i.test(cover)) return cover;
  return readerGateway.fileUrl(cover);
}

const COVER_PALETTES = [
  { start: '#315B6B', end: '#172F38' },
  { start: '#91674B', end: '#493225' },
  { start: '#6C5B7B', end: '#352E43' },
  { start: '#52705B', end: '#26392C' },
  { start: '#80606A', end: '#422E35' },
  { start: '#4D668A', end: '#29394F' },
] as const;

function fallbackPalette(book: Book) {
  let hash = 0;
  const source = `${book.title}:${book.author}:${book.type}`;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return COVER_PALETTES[Math.abs(hash) % COVER_PALETTES.length];
}
