import { useEffect } from 'react';
import { EpubPreferences } from '../vendor/readium-navigator';
import type { AppSettings } from '../types';
import { createReaderSettingsLayoutFingerprint } from './readerLayoutCache';
import { applyReadiumFrameSettingsToNavigator, waitForLayoutFrames } from './readiumFrameLayout';
import { navigateToLocator, waitUntil } from './readiumViewerNavigation';
import { retargetLocatorViewport, snapshotLocator, snapshotVisibleTextLocator } from './readiumViewerAnchors';
import { createReadiumPreferences, isContinuousScroll } from './readiumViewerModel';
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
    runtime.layoutRestoringRef.current = true;
    if (runtime.settingsApplyTimerRef.current !== null) window.clearTimeout(runtime.settingsApplyTimerRef.current);
    runtime.settingsApplyTimerRef.current = window.setTimeout(() => {
      runtime.settingsApplyTimerRef.current = null;
      runtime.operations.enqueueLayout(async () => {
        if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
        if (runtime.navigationLockedRef.current) await waitUntil(() => !runtime.navigationLockedRef.current, 350);
        if (revision !== runtime.settingsRevisionRef.current || runtime.navigatorRef.current !== navigator) return;
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
          runtime.suppressResizeUntilRef.current = performance.now() + 500;
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
            runtime.operations.drainNavigationQueue();
          }
        }
      });
    }, 120);
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
    let frozenInlineStyle: Partial<Record<'width' | 'height' | 'position' | 'left' | 'top' | 'transform' | 'margin' | 'willChange', string>> | null = null;
    const freezeSurface = () => {
      if (frozen) return;
      frozen = true;
      runtime.pageTransitionRef.current?.cancel();
      runtime.pageTransitionRef.current = null;
      frozenInlineStyle = {
        width: element.style.width, height: element.style.height, position: element.style.position,
        left: element.style.left, top: element.style.top, transform: element.style.transform,
        margin: element.style.margin, willChange: element.style.willChange,
      };
      element.style.width = `${stableWidth}px`;
      element.style.height = `${stableHeight}px`;
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.transform = 'translate3d(-50%, -50%, 0)';
      element.style.margin = '0';
      element.style.willChange = 'transform';
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
    };
    const applyResize = () => {
      const suppressionRemaining = Math.max(0, runtime.suppressResizeUntilRef.current - performance.now());
      if (runtime.settingsApplyTimerRef.current !== null || suppressionRemaining > 0) {
        runtime.resizeTimerRef.current = window.setTimeout(applyResize, Math.max(24, suppressionRemaining + 8));
        return;
      }
      navigator.clearPreparedReady();
      runtime.prepareGenerationRef.current += 1;
      runtime.preparedTargetRef.current = null;
      runtime.resizeTimerRef.current = null;
      runtime.operations.enqueueLayout(async () => {
        if (runtime.navigatorRef.current !== navigator) return;
        const before = runtime.resizeAnchorRef.current
          || snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current)
          || snapshotLocator(navigator.currentLocator);
        runtime.layoutRestoringRef.current = true;
        try {
          runtime.suppressResizeUntilRef.current = performance.now() + 180;
          releaseSurface();
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
          releaseSurface();
          runtime.resizeAnchorRef.current = undefined;
          runtime.layoutRestoringRef.current = false;
          if (before) runtime.stableViewportAnchorRef.current = before;
          runtime.operations.drainNavigationQueue();
        }
      });
    };
    const scheduleResize = (delay = 80) => {
      if (runtime.resizeTimerRef.current !== null) window.clearTimeout(runtime.resizeTimerRef.current);
      runtime.resizeTimerRef.current = window.setTimeout(applyResize, delay);
    };
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box && Math.abs(box.width - observedWidth) < 0.5 && Math.abs(box.height - observedHeight) < 0.5) return;
      if (box) { observedWidth = box.width; observedHeight = box.height; }
      runtime.resizeAnchorRef.current ||= snapshotVisibleTextLocator(navigator, runtime.appliedLayoutSettingsRef.current)
        || runtime.stableViewportAnchorRef.current || snapshotLocator(navigator.currentLocator);
      runtime.layoutRestoringRef.current = true;
      freezeSurface();
      const suppressionRemaining = Math.max(0, runtime.suppressResizeUntilRef.current - performance.now());
      scheduleResize(Math.max(80, suppressionRemaining + 8));
    });
    observer.observe(resizeTarget);
    return () => {
      observer.disconnect();
      if (runtime.resizeTimerRef.current !== null) {
        window.clearTimeout(runtime.resizeTimerRef.current);
        runtime.resizeTimerRef.current = null;
      }
      releaseSurface();
      runtime.resizeAnchorRef.current = undefined;
    };
  }, [loading]);
}
