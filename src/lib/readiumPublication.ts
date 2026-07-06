import {
  closeEpubBook,
  NativeEpubBookInfo,
  NativeEpubLink,
  prefetchEpubResources,
  readEpubResource,
  openEpubBook,
  toLocalAssetUrl,
} from './native';

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
  text?: unknown;
  serialize: () => unknown;
  copyWithLocations: (locations: Record<string, unknown>) => ReadiumLocatorLike;
};

export type ReadiumPublicationLike = {
  metadata: ReadiumMetadata;
  readingOrder: LinkCollection;
  resources: LinkCollection;
  toc: LinkCollection;
  baseURL?: string;
  positions: ReadiumLocatorLike[];
  get: (link: ReadiumLink) => ReadiumResource;
  positionsFromManifest: () => Promise<ReadiumLocatorLike[]>;
  linkWithHref: (href: string) => ReadiumLink | undefined;
  linkWithRel: (rel: string) => ReadiumLink | undefined;
  linksWithRel: (rel: string) => ReadiumLink[];
  getCover: () => ReadiumLink | undefined;
  prefetchAroundHref: (href: string, radius?: number) => Promise<void>;
  close: () => void;
};

export async function createReadiumPublicationFromPath(path: string, fallbackTitle: string): Promise<ReadiumPublicationLike> {
  const book = await openEpubBook(path, fallbackTitle);
  const readingOrder = new LinkCollection(book.readingOrder.map(nativeLinkToReadiumLink));
  const resources = new LinkCollection(book.resources.map(nativeLinkToReadiumLink));
  const toc = new LinkCollection(book.toc.map(nativeLinkToReadiumLink));
  const positions = createPositions(readingOrder.items);
  const resourceManager = new EpubResourceManager(path);

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
    prefetchAroundHref: async (href, radius = 5) => {
      const index = readingOrder.findIndexWithHref(href);
      if (index < 0) return;
      const start = Math.max(0, index - radius);
      const end = Math.min(readingOrder.items.length, index + radius + 1);
      const hrefs = readingOrder.items.slice(start, end).map((link) => link.href);
      await prefetchEpubResources(path, hrefs);
    },
    close: () => {
      resourceManager.close();
      closeEpubBook(path).catch(() => {});
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
  const total = locator?.locations?.totalProgression;
  if (typeof total === 'number') return clamp(total, 0, 1);

  const index = publication.readingOrder.findIndexWithHref(locator?.href || '');
  const localProgression = typeof locator?.locations?.progression === 'number' ? locator.locations.progression : 0;
  if (index < 0) return 0;
  return clamp((index + localProgression) / Math.max(1, publication.readingOrder.items.length), 0, 1);
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
    this.href = stripHash(normalizeZipPath(values.href));
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
    return createLocator({
      href: this.href,
      type: this.type,
      title: this.title,
      locations: { progression: 0 },
    });
  }
}

export class LinkCollection {
  items: ReadiumLink[];

  constructor(items: ReadiumLink[]) {
    this.items = items;
  }

  findWithHref(href: string) {
    const normalized = stripHash(normalizeZipPath(href));
    return this.items.find((link) => link.href === normalized);
  }

