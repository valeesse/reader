import { readEpubResource, toLocalAssetUrl } from '../lib/readerClient';
import { estimateStringBytes, ReaderContentCache, ReaderWorkScheduler, adaptiveReaderBudget } from './readerCacheCoordinator';
import { READER_IMAGE_RADIUS } from './readerDocumentStyles';
import type { ReadiumResourceLike } from './readiumPublication';
import { ReadiumLink } from './readiumPublicationModel';
import {
  dirname,
  isExternalUrl,
  isMissingOptionalEpubResource,
  normalizeZipPath,
  parseXml,
  resolveZipPath,
  rewriteUrlAttributes,
  stripHash,
  touchKey,
  warnEpubRewriteOnce,
} from './readiumPublicationSupport';

const PAYLOAD_LIMIT = 72;
const BLOB_LIMIT = 96;
const BLOB_BYTES = adaptiveReaderBudget(48 * 1024 * 1024, 24 * 1024 * 1024);
const FRONTEND_BYTES = adaptiveReaderBudget(48 * 1024 * 1024, 24 * 1024 * 1024);
const TRANSFORMED_BYTES = adaptiveReaderBudget(32 * 1024 * 1024, 16 * 1024 * 1024);

class ReadiumResource implements ReadiumResourceLike {
  constructor(private linkValue: ReadiumLink, private manager: EpubResourceManager) {}
  async link() { return this.linkValue; }
  async length() { return (await this.read())?.byteLength; }
  async read() { return this.manager.read(this.linkValue); }
  async readAsString(signal?: AbortSignal) { return this.manager.readAsString(this.linkValue, signal); }
  async readAsJSON() { const text = await this.readAsString(); return text ? JSON.parse(text) : undefined; }
  async readAsXML() { const text = await this.readAsString(); return text ? parseXml(text, 'application/xml') : undefined; }
  close() {}
}

export class EpubResourceManager {
  private payloads = new ReaderContentCache<{ href: string; mediaType: string; text?: string | null; filePath?: string | null; binaryUrl?: string | null }>('epub-payload', PAYLOAD_LIMIT, FRONTEND_BYTES);
  private transformed = new ReaderContentCache<string>('epub-transformed', 24, TRANSFORMED_BYTES);
  private scheduler = new ReaderWorkScheduler(2);
  private blobUrls = new Map<string, string>();
  private blobOrder: string[] = [];
  private blobSizes = new Map<string, number>();
  private blobBytes = 0;

