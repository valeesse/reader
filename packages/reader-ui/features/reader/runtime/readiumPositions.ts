import { EpubPositionCount } from './publicationPositionCache';
import { EpubResourceManager } from './epubResourceManager';
import { ReadiumLink } from './readiumPublicationModel';
import { createLocator, normalizeZipPath, stripHash } from './readiumPublicationSupport';

const POSITION_CHARS = 1024;
const PROGRESSIVE_POSITION_BATCH_SIZE = 12;

export type PositionCountBatch = {
  counts: EpubPositionCount[];
  complete: boolean;
};

export async function calculatePositionCountBatch(
  readingOrder: ReadiumLink[],
  resourceManager: EpubResourceManager,
  existingCounts: EpubPositionCount[],
  signal: AbortSignal,
  batchSize = PROGRESSIVE_POSITION_BATCH_SIZE,
): Promise<PositionCountBatch> {
  const countsByHref = new Map(existingCounts.map((item) => [normalizeZipPath(stripHash(item.href)), item]));
  const pending = readingOrder.filter((link) => !countsByHref.has(normalizeZipPath(stripHash(link.href))));
  if (pending.length === 0) return { counts: orderedCounts(readingOrder, countsByHref), complete: true };
  const worker = new Worker(new URL('./epubPosition.worker.ts', import.meta.url), { type: 'module' });
  try {
    for (const link of pending.slice(0, Math.max(1, batchSize))) {
      if (signal.aborted) break;
      let count = 1;
      try {
        const source = await resourceManager.sourceText(link, signal);
        const textLength = source ? await countTextInWorker(worker, source, signal) : 0;
        count = Math.max(1, Math.ceil(textLength / POSITION_CHARS));
      } catch {
        if (signal.aborted) break;
      }
      countsByHref.set(normalizeZipPath(stripHash(link.href)), { href: link.href, count });
    }
  } finally {
    worker.terminate();
  }
  const counts = orderedCounts(readingOrder, countsByHref);
  return { counts, complete: counts.length === readingOrder.length };
}

function orderedCounts(readingOrder: ReadiumLink[], countsByHref: Map<string, EpubPositionCount>) {
  return readingOrder.flatMap((link) => {
    const count = countsByHref.get(normalizeZipPath(stripHash(link.href)));
    return count ? [{ href: link.href, count: Math.max(1, Math.round(count.count)) }] : [];
  });
}

function countTextInWorker(worker: Worker, source: string, signal: AbortSignal) {
  return new Promise<number>((resolve, reject) => {
    const abort = () => reject(new DOMException('Position refinement aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<number>) => {
      signal.removeEventListener('abort', abort);
      resolve(event.data);
    };
    worker.onerror = (event) => {
      signal.removeEventListener('abort', abort);
      reject(event.error || new Error(event.message));
    };
    worker.postMessage(source);
  });
}

export function coarsePositionCounts(readingOrder: ReadiumLink[]): EpubPositionCount[] {
  return readingOrder.map((link) => ({ href: link.href, count: 1 }));
}

export function createPositionsFromCounts(readingOrder: ReadiumLink[], rawCounts: EpubPositionCount[]) {
  const countByHref = new Map(rawCounts.map((item) => [
    normalizeZipPath(stripHash(item.href)),
    Math.max(1, Math.round(item.count)),
  ]));
  const counts = readingOrder.map((link) => countByHref.get(normalizeZipPath(stripHash(link.href))) || 1);
  const total = Math.max(1, counts.reduce((sum, count) => sum + count, 0));
  let position = 0;
  return readingOrder.flatMap((link, linkIndex) => Array.from({ length: counts[linkIndex] }, (_, localIndex) => {
    const current = position++;
    return createLocator({
      href: link.href,
      type: link.type,
      title: link.title,
      locations: {
        progression: localIndex / counts[linkIndex],
        totalProgression: total > 1 ? current / (total - 1) : 0,
        position: current + 1,
      },
    });
  }));
}
