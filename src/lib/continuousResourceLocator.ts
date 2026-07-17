import { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';
import { clamp, cssSelector } from './continuousResourceDom';
import { StripRecord } from './continuousResourceStripTypes';
import { normalizeZipPath, stripHash } from './readiumPublicationSupport';

export function buildPositionRanges(publication: ReadiumPublicationLike) {
  const ranges = new Map<string, ReadiumLocatorLike[]>();
  for (const position of publication.positions) {
    // Position hrefs are generated from reading-order hrefs. Normalizing the
    // fragment directly avoids a linear reading-order lookup for every position.
    const href = publication.readingOrder.findWithHref(position.href)?.href
      || normalizeZipPath(stripHash(position.href));
    const range = ranges.get(href) || [];
    range.push(position);
    ranges.set(href, range);
  }
  return ranges;
}

export function locatorForProgression(
  publication: ReadiumPublicationLike,
  positionRanges: Map<string, ReadiumLocatorLike[]>,
  currentLocator: ReadiumLocatorLike,
  href: string,
  progression: number,
) {
  const normalized = publication.readingOrder.findWithHref(href)?.href || href.split('#')[0];
  const range = positionRanges.get(normalized) || [];
  const selected = range[Math.min(range.length - 1, Math.max(0, Math.floor(progression * range.length)))]
    || publication.readingOrder.findWithHref(normalized)?.locator
    || currentLocator;
  return selected.copyWithLocations({ ...selected.locations, progression });
}

export function snapshotResourceLocator(
  publication: ReadiumPublicationLike,
  positionRanges: Map<string, ReadiumLocatorLike[]>,
  currentLocator: ReadiumLocatorLike,
  currentIndex: number,
  scroller: HTMLDivElement,
  records: Map<number, StripRecord>,
) {
  const focus = scroller.scrollTop + 8;
  const record = sortedRecords(records).find((item) => item.wrapper.offsetTop + item.wrapper.offsetHeight > focus)
    || records.get(currentIndex);
  const link = record && publication.readingOrder.items[record.index];
  const doc = record?.iframe.contentDocument;
  if (!record || !link || !doc?.body) return currentLocator;
  const localFocus = focus - record.wrapper.offsetTop;
  const hit = doc.elementFromPoint(Math.max(1, record.iframe.clientWidth * 0.5), clamp(localFocus, 1, Math.max(1, record.height - 1)));
  const element = hit?.closest<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || undefined;
  const progression = clamp(localFocus / Math.max(1, record.height), 0, 1);
  const locator = locatorForProgression(publication, positionRanges, currentLocator, link.href, progression);
  return locator.copyWithLocations({
    ...locator.locations,
    progression,
    cssSelector: element ? cssSelector(element) : undefined,
    zenithViewportY: 8 / Math.max(1, scroller.clientHeight),
  });
}

export async function scrollToResourceLocator(
  publication: ReadiumPublicationLike,
  records: Map<number, StripRecord>,
  scroller: HTMLDivElement,
  locator: ReadiumLocatorLike,
  smooth: boolean,
) {
  const index = indexForHref(publication, locator.href);
  if (index === undefined) return;
  const record = records.get(index);
  if (!record) return;
  await record.loadPromise.catch(() => {});
  const fragments = locator.locations?.fragments as string[] | undefined;
  const fragment = fragments?.[0] || locator.href.split('#')[1];
  const locations = locator.locations as Record<string, unknown> & { getCssSelector?: () => string | undefined };
  const selector = typeof locations.getCssSelector === 'function'
    ? locations.getCssSelector()
    : typeof locations.cssSelector === 'string' ? locations.cssSelector : undefined;
  const doc = record.iframe.contentDocument;
  let element = fragment ? doc?.getElementById(decodeURIComponent(fragment)) : null;
  if (!element && selector) {
    try {
      element = doc?.querySelector(selector) || null;
    } catch {
      // Malformed selectors fall back to the resource progression.
    }
  }
  const progression = typeof locator.locations?.progression === 'number' ? locator.locations.progression : 0;
  const viewportY = typeof locations.zenithViewportY === 'number' ? locations.zenithViewportY : 0;
  const local = element
    ? element.getBoundingClientRect().top - viewportY * scroller.clientHeight
    : progression * record.height - viewportY * scroller.clientHeight;
  scroller.scrollTo({ top: Math.max(0, record.wrapper.offsetTop + local), behavior: smooth ? 'smooth' : 'auto' });
}

export function indexForHref(publication: ReadiumPublicationLike, href?: string) {
  if (!href) return undefined;
  const index = publication.readingOrder.findIndexWithHref(href);
  return index >= 0 ? index : undefined;
}

export function sortedRecords(records: Map<number, StripRecord>) {
  return Array.from(records.values()).sort((a, b) => a.index - b.index);
}
