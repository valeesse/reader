import type { NativeEpubBookInfo } from '../lib/readerClient';
import type { ReadiumResourceLike } from './readiumPublication';
import {
  createLocator,
  fragmentFromHref,
  mimeFromPath,
  normalizeHref,
  normalizeZipPath,
  stripHash,
} from './readiumPublicationSupport';

const EPUB_PROFILE = 'https://readium.org/webpub-manifest/profiles/epub';

export class ReadiumMediaType {
  constructor(public string: string) {
    this.string ||= 'application/octet-stream';
  }
  get isHTML() { return this.string === 'application/xhtml+xml' || this.string === 'text/html'; }
  get isBitmap() { return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'].includes(this.string); }
  equals(other: { string?: string } | string) { return this.string === (typeof other === 'string' ? other : other?.string); }
}

export class ReadiumLink {
  href: string;
  type: string;
  title?: string;
  rels?: Set<string>;
  properties: Record<string, unknown>;
  mediaType: ReadiumMediaType;

  constructor(values: { href: string; type?: string; title?: string; rels?: Set<string>; properties?: Set<string> | Record<string, unknown> }) {
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
    return baseURL ? new URL(this.href, baseURL).toString() : this.href;
  }
  addProperties(properties: Record<string, unknown>) {
    return new ReadiumLink({ href: this.href, type: this.type, title: this.title, rels: this.rels, properties: { ...this.properties, ...properties } });
  }
  get locator() {
    const fragment = fragmentFromHref(this.href);
    const locatorLocations = this.properties.locatorLocations;
    return createLocator({
      href: stripHash(this.href),
      type: this.type,
      title: this.title,
      locations: {
        progression: 0,
        ...(typeof locatorLocations === 'object' && locatorLocations ? locatorLocations : {}),
        ...(fragment ? { fragments: [fragment], htmlIdValue: fragment } : {}),
      },
    });
  }
}

export class LinkCollection {
  constructor(public items: ReadiumLink[]) {}
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
  findWithRel(rel: string) { return this.items.find((link) => link.rels?.has(rel)); }
  filterByRel(rel: string) { return this.items.filter((link) => link.rels?.has(rel)); }
}

export class ReadiumMetadata {
  title: { getTranslation: () => string; serialize: () => string };
  authors?: Array<{ name: string }>;
  languages?: string[];
  conformsTo = [EPUB_PROFILE];
  layout?: string;
  readingProgression?: string;
  otherMetadata: Record<string, unknown> = {};

  constructor(values: NativeEpubBookInfo['metadata']) {
    this.title = { getTranslation: () => values.title, serialize: () => values.title };
    this.authors = values.author ? [{ name: values.author }] : undefined;
    this.languages = values.language ? [values.language] : ['zh'];
    this.layout = values.layout;
    this.readingProgression = values.readingProgression;
  }
  get effectiveLayout() { return this.layout || 'reflowable'; }
  get effectiveReadingProgression() { return this.readingProgression === 'rtl' ? 'rtl' : 'ltr'; }
}

export type ResourceFactory = { get(link: ReadiumLink): ReadiumResourceLike };
