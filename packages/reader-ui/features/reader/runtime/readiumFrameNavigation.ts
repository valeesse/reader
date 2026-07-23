import { EpubNavigator } from '../../../vendor/readium-navigator';
import { yieldReaderTask } from '../../../lib/readerScheduler';
import { currentReadiumFrame, getLiveReadiumIframe, readiumFrames } from './readiumNavigatorAdapter';

export function snapContinuousResourceBoundary(navigator: EpubNavigator, direction: -1 | 1, remainingFrames = 6) {
  window.requestAnimationFrame(() => {
    // Use the navigator's active frame directly. The outgoing frame is kept
    // visible during handoff and therefore cannot be selected by visibility.
    const handle = readiumFrames(navigator)[0];
    const wnd = getLiveReadiumIframe(handle)?.contentWindow;
    const scroller = wnd?.document.scrollingElement;
    if (scroller && wnd) {
      scroller.scrollTop = direction > 0
        ? 0
        : Math.max(0, scroller.scrollHeight - wnd.innerHeight);
    }
    if (remainingFrames > 1) snapContinuousResourceBoundary(navigator, direction, remainingFrames - 1);
  });
}

export function isNearResourceBoundary(navigator: EpubNavigator, href: string, direction: -1 | 1) {
  const normalized = href.split('#')[0];
  const viewportEntry = Array.from(navigator.viewport.progressions.entries())
    .find(([key]) => key.split('#')[0] === normalized)?.[1];
  if (!viewportEntry) return true;
  const frame = currentReadiumFrame(navigator);
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const scroller = wnd?.document.scrollingElement;
  let pageFraction = 0.2;
  if (wnd && scroller) {
    const horizontal = scroller.scrollWidth > wnd.innerWidth * 1.25;
    const extent = horizontal ? scroller.scrollWidth : scroller.scrollHeight;
    const viewportSize = horizontal ? wnd.innerWidth : wnd.innerHeight;
    if (extent > 0) pageFraction = Math.min(1, viewportSize / extent);
  }
  return direction > 0
    ? viewportEntry.end >= 1 - pageFraction
    : viewportEntry.start <= pageFraction;
}

export function normalizeWheelDelta(event: WheelEvent, container: HTMLElement | null) {
  const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return dominantDelta * 16;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return dominantDelta * Math.max(1, container?.clientHeight || window.innerHeight);
  }
  return dominantDelta;
}

export function yieldForReaderPreparation() {
  return yieldReaderTask('background', { timeout: 120 });
}
