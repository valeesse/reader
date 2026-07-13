import { closeTxtBook, NativeTxtBookInfo, openTxtBook, readTxtWindow } from './native';
import {
  createLocator,
  LinkCollection,
  ReadiumLink,
  ReadiumPublicationLike,
  ReadiumResourceLike,
} from './readiumPublication';

const TXT_RESOURCE_CHARS = 48 * 1024;
const TXT_POSITION_CHARS = 1024;
const TXT_RESOURCE_CACHE_LIMIT = 12;

type TxtChunk = {
  href: string;
  start: number;
  end: number;
  title: string;
};

export async function createTxtReadiumPublication(
  path: string,
  title: string,
  author?: string,
): Promise<ReadiumPublicationLike> {
  const info = await openTxtBook(path);
  const chunks = createChunks(info);
  const readingOrder = new LinkCollection(chunks.map((chunk) => new ReadiumLink({
    href: chunk.href,
    type: 'application/xhtml+xml',
    title: chunk.title,
  })));
  const toc = new LinkCollection(info.chapters.map((chapter) => {
    const chunk = chunkForPosition(chunks, chapter.startIndex);
    return new ReadiumLink({
      href: `${chunk.href}#txt-${chapter.startIndex}`,
      type: 'application/xhtml+xml',
      title: chapter.title,
    });
  }));
  const manager = new TxtResourceManager(path, info, chunks);
  const positions = createTxtPositions(chunks, info.totalChars);

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
    close: () => {
      manager.close();
      closeTxtBook(path, info.sessionId).catch(() => {});
    },
  };
}

function createChunks(info: NativeTxtBookInfo): TxtChunk[] {
  const count = Math.max(1, Math.ceil(info.totalChars / TXT_RESOURCE_CHARS));
  return Array.from({ length: count }, (_, index) => {
    const start = index * TXT_RESOURCE_CHARS;
    const end = Math.min(info.totalChars, start + TXT_RESOURCE_CHARS);
    const chapter = [...info.chapters].reverse().find((item) => item.startIndex <= start)
      || info.chapters.find((item) => item.startIndex < end);
    return {
      href: `txt/chunk-${String(index).padStart(6, '0')}.xhtml`,
      start,
      end,
      title: chapter?.title || `文本 ${index + 1}`,
    };
  });
}

function createTxtPositions(chunks: TxtChunk[], totalChars: number) {
  const total = Math.max(1, Math.ceil(totalChars / TXT_POSITION_CHARS));
  return Array.from({ length: total }, (_, index) => {
    const absolute = Math.min(totalChars, index * TXT_POSITION_CHARS);
    const chunk = chunkForPosition(chunks, absolute);
    const chunkLength = Math.max(1, chunk.end - chunk.start);
    return createLocator({
      href: chunk.href,
      type: 'application/xhtml+xml',
      title: chunk.title,
      locations: {
        progression: Math.min(1, (absolute - chunk.start) / chunkLength),
        totalProgression: total > 1 ? index / (total - 1) : 0,
        position: index + 1,
        txtOffset: absolute,
      },
    });
  });
}

function chunkForPosition(chunks: TxtChunk[], position: number) {
  const index = Math.min(chunks.length - 1, Math.max(0, Math.floor(position / TXT_RESOURCE_CHARS)));
  return chunks[index];
}

class TxtResourceManager {
  private cache = new Map<string, Promise<string>>();
  private order: string[] = [];
  private closed = false;

  constructor(
    private path: string,
    private info: NativeTxtBookInfo,
    private chunks: TxtChunk[],
  ) {}

  get(link: ReadiumLink): ReadiumResourceLike {
    return new TxtResource(link, this);
  }

  async read(link: ReadiumLink) {
    if (this.closed) throw new Error('TXT 阅读会话已关闭');
    const chunk = this.chunks.find((item) => item.href === link.href.split('#')[0]);
    if (!chunk) throw new Error(`TXT 虚拟资源不存在: ${link.href}`);
    const existing = this.cache.get(chunk.href);
    if (existing) {
      this.touch(chunk.href);
      return existing;
    }
    const request = readTxtWindow(this.path, this.info.sessionId, chunk.start, chunk.end)
      .then((window) => txtWindowToXhtml(window.text, window.start, this.info));
    this.cache.set(chunk.href, request);
    this.touch(chunk.href);
    request.catch(() => {
      if (this.cache.get(chunk.href) === request) this.cache.delete(chunk.href);
    });
    return request;
  }

  async prefetch(href: string, radius: number, direction: -1 | 0 | 1) {
    const index = this.chunks.findIndex((chunk) => chunk.href === href.split('#')[0]);
    if (index < 0) return;
    const start = Math.max(0, direction > 0 ? index : index - radius);
    const end = Math.min(this.chunks.length, direction < 0 ? index + 1 : index + radius + 1);
    const targets = this.chunks.slice(start, end);
    await Promise.all(targets.map((chunk) => this.read(new ReadiumLink({ href: chunk.href }))));
  }

  close() {
    this.closed = true;
    this.cache.clear();
    this.order = [];
  }

  private touch(href: string) {
    const index = this.order.indexOf(href);
    if (index >= 0) this.order.splice(index, 1);
    this.order.push(href);
    while (this.order.length > TXT_RESOURCE_CACHE_LIMIT) {
      const oldest = this.order.shift();
      if (oldest) this.cache.delete(oldest);
    }
  }
}

class TxtResource implements ReadiumResourceLike {
  constructor(private linkValue: ReadiumLink, private manager: TxtResourceManager) {}

  async link() { return this.linkValue; }
  async readAsString() { return this.manager.read(this.linkValue); }
  async read() { return new TextEncoder().encode(await this.readAsString()); }
  async length() { return (await this.read())?.byteLength; }
  async readAsJSON() { return JSON.parse(await this.readAsString()); }
  async readAsXML() { return new DOMParser().parseFromString(await this.readAsString(), 'application/xhtml+xml'); }
  close() {}
}

function txtWindowToXhtml(text: string, start: number, info: NativeTxtBookInfo) {
  const textLength = Array.from(text).length;
  const chapterOffsets = new Map(info.chapters
    .filter((chapter) => chapter.startIndex >= start && chapter.startIndex < start + textLength)
    .map((chapter) => [chapter.startIndex, chapter]));
  let offset = start;
  const lines = text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g)?.filter(Boolean) || [];
  const body = lines.map((segment) => {
    const line = segment.replace(/[\r\n]+$/, '');
    const chapter = chapterOffsets.get(offset);
    const content = escapeHtml(line.trim()) || '&#160;';
    const html = chapter
      ? `<h2 id="txt-${chapter.startIndex}">${content}</h2>`
      : `<p>${content}</p>`;
    offset += Array.from(segment).length;
    return html;
  }).join('');
  const windowTitle = info.chapters.find((chapter) => chapter.startIndex >= start && chapter.startIndex < start + textLength)?.title || 'TXT';
  return `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" lang="zh"><head><meta charset="utf-8"/><title>${escapeHtml(windowTitle)}</title></head><body>${body}</body></html>`;
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
