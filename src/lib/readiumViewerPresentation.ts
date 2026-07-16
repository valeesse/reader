import { EpubNavigator, ReadiumLocator } from '../vendor/readium-navigator';
import {
  pageFromLocator,
  progressionFromLocator,
  ReadiumPublicationLike,
} from './readiumPublication';
import { currentReadiumFrame, getLiveReadiumIframe, readiumFrames } from './readiumNavigatorAdapter';

type PageGeometry = {
  viewportWidth: number; viewportHeight: number; scrollWidth: number; scrollHeight: number;
  columnCount: number; columnGap: number; horizontal: boolean; stride: number;
};
const geometryCache = new WeakMap<Document, PageGeometry>();

export function formatProgressLabel(progress: number) {
  return `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`;
}
export function formatResourceStripPageCounter(locator: ReadiumLocator, publication: ReadiumPublicationLike) {
  const page = pageFromLocator(locator, publication);
  const percent = Math.max(0, Math.min(100, Math.round(progressionFromLocator(locator, publication) * 100)));
  return `全书位置 ${page.current} / ${page.total} · ${percent}%`;
}
export function formatEpubPageCounter(navigator: EpubNavigator, locator: ReadiumLocator, publication: ReadiumPublicationLike) {
  const iframe = getLiveReadiumIframe(currentReadiumFrame(navigator));
  const wnd = iframe?.contentWindow;
  const doc = iframe?.contentDocument;
  let geometry = doc ? geometryCache.get(doc) : undefined;
  if (!geometry) {
    const viewportWidth = Math.max(1, wnd?.innerWidth || doc?.documentElement.clientWidth || 1);
    const viewportHeight = Math.max(1, wnd?.innerHeight || doc?.documentElement.clientHeight || 1);
    const scrollWidth = Math.max(viewportWidth, doc?.documentElement.scrollWidth || 0, doc?.body?.scrollWidth || 0);
    const scrollHeight = Math.max(viewportHeight, doc?.documentElement.scrollHeight || 0, doc?.body?.scrollHeight || 0);
    const style = wnd && doc ? wnd.getComputedStyle(doc.documentElement) : undefined;
    const columnCount = Math.max(1, Number.parseInt(style?.columnCount || '', 10) || 1);
    const columnGap = Math.max(0, Number.parseFloat(style?.columnGap || '') || 0);
    const horizontal = scrollWidth > viewportWidth * 1.1;
    geometry = { viewportWidth, viewportHeight, scrollWidth, scrollHeight, columnCount, columnGap, horizontal, stride: horizontal ? (viewportWidth + (columnCount > 1 ? columnGap : 0)) / columnCount : viewportHeight };
    if (doc) geometryCache.set(doc, geometry);
  }
  const scroller = doc?.scrollingElement as HTMLElement | null;
  const offset = geometry.horizontal ? Math.abs(scroller?.scrollLeft || wnd?.scrollX || 0) : Math.max(0, scroller?.scrollTop || wnd?.scrollY || 0);
  const extent = geometry.horizontal ? geometry.scrollWidth : geometry.scrollHeight;
  const total = Math.max(1, Math.ceil((extent - 1) / geometry.stride));
  const current = Math.max(1, Math.min(total, Math.floor((offset + 1) / geometry.stride) + 1));
  const end = Math.min(total, current + (geometry.horizontal ? geometry.columnCount : 1) - 1);
  const page = pageFromLocator(locator, publication);
  return `本章${geometry.horizontal ? '页' : '屏'} ${end > current ? `${current}–${end}` : current} / ${total} · 全书位置 ${page.current} / ${page.total} · ${Math.round((page.current / page.total) * 100)}%`;
}
export function invalidateReadiumDocumentGeometry(doc: Document) { geometryCache.delete(doc); }
export function invalidateReadiumPageGeometry(navigator: EpubNavigator) {
  readiumFrames(navigator).forEach((frame) => {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    if (doc) geometryCache.delete(doc);
  });
}
export function watchReadiumFrameLayout(wnd: Window, onLayout: () => void) {
  const doc = wnd.document;
  const notify = () => { geometryCache.delete(doc); onLayout(); };
  wnd.addEventListener('load', notify, { once: true });
  doc.fonts?.ready.then(notify).catch(() => {});
  doc.querySelectorAll('img').forEach((image) => {
    if (!(image as HTMLImageElement).complete) {
      image.addEventListener('load', notify, { once: true });
      image.addEventListener('error', notify, { once: true });
    }
  });
}
export function installReadiumFrameStyles(doc: Document) {
  if (!doc?.head || doc.getElementById('zenith-readium-frame-style')) return;
  const style = doc.createElement('style');
  style.id = 'zenith-readium-frame-style';
  style.textContent = `
    :root {
      -webkit-column-gap: var(--RS__colGap, 0px) !important;
      -moz-column-gap: var(--RS__colGap, 0px) !important;
      column-gap: var(--RS__colGap, 0px) !important;
    }
    :root:not([style*="readium-scroll-on"]) body {
      padding-block-start: 0 !important;
      padding-inline-end: 0 !important;
      padding-block-end: 0 !important;
      padding-inline-start: 0 !important;
    }
    img {
      border-radius: 5px !important; cursor: zoom-in !important; display: block;
      height: auto; max-width: 100%; object-fit: contain;
    }
    body > img, body > picture, body > svg { margin-inline: auto !important; }
    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) {
      align-items: center !important; box-sizing: border-box !important; display: flex !important;
      flex-direction: column !important; gap: 28px !important; justify-content: center !important;
      min-height: 100vh !important; padding: 24px !important;
    }
    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) img {
      margin: 0 auto !important; max-height: calc(100vh - 48px) !important; width: auto !important;
    }
    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) > *,
    body:has(img):not(:has(p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote)) :is(div, section, figure) {
      align-items: center !important; box-sizing: border-box !important; display: flex !important;
      flex-wrap: wrap !important; gap: 28px !important; justify-content: center !important;
      margin-inline: auto !important; max-width: 100% !important;
    }`;
  doc.head.appendChild(style);
}
export function revealReadiumFrames(container: HTMLElement | null, navigator: EpubNavigator | null) {
  if (!container || !navigator) return;
  const frames = readiumFrames(navigator);
  const active = new Set(frames.map(getLiveReadiumIframe).filter((iframe): iframe is HTMLIFrameElement => Boolean(iframe && container.contains(iframe))));
  container.querySelectorAll<HTMLIFrameElement>('.readium-navigator-iframe').forEach((iframe) => {
    if (active.has(iframe)) return;
    iframe.style.visibility = 'hidden';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
  });
  frames.forEach((frame) => {
    const iframe = getLiveReadiumIframe(frame);
    if (!iframe || !container.contains(iframe)) return;
    iframe.style.removeProperty('visibility');
    iframe.style.removeProperty('opacity');
    iframe.style.removeProperty('pointer-events');
    iframe.removeAttribute('aria-hidden');
  });
}
export function createScrollTransitionSnapshot(source: HTMLIFrameElement, container: HTMLElement) {
  const sourceDoc = source.contentDocument;
  if (!sourceDoc || !source.contentWindow) return undefined;
  const snapshot = document.createElement('iframe');
  snapshot.className = 'zenith-scroll-transition-snapshot';
  snapshot.setAttribute('aria-hidden', 'true');
  snapshot.setAttribute('sandbox', 'allow-same-origin');
  const bounds = container.getBoundingClientRect();
  Object.assign(snapshot.style, { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });
  document.body.appendChild(snapshot);
  const snapshotDoc = snapshot.contentDocument;
  if (!snapshotDoc) { snapshot.remove(); return undefined; }
  const root = sourceDoc.documentElement.cloneNode(true) as HTMLElement;
  root.querySelectorAll('script').forEach((script) => script.remove());
  const base = snapshotDoc.createElement('base');
  base.href = sourceDoc.baseURI;
  (root.querySelector('head') || root).prepend(base);
  snapshotDoc.replaceChild(root, snapshotDoc.documentElement);
  const top = sourceDoc.scrollingElement?.scrollTop || 0;
  const left = sourceDoc.scrollingElement?.scrollLeft || 0;
  const sync = () => {
    if (!snapshot.contentDocument?.scrollingElement) return;
    snapshot.contentDocument.scrollingElement.scrollTop = top;
    snapshot.contentDocument.scrollingElement.scrollLeft = left;
  };
  sync(); requestAnimationFrame(sync);
  return snapshot;
}
