import type { EpubNavigator, ReadiumFrameClickEvent, ReadiumLocator, ReadiumPositionChangedContext } from '../vendor/readium-navigator';
import type { Book } from '../types';
import { createReaderLayoutKey } from './readerLayoutCache';
import { recordReaderMetric } from './readerPerformance';
import { applyReadiumFrameSettings } from './readiumFrameLayout';
import { currentReadiumFrame, getLiveReadiumIframe } from './readiumNavigatorAdapter';
import { handleReadiumClick, installImagePreview, installReadiumWheel } from './readiumViewerInteractions';
import { currentTocItemId, isContinuousScroll } from './readiumViewerModel';
import { progressionFromLocator, type ReadiumPublicationLike } from './readiumPublication';
import { formatProgressLabel, watchReadiumFrameLayout } from './readiumViewerPresentation';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

interface CallbackOptions {
  book: Book;
  navigator: () => EpubNavigator;
  publication: ReadiumPublicationLike;
  openPreview: (image: { src: string; name: string }) => void;
  queueProgressSave: (locator: ReadiumLocator) => void;
  schedulePageCounter: (locator?: ReadiumLocator, delay?: number) => void;
  setPageLabel: (label: string) => void;
}

export function createNavigatorCallbacks(runtime: ReadiumReaderRuntime, options: CallbackOptions) {
  const { book, publication, openPreview, queueProgressSave, schedulePageCounter } = options;
  const handlePointer = (event: ReadiumFrameClickEvent) => {
    if (handleReadiumClick(event, openPreview)) return true;
    if (event.doNotDisturb || runtime.previewImageRef.current
      || Date.now() < runtime.suppressChromeToggleUntilRef.current) return true;
    return false;
  };
  return {
    frameLoaded: (wnd: Window) => {
      applyReadiumFrameSettings(wnd.document, runtime.settingsRef.current, book.type);
      installImagePreview(wnd, openPreview);
      installReadiumWheel(
        wnd,
        runtime.operations.navigateByWheel,
        runtime.operations.navigateContinuousScrollBoundary,
        runtime.settingsRef,
      );
      watchReadiumFrameLayout(wnd, () => schedulePageCounter(runtime.navigatorRef.current?.currentLocator));
      queueMicrotask(runtime.operations.drainNavigationQueue);
    },
    positionChanged: (locator: ReadiumLocator, context?: ReadiumPositionChangedContext) => {
      const navigator = options.navigator();
      if (runtime.navigatorRef.current !== navigator || runtime.publicationRef.current !== publication) return;
      const navigationId = context?.turnRequestId === undefined
        ? undefined : runtime.navigationByTurnRequestRef.current.get(context.turnRequestId);
      if (context?.cause === 'turn' && context.iframeElapsedMs !== undefined) recordReaderMetric({
        kind: 'navigation', name: 'iframe-turn', durationMs: context.iframeElapsedMs,
        detail: { navigationId, turnRequestId: context.turnRequestId, cause: context.cause, callbackReleased: context.callbackReleased, transport: context.transport },
      });
      if (context?.cause === 'turn' && context.locatorLookupMs !== undefined) recordReaderMetric({
        kind: 'navigation', name: 'locator-lookup', durationMs: context.locatorLookupMs,
        detail: { navigationId, turnRequestId: context.turnRequestId, cause: context.cause, callbackReleased: context.callbackReleased, transport: context.transport },
      });
      if (runtime.layoutRestoringRef.current) return;
      runtime.operations.scheduleStableAnchorCapture(navigator);
      const visibleLink = publication.readingOrder.findWithHref(locator.href);
      if (visibleLink) {
        const container = runtime.containerRef.current!;
        const viewport = {
          width: container.clientWidth,
          height: container.clientHeight,
          devicePixelRatio: window.devicePixelRatio || 1,
        };
        const key = `${createReaderLayoutKey(publication.contentKey, runtime.settingsRef.current, viewport, book.type)}:${visibleLink.href}`;
        navigator.markPreparedReady(locator, key);
      }
      const progress = progressionFromLocator(locator, publication);
      runtime.onCurrentTocChangeRef.current(currentTocItemId(
        locator, publication,
        getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentDocument || undefined,
      ));
      const previousProgress = runtime.lastEmittedProgressRef.current;
      const direction: -1 | 0 | 1 = previousProgress < 0 ? 0 : progress > previousProgress ? 1 : progress < previousProgress ? -1 : 0;
      const cacheDirection: -1 | 0 | 1 = context?.cause === 'turn' ? direction : 1;
      queueMicrotask(() => {
        if (runtime.publicationRef.current !== publication) return;
        if (runtime.deferredHrefRef.current !== locator.href) {
          publication.prefetchAroundHref(locator.href, 1, cacheDirection).catch(() => {});
        }
        runtime.operations.scheduleDeferredWork(locator.href, cacheDirection, false);
      });
      schedulePageCounter(locator);
      if (Math.abs(progress - runtime.lastEmittedProgressRef.current) >= 0.0001) {
        runtime.lastEmittedProgressRef.current = progress;
        options.setPageLabel(formatProgressLabel(progress));
        runtime.onProgressChangeRef.current(progress);
      }
      queueProgressSave(locator);
    },
    click: handlePointer,
    tap: handlePointer,
    contextMenu: () => {},
    miscPointer: () => {
      if (Date.now() < runtime.suppressChromeToggleUntilRef.current || runtime.previewImageRef.current) return;
      runtime.onToggleChromeRef.current();
    },
  };
}
