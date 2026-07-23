import { useEffect } from 'react';
import { EpubPreferences, type ReadiumLocator } from '../../../vendor/readium-navigator';
import type { AppSettings } from '../../../types';
import { createReaderSettingsLayoutFingerprint } from './readerLayoutCache';
import type { ReadiumLocatorLike } from './readiumPublication';
import { invalidatePublicationPageMap } from './publicationPageMap';
import { applyReadiumFrameSettingsToNavigator, waitForLayoutFrames } from './readiumFrameLayout';
import { navigateToLocator, waitUntil } from './readiumViewerNavigation';
import { retargetLocatorViewport, snapshotLocator, snapshotVisibleTextLocator } from './readiumViewerAnchors';
import { createReadiumPreferences, isContinuousScroll } from './readiumViewerModel';
import { releaseReadiumNavigationGuard } from './readiumNavigatorAdapter';
import { invalidateReadiumPageGeometry, revealReadiumFrames } from './readiumViewerPresentation';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

export function installLayoutOperations(runtime: ReadiumReaderRuntime) {
  runtime.operations.enqueueLayout = (operation) => {
    void runtime.layoutQueueRef.current.enqueue(operation);
  };
  runtime.operations.scheduleStableAnchorCapture = (navigator, remainingFrames = 1) => {
    if (runtime.anchorCaptureRafRef.current !== null) window.cancelAnimationFrame(runtime.anchorCaptureRafRef.current);
    const capture = (frames: number) => {
      runtime.anchorCaptureRafRef.current = window.requestAnimationFrame(() => {
        if (frames > 1) {
          capture(frames - 1);
          return;
        }
        runtime.anchorCaptureRafRef.current = null;
        if (runtime.navigatorRef.current !== navigator || runtime.layoutRestoringRef.current) return;
        runtime.stableViewportAnchorRef.current = snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current)
          || snapshotLocator(navigator.currentLocator);
      });
    };
    capture(remainingFrames);
  };
}

