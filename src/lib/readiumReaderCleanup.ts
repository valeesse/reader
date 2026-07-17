import { cancelReaderIdle, type ReaderIdleHandle } from './readerScheduler';
import type { ReaderTocItem } from '../types';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

interface CleanupOptions {
  onTocChange: (items: ReaderTocItem[]) => void;
  flushProgressSave: () => void;
  pageCounterTimer: number | null;
  tocIdleId: ReaderIdleHandle | null;
  cancel: () => void;
  handlePageHide: () => void;
}

export function cleanupReadiumReader(runtime: ReadiumReaderRuntime, options: CleanupOptions) {
  options.cancel();
  runtime.pageCounterRefreshRef.current = () => {};
  if (options.pageCounterTimer !== null) window.clearTimeout(options.pageCounterTimer);
  cancelReaderIdle(options.tocIdleId);
  window.removeEventListener('pagehide', options.handlePageHide);
  options.onTocChange([]);
  if (runtime.progressSaveTimerRef.current !== null) {
    window.clearTimeout(runtime.progressSaveTimerRef.current);
    runtime.progressSaveTimerRef.current = null;
  }
  if (runtime.navigationUnlockTimerRef.current !== null) {
    window.clearTimeout(runtime.navigationUnlockTimerRef.current);
    runtime.navigationUnlockTimerRef.current = null;
  }
  if (runtime.absoluteNavigationTimerRef.current !== null) {
    window.clearTimeout(runtime.absoluteNavigationTimerRef.current);
    runtime.absoluteNavigationTimerRef.current = null;
  }
  runtime.absoluteNavigationPendingRef.current = null;
  runtime.absoluteNavigationRunningRef.current = false;
  if (runtime.seekPreviewTimerRef.current !== null) {
    window.clearTimeout(runtime.seekPreviewTimerRef.current);
    runtime.seekPreviewTimerRef.current = null;
  }
  runtime.seekPreviewPendingRef.current = null;
  if (runtime.scrollBoundaryGestureTimerRef.current !== null) {
    window.clearTimeout(runtime.scrollBoundaryGestureTimerRef.current);
    runtime.scrollBoundaryGestureTimerRef.current = null;
  }
  runtime.scrollBoundaryGestureLockedRef.current = false;
  runtime.scrollBoundaryPendingDirectionRef.current = 0;
  runtime.wheelDeltaRef.current = 0;
  runtime.containerRef.current?.classList.remove('zenith-scroll-gesture-locked');
  document.querySelectorAll('.zenith-scroll-transition-snapshot').forEach((snapshot) => snapshot.remove());
  runtime.containerRef.current?.querySelectorAll<HTMLIFrameElement>(
    '.zenith-scroll-transition-outgoing, .zenith-scroll-transition-incoming',
  ).forEach((iframe) => {
    iframe.classList.remove('zenith-scroll-transition-outgoing', 'zenith-scroll-transition-incoming');
    iframe.style.removeProperty('visibility');
    iframe.style.removeProperty('opacity');
  });
  runtime.navigationTokenRef.current += 1;
  if (runtime.navigationRetryTimerRef.current !== null) {
    window.clearTimeout(runtime.navigationRetryTimerRef.current);
    runtime.navigationRetryTimerRef.current = null;
  }
  runtime.navigationLockedRef.current = false;
  runtime.pendingNavigationRef.current = 0;
  runtime.navigationRetryCountRef.current = 0;
  runtime.navigationByTurnRequestRef.current.clear();
  runtime.layoutCacheRef.current.invalidate();
  runtime.prepareGenerationRef.current += 1;
  runtime.preparedTargetRef.current = null;
  runtime.resizeAnchorRef.current = undefined;
  runtime.stableViewportAnchorRef.current = undefined;
  if (runtime.anchorCaptureRafRef.current !== null) window.cancelAnimationFrame(runtime.anchorCaptureRafRef.current);
  runtime.anchorCaptureRafRef.current = null;
  runtime.layoutRestoringRef.current = false;
  if (runtime.settingsApplyTimerRef.current !== null) window.clearTimeout(runtime.settingsApplyTimerRef.current);
  if (runtime.resizeTimerRef.current !== null) window.clearTimeout(runtime.resizeTimerRef.current);
  runtime.operations.cancelDeferredWork(true);
  options.flushProgressSave();
  const navigator = runtime.navigatorRef.current;
  runtime.navigatorRef.current = null;
  runtime.resourceStripRef.current?.destroy();
  runtime.resourceStripRef.current = null;
  runtime.ensureResourceStripRef.current = null;
  navigator?.destroy?.();
  runtime.publicationRef.current?.close();
  runtime.publicationRef.current = null;
}
