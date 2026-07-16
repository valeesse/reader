import {
  closeEpubBook,
  NativeEpubBookInfo,
  NativeEpubLink,
  prefetchEpubResources,
  readEpubResource,
  openEpubBook,
  toLocalAssetUrl,
} from './native';
import { EpubPositionCount, getCachedEpubPositionCounts, saveCachedEpubPositionCounts } from './publicationPositionCache';
import { adaptiveReaderBudget, estimateStringBytes, ReaderContentCache, ReaderWorkScheduler } from './readerCacheCoordinator';

const EPUB_PROFILE = 'https://readium.org/webpub-manifest/profiles/epub';
const READING_PROGRESSION = {
  ltr: 'ltr',
  rtl: 'rtl',
  auto: 'auto',
} as const;

const LAYOUT = {
  reflowable: 'reflowable',
  fixed: 'fixed',
} as const;
const EPUB_PAYLOAD_CACHE_LIMIT = 72;
const EPUB_BLOB_CACHE_LIMIT = 96;
const EPUB_BLOB_CACHE_BYTES = adaptiveReaderBudget(48 * 1024 * 1024, 24 * 1024 * 1024);
const EPUB_FRONTEND_CACHE_BYTES = adaptiveReaderBudget(48 * 1024 * 1024, 24 * 1024 * 1024);
const EPUB_TRANSFORMED_CACHE_BYTES = adaptiveReaderBudget(32 * 1024 * 1024, 16 * 1024 * 1024);
const EPUB_POSITION_CHARS = 1024;
const epubRewriteWarnings = new Set<string>();

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

type ReadiumTextLike = {
  after?: string;
  before?: string;
  highlight?: string;
  serialize: () => Record<string, string>;
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
  advancePrefetchGeneration: () => void;
  contentKey: string;
  refinePositions?: (signal: AbortSignal) => Promise<void>;
  close: () => void;
};

export type ReadiumResourceLike = {
  link: () => Promise<ReadiumLink>;
  length: () => Promise<number | undefined>;
  read: () => Promise<Uint8Array | undefined>;
  readAsString: () => Promise<string | undefined>;
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
  const cachedCounts = await getCachedEpubPositionCounts(resourceId, cacheKey).catch(() => undefined);
  const positions = createPositionsFromCounts(readingOrder.items, cachedCounts || coarsePositionCounts(readingOrder.items));
  let lastPrefetchKey = '';
  let lastPrefetch: Promise<void> = Promise.resolve();

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
      lastPrefetchKey = key;
      lastPrefetch = prefetchEpubResources(resourceId, sessionId, hrefs).catch((error) => {
        if (lastPrefetchKey === key) lastPrefetchKey = '';
        throw error;
      });
      await lastPrefetch;
    },
    prepareContentAroundHref: async (href, radius = 2, direction = 0) => {
      const index = readingOrder.findIndexWithHref(href);
      if (index < 0) return;
      const start = Math.max(0, direction > 0 ? index : index - radius);
      const end = Math.min(readingOrder.items.length, direction < 0 ? index + 1 : index + radius + 1);
      const targets = readingOrder.items.slice(start, end);
      await prefetchEpubResources(resourceId, sessionId, targets.map((link) => link.href));
      await resourceManager.prepare(targets, direction);
    },
    advancePrefetchGeneration: () => resourceManager.advanceGeneration(),
    contentKey: `${cacheKey}:epub-content-v2`,
    refinePositions: cachedCounts ? undefined : async (signal) => {
      const counts = await calculatePositionCounts(readingOrder.items, resourceManager, signal);
      if (signal.aborted) return;
      const refined = createPositionsFromCounts(readingOrder.items, counts);
      positions.splice(0, positions.length, ...refined);
      await saveCachedEpubPositionCounts(resourceId, cacheKey, counts);
    },
    close: () => {
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
  const page = pageFromLocator(locator, publication);
  return page.current / page.total;
}

const publicationPositionRanges = new WeakMap<object, Map<string, { first: number; count: number }>>();

