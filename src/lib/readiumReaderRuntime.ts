import type React from 'react';
import type { EpubNavigator, ReadiumLocator } from '../vendor/readium-navigator';
import type { AppSettings, BookType } from '../types';
import type { ContinuousResourceStrip } from './continuousResourceStrip';
import type { ReaderLayoutCache } from './readerLayoutCache';
import type { ReaderLayoutTransactionQueue } from './readerLayoutTransactions';
import type { ReaderIdleHandle } from './readerScheduler';
import type { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';

export type Ref<T> = { current: T };
export type ReaderDirection = -1 | 0 | 1;
export type ProgressPayload = { bookId: string; location: string; updatedAt: number };

export interface ReadiumReaderOperations {
  cancelDeferredWork: (abortRefinement: boolean) => void;
  drainAbsoluteNavigation: () => void;
  drainNavigationQueue: () => void;
  enqueueLayout: (operation: () => Promise<void>) => void;
  navigateByWheel: (event: WheelEvent) => void;
  navigateContinuousScrollBoundary: (event: WheelEvent, wnd: Window) => void;
  navigatePage: (direction: -1 | 1) => void;
  prepareAdjacentLayouts: (href: string, direction: ReaderDirection) => Promise<void>;
  scheduleDeferredWork: (href: string, direction: ReaderDirection, restartRefinement: boolean) => void;
  scheduleStableAnchorCapture: (navigator: EpubNavigator, remainingFrames?: number) => void;
  submitAbsoluteNavigation: (locator: ReadiumLocatorLike, requestId: number) => void;
}

const noop = () => {};
const noopAsync = async () => {};

export interface ReadiumReaderRuntime {
  bookType: BookType;
  containerRef: Ref<HTMLDivElement | null>;
  resourceStripHostRef: Ref<HTMLDivElement | null>;
  resourceStripRef: Ref<ContinuousResourceStrip | null>;
  ensureResourceStripRef: Ref<((settings: AppSettings, locator: ReadiumLocatorLike) => Promise<ContinuousResourceStrip | null>) | null>;
  navigatorRef: Ref<EpubNavigator | null>;
  publicationRef: Ref<ReadiumPublicationLike | null>;
  settingsRef: Ref<AppSettings>;
  appliedLayoutSettingsRef: Ref<AppSettings>;
  onProgressChangeRef: Ref<(progress: number) => void>;
  onToggleChromeRef: Ref<() => void>;
  onPresentableRef: Ref<(() => void) | undefined>;
  onCurrentTocChangeRef: Ref<(itemId: string | null) => void>;
  loadingResolvedRef: Ref<boolean>;
  settingsApplyTimerRef: Ref<number | null>;
  resizeTimerRef: Ref<number | null>;
  pageCounterRefreshRef: Ref<(locator?: ReadiumLocator, delay?: number) => void>;
  settingsRevisionRef: Ref<number>;
  resizeAnchorRef: Ref<ReadiumLocator | undefined>;
  stableViewportAnchorRef: Ref<ReadiumLocator | undefined>;
  anchorCaptureRafRef: Ref<number | null>;
  layoutQueueRef: Ref<ReaderLayoutTransactionQueue>;
  suppressResizeUntilRef: Ref<number>;
  layoutRestoringRef: Ref<boolean>;
  lastEmittedProgressRef: Ref<number>;
  lastSavedLocationRef: Ref<string>;
  pendingProgressRef: Ref<ProgressPayload | null>;
  progressSaveTimerRef: Ref<number | null>;
  previewImageRef: Ref<{ src: string; name: string } | null>;
  suppressChromeToggleUntilRef: Ref<number>;
  wheelDeltaRef: Ref<number>;
  wheelLastEventAtRef: Ref<number>;
  scrollBoundaryGestureLockedRef: Ref<boolean>;
  scrollBoundaryGestureTimerRef: Ref<number | null>;
  scrollBoundaryPendingDirectionRef: Ref<ReaderDirection>;
  navigationLockedRef: Ref<boolean>;
  pendingNavigationRef: Ref<number>;
  navigationUnlockTimerRef: Ref<number | null>;
  navigationTokenRef: Ref<number>;
  navigationRetryTimerRef: Ref<number | null>;
  navigationRetryCountRef: Ref<number>;
  navigationIdRef: Ref<number>;
  navigationByTurnRequestRef: Ref<Map<number, number>>;
  stablePrefetchTimerRef: Ref<number | null>;
  refinementTimerRef: Ref<number | null>;
  refinementIdleRef: Ref<ReaderIdleHandle | null>;
  refinementAbortRef: Ref<AbortController | null>;
  positionsRefinedRef: Ref<boolean>;
  absoluteNavigationPendingRef: Ref<{ locator: ReadiumLocatorLike; requestId: number } | null>;
  absoluteNavigationRunningRef: Ref<boolean>;
  absoluteNavigationTimerRef: Ref<number | null>;
  absoluteNavigationTokenRef: Ref<number>;
  seekPreviewTimerRef: Ref<number | null>;
  seekPreviewPendingRef: Ref<{ locator: ReadiumLocatorLike; requestId: number } | null>;
  deferredHrefRef: Ref<string>;
  deferredDirectionRef: Ref<ReaderDirection>;
  layoutCacheRef: Ref<ReaderLayoutCache>;
  preparedTargetRef: Ref<{ currentHref: string; direction: -1 | 1; href: string; generation: number } | null>;
  prepareGenerationRef: Ref<number>;
  navigationStartedAtRef: Ref<number | null>;
  pageTransitionRef: React.MutableRefObject<Animation | null>;
  settingsLayoutFingerprintRef: Ref<string>;
  operations: ReadiumReaderOperations;
}

export function createReadiumReaderOperations(): ReadiumReaderOperations {
  return {
    cancelDeferredWork: noop,
    drainAbsoluteNavigation: noop,
    drainNavigationQueue: noop,
    enqueueLayout: noop,
    navigateByWheel: noop,
    navigateContinuousScrollBoundary: noop,
    navigatePage: noop,
    prepareAdjacentLayouts: noopAsync,
    scheduleDeferredWork: noop,
    scheduleStableAnchorCapture: noop,
    submitAbsoluteNavigation: noop,
  };
}
