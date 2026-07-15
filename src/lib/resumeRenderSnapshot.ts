import { AppSettings, Book } from '../types';
import { ReadiumPublicationLike } from './readiumPublication';

export const RESUME_RENDER_SNAPSHOT_KEY = 'zenith_resume_render_v2';
const MAX_SNAPSHOT_BYTES = 3_600_000;
const SNAPSHOT_PAGE_RADIUS = 6;

type SnapshotDocument = { id: string; html: string };
type SnapshotPage = {
  relative: number;
  documentId: string;
  scrollLeft: number;
  scrollTop: number;
};

export interface ResumeRenderSnapshot {
  version: 2;
  bookId: string;
  contentKey: string;
  capturedAt: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  background: string;
  frameRect: { left: number; top: number; width: number; height: number };
  layoutFingerprint: string;
  documents: SnapshotDocument[];
  pages: SnapshotPage[];
}

type FrameLike = {
  frame?: HTMLIFrameElement;
  iframe?: HTMLIFrameElement;
  destroyed?: boolean;
};

type NavigatorLike = {
  currentLocator?: { href?: string };
  _cframes?: FrameLike[];
  framePool?: { pool?: Map<string, FrameLike> };
};

export function persistResumeRenderSnapshot(
  book: Book,
  navigator: NavigatorLike,
  publication: ReadiumPublicationLike,
  settings: AppSettings,
) {
  const currentFrame = navigator._cframes
    ?.map(frameElement)
    .find((frame) => frame?.contentDocument && getComputedStyle(frame).visibility === 'visible');
  const currentDoc = currentFrame?.contentDocument;
  const currentWindow = currentFrame?.contentWindow;
  const currentScroller = currentDoc?.scrollingElement as HTMLElement | null | undefined;
  if (!currentFrame || !currentDoc?.body || !currentWindow || !currentScroller) return;

  const documents: SnapshotDocument[] = [];
  const pages: SnapshotPage[] = [];
  const currentHref = publication.readingOrder.findWithHref(navigator.currentLocator?.href || '')?.href
    || navigator.currentLocator?.href || 'current';
  const currentDocumentId = `current:${currentHref}`;
  const currentHtml = serializeSnapshotDocument(currentDoc);
  if (!currentHtml) return;
  documents.push({ id: currentDocumentId, html: currentHtml });

  const currentLeft = currentScroller.scrollLeft;
  const currentTop = currentScroller.scrollTop;
  pages.push({ relative: 0, documentId: currentDocumentId, scrollLeft: currentLeft, scrollTop: currentTop });

  const horizontal = currentScroller.scrollWidth > currentWindow.innerWidth * 1.25;
  if (horizontal) {
    const stride = pageStride(currentWindow);
    const max = Math.max(0, currentScroller.scrollWidth - currentWindow.innerWidth);
    const normalized = Math.abs(currentLeft);
    const sign = currentLeft < 0 ? -1 : 1;
    for (let relative = -SNAPSHOT_PAGE_RADIUS; relative <= SNAPSHOT_PAGE_RADIUS; relative += 1) {
      if (relative === 0) continue;
      const target = normalized + relative * stride;
      if (target < -1 || target > max + 1) continue;
      pages.push({ relative, documentId: currentDocumentId, scrollLeft: sign * Math.max(0, Math.min(max, target)), scrollTop: currentTop });
    }
  } else {
    const stride = currentWindow.innerHeight;
    const max = Math.max(0, currentScroller.scrollHeight - currentWindow.innerHeight);
    for (let relative = -SNAPSHOT_PAGE_RADIUS; relative <= SNAPSHOT_PAGE_RADIUS; relative += 1) {
      if (relative === 0) continue;
      const target = currentTop + relative * stride;
      if (target < -1 || target > max + 1) continue;
      pages.push({ relative, documentId: currentDocumentId, scrollLeft: currentLeft, scrollTop: Math.max(0, Math.min(max, target)) });
    }
  }

  const currentIndex = publication.readingOrder.findIndexWithHref(currentHref);
  for (const [href, handle] of navigator.framePool?.pool || []) {
    const index = publication.readingOrder.findIndexWithHref(href);
    const relativeDirection = index === currentIndex - 1 ? -1 : index === currentIndex + 1 ? 1 : 0;
    if (!relativeDirection || pages.some((page) => page.relative === relativeDirection)) continue;
    const frame = frameElement(handle);
    const doc = frame?.contentDocument;
    const wnd = frame?.contentWindow;
    const scroller = doc?.scrollingElement as HTMLElement | null | undefined;
    if (!frame || !doc?.body || !wnd || !scroller) continue;
    const html = serializeSnapshotDocument(doc);
    if (!html) continue;
    const id = `adjacent:${href}`;
    documents.push({ id, html });
    const maxLeft = Math.max(0, scroller.scrollWidth - wnd.innerWidth);
    const maxTop = Math.max(0, scroller.scrollHeight - wnd.innerHeight);
    pages.push({
      relative: relativeDirection,
      documentId: id,
      scrollLeft: relativeDirection < 0 ? (scroller.scrollLeft < 0 ? -maxLeft : maxLeft) : 0,
      scrollTop: relativeDirection < 0 ? maxTop : 0,
    });
  }

  const rect = currentFrame.getBoundingClientRect();
  const snapshot: ResumeRenderSnapshot = {
    version: 2,
    bookId: book.id,
    contentKey: publication.contentKey,
    capturedAt: Date.now(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    background: getComputedStyle(document.documentElement).backgroundColor || getComputedStyle(document.body).backgroundColor || '#fff',
    frameRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    layoutFingerprint: JSON.stringify({
      pageMode: settings.pageMode,
      pageTurnAnimation: settings.pageTurnAnimation,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      paragraphSpacing: settings.paragraphSpacing,
      letterSpacing: settings.letterSpacing,
      pageMargins: settings.pageMargins,
    }),
    documents,
    pages: pages.sort((a, b) => a.relative - b.relative),
  };

  let serialized = JSON.stringify(snapshot);
  if (new Blob([serialized]).size > MAX_SNAPSHOT_BYTES && documents.length > 1) {
    snapshot.documents = documents.slice(0, 1);
    snapshot.pages = pages.filter((page) => page.documentId === currentDocumentId);
    serialized = JSON.stringify(snapshot);
  }
  if (new Blob([serialized]).size > MAX_SNAPSHOT_BYTES) return;
  try {
    localStorage.setItem(RESUME_RENDER_SNAPSHOT_KEY, serialized);
  } catch {
    // A render snapshot is an optional acceleration layer. Never disturb the
    // reading path if the browser quota is constrained.
  }
}

function frameElement(handle?: FrameLike) {
  if (!handle || handle.destroyed) return undefined;
  const frame = handle.frame || handle.iframe;
  return frame?.contentWindow ? frame : undefined;
}

function pageStride(wnd: Window) {
  const style = wnd.getComputedStyle(wnd.document.documentElement);
  const columns = Number.parseInt(style.columnCount, 10) || 1;
  const gap = Number.parseFloat(style.columnGap) || 0;
  return wnd.innerWidth + (columns > 1 ? gap : 0);
}

function serializeSnapshotDocument(doc: Document) {
  try {
    const clone = doc.documentElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, iframe, object, embed, form, base, noscript, template').forEach((element) => element.remove());
    clone.querySelectorAll('meta[http-equiv="Content-Security-Policy"], link[rel="preload"], link[rel="modulepreload"], link[rel="prefetch"]').forEach((element) => element.remove());
    clone.querySelectorAll('*').forEach((element) => {
      for (const attribute of Array.from(element.attributes)) {
        if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
      }
    });

    const css: string[] = [];
    for (const sheet of Array.from(doc.styleSheets)) {
      try {
        css.push(Array.from(sheet.cssRules)
          .filter((rule) => rule.type !== CSSRule.FONT_FACE_RULE && rule.type !== CSSRule.IMPORT_RULE)
          .map((rule) => rule.cssText)
          .join('\n'));
      } catch {
        // Cross-origin rules are not expected in transformed publications, but
        // ignoring one is safer than losing the complete startup snapshot.
      }
    }
    clone.querySelectorAll('link[rel="stylesheet"]').forEach((element) => element.remove());
    if (css.length > 0) {
      const style = clone.ownerDocument.createElement('style');
      style.dataset.zenithResumeSnapshot = 'true';
      style.textContent = css.join('\n');
      clone.querySelector('head')?.appendChild(style);
    }
    const csp = clone.ownerDocument.createElement('meta');
    csp.setAttribute('http-equiv', 'Content-Security-Policy');
    csp.setAttribute('content', "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob: asset: http://asset.localhost https://asset.localhost; font-src data: blob: asset: http://asset.localhost https://asset.localhost");
    clone.querySelector('head')?.prepend(csp);
    return `<!doctype html>${clone.outerHTML}`;
  } catch {
    return undefined;
  }
}
