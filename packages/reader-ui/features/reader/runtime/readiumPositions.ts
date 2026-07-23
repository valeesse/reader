import { EpubPositionCount } from './publicationPositionCache';
import { EpubResourceManager } from './epubResourceManager';
import { ReadiumLink } from './readiumPublicationModel';
import { createLocator, normalizeZipPath, stripHash } from './readiumPublicationSupport';

const POSITION_CHARS = 1024;

export async function calculatePositionCounts(
  readingOrder: ReadiumLink[],
  resourceManager: EpubResourceManager,
  signal: AbortSignal,
): Promise<EpubPositionCount[]> {
  const counts: EpubPositionCount[] = [];
  const worker = new Worker(new URL('./epubPosition.worker.ts', import.meta.url), { type: 'module' });
  try {
    for (const link of readingOrder) {
      if (signal.aborted) return counts;
      try {
        const source = await resourceManager.sourceText(link);
        const textLength = source ? await countTextInWorker(worker, source, signal) : 0;
        counts.push({ href: link.href, count: Math.max(1, Math.ceil(textLength / POSITION_CHARS)) });
      } catch {
        if (signal.aborted) return counts;
        counts.push({ href: link.href, count: 1 });
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    }
  } finally {
    worker.terminate();
  }
  return counts;
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