  findIndexWithHref(href: string) {
    const normalized = stripHash(normalizeZipPath(href));
    return this.items.findIndex((link) => link.href === normalized);
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
  private path: string;
  private payloads = new Map<string, Promise<{ href: string; mediaType: string; text?: string; base64?: string; filePath?: string }>>();
  private blobUrls = new Map<string, string>();

  constructor(path: string) {
    this.path = path;
  }

  get(link: ReadiumLink) {
    return new ReadiumResource(link, this);
  }

  async read(link: ReadiumLink) {
    if (link.mediaType.isHTML || link.type === 'text/css') {
      const text = await this.readAsString(link);
      return new TextEncoder().encode(text || '');
    }

    const payload = await this.payloadFor(link.href);
    if (payload.filePath) {
      const response = await fetch(toLocalAssetUrl(payload.filePath));
      return new Uint8Array(await response.arrayBuffer());
    }
    if (payload.base64) return base64ToBytes(payload.base64);
    if (payload.text !== undefined) return new TextEncoder().encode(payload.text);
    return undefined;
  }

  async readAsString(link: ReadiumLink) {
    const payload = await this.payloadFor(link.href);
    const text = payload.text ?? (payload.base64 ? new TextDecoder().decode(base64ToBytes(payload.base64)) : undefined);
    if (text === undefined) return undefined;
    if (link.mediaType.isHTML) return this.rewriteHtml(text, link.href);
    if (link.type === 'text/css') return this.rewriteCss(text, link.href);
    return text;
  }

  close() {
    for (const url of this.blobUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();
  }

  private payloadFor(href: string) {
    const normalized = stripHash(normalizeZipPath(href));
    const existing = this.payloads.get(normalized);
    if (existing) return existing;
    const payload = readEpubResource(this.path, normalized).catch((error) => {
      console.warn('Failed to read EPUB resource', { bookPath: this.path, href: normalized, error });
      throw error;
    });
    this.payloads.set(normalized, payload);
    return payload;
  }

  private async blobUrlFor(href: string) {
    const normalized = stripHash(normalizeZipPath(href));
    const existing = this.blobUrls.get(normalized);
    if (existing) return existing;

    const link = new ReadiumLink({ href: normalized });
    const payload = await this.payloadFor(normalized);
    const type = payload.mediaType || link.type;
    if (payload.filePath && type !== 'text/css' && !link.mediaType.isHTML) {
      const response = await fetch(toLocalAssetUrl(payload.filePath));
      if (!response.ok) throw new Error(`Failed reading cached EPUB resource ${normalized}`);
      const url = URL.createObjectURL(await response.blob());
      this.blobUrls.set(normalized, url);
      return url;
    }
    const content = type === 'text/css'
      ? await this.rewriteCss(payload.text ?? new TextDecoder().decode(base64ToBytes(payload.base64 || '')), normalized)
      : payload.text !== undefined
        ? payload.text
        : bytesToBlobPart(base64ToBytes(payload.base64 || ''));
    const url = URL.createObjectURL(new Blob([content], { type }));
    this.blobUrls.set(normalized, url);
    return url;
  }

  private async rewriteHtml(html: string, href: string) {
    const doc = parseXml(html, 'application/xhtml+xml');
    if (doc.querySelector('parsererror')) return html;

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
        parts.push(`url(${quote}${await this.blobUrlFor(resolved)}${suffix}${quote})`);
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

function createPositions(readingOrder: ReadiumLink[]) {
  return readingOrder.map((link, index) => createLocator({
    href: link.href,
    type: link.type,
    title: link.title,
    locations: {
      progression: 0,
      totalProgression: index / Math.max(1, readingOrder.length),
      position: index + 1,
    },
  }));
}

function createLocator(values: {
  href: string;
  type: string;
  title?: string;
  locations?: Record<string, unknown>;
  text?: unknown;
}): ReadiumLocatorLike {
  const locator = {
    href: values.href,
    type: values.type,
    title: values.title,
    locations: values.locations || {},
    text: values.text,
    serialize() {
      return {
        href: locator.href,
        type: locator.type,
        title: locator.title,
        locations: locator.locations,
        text: locator.text,
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
  element.setAttribute(attribute, `${await resolveUrl(resolved)}${suffix}`);
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

function resolveZipPath(baseDir: string, href: string) {
  if (isExternalUrl(href)) return href;
  return normalizeZipPath(`${baseDir ? `${baseDir}/` : ''}${href}`);
}

function dirname(path: string) {
  const normalized = normalizeZipPath(path);
  const index = normalized.lastIndexOf('/');
  return index >= 0 ? normalized.slice(0, index) : '';
}

function stripHash(path: string) {
  return path.split('#')[0].split('?')[0];
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

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBlobPart(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
