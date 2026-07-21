import { closeTxtBook, NativeTxtBookInfo, openTxtBook, readTxtWindow } from '../lib/native';
import {
  createLocator,
  LinkCollection,
  ReadiumLink,
  ReadiumLocatorLike,
  ReadiumPublicationLike,
  ReadiumResourceLike,
} from './readiumPublication';
import { adaptiveReaderBudget, estimateStringBytes, ReaderContentCache, ReaderWorkScheduler } from './readerCacheCoordinator';

// Transport slices bound native I/O independently from the larger render band.
const TXT_TARGET_RESOURCE_CHARS = 12 * 1024;
const TXT_NATURAL_BOUNDARY_TOLERANCE = 12 * 1024;
// Positions are navigation samples, not rendered pages. A 4K interval keeps
// progress/seek resolution well below one resource while avoiding thousands
// of locator objects on the synchronous book-open path.
const TXT_POSITION_CHARS = 4 * 1024;
const TXT_RESOURCE_CACHE_LIMIT = 12;
const TXT_RESOURCE_CACHE_BYTES = adaptiveReaderBudget(24 * 1024 * 1024, 12 * 1024 * 1024);
const TXT_RENDER_BAND_CHARS = 48 * 1024;

type TxtChunk = {
  href: string;
  start: number;
  end: number;
  title: string;
};

export async function createTxtReadiumPublication(
  resourceId: string,
  title: string,
  author?: string,
): Promise<ReadiumPublicationLike> {
  const info = await openTxtBook(resourceId);
  const chunks = createTxtChunks(info);
  const readingOrder = new LinkCollection(chunks.map((chunk) => new ReadiumLink({
    href: chunk.href,
    type: 'application/xhtml+xml',
    title: chunk.title,
  })));
  const toc = new LinkCollection(info.chapters.map((chapter) => {
    const chunk = chunkForPosition(chunks, chapter.startIndex);
    const progression = (chapter.startIndex - chunk.start) / Math.max(1, chunk.end - chunk.start);
    return new ReadiumLink({
      href: `${chunk.href}#txt-${chapter.startIndex}`,
      type: 'application/xhtml+xml',
      title: chapter.title,
      properties: {
        locatorLocations: {
          txtOffset: chapter.startIndex,
          progression,
          totalProgression: chapter.startIndex / Math.max(1, info.totalChars),
          htmlIdValue: `txt-${chapter.startIndex}`,
        },
      },
    });
  }));
  const manager = new TxtResourceManager(resourceId, info, chunks);
  const positions = createTxtPositions(chunks, info);
  const locatorAtTextOffset = (offset: number) => txtLocatorAtOffset(chunks, positions, info.totalChars, offset);

  return {
    metadata: createTxtMetadata(title, author),
    readingOrder,
    resources: new LinkCollection([]),
    toc,
    positions,
    get: (link) => manager.get(link),
    positionsFromManifest: async () => positions,
    linkWithHref: (href) => readingOrder.findWithHref(href),
    linkWithRel: () => undefined,
    linksWithRel: () => [],
    getCover: () => undefined,
    prefetchAroundHref: async (href, radius = 2, direction = 0) => manager.prefetch(href, radius, direction),
    prepareContentAroundHref: async (href, radius = 2, direction = 0) => manager.prefetch(href, radius, direction),
    prepareResourceWindow: async (window) => manager.prefetchWindow(window.startIndex, window.endIndex, window.centerIndex, window.direction),
    locatorAtTextOffset,
    locatorAtResourceProgression: (href, progression) => {
      const chunk = chunks.find((item) => item.href === href.split('#')[0]) || chunks[0];
      return locatorAtTextOffset(chunk.start + Math.max(0, Math.min(1, progression)) * (chunk.end - chunk.start));
    },
    textLength: info.totalChars,
    textRangeForHref: (href) => {
      const chunk = chunks.find((item) => item.href === href.split('#')[0]);
      return chunk ? { start: chunk.start, end: chunk.end } : undefined;
    },
    advancePrefetchGeneration: () => manager.advanceGeneration(),
    contentKey: `${resourceId}:${info.totalBytes}:${info.totalChars}:txt-content-v7`,
    close: () => {
      manager.close();
      closeTxtBook(resourceId, info.sessionId).catch(() => {});
    },
  };
}