export function useReadiumReaderSettingsLayout(
  runtime: ReadiumReaderRuntime,
  settings: AppSettings,
) {
  useEffect(() => {
    const navigator = runtime.navigatorRef.current;
    if (!navigator) return;
    const strip = runtime.resourceStripRef.current;
    const wantsContinuous = isContinuousScroll(settings);
    const layoutFingerprint = createReaderSettingsLayoutFingerprint(settings, runtime.bookType);
    const layoutChanged = runtime.settingsLayoutFingerprintRef.current !== layoutFingerprint;
    runtime.settingsLayoutFingerprintRef.current = layoutFingerprint;
    if (!layoutChanged) {
      applyReadiumFrameSettingsToNavigator(navigator, settings, runtime.bookType);
      runtime.appliedLayoutSettingsRef.current = settings;
      return;
    }
    runtime.operations.cancelDeferredWork(true);
    runtime.layoutCacheRef.current.invalidate();
    invalidatePublicationPageMap(runtime.publicationRef.current);
    navigator.clearPreparedReady();
    runtime.prepareGenerationRef.current += 1;
    runtime.preparedTargetRef.current = null;
    navigator.releasePrepared?.();
    runtime.publicationRef.current?.advancePrefetchGeneration();
    const revision = ++runtime.settingsRevisionRef.current;
    const sourceIsContinuous = isContinuousScroll(runtime.appliedLayoutSettingsRef.current);
    const anchor = sourceIsContinuous && strip
      ? strip.snapshotLocator()
      : snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current) || snapshotLocator(navigator.currentLocator);
    if (runtime.settingsApplyTimerRef.current !== null) window.clearTimeout(runtime.settingsApplyTimerRef.current);
    runtime.settingsApplyTimerRef.current = window.setTimeout(() => {
      runtime.settingsApplyTimerRef.current = null;
      runtime.operations.enqueueLayout(async () => {
        if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
        if (runtime.navigationLockedRef.current) await waitUntil(() => !runtime.navigationLockedRef.current, 350);
        if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
        runtime.layoutRestoringRef.current = true;
        try {
          if (wantsContinuous) {
            const target = anchor || snapshotLocator(navigator.currentLocator);
            const activeStrip = target ? await runtime.ensureResourceStripRef.current?.(settings, target) : null;
            if (!activeStrip || revision !== runtime.settingsRevisionRef.current || runtime.resourceStripRef.current !== activeStrip) return;
            const updated = await activeStrip.updateSettings(settings, target || activeStrip.snapshotLocator());
            if (!updated || revision !== runtime.settingsRevisionRef.current || runtime.resourceStripRef.current !== activeStrip) return;
            activeStrip.setActive(true);
            runtime.containerRef.current?.classList.add('zenith-resource-strip-suspended');
            runtime.appliedLayoutSettingsRef.current = settings;
            return;
          }
          runtime.suppressResizeUntilRef.current = performance.now() + 24;
          await navigator.submitPreferences(new EpubPreferences(createReadiumPreferences(settings, runtime.bookType)));
          if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
          if (navigator.layout !== 'fixed' && navigator.layout !== 'reflowable') await navigator.setLayout('reflowable');
          if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
          await navigator.resizeHandler?.();
          if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
          await waitForLayoutFrames();
          if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
          applyReadiumFrameSettingsToNavigator(navigator, settings, runtime.bookType);
          if (anchor) await navigateToLocator(navigator, retargetLocatorViewport(anchor, settings));
          if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
          revealReadiumFrames(runtime.containerRef.current, navigator);
          strip?.setActive(false);
          runtime.containerRef.current?.classList.remove('zenith-resource-strip-suspended');
          runtime.appliedLayoutSettingsRef.current = settings;
          runtime.operations.scheduleDeferredWork(navigator.currentLocator?.href || anchor?.href || '', 0, true);
        } finally {
          if (revision === runtime.settingsRevisionRef.current) {
            runtime.layoutRestoringRef.current = false;
            runtime.operations.scheduleStableAnchorCapture(navigator, 2);
            runtime.operations.drainAbsoluteNavigation();
            runtime.operations.drainNavigationQueue();
          }
        }
      });
    }, 16);
    return () => {
      if (runtime.settingsApplyTimerRef.current !== null) {
        window.clearTimeout(runtime.settingsApplyTimerRef.current);
        runtime.settingsApplyTimerRef.current = null;
      }
    };
  }, [settings]);
}

