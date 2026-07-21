import { get, set } from 'idb-keyval';

const CACHE_VERSION = 1;
const CACHE_PREFIX = 'reader:epub-positions:';

export type EpubPositionCount = {
  href: string;
  count: number;
};

type CachedEpubPositions = {
  version: number;
  cacheKey: string;
  counts: EpubPositionCount[];
  updatedAt: number;
};

export async function getCachedEpubPositionCounts(resourceId: string, cacheKey: string) {
  const cached = await get<CachedEpubPositions>(cacheId(resourceId));
  if (!cached || cached.version !== CACHE_VERSION || cached.cacheKey !== cacheKey) return undefined;
  if (!Array.isArray(cached.counts) || cached.counts.some((item) => !item.href || !Number.isFinite(item.count))) return undefined;
  return cached.counts;
}

export async function saveCachedEpubPositionCounts(resourceId: string, cacheKey: string, counts: EpubPositionCount[]) {
  await set(cacheId(resourceId), {
    version: CACHE_VERSION,
    cacheKey,
    counts,
    updatedAt: Date.now(),
  } satisfies CachedEpubPositions);
}

function cacheId(resourceId: string) {
  return `${CACHE_PREFIX}${resourceId}`;
}
