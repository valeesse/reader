import { cancelReaderIdle, scheduleReaderIdle } from './readerScheduler';
import { readerRuntimePolicy } from './readerRuntimePolicy';
import { invalidatePublicationPositionRanges, progressionFromLocator } from './readiumPublication';
import { createReaderLayoutKey } from './readerLayoutCache';
import { formatEpubPageCounter } from './readiumViewerPresentation';
import { isContinuousScroll } from './readiumViewerModel';
import { applyReadiumFrameSettings, waitForFrameReadiness, waitForLayoutFrames } from './readiumFrameLayout';
import { isNearResourceBoundary, yieldForReaderPreparation } from './readiumFrameNavigation';
import { navigatorReservedHref } from './readiumNavigatorAdapter';
import type { ReaderDirection, ReadiumReaderRuntime } from './readiumReaderRuntime';

const STABLE_PREFETCH_RADIUS = readerRuntimePolicy().contentPrefetchRadius;

export function installDeferredOperations(
  runtime: ReadiumReaderRuntime,
  setPageCounter: (value: string) => void,
) {
  const cancelPositionRefinement = () => {
    if (runtime.refinementTimerRef.current !== null) window.clearTimeout(runtime.refinementTimerRef.current);
    if (runtime.refinementIdleRef.current !== null) cancelReaderIdle(runtime.refinementIdleRef.current);
    runtime.refinementTimerRef.current = null;
    runtime.refinementIdleRef.current = null;
    runtime.refinementAbortRef.current?.abort();
    runtime.refinementAbortRef.current = null;
  };

  const cancelDeferredWork = (abortRefinement: boolean) => {
    if (runtime.stablePrefetchTimerRef.current !== null) window.clearTimeout(runtime.stablePrefetchTimerRef.current);
    if (runtime.refinementTimerRef.current !== null) window.clearTimeout(runtime.refinementTimerRef.current);
    if (runtime.refinementIdleRef.current !== null) cancelReaderIdle(runtime.refinementIdleRef.current);
    runtime.stablePrefetchTimerRef.current = null;
    runtime.refinementTimerRef.current = null;
    runtime.refinementIdleRef.current = null;
    if (abortRefinement) {
      runtime.refinementAbortRef.current?.abort();
      runtime.refinementAbortRef.current = null;
    }
  };

  const prepareAdjacentLayouts = async (href: string, direction: ReaderDirection) => {
    const publication = runtime.publicationRef.current;
    const navigator = runtime.navigatorRef.current;
    const container = runtime.containerRef.current;
    if (!publication || !navigator || !container || isContinuousScroll(runtime.settingsRef.current)) {
      navigator?.releasePrepared();
      runtime.preparedTargetRef.current = null;
      return;
    }
    const currentIndex = publication.readingOrder.findIndexWithHref(href);
    if (currentIndex < 0) return;
    const effectiveDirection: -1 | 1 = direction || runtime.deferredDirectionRef.current || 1;
    const currentHref = publication.readingOrder.items[currentIndex].href;
    const nearBoundary = isNearResourceBoundary(navigator, currentHref, effectiveDirection);
    const link = publication.readingOrder.items[currentIndex + effectiveDirection];
    if (!link) {
      navigator.releasePrepared();
      runtime.preparedTargetRef.current = null;
      return;
    }
    const previousTarget = runtime.preparedTargetRef.current;
    const targetChanged = previousTarget?.currentHref !== currentHref
      || previousTarget.direction !== effectiveDirection || previousTarget.href !== link.href;
    const generation = targetChanged ? ++runtime.prepareGenerationRef.current : previousTarget.generation;
    if (targetChanged) navigator.releasePrepared();
    runtime.preparedTargetRef.current = { currentHref, direction: effectiveDirection, href: link.href, generation };
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    const isCurrentTarget = (targetHref: string, targetGeneration: number) => runtime.publicationRef.current === publication
      && runtime.navigatorRef.current === navigator
      && runtime.preparedTargetRef.current?.href === targetHref
      && runtime.preparedTargetRef.current.generation === targetGeneration;
    const layoutKey = `${createReaderLayoutKey(publication.contentKey, runtime.settingsRef.current, viewport, runtime.bookType)}:${link.href}`;
    const layoutReady = runtime.layoutCacheRef.current.isReady(layoutKey);
    const physicalReady = navigator.isPreparedReady(link.locator, layoutKey);
    if (layoutReady && !physicalReady) runtime.layoutCacheRef.current.delete(layoutKey);
    if (physicalReady) {
      if (navigatorReservedHref(navigator) !== link.href) await navigator.reservePrepared(link.locator);
      return;
    }
    const framePreparation = runtime.layoutCacheRef.current.prepare(layoutKey, async () => {
      const reservedFrames = navigator.reservePrepared(link.locator);
      if (!nearBoundary) await yieldForReaderPreparation();
      if (!isCurrentTarget(link.href, generation)) return false;
      const frames = await reservedFrames;
      if (!isCurrentTarget(link.href, generation) || frames.length === 0) return false;
      await Promise.all(frames.map(async (frameWindow) => {
        applyReadiumFrameSettings(frameWindow.document, runtime.settingsRef.current, runtime.bookType);
        await waitForFrameReadiness(frameWindow.document, runtime.bookType);
      }));
      await waitForLayoutFrames();
      if (!isCurrentTarget(link.href, generation)) return false;
      navigator.markPreparedReady(link.locator, layoutKey, frames[0]);
      return navigator.isPreparedReady(link.locator, layoutKey);
    });
    await Promise.all([
      framePreparation,
      publication.prepareContentAroundHref(href, 1, effectiveDirection).catch(() => {}),
    ]);
  };

  const scheduleDeferredWork = (href: string, direction: ReaderDirection, restartRefinement: boolean) => {
    const publication = runtime.publicationRef.current;
    if (!publication || !href) return;
    const resourceChanged = Boolean(runtime.deferredHrefRef.current && runtime.deferredHrefRef.current !== href);
    if (resourceChanged) publication.advancePrefetchGeneration();
    runtime.deferredHrefRef.current = href;
    if (direction !== 0) runtime.deferredDirectionRef.current = direction;
    void prepareAdjacentLayouts(href, direction);
    if (runtime.stablePrefetchTimerRef.current !== null) window.clearTimeout(runtime.stablePrefetchTimerRef.current);
    runtime.stablePrefetchTimerRef.current = window.setTimeout(() => {
      runtime.stablePrefetchTimerRef.current = null;
      publication.prefetchAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
      publication.prepareContentAroundHref(href, STABLE_PREFETCH_RADIUS, direction).catch(() => {});
    }, 320);
    if (restartRefinement || resourceChanged) cancelPositionRefinement();
    if (runtime.positionsRefinedRef.current || !publication.refinePositions || runtime.refinementAbortRef.current) return;
    if (runtime.refinementTimerRef.current !== null) window.clearTimeout(runtime.refinementTimerRef.current);
    runtime.refinementTimerRef.current = window.setTimeout(() => {
      runtime.refinementTimerRef.current = null;
      const run = () => {
        runtime.refinementIdleRef.current = null;
        if (runtime.positionsRefinedRef.current || !publication.refinePositions) return;
        const controller = new AbortController();
        runtime.refinementAbortRef.current = controller;
        publication.refinePositions(controller.signal).then(() => {
          if (!controller.signal.aborted) {
            runtime.positionsRefinedRef.current = true;
            const navigator = runtime.navigatorRef.current;
            invalidatePublicationPositionRanges(publication);
            navigator?.refreshPositions();
            runtime.resourceStripRef.current?.updatePositions();
            if (navigator?.currentLocator) {
              setPageCounter(formatEpubPageCounter(navigator, navigator.currentLocator, publication));
              const progress = progressionFromLocator(navigator.currentLocator, publication);
              runtime.lastEmittedProgressRef.current = progress;
              runtime.onProgressChangeRef.current(progress);
            }
          }
        }).catch((error) => {
          if (!controller.signal.aborted) console.warn('Failed to refine publication positions', error);
        }).finally(() => {
          if (runtime.refinementAbortRef.current === controller) runtime.refinementAbortRef.current = null;
        });
      };
      runtime.refinementIdleRef.current = scheduleReaderIdle(run, { timeout: 1500 });
    }, 850);
  };

  runtime.operations.cancelDeferredWork = cancelDeferredWork;
  runtime.operations.prepareAdjacentLayouts = prepareAdjacentLayouts;
  runtime.operations.scheduleDeferredWork = scheduleDeferredWork;
}