export function useReadiumReaderResize(runtime: ReadiumReaderRuntime, loading: boolean) {
  useEffect(() => {
    const element = runtime.containerRef.current;
    const navigator = runtime.navigatorRef.current;
    if (!element || !navigator) return;
    const resizeTarget = element.parentElement || element;
    let observedWidth = resizeTarget.clientWidth;
    let observedHeight = resizeTarget.clientHeight;
    let stableWidth = Math.max(1, element.getBoundingClientRect().width);
    let stableHeight = Math.max(1, element.getBoundingClientRect().height);
    let frozen = false;
    let ownsResizeTransaction = false;
    let resizeGeneration = 0;
    const stripHost = runtime.resourceStripHostRef.current;
    let frozenInlineStyle: Partial<Record<'width' | 'height' | 'position' | 'left' | 'top' | 'transform' | 'margin' | 'willChange' | 'transformOrigin', string>> | null = null;
    let frozenStripStyle: { width: string; height: string; inset: string; transform: string; transformOrigin: string } | null = null;
    let stableStripViewportAnchor = runtime.resourceStripRef.current?.stableTopAnchor();
    let stripAnchorReleaseTimer: number | null = null;
    const freezeSurface = () => {
      if (frozen) return;
      frozen = true;
      runtime.pageTransitionRef.current?.cancel();
      runtime.pageTransitionRef.current = null;
      frozenInlineStyle = {
        width: element.style.width, height: element.style.height, position: element.style.position,
        left: element.style.left, top: element.style.top, transform: element.style.transform,
        margin: element.style.margin, willChange: element.style.willChange, transformOrigin: element.style.transformOrigin,
      };
      element.style.width = `${stableWidth}px`;
      element.style.height = `${stableHeight}px`;
      element.style.position = 'absolute';
      element.style.left = '0';
      element.style.top = '0';
      element.style.transform = 'none';
      element.style.transformOrigin = 'top left';
      element.style.margin = '0';
      element.style.willChange = 'transform';
      if (stripHost) {
        frozenStripStyle = {
          width: stripHost.style.width, height: stripHost.style.height, inset: stripHost.style.inset,
          transform: stripHost.style.transform, transformOrigin: stripHost.style.transformOrigin,
        };
        stripHost.style.width = `${stableWidth}px`;
        stripHost.style.height = `${stableHeight}px`;
        stripHost.style.inset = '0 auto auto 0';
        stripHost.style.transform = 'none';
        stripHost.style.transformOrigin = 'top left';
      }
    };
    const releaseSurface = () => {
      if (!frozen) return;
      frozen = false;
      const inline = frozenInlineStyle;
      frozenInlineStyle = null;
      if (!inline) return;
      element.style.width = inline.width || '';
      element.style.height = inline.height || '';
      element.style.position = inline.position || '';
      element.style.left = inline.left || '';
      element.style.top = inline.top || '';
      element.style.transform = inline.transform || '';
      element.style.margin = inline.margin || '';
      element.style.willChange = inline.willChange || '';
      element.style.transformOrigin = inline.transformOrigin || '';
      if (stripHost && frozenStripStyle) {
        stripHost.style.width = frozenStripStyle.width;
        stripHost.style.height = frozenStripStyle.height;
        stripHost.style.inset = frozenStripStyle.inset;
        stripHost.style.transform = frozenStripStyle.transform;
        stripHost.style.transformOrigin = frozenStripStyle.transformOrigin;
        frozenStripStyle = null;
      }
    };
    const applyResize = () => {
      const suppressionRemaining = Math.max(0, runtime.suppressResizeUntilRef.current - performance.now());
      if (runtime.settingsApplyTimerRef.current !== null || suppressionRemaining > 0
        || runtime.navigationLockedRef.current || runtime.absoluteNavigationRunningRef.current) {
        runtime.resizeTimerRef.current = window.setTimeout(applyResize, Math.max(24, suppressionRemaining + 8));
        return;
      }
      const generation = resizeGeneration;
      navigator.clearPreparedReady();
      invalidatePublicationPageMap(runtime.publicationRef.current);
      runtime.prepareGenerationRef.current += 1;
      runtime.preparedTargetRef.current = null;
      runtime.resizeTimerRef.current = null;
      runtime.operations.enqueueLayout(async () => {
        if (runtime.navigatorRef.current !== navigator) return;
        const activeStrip = isContinuousScroll(runtime.settingsRef.current) ? runtime.resourceStripRef.current : null;
        const stripViewportAnchor = stableStripViewportAnchor || activeStrip?.stableTopAnchor();
        const before = activeStrip?.snapshotLocator()
          || runtime.resizeAnchorRef.current
          || snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current)
          || snapshotLocator(navigator.currentLocator);
        // A resize invalidates the iframe geometry used by an in-flight turn.
        // Cancel its guard/watchdogs before rebuilding; queued wheel input is
        // preserved and drained against the resized frame in finally.
        runtime.navigationTokenRef.current += 1;
        if (runtime.navigationUnlockTimerRef.current !== null) {
          window.clearTimeout(runtime.navigationUnlockTimerRef.current);
          runtime.navigationUnlockTimerRef.current = null;
        }
        if (runtime.navigationRetryTimerRef.current !== null) {
          window.clearTimeout(runtime.navigationRetryTimerRef.current);
          runtime.navigationRetryTimerRef.current = null;
        }
        releaseReadiumNavigationGuard(navigator);
        runtime.navigationLockedRef.current = false;
        runtime.navigationRetryCountRef.current = 0;
        runtime.layoutRestoringRef.current = true;
        try {
          runtime.suppressResizeUntilRef.current = performance.now() + 24;
          releaseSurface();
          if (activeStrip && before) {
            await activeStrip.updateSettings(runtime.settingsRef.current, before as unknown as ReadiumLocatorLike, stripViewportAnchor);
            if (stripAnchorReleaseTimer !== null) window.clearTimeout(stripAnchorReleaseTimer);
            stripAnchorReleaseTimer = window.setTimeout(() => {
              stableStripViewportAnchor = undefined;
              stripAnchorReleaseTimer = null;
            }, 120);
            runtime.appliedLayoutSettingsRef.current = runtime.settingsRef.current;
            return;
          }
          const forceRequestedLayout = () => {
            if (runtime.navigatorRef.current === navigator) {
              applyReadiumFrameSettingsToNavigator(navigator, runtime.settingsRef.current, runtime.bookType);
            }
          };
          const resizeOperation = navigator.resizeHandler?.();
          forceRequestedLayout();
          await resizeOperation;
          if (runtime.navigatorRef.current !== navigator) return;
          forceRequestedLayout();
          if (before) await navigateToLocator(navigator, before, forceRequestedLayout);
          forceRequestedLayout();
          invalidateReadiumPageGeometry(navigator);
          runtime.pageCounterRefreshRef.current(navigator.currentLocator, 0);
          revealReadiumFrames(runtime.containerRef.current, navigator);
          const settledRect = element.getBoundingClientRect();
          stableWidth = Math.max(1, settledRect.width);
          stableHeight = Math.max(1, settledRect.height);
          runtime.appliedLayoutSettingsRef.current = runtime.settingsRef.current;
          const href = navigator.currentLocator?.href;
          if (href) runtime.operations.scheduleDeferredWork(href, runtime.deferredDirectionRef.current, false);
        } finally {
          if (generation !== resizeGeneration || runtime.resizeTimerRef.current !== null) return;
          releaseSurface();
          runtime.resizeAnchorRef.current = undefined;
          runtime.layoutRestoringRef.current = false;
          ownsResizeTransaction = false;
          if (before) runtime.stableViewportAnchorRef.current = before;
          runtime.operations.drainAbsoluteNavigation();
          runtime.operations.drainNavigationQueue();
        }
      });
    };
    const scheduleResize = (delay = 16) => {
      if (runtime.resizeTimerRef.current !== null) window.clearTimeout(runtime.resizeTimerRef.current);
      runtime.resizeTimerRef.current = window.setTimeout(applyResize, delay);
    };
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box && Math.abs(box.width - observedWidth) < 0.5 && Math.abs(box.height - observedHeight) < 0.5) return;
      if (box) { observedWidth = box.width; observedHeight = box.height; }
      resizeGeneration += 1;
      const startsResizeTransaction = runtime.resizeTimerRef.current === null && !runtime.layoutRestoringRef.current;
      if (stripAnchorReleaseTimer !== null) {
        window.clearTimeout(stripAnchorReleaseTimer);
        stripAnchorReleaseTimer = null;
      }
      runtime.resizeAnchorRef.current ||= isContinuousScroll(runtime.settingsRef.current)
        ? runtime.resourceStripRef.current?.snapshotLocator() as ReadiumLocator | undefined
        : snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current)
          || runtime.stableViewportAnchorRef.current || snapshotLocator(navigator.currentLocator);
      if (startsResizeTransaction) {
        ownsResizeTransaction = true;
        stableStripViewportAnchor = runtime.resourceStripRef.current?.stableTopAnchor() || stableStripViewportAnchor;
      }
      runtime.layoutRestoringRef.current = true;
      freezeSurface();
      const suppressionRemaining = Math.max(0, runtime.suppressResizeUntilRef.current - performance.now());
      scheduleResize(Math.max(16, suppressionRemaining + 8));
    });
    observer.observe(resizeTarget);
    return () => {
      observer.disconnect();
      if (stripAnchorReleaseTimer !== null) window.clearTimeout(stripAnchorReleaseTimer);
      if (runtime.resizeTimerRef.current !== null) {
        window.clearTimeout(runtime.resizeTimerRef.current);
        runtime.resizeTimerRef.current = null;
      }
      releaseSurface();
      runtime.resizeAnchorRef.current = undefined;
      if (ownsResizeTransaction) {
        ownsResizeTransaction = false;
        runtime.layoutRestoringRef.current = false;
        queueMicrotask(() => {
          runtime.operations.drainAbsoluteNavigation();
          runtime.operations.drainNavigationQueue();
        });
      }
    };
  }, [loading]);
}