export function pageFromLocator(locator: any, publication: ReadiumPublicationLike) {
  const positions = publication.positions;
  const total = Math.max(1, positions.length);
  let ranges = publicationPositionRanges.get(publication as object);
  if (!ranges) {
    ranges = new Map();
    positions.forEach((position, index) => {
      const href = position.href.split('#')[0];
      const existing = ranges?.get(href);
      if (existing) existing.count += 1;
      else ranges?.set(href, { first: index, count: 1 });
    });
    publicationPositionRanges.set(publication as object, ranges);
  }
  const normalizedHref = publication.readingOrder.findWithHref(locator?.href || '')?.href
    || `${locator?.href || ''}`.split('#')[0];
  const range = ranges.get(normalizedHref);
  if (!range) return { current: 1, total };

  const local = clamp(typeof locator?.locations?.progression === 'number' ? locator.locations.progression : 0, 0, 1);
  const localIndex = Math.min(range.count - 1, Math.floor(local * range.count));
  return { current: range.first + localIndex + 1, total };
}

export class ReadiumLink {
  href: string;
  type: string;
  title?: string;
  rels?: Set<string>;
  properties: Record<string, unknown>;
  mediaType: ReadiumMediaType;

  constructor(values: {
    href: string;
    type?: string;
    title?: string;
    rels?: Set<string>;
    properties?: Set<string> | Record<string, unknown>;
  }) {
    this.href = normalizeHref(values.href);
    this.type = values.type || mimeFromPath(this.href);
    this.title = values.title;
    this.rels = values.rels;
    this.properties = values.properties instanceof Set
      ? Object.fromEntries(Array.from(values.properties).map((property) => [property, true]))
      : values.properties || {};
    this.mediaType = new ReadiumMediaType(this.type);
  }

  toURL(baseURL?: string) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(this.href)) return this.href;
    if (!baseURL) return this.href;
    return new URL(this.href, baseURL).toString();
  }

  addProperties(properties: Record<string, unknown>) {
    return new ReadiumLink({
      href: this.href,
      type: this.type,
      title: this.title,
      rels: this.rels,
      properties: { ...this.properties, ...properties },
    });
  }

  get locator() {
    const fragment = fragmentFromHref(this.href);
    return createLocator({
      href: stripHash(this.href),
      type: this.type,
      title: this.title,
      locations: {
        progression: 0,
        ...(fragment ? { fragments: [fragment] } : {}),
      },
    });
  }
}

export class LinkCollection {
  items: ReadiumLink[];

  constructor(items: ReadiumLink[]) {
    this.items = items;
  }

  findWithHref(href: string) {
    const normalized = normalizeZipPath(stripHash(href));
    return this.items.find((link) => normalizeZipPath(stripHash(link.href)) === normalized);
  }

  findExactWithHref(href: string) {
    const normalized = normalizeHref(href);
    return this.items.find((link) => link.href === normalized);
  }

  findIndexWithHref(href: string) {
    const normalized = normalizeZipPath(stripHash(href));
    return this.items.findIndex((link) => normalizeZipPath(stripHash(link.href)) === normalized);
  }

  findWithRel(rel: string) {
    return this.items.find((link) => link.rels?.has(rel));
  }

  filterByRel(rel: string) {
    return this.items.filter((link) => link.rels?.has(rel));
  }
}

class ReadiumMediaType {
  string: string;

  constructor(value: string) {
    this.string = value || 'application/octet-stream';
  }

  get isHTML() {
    return this.string === 'application/xhtml+xml' || this.string === 'text/html';
  }

  get isBitmap() {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'].includes(this.string);
  }

  equals(other: { string?: string } | string) {
    return this.string === (typeof other === 'string' ? other : other?.string);
  }
}

class ReadiumResource {
  private linkValue: ReadiumLink;
  private manager: EpubResourceManager;

  constructor(link: ReadiumLink, manager: EpubResourceManager) {
    this.linkValue = link;
    this.manager = manager;
  }

  async link() {
    return this.linkValue;
  }

  async length() {
    const bytes = await this.read();
    return bytes?.byteLength;
  }

  async read() {
    return this.manager.read(this.linkValue);
  }

  async readAsString() {
    return this.manager.readAsString(this.linkValue);
  }