export function createTxtChunks(info: NativeTxtBookInfo): TxtChunk[] {
  const chunks: TxtChunk[] = [];
  const chapters = info.chapters;
  const chapterBreaks = chapters.map((chapter) => chapter.startIndex);
  let start = 0;
  while (start < info.totalChars || chunks.length === 0) {
    const ideal = Math.min(info.totalChars, start + TXT_RENDER_BAND_CHARS);
    const minimum = Math.min(info.totalChars, start + TXT_RENDER_BAND_CHARS - TXT_NATURAL_BOUNDARY_TOLERANCE);
    const maximum = Math.min(info.totalChars, start + TXT_RENDER_BAND_CHARS + TXT_NATURAL_BOUNDARY_TOLERANCE);
    // A paginated Readium resource cannot flow its remaining page into the
    // next iframe. Prefer a chapter boundary so an artificial render band
    // never leaves a half-empty page in the middle of a chapter.
    const chapterBoundary = boundaryNear(
      chapterBreaks, ideal, minimum, maximum, start,
    );
    const paragraphBoundary = boundaryNear(info.lineBreaks, ideal, minimum, maximum, start)
      ?? info.lineBreaks[lowerBound(info.lineBreaks, ideal)];
    const end = Math.max(start, chapterBoundary ?? paragraphBoundary ?? info.totalChars);
    const chapter = chapters[Math.max(0, lowerBoundChapter(chapters, start + 1) - 1)]
      || chapters[lowerBoundChapter(chapters, end)];
    chunks.push({
      href: `txt/r-${String(start).padStart(12, '0')}.xhtml`,
      start,
      end,
      title: chapter?.title || `文本 ${chunks.length + 1}`,
    });
    if (end >= info.totalChars) break;
    start = end;
  }
  return chunks;
}

function boundaryNear(values: number[], ideal: number, minimum: number, maximum: number, start: number) {
  const after = lowerBound(values, ideal);
  const forward = values[after];
  if (forward !== undefined && forward > start && forward <= maximum) return forward;
  const backward = values[Math.max(0, after - 1)];
  if (backward !== undefined && backward > start && backward >= minimum) return backward;
  return undefined;
}

function lowerBound(values: number[], target: number) {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (values[middle] < target) low = middle + 1;
    else high = middle;
  }
  return low;
}

function lowerBoundChapter(chapters: NativeTxtBookInfo['chapters'], position: number) {
  let low = 0;
  let high = chapters.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (chapters[middle].startIndex < position) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function createTxtPositions(chunks: TxtChunk[], info: NativeTxtBookInfo) {
  const offsets = new Set<number>([0, info.totalChars]);
  for (let offset = 0; offset < info.totalChars; offset += TXT_POSITION_CHARS) offsets.add(offset);
  for (const chunk of chunks) { offsets.add(chunk.start); offsets.add(chunk.end); }
  for (const chapter of info.chapters) offsets.add(chapter.startIndex);
  const ordered = Array.from(offsets).filter((offset) => offset >= 0 && offset <= info.totalChars).sort((a, b) => a - b);
  return ordered.map((absolute, index) => {
    const chunk = chunkForPosition(chunks, absolute);
    const chunkLength = Math.max(1, chunk.end - chunk.start);
    return createLocator({
      href: chunk.href,
      type: 'application/xhtml+xml',
      title: chunk.title,
      locations: {
        progression: Math.min(1, (absolute - chunk.start) / chunkLength),
        totalProgression: absolute / Math.max(1, info.totalChars),
        position: index + 1,
        txtOffset: absolute,
      },
    });
  });
}

function txtLocatorAtOffset(chunks: TxtChunk[], positions: ReadiumLocatorLike[], totalChars: number, value: number) {
  const offset = Math.max(0, Math.min(totalChars, Math.round(value)));
  const chunk = chunkForPosition(chunks, offset);
  let low = 0;
  let high = positions.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (Number(positions[middle].locations.txtOffset) < offset) low = middle + 1;
    else high = middle;
  }
  const exact = Number(positions[Math.min(positions.length - 1, low)]?.locations.txtOffset) === offset;
  const positionIndex = exact ? low : Math.max(0, low - 1);
  const sample = positions[Math.min(positions.length - 1, positionIndex)];
  return createLocator({
    href: chunk.href,
    type: 'application/xhtml+xml',
    title: chunk.title,
    locations: {
      ...(sample?.locations || {}),
      progression: (offset - chunk.start) / Math.max(1, chunk.end - chunk.start),
      totalProgression: offset / Math.max(1, totalChars),
      position: Math.min(positions.length, positionIndex + 1),
      txtOffset: offset,
    },
  });
}