  constructor(private resourceId: string, private sessionId: string) {}
  get(link: ReadiumLink) { return new ReadiumResource(link, this); }
  async sourceText(link: ReadiumLink) { return (await this.payloadFor(link.href)).text ?? ''; }
  async read(link: ReadiumLink) {
    if (link.mediaType.isHTML || link.type === 'text/css') return new TextEncoder().encode(await this.readAsString(link) || '');
    const payload = await this.payloadFor(link.href);
    const bytes = await this.binaryBytes(payload);
    if (bytes) return bytes;
    return typeof payload.text === 'string' ? new TextEncoder().encode(payload.text) : undefined;
  }
  async readAsString(link: ReadiumLink, signal?: AbortSignal) {
    const key = normalizeZipPath(stripHash(link.href));
    if (link.mediaType.isHTML || link.type === 'text/css') {
      return this.transformed.getOrCreate(key, async () => {
        const text = (await this.payloadFor(link.href, signal)).text ?? '';
        const result = link.mediaType.isHTML ? await this.rewriteHtml(text, link.href) : await this.rewriteCss(text, link.href);
        this.transformed.updateSize(key, estimateStringBytes(result));
        return result;
      });
    }
    return (await this.payloadFor(link.href, signal)).text ?? undefined;
  }
  async prepare(links: ReadiumLink[], direction: -1 | 0 | 1) {
    this.scheduler.replaceWindow(links.map((link) => `content:${link.href}`));
    await Promise.all(links.map((link, index) => this.scheduler.schedule(`content:${link.href}`, index < 2 ? 1 : 2, async (signal) => {
      await this.readAsString(link, signal);
      if (signal.aborted) throw new DOMException('Stale EPUB prefetch', 'AbortError');
    })));
  }
  advanceGeneration() { this.scheduler.advanceGeneration(2); }
  close() {
    for (const url of this.blobUrls.values()) URL.revokeObjectURL(url);
    this.blobUrls.clear(); this.blobOrder = []; this.blobSizes.clear(); this.blobBytes = 0;
    this.payloads.clear(); this.transformed.clear(); this.scheduler.close();
  }
  private payloadFor(href: string, signal?: AbortSignal) {
    const key = normalizeZipPath(stripHash(href));
    return this.payloads.getOrCreate(key, async () => {
      const payload = await readEpubResource(this.resourceId, this.sessionId, key, signal);
      this.payloads.updateSize(key, typeof payload.text === 'string' ? estimateStringBytes(payload.text) : 256);
      return payload;
    });
  }
  private async blobUrlFor(href: string) {
    const key = normalizeZipPath(stripHash(href));
    const existing = this.blobUrls.get(key);
    if (existing) { touchKey(this.blobOrder, key); return existing; }
    const link = new ReadiumLink({ href: key });
    const payload = await this.payloadFor(key);
    const type = payload.mediaType || link.type;
    const bytes = type !== 'text/css' && !link.mediaType.isHTML ? await this.binaryBytes(payload) : undefined;
    const content = bytes || (type === 'text/css' ? await this.rewriteCss(payload.text ?? '', key) : payload.text ?? '');
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    this.rememberBlobUrl(key, url, blob.size);
    return url;
  }
  private async binaryBytes(payload: { binaryUrl?: string | null; filePath?: string | null }) {
    const url = payload.binaryUrl || (payload.filePath ? toLocalAssetUrl(payload.filePath) : undefined);
    if (!url) return undefined;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`EPUB binary resource failed (${response.status})`);
    return new Uint8Array(await response.arrayBuffer());
  }
  private rememberBlobUrl(key: string, url: string, bytes: number) {
    this.blobBytes += bytes - (this.blobSizes.get(key) || 0);
    this.blobUrls.set(key, url); this.blobSizes.set(key, bytes); touchKey(this.blobOrder, key);
    while (this.blobOrder.length > BLOB_LIMIT || this.blobBytes > BLOB_BYTES) {
      const oldest = this.blobOrder.shift();
      if (!oldest) break;
      const oldUrl = this.blobUrls.get(oldest);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      this.blobBytes = Math.max(0, this.blobBytes - (this.blobSizes.get(oldest) || 0));
      this.blobUrls.delete(oldest); this.blobSizes.delete(oldest);
    }
  }
  private async rewriteHtml(html: string, href: string) {
    const doc = parseXml(html, 'application/xhtml+xml');
    if (doc.querySelector('parsererror')) return html;
    doc.querySelectorAll('script, iframe, frame, object, embed, portal, base, form, meta[http-equiv="refresh"]')
      .forEach((element) => element.remove());
    doc.querySelectorAll('*').forEach((element) => Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (
        name.startsWith('on')
        || name === 'srcdoc'
        || name === 'formaction'
        || ((name === 'href' || name === 'src' || name === 'xlink:href') && /^(?:javascript:|data:text\/html)/i.test(value))
      ) element.removeAttribute(attribute.name);
    }));
    doc.querySelectorAll('a[href]').forEach((anchor) => {
      if (/^\s*javascript:/i.test(anchor.getAttribute('href') || '')) anchor.setAttribute('href', '#');
    });
    await rewriteUrlAttributes(doc, dirname(href), (resourceHref) => this.blobUrlFor(resourceHref));
    installPublicationCsp(doc);
    doc.querySelectorAll('img, picture, figure, svg, svg image').forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (htmlElement.tagName.toLowerCase() === 'svg' && !htmlElement.querySelector('image')) return;
      htmlElement.style.setProperty('border-radius', READER_IMAGE_RADIUS, 'important');
      htmlElement.style.setProperty('clip-path', `inset(0 round ${READER_IMAGE_RADIUS})`, 'important');
      if (htmlElement.tagName.toLowerCase() === 'img') htmlElement.style.setProperty('cursor', 'zoom-in', 'important');
    });
    return new XMLSerializer().serializeToString(doc);
  }
  private async rewriteCss(css: string, href: string) {
    const baseDir = dirname(href);
    const parts: string[] = [];
    const regex = /url\((['"]?)(.*?)\1\)/g;
    let lastIndex = 0;
    for (let match = regex.exec(css); match; match = regex.exec(css)) {
      parts.push(css.slice(lastIndex, match.index));
      const quote = match[1] || '';
      const rawUrl = String(match[2] || '').trim();
      if (!rawUrl) parts.push(match[0]);
      else if (isExternalUrl(rawUrl)) parts.push('url("")');
      else {
        const [pathPart, suffix = ''] = rawUrl.split(/(?=[?#])/);
        const resolved = resolveZipPath(baseDir, pathPart);
        try { parts.push(`url(${quote}${await this.blobUrlFor(resolved)}${suffix}${quote})`); }
        catch (error) {
          if (!isMissingOptionalEpubResource(error)) warnEpubRewriteOnce(`css:${resolved}`, 'Failed to rewrite EPUB CSS resource URL', { href, resolved, error });
          parts.push(match[0]);
        }
      }
      lastIndex = regex.lastIndex;
    }
    parts.push(css.slice(lastIndex));
    return parts.join('');
  }
}

function installPublicationCsp(doc: XMLDocument) {
  const head = doc.querySelector('head');
  if (!head) return;
  head.querySelectorAll('meta[http-equiv="Content-Security-Policy" i]').forEach((element) => element.remove());
  const meta = doc.createElementNS(doc.documentElement.namespaceURI, 'meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute(
    'content',
    "default-src 'none'; img-src blob: data:; font-src blob: data:; style-src 'unsafe-inline' blob:; media-src blob: data:; script-src 'none'; frame-src 'none'; object-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'",
  );
  head.prepend(meta);
}
