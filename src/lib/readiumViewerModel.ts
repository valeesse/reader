import { AppSettings, ReaderTocItem } from '../types';
import {
  locatorAtProgress,
  ReadiumLocatorLike,
  ReadiumPublicationLike,
} from './readiumPublication';
import { readerThemeColors, readiumFontScale } from './readerDocumentStyles';

export function toTocItems(publication: ReadiumPublicationLike): ReaderTocItem[] {
  const source = publication.toc.items.length > 0 ? publication.toc.items : publication.readingOrder.items;
  return source.map((link, index) => ({
    id: `${link.href}-${index}`,
    title: link.title || `章节 ${index + 1}`,
    href: link.href,
    index,
  }));
}

export function currentTocItemId(
  locator: { href: string; locations?: { progression?: number } },
  publication: ReadiumPublicationLike,
  document?: Document,
) {
  const items = toTocItems(publication);
  if (items.length === 0) return null;
  const href = publication.readingOrder.findWithHref(locator.href)?.href || locator.href.split('#')[0];
  const resourceIndex = publication.readingOrder.findIndexWithHref(href);
  let current = items[0];
  for (const item of items) {
    if (!item.href) continue;
    const itemHref = publication.readingOrder.findWithHref(item.href)?.href || item.href.split('#')[0];
    const itemResourceIndex = publication.readingOrder.findIndexWithHref(itemHref);
    if (itemResourceIndex > resourceIndex) break;
    if (itemResourceIndex === resourceIndex && document) {
      const fragment = item.href.split('#')[1];
      const element = fragment ? document.getElementById(safeDecodeFragment(fragment)) : undefined;
      const progression = element ? elementProgression(element, document) : 0;
      if (progression > (locator.locations?.progression ?? 0) + 0.02) continue;
    }
    current = item;
  }
  return current.id;
}

function safeDecodeFragment(fragment: string) {
  try { return decodeURIComponent(fragment); } catch { return fragment; }
}

function elementProgression(element: HTMLElement, document: Document) {
  const scroller = document.scrollingElement;
  const rect = element.getBoundingClientRect();
  if (!scroller) return 0;
  if (scroller.scrollWidth > document.defaultView!.innerWidth * 1.25) {
    return Math.max(0, Math.min(1, (Math.abs(scroller.scrollLeft) + rect.left) / Math.max(1, scroller.scrollWidth)));
  }
  return Math.max(0, Math.min(1, (scroller.scrollTop + rect.top) / Math.max(1, scroller.scrollHeight)));
}

export function createReadiumPreferences(settings: AppSettings, bookType: 'epub' | 'txt') {
  const columns = isContinuousScroll(settings) ? null : settings.pageMode === 'double' ? 2 : 1;
  return {
    backgroundColor: readerThemeColors(settings.theme).background,
    textColor: readerThemeColors(settings.theme).text,
    fontFamily: settings.fontFamily,
    fontSize: readiumFontScale(settings.fontSize, bookType, settings.fontFamily),
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    columnCount: columns,
    pageGutter: 0,
    scroll: isContinuousScroll(settings),
    scrollPaddingTop: 0,
    scrollPaddingRight: 0,
    scrollPaddingBottom: 0,
    scrollPaddingLeft: 0,
    optimalLineLength: null,
    minimalLineLength: null,
    maximalLineLength: null,
  };
}

export function createReadiumDefaults(settings: AppSettings, bookType: 'epub' | 'txt') {
  return { ...createReadiumPreferences(settings, bookType) };
}

export function legacyProgressPosition(progress: number | undefined, publication: ReadiumPublicationLike) {
  return progress === undefined || publication.positions.length === 0
    ? undefined
    : locatorAtProgress(publication, progress);
}

export function normalizeLocatorToPublicationPosition(
  locator: ReadiumLocatorLike | undefined,
  publication: ReadiumPublicationLike,
) {
  if (!locator) return undefined;
  if (typeof locator.locations?.position === 'number') return locator;
  const normalizedHref = publication.readingOrder.findWithHref(locator.href)?.href || locator.href.split('#')[0];
  const range = publication.positions.filter((position) => {
    const href = publication.readingOrder.findWithHref(position.href)?.href || position.href.split('#')[0];
    return href === normalizedHref;
  });
  if (range.length === 0) return publication.positions[0];
  const progression = typeof locator.locations?.progression === 'number' ? locator.locations.progression : 0;
  const selected = range[Math.min(range.length - 1, Math.max(0, Math.floor(progression * range.length)))];
  return selected.copyWithLocations({ ...locator.locations, ...selected.locations, progression });
}

export function isContinuousScroll(settings: AppSettings) {
  return settings.pageTurnAnimation === 'scroll';
}
