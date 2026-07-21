import type { ReadiumPublicationLike } from './readiumPublication';

type ResourcePages = { count: number; positionCount: number };
type PageMapState = { layoutKey: string; resources: Map<string, ResourcePages> };
const states = new WeakMap<object, PageMapState>();
const positionCounts = new WeakMap<object, Map<string, number>>();

export function updatePublicationPageMap(
  publication: ReadiumPublicationLike,
  href: string,
  page: number,
  pageCount: number,
  layoutKey: string,
) {
  let state = states.get(publication as object);
  if (!state || state.layoutKey !== layoutKey) {
    state = { layoutKey, resources: new Map() };
    states.set(publication as object, state);
  }
  const normalized = publication.readingOrder.findWithHref(href)?.href || href.split('#')[0];
  state.resources.set(normalized, {
    count: Math.max(1, pageCount),
    positionCount: resourcePositionCount(publication, normalized),
  });
  const measured = Array.from(state.resources.values());
  const pagesPerPosition = measured.reduce((sum, item) => sum + item.count, 0)
    / Math.max(1, measured.reduce((sum, item) => sum + item.positionCount, 0));
  let current = 0;
  let total = 0;
  for (const link of publication.readingOrder.items) {
    const known = state.resources.get(link.href);
    const positions = resourcePositionCount(publication, link.href);
    const count = known?.count || Math.max(1, Math.round(positions * pagesPerPosition));
    if (link.href === normalized) current = total + Math.max(1, Math.min(count, page));
    total += count;
  }
  return {
    current: Math.max(1, current),
    total: Math.max(1, total),
    estimated: state.resources.size < publication.readingOrder.items.length,
  };
}

export function invalidatePublicationPageMap(publication?: ReadiumPublicationLike | null) {
  if (publication) { states.delete(publication as object); positionCounts.delete(publication as object); }
}

function resourcePositionCount(publication: ReadiumPublicationLike, href: string) {
  const textRange = publication.textRangeForHref?.(href);
  if (textRange) return Math.max(1, textRange.end - textRange.start);
  let counts = positionCounts.get(publication as object);
  if (!counts) {
    counts = new Map();
    for (const position of publication.positions) {
      const normalized = publication.readingOrder.findWithHref(position.href)?.href || position.href.split('#')[0];
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
    positionCounts.set(publication as object, counts);
  }
  return Math.max(1, counts.get(href) || 0);
}

export function chapterPageFromProgress(
  publication: ReadiumPublicationLike,
  locatorProgress: number,
  publicationPage: { current: number; total: number; estimated?: boolean },
): { current: number; total: number } {
  const toc = publication.toc.items;
  if (toc.length === 0) return { current: publicationPage.current, total: publicationPage.total };
  const starts = toc.map((link) => {
    const totalProgression = link.locator.locations.totalProgression;
    if (typeof totalProgression === 'number') return totalProgression;
    const index = publication.readingOrder.findIndexWithHref(link.href);
    return Math.max(0, index) / Math.max(1, publication.readingOrder.items.length);
  });
  let chapter = 0;
  while (chapter + 1 < starts.length && starts[chapter + 1] <= locatorProgress) chapter += 1;
  const start = starts[chapter] || 0;
  const end = starts[chapter + 1] ?? 1;
  const total = Math.max(1, Math.round((end - start) * publicationPage.total));
  const current = Math.max(1, Math.min(total, Math.floor((locatorProgress - start) * publicationPage.total) + 1));
  return { current, total };
}
