import { useEffect } from 'react';
import { locatorAtProgress } from './readiumPublication';
import { isContinuousScroll } from './readiumViewerModel';
import type { ReaderSeekRequest, ReaderTocItem } from '../types';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

const IMMEDIATE_PREFETCH_RADIUS = 1;

export function installAbsoluteNavigation(runtime: ReadiumReaderRuntime) {
  const drainAbsoluteNavigation = () => {
    if (runtime.absoluteNavigationRunningRef.current || runtime.layoutRestoringRef.current) return;
    const request = runtime.absoluteNavigationPendingRef.current;
    const navigator = runtime.navigatorRef.current;
    if (!request || !navigator) return;
    runtime.absoluteNavigationPendingRef.current = null;
    runtime.absoluteNavigationRunningRef.current = true;
    const finish = (applied: boolean) => {
      if (runtime.absoluteNavigationTimerRef.current !== null) window.clearTimeout(runtime.absoluteNavigationTimerRef.current);
      runtime.absoluteNavigationTimerRef.current = null;
      runtime.absoluteNavigationRunningRef.current = false;
      if (!applied && !runtime.absoluteNavigationPendingRef.current) runtime.absoluteNavigationPendingRef.current = request;
      window.setTimeout(drainAbsoluteNavigation, applied ? 0 : 32);
    };
    runtime.absoluteNavigationTimerRef.current = window.setTimeout(() => {
      navigator.recoverNavigation();
      finish(false);
    }, 2500);
    if (isContinuousScroll(runtime.settingsRef.current) && runtime.resourceStripRef.current) {
      runtime.resourceStripRef.current.go(request.locator, false).then(finish).catch(() => finish(false));
    } else navigator.go(request.locator, false, finish);
  };

  const submitAbsoluteNavigation = (locator: Parameters<typeof runtime.operations.submitAbsoluteNavigation>[0], requestId: number) => {
    runtime.absoluteNavigationPendingRef.current = { locator, requestId };
    runtime.pendingNavigationRef.current = 0;
    drainAbsoluteNavigation();
  };
  runtime.operations.drainAbsoluteNavigation = drainAbsoluteNavigation;
  runtime.operations.submitAbsoluteNavigation = submitAbsoluteNavigation;
}

export function useReadiumReaderRequests(
  runtime: ReadiumReaderRuntime,
  tocTarget: ReaderTocItem | null,
  seekRequest: ReaderSeekRequest | null,
  loading: boolean,
) {
  useEffect(() => {
    if (!tocTarget?.href) return;
    const publication = runtime.publicationRef.current;
    const navigator = runtime.navigatorRef.current;
    const link = publication?.toc.findExactWithHref(tocTarget.href)
      || publication?.toc.findWithHref(tocTarget.href)
      || publication?.linkWithHref(tocTarget.href);
    if (link && navigator) {
      const fragment = tocTarget.href.split('#')[1];
      const locator = fragment
        ? link.locator.copyWithLocations({ fragments: [decodeURIComponent(fragment)] })
        : link.locator;
      if (isContinuousScroll(runtime.settingsRef.current) && runtime.resourceStripRef.current) {
        runtime.operations.submitAbsoluteNavigation(locator, tocTarget.index ?? Date.now());
      } else runtime.operations.submitAbsoluteNavigation(locator, tocTarget.index ?? Date.now());
    }
  }, [tocTarget, loading]);

  useEffect(() => {
    if (!seekRequest) return;
    const publication = runtime.publicationRef.current;
    const navigator = runtime.navigatorRef.current;
    if (!publication || !navigator || publication.positions.length === 0) return;
    const target = locatorAtProgress(publication, seekRequest.progress);
    if (!target) return;
    publication.prefetchAroundHref(target.href, IMMEDIATE_PREFETCH_RADIUS, 0).catch(() => {});
    if (seekRequest.phase === 'commit') {
      if (runtime.seekPreviewTimerRef.current !== null) {
        window.clearTimeout(runtime.seekPreviewTimerRef.current);
        runtime.seekPreviewTimerRef.current = null;
      }
      runtime.seekPreviewPendingRef.current = null;
      runtime.operations.submitAbsoluteNavigation(target, seekRequest.requestId);
      return;
    }
    runtime.seekPreviewPendingRef.current = { locator: target, requestId: seekRequest.requestId };
    if (runtime.seekPreviewTimerRef.current !== null) return;
    runtime.seekPreviewTimerRef.current = window.setTimeout(() => {
      runtime.seekPreviewTimerRef.current = null;
      const pending = runtime.seekPreviewPendingRef.current;
      runtime.seekPreviewPendingRef.current = null;
      if (pending) runtime.operations.submitAbsoluteNavigation(pending.locator, pending.requestId);
    }, 80);
  }, [seekRequest, loading]);
}

export function useReadiumReaderInput(runtime: ReadiumReaderRuntime, previewImage: unknown, loading: boolean) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (previewImage) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, select, textarea, button, [contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft') runtime.operations.navigatePage(-1);
      else if (event.key === 'ArrowRight') runtime.operations.navigatePage(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  useEffect(() => {
    const element = runtime.containerRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => runtime.operations.navigateByWheel(event);
    element.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => element.removeEventListener('wheel', handleWheel, { capture: true });
  }, [loading]);
}
