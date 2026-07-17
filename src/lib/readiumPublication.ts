import {
  closeEpubBook,
  NativeEpubBookInfo,
  NativeEpubLink,
  getEpubPositionCounts,
  prefetchEpubResources,
  openEpubBook,
} from './native';
import { getCachedEpubPositionCounts, saveCachedEpubPositionCounts } from './publicationPositionCache';
import { EpubResourceManager } from './epubResourceManager';
import { LinkCollection, ReadiumLink, ReadiumMetadata } from './readiumPublicationModel';
import {
  calculatePositionCounts,
  coarsePositionCounts,
  createPositionsFromCounts,
} from './readiumPositions';
import {
  clamp,
  createLocator,
  normalizeZipPath,
  stripHash,
} from './readiumPublicationSupport';

export type ReadiumLocatorLike = {
  href: string;
  type: string;
  title?: string;
  locations: {
    fragments?: string[];
    progression?: number;
    totalProgression?: number;
    position?: number;
    [key: string]: unknown;
  };
  text?: ReadiumTextLike;
  serialize: () => unknown;
  copyWithLocations: (locations: Record<string, unknown>) => ReadiumLocatorLike;
};

export type ReadiumTextLike = {
  after?: string;
  before?: string;
  highlight?: string;
  serialize: () => Record<string, string>;
};

export type ResourceWindow = {
  startIndex: number;
  endIndex: number;
  centerIndex: number;
  direction: -1 | 0 | 1;
  generation: number;
};

export type ReadiumPublicationLike = {
  metadata: ReadiumMetadata;
  readingOrder: LinkCollection;
  resources: LinkCollection;
  toc: LinkCollection;
  baseURL?: string;
  positions: ReadiumLocatorLike[];
  get: (link: ReadiumLink) => ReadiumResourceLike;
  positionsFromManifest: () => Promise<ReadiumLocatorLike[]>;
  linkWithHref: (href: string) => ReadiumLink | undefined;
  linkWithRel: (rel: string) => ReadiumLink | undefined;
  linksWithRel: (rel: string) => ReadiumLink[];
  getCover: () => ReadiumLink | undefined;
  prefetchAroundHref: (href: string, radius?: number, direction?: -1 | 0 | 1) => Promise<void>;
  prepareContentAroundHref: (href: string, radius?: number, direction?: -1 | 0 | 1) => Promise<void>;
  prepareResourceWindow: (window: ResourceWindow) => Promise<void>;
  locatorAtTextOffset?: (offset: number) => ReadiumLocatorLike;
  locatorAtResourceProgression?: (href: string, progression: number) => ReadiumLocatorLike;
  textLength?: number;
  textRangeForHref?: (href: string) => { start: number; end: number } | undefined;
  advancePrefetchGeneration: () => void;
  contentKey: string;
  refinePositions?: (signal: AbortSignal) => Promise<void>;
  close: () => void;
};

export type ReadiumResourceLike = {
  link: () => Promise<ReadiumLink>;
  length: () => Promise<number | undefined>;
  read: () => Promise<Uint8Array | undefined>;
  readAsString: (signal?: AbortSignal) => Promise<string | undefined>;
  readAsJSON: () => Promise<unknown>;
  readAsXML: () => Promise<Document | undefined>;
  close: () => void;
};

