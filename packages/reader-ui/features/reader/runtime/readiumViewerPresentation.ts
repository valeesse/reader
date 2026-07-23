import { EpubNavigator, ReadiumLocator } from '../../../vendor/readium-navigator';
import {
  progressionFromLocator,
  ReadiumPublicationLike,
} from './readiumPublication';
import { currentReadiumFrame, getLiveReadiumIframe, readiumFrames } from './readiumNavigatorAdapter';
import { chapterPageFromProgress, updatePublicationPageMap } from './publicationPageMap';
import { READER_IMAGE_RADIUS } from './readerDocumentStyles';

type PageGeometry = {
  viewportWidth: number; viewportHeight: number; scrollWidth: number; scrollHeight: number;
  columnCount: number; columnGap: number; horizontal: boolean; stride: number;
};
const geometryCache = new WeakMap<Document, PageGeometry>();

export function formatResourceStripPageCounter(
  locator: ReadiumLocator,
  publication: ReadiumPublicationLike,
  metrics?: { resourceCurrent: number; resourceTotal: number; publicationCurrent: number; publicationTotal: number },
) {
  if (!metrics) return formatProgressPercent(progressionFromLocator(locator, publication));
  const progress = progressionFromLocator(locator, publication);
  const chapter = chapterPageFromProgress(publication, progress, { current: metrics.publicationCurrent, total: metrics.publicationTotal });
  return `本章屏 ${chapter.current} / ${chapter.total} · 全书屏 ${metrics.publicationCurrent} / ${metrics.publicationTotal} · ${formatProgressPercent(progress)}`;
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
  const layoutKey = [geometry.viewportWidth, geometry.viewportHeight, geometry.columnCount, geometry.columnGap, geometry.horizontal].join(':');
  const publicationPage = updatePublicationPageMap(publication, locator.href, current, total, layoutKey);
  const progress = progressionFromLocator(locator, publication);
  const chapter = chapterPageFromDocument(publication, locator.href, doc || undefined, geometry, current)
    || { current, total };
  return `本章${geometry.horizontal ? '页' : '屏'} ${chapter.current} / ${chapter.total} · 全书页 ${publicationPage.current} / ${publicationPage.total}${publicationPage.estimated ? '（估算）' : ''} · ${formatProgressPercent(progress)}`;
}
function chapterPageFromDocument(
  publication: ReadiumPublicationLike,
  href: string,
  doc: Document | undefined,
  geometry: PageGeometry,
  currentPage: number,
) {
  if (!doc) return undefined;
  const resource = publication.readingOrder.findWithHref(href)?.href || href.split('#')[0];
  const anchors = publication.toc.items.flatMap((link) => {
    const linkResource = publication.readingOrder.findWithHref(link.href)?.href || link.href.split('#')[0];
    const fragment = link.locator.locations.fragments?.[0];
    if (linkResource !== resource || !fragment) return [];
    const element = doc.getElementById(fragment);
    if (!element) return [];
    const rect = element.getBoundingClientRect();
    const scroller = doc.scrollingElement as HTMLElement | null;
    const offset = geometry.horizontal
      ? Math.abs(scroller?.scrollLeft || 0) + rect.left
      : Math.max(0, scroller?.scrollTop || 0) + rect.top;
    return [{ page: Math.max(1, Math.floor(Math.max(0, offset) / geometry.stride) + 1) }];
  }).sort((left, right) => left.page - right.page);
  if (anchors.length === 0) return undefined;
  let index = 0;
  while (index + 1 < anchors.length && anchors[index + 1].page <= currentPage) index += 1;
  const start = anchors[index].page;
  const end = anchors[index + 1]?.page || Math.max(currentPage, Math.ceil((geometry.horizontal ? geometry.scrollWidth : geometry.scrollHeight) / geometry.stride));
  return {
    current: Math.max(1, currentPage - start + 1),
    total: Math.max(1, end - start + (anchors[index + 1] ? 0 : 1)),
  };
}
function formatProgressPercent(progress: number) {
  const percent = Math.max(0, Math.min(100, progress * 100));
  return `${percent === 0 || percent === 100 ? percent.toFixed(0) : percent.toFixed(1)}%`;
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
  let raf: number | null = null;
  const notify = () => {
    geometryCache.delete(doc);
    if (raf !== null) return;
    raf = wnd.requestAnimationFrame(() => { raf = null; onLayout(); });
  };
  wnd.addEventListener('load', notify, { once: true });
  doc.fonts?.ready.then(notify).catch(() => {});
  doc.querySelectorAll('img').forEach((image) => {
    if (!(image as HTMLImageElement).complete) {
      image.addEventListener('load', notify, { once: true });
      image.addEventListener('error', notify, { once: true });
    }
  });
  const resizeObserver = new ResizeObserver(notify);
  resizeObserver.observe(doc.documentElement);
  if (doc.body) resizeObserver.observe(doc.body);
  const mutationObserver = new MutationObserver(notify);
  mutationObserver.observe(doc.documentElement, { childList: true, subtree: true, attributes: true });
  wnd.addEventListener('pagehide', () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    if (raf !== null) wnd.cancelAnimationFrame(raf);
  }, { once: true });
}
export function installReadiumFrameStyles(doc: Document) {
  if (!doc?.head || doc.getElementById('zenith-readium-frame-style')) return;
  const style = doc.createElement('style');
  style.id = 'zenith-readium-frame-style';
  style.textContent = `
    :root {
      --ZENITH__imageRadius: ${READER_IMAGE_RADIUS};
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
    :root:not([data-zenith-layout="fixed"]) img {
      border-radius: var(--ZENITH__imageRadius) !important; cursor: zoom-in !important; display: block !important;
      clip-path: inset(0 round var(--ZENITH__imageRadius)) !important;
      height: auto; max-width: 100%; object-fit: contain;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"] :is(img, svg:has(image)) {
      border-radius: var(--ZENITH__imageRadius) !important;
      clear: both !important;
      clip-path: inset(0 round var(--ZENITH__imageRadius)) !important;
      display: block !important;
      float: none !important;
      margin-inline: auto !important;
      max-width: 100% !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"] :is(figure, picture):has(img, svg) {
      border-radius: var(--ZENITH__imageRadius) !important;
      clear: both !important;
      clip-path: inset(0 round var(--ZENITH__imageRadius)) !important;
      float: none !important;
      margin-inline: auto !important;
      max-width: 100% !important;
      text-align: center !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"] picture {
      display: block !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-media-only="true"]:not([data-zenith-page-mode="scroll"]) [data-zenith-media-page]:not(img):not(svg) {
      align-items: center !important;
      block-size: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      display: flex !important;
      flex-direction: column !important;
      height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      justify-content: center !important;
      margin: 0 auto !important;
      max-height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-width: 100% !important;
      padding: 8px !important;
      width: 100% !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-media-only="true"]:not([data-zenith-page-mode="scroll"]) [data-zenith-media-page]:is(img, svg) {
      block-size: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      display: block !important;
      height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      margin: 0 auto !important;
      max-height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-width: 100% !important;
      object-fit: contain !important;
      padding: 8px !important;
      width: 100% !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-media-only="true"]:not([data-zenith-page-mode="scroll"]) [data-zenith-media-page] > :is(img, svg),
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-media-only="true"]:not([data-zenith-page-mode="scroll"]) [data-zenith-media-page] > * > :is(img, svg):only-child {
      display: block !important;
      height: 100% !important;
      margin: auto !important;
      max-height: 100% !important;
      max-width: 100% !important;
      object-fit: contain !important;
      width: 100% !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-page-mode="single"] img {
      box-sizing: border-box !important;
      break-inside: avoid !important;
      max-block-size: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-width: max(1px, calc(var(--ZENITH__pageImageMaxWidth, 100vw) - 16px)) !important;
      min-block-size: 0 !important;
      min-height: 0 !important;
      min-width: 0 !important;
      object-fit: contain !important;
      width: auto !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-page-mode="single"] :is(figure, picture):has(img) {
      break-inside: avoid !important;
      max-block-size: 100vh !important;
      max-height: 100vh !important;
      max-width: 100% !important;
    }
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-page-mode="single"] body > svg,
    :root[data-zenith-layout="reflowable"][data-zenith-book-type="epub"][data-zenith-page-mode="single"] body > * > svg:only-child {
      box-sizing: border-box !important;
      display: block !important;
      height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-height: calc(var(--ZENITH__pageImageMaxHeight, 100vh) - 16px) !important;
      max-width: 100% !important;
      width: 100% !important;
    }
    :root:not([data-zenith-layout="fixed"]) body > img,
    :root:not([data-zenith-layout="fixed"]) body > picture,
    :root:not([data-zenith-layout="fixed"]) body > svg { margin-inline: auto !important; }
    `;
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
    if (!iframe || frame.hidden || !container.contains(iframe)) return;
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
  sanitizeSnapshot(root);
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

function sanitizeSnapshot(root: HTMLElement) {
  root.querySelectorAll('script, iframe, frame, object, embed, portal, meta[http-equiv="refresh"]')
    .forEach((element) => element.remove());
  [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:'))) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}