  async readAsJSON() {
    const text = await this.readAsString();
    return text ? JSON.parse(text) : undefined;
  }

  async readAsXML() {
    const text = await this.readAsString();
    return text ? parseXml(text, 'application/xml') : undefined;
  }

  close() {}
}

class EpubResourceManager {
  private resourceId: string;
  private sessionId: string;
  private payloads = new ReaderContentCache<{ href: string; mediaType: string; text?: string | null; filePath?: string | null; binaryUrl?: string | null }>(
    'epub-payload', EPUB_PAYLOAD_CACHE_LIMIT, EPUB_FRONTEND_CACHE_BYTES,
  );
  private transformed = new ReaderContentCache<string>('epub-transformed', 24, EPUB_TRANSFORMED_CACHE_BYTES);
  private scheduler = new ReaderWorkScheduler(2);
  private blobUrls = new Map<string, string>();
  private blobOrder: string[] = [];
  private blobSizes = new Map<string, number>();
  private blobBytes = 0;

  constructor(resourceId: string, sessionId: string) {
    this.resourceId = resourceId;
    this.sessionId = sessionId;
  }

  get(link: ReadiumLink) {
    return new ReadiumResource(link, this);
  }

  async sourceText(link: ReadiumLink) {
    const payload = await this.payloadFor(link.href);
    return payload.text ?? '';
  }

  async read(link: ReadiumLink) {
    if (link.mediaType.isHTML || link.type === 'text/css') {
      const text = await this.readAsString(link);
      return new TextEncoder().encode(text || '');
    }

    const payload = await this.payloadFor(link.href);
    const binaryUrl = payload.binaryUrl || (payload.filePath ? toLocalAssetUrl(payload.filePath) : undefined);
    if (binaryUrl) {
      const response = await fetch(binaryUrl);
      if (!response.ok) throw new Error(`EPUB binary resource failed (${response.status})`);
      return new Uint8Array(await response.arrayBuffer());
    }
    if (typeof payload.text === 'string') return new TextEncoder().encode(payload.text);
    return undefined;
  }

  async readAsString(link: ReadiumLink) {
    const normalized = normalizeZipPath(stripHash(link.href));
    if (link.mediaType.isHTML || link.type === 'text/css') {
      return this.transformed.getOrCreate(normalized, async () => {
        const payload = await this.payloadFor(link.href);
        const text = payload.text ?? undefined;
        if (typeof text !== 'string') return '';
        const result = link.mediaType.isHTML
          ? await this.rewriteHtml(text, link.href)
          : await this.rewriteCss(text, link.href);
        this.transformed.updateSize(normalized, estimateStringBytes(result));
        return result;
      });
    }
    const payload = await this.payloadFor(link.href);
    const text = payload.text ?? undefined;
    return text;
  }

  async prepare(links: ReadiumLink[], direction: -1 | 0 | 1) {
    await Promise.all(links.map((link, index) => this.scheduler.schedule(
      `content:${link.href}`,
      index === 0 ? 1 : direction === 0 ? 2 : 1,
      async (signal) => {
        await this.readAsString(link);
        if (signal.aborted) throw new DOMException('Stale EPUB prefetch', 'AbortError');
      },
    )));
  }

  advanceGeneration() {
    this.scheduler.advanceGeneration(2);
  }