export async function createReadiumPublication(resourceId: string, fallbackTitle: string): Promise<ReadiumPublicationLike> {
  const opened = await openEpubBook(resourceId, fallbackTitle);
  const { book, sessionId, cacheKey } = opened;
  const readingOrder = new LinkCollection(book.readingOrder.map(nativeLinkToReadiumLink));
  const resources = new LinkCollection(book.resources.map(nativeLinkToReadiumLink));
  const toc = new LinkCollection(book.toc.map(nativeLinkToReadiumLink));
  const resourceManager = new EpubResourceManager(resourceId, sessionId);
  const cachedCounts = opened.positionCounts.length > 0
    ? opened.positionCounts
    : await getCachedEpubPositionCounts(resourceId, cacheKey).catch(() => undefined);
  const positions = createPositionsFromCounts(readingOrder.items, cachedCounts || coarsePositionCounts(readingOrder.items));
  let lastPrefetchKey = '';
  let lastPrefetch: Promise<void> = Promise.resolve();
  let prefetchController: AbortController | undefined;
  let windowPreparationController: AbortController | undefined;

  return {
    metadata: new ReadiumMetadata(book.metadata),
    readingOrder,
    resources,
    toc,
    baseURL: undefined,
    positions,
    get: (link) => resourceManager.get(link),
    positionsFromManifest: async () => positions,
    linkWithHref: (href) => readingOrder.findWithHref(href) || resources.findWithHref(href),
    linkWithRel: (rel) => resources.findWithRel(rel),
    linksWithRel: (rel) => resources.filterByRel(rel),
    getCover: () => resources.findWithRel('cover') || resources.items.find((link) => link.mediaType.isBitmap),
    prefetchAroundHref: async (href, radius = 5, direction = 0) => {
      const index = readingOrder.findIndexWithHref(href);
      if (index < 0) return;
      const start = Math.max(0, direction > 0 ? index : index - radius);
      const end = Math.min(readingOrder.items.length, direction < 0 ? index + 1 : index + radius + 1);
      const hrefs = readingOrder.items.slice(start, end).map((link) => link.href);
      const key = hrefs.join('\n');
      if (key === lastPrefetchKey) return lastPrefetch;
      prefetchController?.abort();
      const controller = new AbortController();
      prefetchController = controller;
      lastPrefetchKey = key;
      lastPrefetch = prefetchEpubResources(resourceId, sessionId, hrefs, controller.signal).catch((error) => {
        if (lastPrefetchKey === key) lastPrefetchKey = '';
        if (controller.signal.aborted) return;
        throw error;
      });
      await lastPrefetch;
    },
    prepareContentAroundHref: async (href, radius = 2, direction = 0) => {
      const index = readingOrder.findIndexWithHref(href);
      if (index < 0) return;
      const start = Math.max(0, direction > 0 ? index : index - radius);
      const end = Math.min(readingOrder.items.length, direction < 0 ? index + 1 : index + radius + 1);
      await resourceManager.prepare(orderResourceLinks(readingOrder.items, start, end - 1, index, direction), direction);
    },
    prepareResourceWindow: async (window) => {
      const start = Math.max(0, window.startIndex);
      const end = Math.min(readingOrder.items.length - 1, window.endIndex);
      if (start > end) return;
      const targets = orderResourceLinks(readingOrder.items, start, end, window.centerIndex, window.direction);
      windowPreparationController?.abort();
      const controller = new AbortController();
      windowPreparationController = controller;
      await prefetchEpubResources(resourceId, sessionId, targets.map((link) => link.href), controller.signal);
      if (controller.signal.aborted) return;
      await resourceManager.prepare(targets, window.direction);
    },
    advancePrefetchGeneration: () => {
      prefetchController?.abort();
      prefetchController = undefined;
      windowPreparationController?.abort();
      windowPreparationController = undefined;
      lastPrefetchKey = '';
      resourceManager.advanceGeneration();
    },
    contentKey: `${cacheKey}:epub-content-v2`,
    refinePositions: cachedCounts ? undefined : async (signal) => {
      const counts = await getEpubPositionCounts(resourceId, sessionId, signal)
        .catch((error) => {
          if (signal.aborted) throw error;
          return calculatePositionCounts(readingOrder.items, resourceManager, signal);
        });
      if (signal.aborted) return;
      const refined = createPositionsFromCounts(readingOrder.items, counts);
      for (const tocLink of toc.items) {
        if (signal.aborted) return;
        const fragment = tocLink.locator.locations.fragments?.[0];
        const resourceLink = readingOrder.findWithHref(tocLink.href);
        if (!fragment || !resourceLink) continue;
        try {
          const source = await resourceManager.sourceText(resourceLink);
          const document = new DOMParser().parseFromString(source, 'application/xhtml+xml');
          const element = document.getElementById(fragment);
          if (!element || !document.body) continue;
          const allText = document.body.textContent || '';
          let preceding = 0;
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (element.contains(walker.currentNode)) break;
            preceding += walker.currentNode.textContent?.length || 0;
          }
          const progression = Math.max(0, Math.min(1, preceding / Math.max(1, allText.length)));
          const base = resourceLink.locator;
          refined.push(base.copyWithLocations({
            ...base.locations,
            progression,
            fragments: [fragment],
            htmlIdValue: fragment,
          }));
        } catch {}
      }
      refined.sort((left, right) => {
        const leftIndex = readingOrder.findIndexWithHref(left.href);
        const rightIndex = readingOrder.findIndexWithHref(right.href);
        return leftIndex - rightIndex || (left.locations.progression || 0) - (right.locations.progression || 0);
      });
      refined.forEach((locator, index) => {
        locator.locations.position = index + 1;
        const resourceIndex = readingOrder.findIndexWithHref(locator.href);
        const resourceProgression = locator.locations.progression || 0;
        locator.locations.totalProgression = readingOrder.items.length > 0
          ? (Math.max(0, resourceIndex) + resourceProgression) / readingOrder.items.length
          : 0;
      });
      positions.splice(0, positions.length, ...refined);
      await saveCachedEpubPositionCounts(resourceId, cacheKey, counts);
    },
    close: () => {
      prefetchController?.abort();
      windowPreparationController?.abort();
      resourceManager.close();
      closeEpubBook(resourceId, sessionId).catch(() => {});
    },
  };
}