function chunkForPosition(chunks: TxtChunk[], position: number) {
  let low = 0;
  let high = chunks.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const chunk = chunks[middle];
    if (position < chunk.start) high = middle - 1;
    else if (position >= chunk.end && middle < chunks.length - 1) low = middle + 1;
    else return chunk;
  }
  return chunks[Math.max(0, Math.min(chunks.length - 1, low))];
}

class TxtResourceManager {
  private cache = new ReaderContentCache<string>('txt-xhtml', TXT_RESOURCE_CACHE_LIMIT, TXT_RESOURCE_CACHE_BYTES);
  private transportCache = new ReaderContentCache<string>('txt-transport', TXT_RESOURCE_CACHE_LIMIT * 4, TXT_RESOURCE_CACHE_BYTES);
  private scheduler = new ReaderWorkScheduler(2);
  private closed = false;

  constructor(
    private resourceId: string,
    private info: NativeTxtBookInfo,
    private chunks: TxtChunk[],
  ) {}

  get(link: ReadiumLink): ReadiumResourceLike {
    return new TxtResource(link, this);
  }

  async read(link: ReadiumLink, signal?: AbortSignal) {
    if (this.closed) throw new Error('TXT 阅读会话已关闭');
    const chunk = this.chunks.find((item) => item.href === link.href.split('#')[0]);
    if (!chunk) throw new Error(`TXT 虚拟资源不存在: ${link.href}`);
    return this.cache.getOrCreate(chunk.href, async () => {
      const slices: Array<{ start: number; end: number }> = [];
      for (let start = chunk.start; start < chunk.end; start += TXT_TARGET_RESOURCE_CHARS) {
        slices.push({ start, end: Math.min(chunk.end, start + TXT_TARGET_RESOURCE_CHARS) });
      }
      const text = (await Promise.all(slices.map(({ start, end }) => {
        const key = `${start}:${end}`;
        return this.transportCache.getOrCreate(key, async () => {
          const window = await readTxtWindow(this.resourceId, this.info.sessionId, start, end, signal);
          this.transportCache.updateSize(key, estimateStringBytes(window.text));
          return window.text;
        });
      }))).join('');
      const xhtml = txtWindowToXhtml(text, chunk.start, this.info);
      this.cache.updateSize(chunk.href, estimateStringBytes(xhtml));
      return xhtml;
    });
  }

  async prefetch(href: string, radius: number, direction: -1 | 0 | 1) {
    const index = this.chunks.findIndex((chunk) => chunk.href === href.split('#')[0]);
    if (index < 0) return;
    const start = Math.max(0, direction > 0 ? index : index - radius);
    const end = Math.min(this.chunks.length, direction < 0 ? index + 1 : index + radius + 1);
    const targets = this.chunks.slice(start, end);
    await Promise.all(targets.map((chunk, targetIndex) => this.scheduler.schedule(
      `content:${chunk.href}`,
      targetIndex === 0 ? 1 : 2,
      async (signal) => {
        await this.read(new ReadiumLink({ href: chunk.href }), signal);
        if (signal.aborted) throw new DOMException('Stale TXT prefetch', 'AbortError');
      },
    )));
  }

