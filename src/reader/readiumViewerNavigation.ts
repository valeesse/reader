import { EpubNavigator, ReadiumLocator } from '../vendor/readium-navigator';
import { serializeReadiumLocator } from './readiumPublication';
import {
  currentReadiumFrame,
  getLiveReadiumIframe,
  readiumNavigationInFlight,
  releaseReadiumNavigationGuard,
} from './readiumNavigatorAdapter';
import { distanceToRectCenter, textRangeRect, textRangeRects } from './readiumViewerAnchors';

export function navigateToLocator(navigator: EpubNavigator, locator: ReadiumLocator, beforeCorrection?: () => void) {
  return new Promise<void>((resolve) => {
    const direct = navigator as EpubNavigator & { loadLocator?: (locator: ReadiumLocator, callback: (ok: boolean) => void) => void };
    const canRelocate = navigator.currentLocator?.href?.split('#')[0] === locator.href?.split('#')[0] && direct.loadLocator;
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeoutId);
      beforeCorrection?.();
      requestAnimationFrame(() => {
        beforeCorrection?.();
        requestAnimationFrame(() => {
          beforeCorrection?.();
          restoreAnchorOffset(navigator, locator);
          requestAnimationFrame(() => {
            beforeCorrection?.();
            restoreAnchorOffset(navigator, locator);
            resolve();
          });
        });
      });
    };
    const timeoutId = window.setTimeout(async () => {
      if (!canRelocate) {
        await waitUntil(() => !readiumNavigationInFlight(navigator), 1800);
        if (readiumNavigationInFlight(navigator)) releaseReadiumNavigationGuard(navigator);
      }
      finish();
    }, 1800);
    try {
      if (canRelocate) direct.loadLocator!(locator, finish);
      else navigator.go(locator, false, finish);
    } catch { finish(); }
  });
}

export function waitUntil(predicate: () => boolean, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const poll = () => {
      if (predicate() || performance.now() - startedAt >= timeoutMs) resolve();
      else window.setTimeout(poll, 4);
    };
    poll();
  });
}

function restoreAnchorOffset(navigator: EpubNavigator, locator: ReadiumLocator) {
  let locations: Record<string, unknown> | undefined;
  let serializedText: Record<string, unknown> | undefined;
  try {
    const serialized = JSON.parse(serializeReadiumLocator(locator));
    locations = serialized.locations;
    serializedText = serialized.text;
  } catch { return; }
  const wnd = getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentWindow;
  const scroller = wnd?.document.scrollingElement;
  if (!wnd || !scroller) return;
  const selector = readiumAnchorSelector(locator, locations);
  const anchorText = readiumAnchorText(locator, locations, serializedText);
  const element = findAnchorElement(wnd.document, selector, anchorText);
  const rect = element && anchorText ? textRangeRect(element, anchorText) || element.getBoundingClientRect() : element?.getBoundingClientRect();
  if (scroller.scrollWidth > wnd.innerWidth * 1.25) {
    snapPaginatedFrameOffset(wnd, scroller);
    if (rect) {
      const targetX = (typeof locations?.zenithViewportX === 'number' ? locations.zenithViewportX : 0.5) * wnd.innerWidth;
      const targetY = (typeof locations?.zenithViewportY === 'number' ? locations.zenithViewportY : 0.5) * wnd.innerHeight;
      const rects = element && anchorText ? textRangeRects(element, anchorText) : [rect];
      const anchorRect = rects.filter((candidate) => candidate.width > 0 && candidate.height > 0)
        .sort((a, b) => distanceToRectCenter(a, targetX, targetY) - distanceToRectCenter(b, targetX, targetY))[0] || rect;
      const stride = paginatedPhysicalStride(wnd);
      const delta = Math.round((((anchorRect.left + anchorRect.right) / 2) - targetX) / stride);
      if (stride > 1 && delta !== 0) (scroller as HTMLElement).scrollLeft += delta * stride;
    }
    snapPaginatedFrameOffset(wnd, scroller);
    return;
  }
  if (rect && scroller.scrollHeight > wnd.innerHeight * 1.25) {
    const viewportY = typeof locations?.zenithViewportY === 'number' ? locations.zenithViewportY : 0.5;
    scroller.scrollTop += (rect.top + rect.bottom) / 2 - viewportY * wnd.innerHeight;
  }
}

function readiumAnchorSelector(locator: ReadiumLocator, locations?: Record<string, unknown>) {
  if (typeof locations?.cssSelector === 'string') return locations.cssSelector;
  const accessor = (locator.locations as { getCssSelector?: () => string | undefined } | undefined)?.getCssSelector;
  return typeof accessor === 'function' ? accessor.call(locator.locations) : undefined;
}
function readiumAnchorText(locator: ReadiumLocator, locations?: Record<string, unknown>, serializedText?: Record<string, unknown>) {
  if (typeof locations?.zenithAnchorText === 'string') return locations.zenithAnchorText;
  if (typeof serializedText?.highlight === 'string') return serializedText.highlight;
  const highlight = (locator.text as { highlight?: string } | undefined)?.highlight;
  return typeof highlight === 'string' ? highlight : undefined;
}
function findAnchorElement(doc: Document, selector?: string, anchorText?: string) {
  if (selector) {
    try {
      const selected = doc.querySelector(selector);
      if (selected && (!anchorText || normalizeAnchorText(selected.textContent || '').includes(normalizeAnchorText(anchorText)))) return selected;
    } catch {}
  }
  if (!anchorText) return undefined;
  const normalized = normalizeAnchorText(anchorText);
  return Array.from(doc.body?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || [])
    .find((element) => normalizeAnchorText(element.textContent || '').includes(normalized));
}
function normalizeAnchorText(text: string) { return text.replace(/\s+/g, ' ').trim(); }
function snapPaginatedFrameOffset(wnd: Window, scroller: Element) {
  const stride = paginatedPhysicalStride(wnd);
  if (!Number.isFinite(stride) || stride <= 1) return;
  const current = (scroller as HTMLElement).scrollLeft;
  const snapped = Math.round(Math.abs(current) / stride) * stride;
  (scroller as HTMLElement).scrollLeft = current < 0 ? -snapped : snapped;
}
function paginatedPhysicalStride(wnd: Window) {
  const style = wnd.getComputedStyle(wnd.document.documentElement);
  const count = Number.parseInt(style.columnCount, 10) || 1;
  const gap = Number.parseFloat(style.columnGap) || 0;
  return (wnd.innerWidth + (count > 1 ? gap : 0)) / count;
}