export function deserializeReadiumLocator(value?: string): ReadiumLocatorLike | undefined {
  if (!value) return undefined;
  try {
    const data = JSON.parse(value) as Partial<ReadiumLocatorLike>;
    if (!data.href || !data.type) return undefined;
    return createLocator({
      href: data.href,
      type: data.type,
      title: data.title,
      locations: data.locations || {},
      text: data.text,
    });
  } catch {
    return undefined;
  }
}

export function serializeReadiumLocator(locator: any) {
  if (typeof locator?.serialize === 'function') {
    return JSON.stringify(locator.serialize());
  }
  return JSON.stringify({
    href: locator.href,
    type: locator.type,
    title: locator.title,
    locations: locator.locations || {},
    text: locator.text,
  });
}

export function progressionFromLocator(locator: any, publication: ReadiumPublicationLike) {
  const totalProgression = locator?.locations?.totalProgression;
  if (typeof totalProgression === 'number') return clamp(totalProgression, 0, 1);
  const total = Math.max(1, publication.positions.length);
  const range = positionRangeForLocator(locator, publication);
  if (!range) return 0;
  const local = clamp(typeof locator?.locations?.progression === 'number' ? locator.locations.progression : 0, 0, 1);
  return clamp((range.first + local * range.count) / total, 0, 1);
}

function orderResourceLinks(
  links: ReadiumLink[], start: number, end: number, center: number, direction: -1 | 0 | 1,
) {
  return links.slice(start, end + 1).sort((left, right) => {
    const leftIndex = links.indexOf(left);
    const rightIndex = links.indexOf(right);
    const leftAhead = direction !== 0 && (leftIndex - center) * direction > 0;
    const rightAhead = direction !== 0 && (rightIndex - center) * direction > 0;
    if (leftAhead !== rightAhead) return leftAhead ? -1 : 1;
    return Math.abs(leftIndex - center) - Math.abs(rightIndex - center);
  });
}

const publicationPositionRanges = new WeakMap<object, Map<string, { first: number; count: number }>>();

export function invalidatePublicationPositionRanges(publication: ReadiumPublicationLike) {
  publicationPositionRanges.delete(publication as object);
}

export function locatorAtProgress(publication: ReadiumPublicationLike, progress: number) {
  const positions = publication.positions;
  if (positions.length === 0) return publication.readingOrder.items[0]?.locator;
  const normalized = clamp(progress, 0, 1);
  if (normalized === 0) {
    const first = positions[0];
    return first.copyWithLocations({ ...first.locations, progression: 0, totalProgression: 0, position: 1 });
  }
  if (normalized === 1) {
    const last = positions[positions.length - 1];
    return last.copyWithLocations({
      ...last.locations,
      progression: 1,
      totalProgression: 1,
      position: positions.length,
    });
  }
  const absolute = normalized * positions.length;
  const selected = positions[Math.min(positions.length - 1, Math.floor(absolute))];
  const range = positionRangeForLocator(selected, publication);
  if (!range) return selected;
  const local = clamp((absolute - range.first) / range.count, 0, 1);
  return selected.copyWithLocations({
    ...selected.locations,
    progression: local,
    totalProgression: normalized,
    position: Math.min(positions.length, Math.floor(absolute) + 1),
  });
}

export function pageFromLocator(locator: any, publication: ReadiumPublicationLike) {
  const positions = publication.positions;
  const total = Math.max(1, positions.length);
  const explicitPosition = locator?.locations?.position;
  if (typeof explicitPosition === 'number') return { current: Math.max(1, Math.min(total, Math.round(explicitPosition))), total };
  const range = positionRangeForLocator(locator, publication);
  if (!range) return { current: 1, total };
  const local = clamp(typeof locator?.locations?.progression === 'number' ? locator.locations.progression : 0, 0, 1);
  const localIndex = Math.min(range.count - 1, Math.floor(local * range.count));
  return { current: range.first + localIndex + 1, total };
}

function positionRangeForLocator(locator: any, publication: ReadiumPublicationLike) {
  let ranges = publicationPositionRanges.get(publication as object);
  if (!ranges) {
    ranges = new Map();
    publication.positions.forEach((position, index) => {
      const href = publication.readingOrder.findWithHref(position.href)?.href
        || normalizeZipPath(stripHash(position.href));
      const existing = ranges?.get(href);
      if (existing) existing.count += 1;
      else ranges?.set(href, { first: index, count: 1 });
    });
    publicationPositionRanges.set(publication as object, ranges);
  }
  const normalizedHref = publication.readingOrder.findWithHref(locator?.href || '')?.href
    || normalizeZipPath(stripHash(`${locator?.href || ''}`));
  return ranges.get(normalizedHref);
}

export { LinkCollection, ReadiumLink } from './readiumPublicationModel';

function nativeLinkToReadiumLink(link: NativeEpubLink) {
  return new ReadiumLink({
    href: link.href,
    type: link.mediaType,
    title: link.title,
    rels: new Set(link.rels || []),
    properties: new Set(link.properties || []),
  });
}

export { createLocator } from './readiumPublicationSupport';