  async prefetchWindow(startIndex: number, endIndex: number, centerIndex: number, direction: -1 | 0 | 1) {
    const targets = this.chunks
      .map((chunk, index) => ({ chunk, index }))
      .slice(Math.max(0, startIndex), Math.min(this.chunks.length, endIndex + 1))
      .sort((left, right) => {
        const leftAhead = direction !== 0 && (left.index - centerIndex) * direction > 0;
        const rightAhead = direction !== 0 && (right.index - centerIndex) * direction > 0;
        if (leftAhead !== rightAhead) return leftAhead ? -1 : 1;
        return Math.abs(left.index - centerIndex) - Math.abs(right.index - centerIndex);
      });
    this.scheduler.replaceWindow(targets.map(({ chunk }) => `content:${chunk.href}`));
    await Promise.all(targets.map(({ chunk }, index) => this.scheduler.schedule(
      `content:${chunk.href}`,
      index < 2 ? 1 : 2,
      async (signal) => {
        await this.read(new ReadiumLink({ href: chunk.href }), signal);
        if (signal.aborted) throw new DOMException('Stale TXT prefetch', 'AbortError');
      },
    )));
  }

  advanceGeneration() {
    this.scheduler.advanceGeneration(2);
  }

  close() {
    this.closed = true;
    this.cache.clear();
    this.transportCache.clear();
    this.scheduler.close();
  }
}

class TxtResource implements ReadiumResourceLike {
  constructor(private linkValue: ReadiumLink, private manager: TxtResourceManager) {}

  async link() { return this.linkValue; }
  async readAsString(signal?: AbortSignal) { return this.manager.read(this.linkValue, signal); }
  async read() { return new TextEncoder().encode(await this.readAsString()); }
  async length() { return (await this.read())?.byteLength; }
  async readAsJSON() { return JSON.parse(await this.readAsString()); }
  async readAsXML() { return new DOMParser().parseFromString(await this.readAsString(), 'application/xhtml+xml'); }
  close() {}
}

function txtWindowToXhtml(text: string, start: number, info: NativeTxtBookInfo) {
  const textLength = codePointLength(text);
  const chapterOffsets = new Map(info.chapters
    .filter((chapter) => chapter.startIndex >= start && chapter.startIndex < start + textLength)
    .map((chapter) => [chapter.startIndex, chapter]));
  let offset = start;
  const lines = text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g)?.filter(Boolean) || [];
  const body = lines.map((segment) => {
    const line = segment.replace(/[\r\n]+$/, '');
    const trimmedLine = line.trim();
    const chapter = chapterOffsets.get(offset);
    const content = escapeHtml(trimmedLine) || '';
    const html = chapter
      ? `<h2 id="txt-${chapter.startIndex}" data-txt-start="${offset}">${content}</h2>`
      : content ? `<p id="txt-p-${offset}" data-txt-start="${offset}">${content}</p>` : '';
    offset += codePointLength(segment);
    return html;
  }).join('');
  const windowTitle = info.chapters.find((chapter) => chapter.startIndex >= start && chapter.startIndex < start + textLength)?.title || 'TXT';
  return `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" lang="zh" data-zenith-fast-pages="true"><head><meta charset="utf-8"/><title>${escapeHtml(windowTitle)}</title></head><body>${body}</body></html>`;
}

function codePointLength(value: string) {
  let count = 0;
  for (let index = 0; index < value.length; index++, count++) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) index++;
  }
  return count;
}

function createTxtMetadata(title: string, author?: string) {
  return {
    title: { getTranslation: () => title, serialize: () => title },
    authors: author ? [{ name: author }] : undefined,
    languages: ['zh'],
    conformsTo: ['https://readium.org/webpub-manifest/profiles/epub'],
    layout: 'reflowable',
    readingProgression: 'ltr',
    otherMetadata: {},
    get effectiveLayout() { return 'reflowable'; },
    get effectiveReadingProgression() { return 'ltr' as const; },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