  close() {
    for (const url of this.blobUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();
    this.blobOrder = [];
    this.blobSizes.clear();
    this.blobBytes = 0;
    this.payloads.clear();
    this.transformed.clear();
    this.scheduler.close();
  }

  private payloadFor(href: string) {
    const normalized = normalizeZipPath(stripHash(href));
    return this.payloads.getOrCreate(normalized, async () => {
      const payload = await readEpubResource(this.resourceId, this.sessionId, normalized);
      const bytes = typeof payload.text === 'string'
        ? estimateStringBytes(payload.text)
        : 256;
      this.payloads.updateSize(normalized, bytes);
      return payload;
    });
  }

  private async blobUrlFor(href: string) {
    const normalized = normalizeZipPath(stripHash(href));
    const existing = this.blobUrls.get(normalized);
    if (existing) {
      touchKey(this.blobOrder, normalized);
      return existing;
    }

    const link = new ReadiumLink({ href: normalized });
    const payload = await this.payloadFor(normalized);
    const type = payload.mediaType || link.type;
    const directUrl = payload.binaryUrl || (payload.filePath ? toLocalAssetUrl(payload.filePath) : undefined);
    if (directUrl && type !== 'text/css' && !link.mediaType.isHTML) {
      return directUrl;
    }
    const content = type === 'text/css'
      ? await this.rewriteCss(payload.text ?? '', normalized)
      : typeof payload.text === 'string'
        ? payload.text
        : '';
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    this.rememberBlobUrl(normalized, url, blob.size);
    return url;
  }

  private rememberBlobUrl(href: string, url: string, bytes: number) {
    const previousBytes = this.blobSizes.get(href) || 0;
    this.blobBytes += bytes - previousBytes;
    this.blobUrls.set(href, url);
    this.blobSizes.set(href, bytes);
    touchKey(this.blobOrder, href);
    while (this.blobOrder.length > EPUB_BLOB_CACHE_LIMIT || this.blobBytes > EPUB_BLOB_CACHE_BYTES) {
      const oldest = this.blobOrder.shift();
      if (!oldest) break;
      const oldUrl = this.blobUrls.get(oldest);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      this.blobBytes = Math.max(0, this.blobBytes - (this.blobSizes.get(oldest) || 0));
      this.blobUrls.delete(oldest);
      this.blobSizes.delete(oldest);
    }
  }

  private async rewriteHtml(html: string, href: string) {
    const doc = parseXml(html, 'application/xhtml+xml');
    if (doc.querySelector('parsererror')) return html;

    // Publication scripts cannot run in the deliberately scriptless reader
    // sandbox. Removing them before srcdoc assignment avoids one CSP/security
    // error per warm L1 frame and keeps untrusted EPUB code out of every mode.
    doc.querySelectorAll('script').forEach((script) => script.remove());
    doc.querySelectorAll('*').forEach((element) => {
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
      }
    });
    doc.querySelectorAll('a[href]').forEach((anchor) => {
      if (/^\s*javascript:/i.test(anchor.getAttribute('href') || '')) anchor.setAttribute('href', '#');
    });
    const baseDir = dirname(href);
    await rewriteUrlAttributes(doc, baseDir, (resourceHref) => this.blobUrlFor(resourceHref));
    doc.querySelectorAll('img, picture, figure, svg image').forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.setProperty('border-radius', '5px', 'important');
      htmlElement.style.setProperty('clip-path', 'inset(0 round 5px)', 'important');
      htmlElement.style.setProperty('overflow', 'hidden', 'important');
      if (htmlElement.tagName.toLowerCase() === 'img') {
        htmlElement.style.setProperty('cursor', 'zoom-in', 'important');
      }
    });
    return new XMLSerializer().serializeToString(doc);
  }

  private async rewriteCss(css: string, href: string) {
    const baseDir = dirname(href);
    const parts: string[] = [];
    const regex = /url\((['"]?)(.*?)\1\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(css))) {
      parts.push(css.slice(lastIndex, match.index));
      const quote = match[1] || '';
      const rawUrl = String(match[2] || '').trim();
      if (!rawUrl || isExternalUrl(rawUrl)) {
        parts.push(match[0]);
      } else {
        const [pathPart, suffix = ''] = rawUrl.split(/(?=[?#])/);
        const resolved = resolveZipPath(baseDir, pathPart);
        try {
          parts.push(`url(${quote}${await this.blobUrlFor(resolved)}${suffix}${quote})`);
        } catch (error) {
          if (!isMissingOptionalEpubResource(error)) {
            warnEpubRewriteOnce(`css:${resolved}`, 'Failed to rewrite EPUB CSS resource URL', { href, resolved, error });
          }
          parts.push(match[0]);
        }
      }
      lastIndex = regex.lastIndex;
    }
    parts.push(css.slice(lastIndex));
    return parts.join('');
  }
}

class ReadiumMetadata {
  title: { getTranslation: () => string; serialize: () => string };
  authors?: Array<{ name: string }>;
  languages?: string[];
  conformsTo = [EPUB_PROFILE];
  layout?: string;
  readingProgression?: string;
  otherMetadata: Record<string, unknown>;

  constructor(values: NativeEpubBookInfo['metadata']) {
    this.title = {
      getTranslation: () => values.title,
      serialize: () => values.title,
    };
    this.authors = values.author ? [{ name: values.author }] : undefined;
    this.languages = values.language ? [values.language] : ['zh'];
    this.layout = values.layout;
    this.readingProgression = values.readingProgression;
    this.otherMetadata = {};
  }

  get effectiveLayout() {
    return this.layout || LAYOUT.reflowable;
  }

  get effectiveReadingProgression() {
    if (this.readingProgression === READING_PROGRESSION.rtl) return READING_PROGRESSION.rtl;
    return READING_PROGRESSION.ltr;
  }
}

function nativeLinkToReadiumLink(link: NativeEpubLink) {
  return new ReadiumLink({
    href: link.href,
    type: link.mediaType,
    title: link.title,
    rels: new Set(link.rels || []),
    properties: new Set(link.properties || []),
  });
}

async function calculatePositionCounts(
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
        counts.push({ href: link.href, count: Math.max(1, Math.ceil(textLength / EPUB_POSITION_CHARS)) });
      } catch {
        if (signal.aborted) return counts;
        counts.push({ href: link.href, count: 1 });
      }
      await yieldToMainThread();
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

function coarsePositionCounts(readingOrder: ReadiumLink[]): EpubPositionCount[] {
  return readingOrder.map((link) => ({ href: link.href, count: 1 }));
}

function createPositionsFromCounts(readingOrder: ReadiumLink[], rawCounts: EpubPositionCount[]) {
  const countByHref = new Map(rawCounts.map((item) => [normalizeZipPath(stripHash(item.href)), Math.max(1, Math.round(item.count))]));
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

function yieldToMainThread() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

export function createLocator(values: {
  href: string;
  type: string;
  title?: string;
  locations?: Record<string, unknown>;
  text?: unknown;
}): ReadiumLocatorLike {
  const text = createLocatorText(values.text);
  const locations = createLocatorLocations(values.locations);
  const locator = {
    href: values.href,
    type: values.type,
    title: values.title,
    locations,
    text,
    serialize() {
      return {
        href: locator.href,
        type: locator.type,
        title: locator.title,
        locations: locator.locations,
        text: locator.text?.serialize(),
      };
    },
    copyWithLocations(locations: Record<string, unknown>) {
      return createLocator({
        href: locator.href,
        type: locator.type,
        title: locator.title,
        locations: {
          ...locator.locations,
          ...locations,
        },
        text: locator.text,
      });
    },
  };
  return locator;
}

function createLocatorLocations(value?: Record<string, unknown>) {
  const serializedHtmlId = typeof value?.htmlId === 'string' ? value.htmlId : undefined;
  const locations: Record<string, unknown> & {
    getCssSelector: () => string | undefined;
    htmlId: () => string | undefined;
  } = {
    ...(value || {}),
    // The vendored Readium navigator deliberately accesses these semantic
    // locations through methods (matching Readium's Locations model), not by
    // reading the JSON properties directly.  Keep the properties serializable
    // while exposing the model-compatible accessors used by go(locator).
    getCssSelector() {
      return typeof locations.cssSelector === 'string' ? locations.cssSelector : undefined;
    },
    htmlId() {
      return typeof locations.htmlIdValue === 'string'
        ? locations.htmlIdValue
        : serializedHtmlId;
    },
  };
  return locations;
}

function createLocatorText(value: unknown): ReadiumTextLike | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Partial<ReadiumTextLike>;
  if (typeof source.serialize === 'function') return source as ReadiumTextLike;
  const text: ReadiumTextLike = {
    after: typeof source.after === 'string' ? source.after : undefined,
    before: typeof source.before === 'string' ? source.before : undefined,
    highlight: typeof source.highlight === 'string' ? source.highlight : undefined,
    serialize() {
      return Object.fromEntries(
        Object.entries({ after: text.after, before: text.before, highlight: text.highlight })
          .filter((entry): entry is [string, string] => entry[1] !== undefined),
      );
    },
  };
  return text.after === undefined && text.before === undefined && text.highlight === undefined ? undefined : text;
}

async function rewriteUrlAttributes(doc: XMLDocument, baseDir: string, resolveUrl: (href: string) => Promise<string>) {
  const tasks: Promise<void>[] = [];
  doc.querySelectorAll('[src], [poster]').forEach((element) => {
    for (const attribute of ['src', 'poster']) {
      tasks.push(rewriteElementUrl(element, attribute, baseDir, resolveUrl));
    }
  });

  doc.querySelectorAll('link, image, use').forEach((element) => {
    tasks.push(rewriteElementUrl(element, 'href', baseDir, resolveUrl));
    tasks.push(rewriteElementUrl(element, 'xlink:href', baseDir, resolveUrl));
  });
  await Promise.all(tasks);
}

async function rewriteElementUrl(element: Element, attribute: string, baseDir: string, resolveUrl: (href: string) => Promise<string>) {
  const value = element.getAttribute(attribute);
  if (!value || isExternalUrl(value) || value.startsWith('#')) return;
  const [pathPart, suffix = ''] = value.split(/(?=[?#])/);
  const resolved = resolveZipPath(baseDir, pathPart);
  try {
    element.setAttribute(attribute, `${await resolveUrl(resolved)}${suffix}`);
  } catch (error) {
    if (!isMissingOptionalEpubResource(error)) {
      warnEpubRewriteOnce(`html:${resolved}`, 'Failed to rewrite EPUB resource URL', { attribute, value, resolved, error });
    }
  }
}

function isMissingOptionalEpubResource(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /(?:missing resource|resource is not in the manifest)/i.test(message);
}

function warnEpubRewriteOnce(key: string, message: string, detail: Record<string, unknown>) {
  if (epubRewriteWarnings.has(key)) return;
  epubRewriteWarnings.add(key);
  if (epubRewriteWarnings.size > 100) epubRewriteWarnings.delete(epubRewriteWarnings.values().next().value!);
  console.warn(message, detail);
}

function parseXml(text: string, type: DOMParserSupportedType) {
  return new DOMParser().parseFromString(text, type);
}

function normalizeZipPath(path: string) {
  return path
    .replace(/\\/g, '/')
    .split('/')
    .reduce<string[]>((parts, part) => {
      if (!part || part === '.') return parts;
      if (part === '..') parts.pop();
      else parts.push(part);
      return parts;
    }, [])
    .join('/');
}

function normalizeHref(href: string) {
  const suffixIndex = href.search(/[?#]/);
  const path = suffixIndex >= 0 ? href.slice(0, suffixIndex) : href;
  const suffix = suffixIndex >= 0 ? href.slice(suffixIndex) : '';
  return `${normalizeZipPath(path)}${suffix}`;
}

function resolveZipPath(baseDir: string, href: string) {
  if (isExternalUrl(href)) return href;
  return normalizeZipPath(`${baseDir ? `${baseDir}/` : ''}${href}`);
}

function dirname(path: string) {
  const normalized = normalizeZipPath(stripHash(path));
  const index = normalized.lastIndexOf('/');
  return index >= 0 ? normalized.slice(0, index) : '';
}

function stripHash(path: string) {
  return path.split('#')[0].split('?')[0];
}

function fragmentFromHref(href: string) {
  const fragment = href.split('#')[1]?.split('?')[0];
  if (!fragment) return undefined;
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function touchKey(order: string[], key: string) {
  const index = order.indexOf(key);
  if (index >= 0) order.splice(index, 1);
  order.push(key);
}

function isExternalUrl(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|data:|blob:|#)/i.test(value);
}

function mimeFromPath(path: string) {
  const extension = stripHash(path).split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'xhtml':
    case 'xml':
      return 'application/xhtml+xml';
    case 'html':
    case 'htm':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'otf':
      return 'font/otf';
    case 'ttf':
      return 'font/ttf';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ncx':
      return 'application/x-dtbncx+xml';
    default:
      return 'application/octet-stream';
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
