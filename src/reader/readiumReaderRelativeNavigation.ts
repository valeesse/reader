import type { EpubNavigator } from '../vendor/readium-navigator';
import { animatePageEntry, animatePageExit } from './readerAnimations';
import { createReaderLayoutKey } from './readerLayoutCache';
import { recordReaderMetric } from './readerPerformance';
import { isNearResourceBoundary, snapContinuousResourceBoundary } from './readiumFrameNavigation';
import {
  isReadiumNavigationReady,
  navigatorHasPreparedFrame,
  navigatorPreparedPoolSize,
  navigatorReservedHref,
  releaseReadiumNavigationGuard,
} from './readiumNavigatorAdapter';
import { isContinuousScroll } from './readiumViewerModel';
import { createFrameTransition } from './readiumReaderTransition';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

const ADJACENT_PREPARATION_TIMEOUT_MS = 650;
const FRAME_RECOVERY_DELAY_MS = 320;
const FRAME_RECOVERY_TIMEOUT_MS = 1800;

export function installRelativeNavigation(runtime: ReadiumReaderRuntime) {
  const inspectWarmNavigationPath = (navigator: EpubNavigator, direction: -1 | 1) => {
    const publication = runtime.publicationRef.current;
    const container = runtime.containerRef.current;
    const locator = navigator.currentLocator;
    if (!publication || !container || !locator?.href) return { warm: false, detail: {} };
    const normalized = publication.readingOrder.findWithHref(locator.href)?.href || locator.href;
    const visible = navigator.viewport.progressions.get(normalized);
    const crossesResource = direction > 0 ? (visible?.end ?? 0) >= 0.999 : (visible?.start ?? 1) <= 0.001;
    if (!crossesResource) return { warm: true, detail: { href: normalized, crossesResource: false } };
    const index = publication.readingOrder.findIndexWithHref(normalized);
    const target = publication.readingOrder.items[index + direction];
    if (!target) return { warm: true, detail: { href: normalized, crossesResource: true } };
    const viewport = {
      width: container.clientWidth,
      height: container.clientHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    const key = `${createReaderLayoutKey(publication.contentKey, runtime.settingsRef.current, viewport, runtime.bookType)}:${target.href}`;
    const layoutReady = runtime.layoutCacheRef.current.isReady(key);
    const frameReady = navigatorHasPreparedFrame(navigator, target.href);
    const physicalReady = navigator.isPreparedReady(target.locator, key);
    const reservedHref = navigatorReservedHref(navigator);
    const reserved = reservedHref === target.href;
    const poolSize = navigatorPreparedPoolSize(navigator);
    const nearBoundary = isNearResourceBoundary(navigator, normalized, direction);
    return {
      warm: physicalReady,
      detail: { href: normalized, targetHref: target.href, crossesResource: true, layoutReady, frameReady, physicalReady, reserved, reservedCount: reservedHref ? 1 : 0, poolSize, nearBoundary },
    };
  };

  const recoverPendingNavigationFrame = () => {
    if (runtime.navigationRetryTimerRef.current !== null) return;
    runtime.navigationRetryTimerRef.current = window.setTimeout(() => {
      runtime.navigationRetryTimerRef.current = null;
      const navigator = runtime.navigatorRef.current;
      const locator = navigator?.currentLocator;
      if (!navigator || !locator || runtime.pendingNavigationRef.current === 0
        || runtime.layoutRestoringRef.current || runtime.navigationLockedRef.current
        || isReadiumNavigationReady(navigator)) {
        drainNavigationQueue();
        return;
      }
      runtime.navigationLockedRef.current = true;
      const token = ++runtime.navigationTokenRef.current;
      let completed = false;
      let watchdogId: number | null = null;
      const finish = () => {
        if (completed) return;
        completed = true;
        if (watchdogId !== null) window.clearTimeout(watchdogId);
        if (runtime.navigationUnlockTimerRef.current === watchdogId) runtime.navigationUnlockTimerRef.current = null;
        if (runtime.navigationTokenRef.current !== token) return;
        runtime.navigationLockedRef.current = false;
        queueMicrotask(() => {
          runtime.operations.drainAbsoluteNavigation();
          drainNavigationQueue();
        });
      };
      watchdogId = window.setTimeout(() => {
        releaseReadiumNavigationGuard(navigator);
        finish();
      }, FRAME_RECOVERY_TIMEOUT_MS);
      runtime.navigationUnlockTimerRef.current = watchdogId;
      try {
        releaseReadiumNavigationGuard(navigator);
        navigator.go(locator, false, finish);
      } catch (error) {
        console.warn('Readium frame recovery failed', error);
        finish();
      }
    }, FRAME_RECOVERY_DELAY_MS);
  };

  const drainNavigationQueue = () => {
    const navigator = runtime.navigatorRef.current;
    const pending = runtime.pendingNavigationRef.current;
    if (!navigator || pending === 0 || runtime.layoutRestoringRef.current || runtime.navigationLockedRef.current
      || runtime.absoluteNavigationRunningRef.current || runtime.absoluteNavigationPendingRef.current) return;
    if (!isReadiumNavigationReady(navigator)) {
      recoverPendingNavigationFrame();
      return;
    }
    const direction: -1 | 1 = pending > 0 ? 1 : -1;
    const warmNavigation = inspectWarmNavigationPath(navigator, direction);
    const warmPath = warmNavigation.warm;
    if (warmNavigation.detail.crossesResource && !warmPath && runtime.navigationRetryCountRef.current === 0) {
      runtime.navigationLockedRef.current = true;
      runtime.navigationRetryCountRef.current = 1;
      const token = ++runtime.navigationTokenRef.current;
      const href = navigator.currentLocator?.href || '';
      let released = false;
      const releasePreparation = () => {
        if (released) return;
        released = true;
        window.clearTimeout(timeoutId);
        if (runtime.navigationTokenRef.current !== token) return;
        runtime.navigationLockedRef.current = false;
        runtime.operations.drainAbsoluteNavigation();
        drainNavigationQueue();
      };
      const timeoutId = window.setTimeout(releasePreparation, ADJACENT_PREPARATION_TIMEOUT_MS);
      void runtime.operations.prepareAdjacentLayouts(href, direction)
        .catch((error) => console.warn('Readium adjacent layout preparation failed', error))
        .finally(releasePreparation);
      return;
    }
    runtime.navigationRetryCountRef.current = 0;
    runtime.pendingNavigationRef.current -= direction;
    runtime.navigationLockedRef.current = true;
    const token = ++runtime.navigationTokenRef.current;
    let finished = false;
    let dispatchedAt = 0;
    let navigationId = 0;
    const attempt = runtime.navigationRetryCountRef.current + 1;
    const inputStartedAt = runtime.navigationStartedAtRef.current;
    runtime.navigationStartedAtRef.current = null;
    const finishFrameTransition = createFrameTransition(runtime, navigator);
    if (runtime.navigationUnlockTimerRef.current !== null) window.clearTimeout(runtime.navigationUnlockTimerRef.current);
    const unlock = (ok?: boolean, transport?: 'direct' | 'postMessage') => {
      if (finished) return;
      finished = true;
      finishFrameTransition();
      if (runtime.navigationTokenRef.current !== token) return;
      if (runtime.navigationUnlockTimerRef.current !== null) window.clearTimeout(runtime.navigationUnlockTimerRef.current);
      runtime.navigationUnlockTimerRef.current = null;
      runtime.navigationLockedRef.current = false;
      const shouldRetry = false;
      runtime.navigationRetryCountRef.current = 0;
      if (navigationId > 0) recordReaderMetric({
        kind: 'navigation', name: 'navigator-callback', durationMs: performance.now() - dispatchedAt,
        hit: warmPath,
        detail: { navigationId, attempt, direction, warmPath, ok, retried: shouldRetry, transport, ...warmNavigation.detail },
      });
      if (shouldRetry) {
        if (runtime.navigationRetryTimerRef.current !== null) window.clearTimeout(runtime.navigationRetryTimerRef.current);
        runtime.navigationRetryTimerRef.current = window.setTimeout(() => {
          runtime.navigationRetryTimerRef.current = null;
          drainNavigationQueue();
        }, 50);
      } else queueMicrotask(() => {
        runtime.operations.drainAbsoluteNavigation();
        drainNavigationQueue();
      });
    };
    const finishNavigation = (ok?: boolean, transport?: 'direct' | 'postMessage') => {
      if (finished || runtime.navigationTokenRef.current !== token) return;
      const completedHref = navigator.currentLocator?.href;
      if (ok && completedHref && completedHref !== warmNavigation.detail.href) {
        runtime.deferredHrefRef.current = completedHref;
        runtime.deferredDirectionRef.current = direction;
        void runtime.operations.prepareAdjacentLayouts(completedHref, direction);
      }
      if (!isContinuousScroll(runtime.settingsRef.current)) animatePageEntry(
        runtime.containerRef.current, runtime.settingsRef.current.pageTurnAnimation, direction,
        runtime.pageTransitionRef, { reduce: runtime.pendingNavigationRef.current !== 0 },
      );
      if (ok && isContinuousScroll(runtime.settingsRef.current) && completedHref
        && completedHref !== warmNavigation.detail.href) snapContinuousResourceBoundary(navigator, direction);
      if (ok) runtime.operations.scheduleStableAnchorCapture(navigator, 2);
      if (ok && inputStartedAt !== null) requestAnimationFrame(() => recordReaderMetric({
        kind: 'navigation', name: 'input-to-next-frame', durationMs: performance.now() - inputStartedAt,
        hit: warmPath, detail: { navigationId, attempt, direction, warmPath, ...warmNavigation.detail },
      }));
      unlock(ok, transport);
    };
    const navigate = () => {
      dispatchedAt = performance.now();
      navigationId = ++runtime.navigationIdRef.current;
      runtime.navigationUnlockTimerRef.current = window.setTimeout(() => {
        releaseReadiumNavigationGuard(navigator);
        // A timed-out navigator turn can still finish internally. Retrying here
        // can apply the same turn twice and skip a page or resource.
        finishNavigation(undefined);
      }, 2500);
      const onNavigationFinished = (ok: boolean, transport?: 'direct' | 'postMessage', turnRequestId?: number) => {
        if (turnRequestId !== undefined) {
          runtime.navigationByTurnRequestRef.current.set(turnRequestId, navigationId);
          window.setTimeout(() => runtime.navigationByTurnRequestRef.current.delete(turnRequestId), 5000);
        }
        finishNavigation(ok, transport);
      };
      if (direction > 0) navigator.goForward(false, onNavigationFinished);
      else navigator.goBackward(false, onNavigationFinished);
    };
    try {
      if (isContinuousScroll(runtime.settingsRef.current) || warmNavigation.detail.crossesResource) navigate();
      else animatePageExit(
        runtime.containerRef.current, runtime.settingsRef.current.pageTurnAnimation, direction,
        runtime.pageTransitionRef, navigate, { reduce: Math.abs(runtime.pendingNavigationRef.current) > 0 },
      );
    } catch (error) {
      releaseReadiumNavigationGuard(navigator);
      unlock(false);
      console.warn('Readium page turn failed', error);
    }
  };

  const navigatePage = (direction: -1 | 1, coalesce = false) => {
    if (isContinuousScroll(runtime.settingsRef.current) && runtime.resourceStripRef.current) {
      runtime.resourceStripRef.current.turn(direction);
      return;
    }
    runtime.pendingNavigationRef.current = coalesce
      ? direction
      : Math.max(-12, Math.min(12, runtime.pendingNavigationRef.current + direction));
    runtime.navigationStartedAtRef.current ??= performance.now();
    if (runtime.deferredDirectionRef.current !== direction) {
      runtime.deferredDirectionRef.current = direction;
      const href = runtime.navigatorRef.current?.currentLocator?.href;
      if (href) void runtime.operations.prepareAdjacentLayouts(href, direction);
    }
    drainNavigationQueue();
  };

  runtime.operations.drainNavigationQueue = drainNavigationQueue;
  runtime.operations.navigatePage = navigatePage;
}
