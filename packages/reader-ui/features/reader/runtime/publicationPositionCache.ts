import { get, set } from 'idb-keyval';

const CACHE_VERSION = 2;
const CACHE_PREFIX = 'reader:epub-positions:';

export type EpubPositionCount = {
  href: string;
  count: number;
};

type CachedEpubPositions = {
  version: number;
  cacheKey: string;
  counts: EpubPositionCount[];
  complete?: boolean;
  updatedAt: number;
};

export type EpubPositionProgress = {
  counts: EpubPositionCount[];
  complete: boolean;
};

export async function getCachedEpubPositionProgress(resourceId: string, cacheKey: string): Promise<EpubPositionProgress | undefined> {
  const cached = await get<CachedEpubPositions>(cacheId(resourceId));
  if (!cached || (cached.version !== 1 && cached.version !== CACHE_VERSION) || cached.cacheKey !== cacheKey) return undefined;
  if (!Array.isArray(cached.counts) || cached.counts.some((item) => !item.href || !Number.isFinite(item.count))) return undefined;
  // Version 1 was only written after a full scan, so it is safe to migrate as
  // complete. Version 2 also stores interrupted progressive batches.
  return { counts: cached.counts, complete: cached.version === 1 || cached.complete === true };
}

export async function saveCachedEpubPositionProgress(
  resourceId: string,
  cacheKey: string,
  counts: EpubPositionCount[],
  complete: boolean,
) {
  await set(cacheId(resourceId), {
    version: CACHE_VERSION,
    cacheKey,
    counts,
    complete,
    updatedAt: Date.now(),
  } satisfies CachedEpubPositions);
}

function cacheId(resourceId: string) {
  return `${CACHE_PREFIX}${resourceId}`;
}
