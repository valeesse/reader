import { normalizeWheelDelta } from './readiumFrameNavigation';
import { isContinuousScroll } from './readiumViewerModel';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

const WHEEL_PAGE_THRESHOLD = 48;
const WHEEL_GESTURE_RESET_MS = 140;

export function installWheelController(runtime: ReadiumReaderRuntime) {
  const releaseScrollBoundaryGestureAfterQuietPeriod = () => {
    if (runtime.scrollBoundaryGestureTimerRef.current !== null) {
      window.clearTimeout(runtime.scrollBoundaryGestureTimerRef.current);
    }
    runtime.scrollBoundaryGestureTimerRef.current = window.setTimeout(() => {
      runtime.scrollBoundaryGestureTimerRef.current = null;
      runtime.scrollBoundaryGestureLockedRef.current = false;
      runtime.containerRef.current?.classList.remove('zenith-scroll-gesture-locked');
      runtime.wheelDeltaRef.current = 0;
      const pendingDirection = runtime.scrollBoundaryPendingDirectionRef.current;
      runtime.scrollBoundaryPendingDirectionRef.current = 0;
      if (pendingDirection !== 0) runtime.operations.navigatePage(pendingDirection);
    }, WHEEL_GESTURE_RESET_MS);
  };

  const navigateByWheel = (event: WheelEvent) => {
    if (event.ctrlKey || runtime.previewImageRef.current) return;
    if (isContinuousScroll(runtime.settingsRef.current)) {
      if (runtime.scrollBoundaryGestureLockedRef.current) {
        event.preventDefault();
        event.stopPropagation();
        runtime.wheelLastEventAtRef.current = performance.now();
        releaseScrollBoundaryGestureAfterQuietPeriod();
      }
      return;
    }
    const dominantDelta = normalizeWheelDelta(event, runtime.containerRef.current);
    if (Math.abs(dominantDelta) < 1) return;
    event.preventDefault();
    event.stopPropagation();
    const now = performance.now();
    if (now - runtime.wheelLastEventAtRef.current > WHEEL_GESTURE_RESET_MS
      || Math.sign(runtime.wheelDeltaRef.current) !== Math.sign(dominantDelta)) {
      runtime.wheelDeltaRef.current = 0;
    }
    runtime.wheelLastEventAtRef.current = now;
    runtime.wheelDeltaRef.current += dominantDelta;
    if (Math.abs(runtime.wheelDeltaRef.current) < WHEEL_PAGE_THRESHOLD) return;
    runtime.wheelDeltaRef.current = 0;
    runtime.operations.navigatePage(dominantDelta > 0 ? 1 : -1, true);
  };

  const navigateContinuousScrollBoundary = (event: WheelEvent, wnd: Window) => {
    if (event.ctrlKey || runtime.previewImageRef.current || !isContinuousScroll(runtime.settingsRef.current)) return;
    const delta = normalizeWheelDelta(event, runtime.containerRef.current);
    if (Math.abs(delta) < 1) return;
    if (runtime.scrollBoundaryGestureLockedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      runtime.wheelLastEventAtRef.current = performance.now();
      releaseScrollBoundaryGestureAfterQuietPeriod();
      return;
    }
    const scroller = wnd.document.scrollingElement;
    if (!scroller) return;
    const maxScrollTop = Math.max(0, scroller.scrollHeight - wnd.innerHeight);
    const atStart = scroller.scrollTop <= 1;
    const atEnd = scroller.scrollTop >= maxScrollTop - 1;
    if ((delta < 0 && !atStart) || (delta > 0 && !atEnd)) return;
    event.preventDefault();
    event.stopPropagation();
    if (runtime.navigationLockedRef.current || runtime.layoutRestoringRef.current
      || runtime.pendingNavigationRef.current !== 0) {
      runtime.wheelDeltaRef.current = 0;
      return;
    }
    const now = performance.now();
    if (now - runtime.wheelLastEventAtRef.current > WHEEL_GESTURE_RESET_MS
      || Math.sign(runtime.wheelDeltaRef.current) !== Math.sign(delta)) {
      runtime.wheelDeltaRef.current = 0;
    }
    runtime.wheelLastEventAtRef.current = now;
    runtime.wheelDeltaRef.current += delta;
    if (Math.abs(runtime.wheelDeltaRef.current) < WHEEL_PAGE_THRESHOLD) return;
    runtime.wheelDeltaRef.current = 0;
    runtime.scrollBoundaryGestureLockedRef.current = true;
    runtime.scrollBoundaryPendingDirectionRef.current = delta > 0 ? 1 : -1;
    runtime.containerRef.current?.classList.add('zenith-scroll-gesture-locked');
    releaseScrollBoundaryGestureAfterQuietPeriod();
  };

  runtime.operations.navigateByWheel = navigateByWheel;
  runtime.operations.navigateContinuousScrollBoundary = navigateContinuousScrollBoundary;
}
