import { useRef } from 'react';
import type { EpubNavigator, ReadiumLocator } from '../vendor/readium-navigator';
import type { AppSettings, Book } from '../types';
import type { ContinuousResourceStrip } from './continuousResourceStrip';
import { ReaderLayoutCache, createReaderSettingsLayoutFingerprint } from './readerLayoutCache';
import { ReaderLayoutTransactionQueue } from './readerLayoutTransactions';
import type { ReaderIdleHandle } from './readerScheduler';
import type { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';
import { createReadiumReaderOperations, type ProgressPayload, type ReadiumReaderRuntime } from './readiumReaderRuntime';

interface RuntimeCallbacks {
  onProgressChange: (progress: number) => void;
  onToggleChrome: () => void;
  onPresentable?: () => void;
  onCurrentTocChange: (itemId: string | null) => void;
}

export function useReadiumReaderRuntime(
  book: Book,
  settings: AppSettings,
  callbacks: RuntimeCallbacks,
  previewImage: { src: string; name: string } | null,
) {
  const runtimeRef = useRef<ReadiumReaderRuntime | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resourceStripHostRef = useRef<HTMLDivElement>(null);
  const resourceStripRef = useRef<ContinuousResourceStrip | null>(null);
  const ensureResourceStripRef = useRef<((value: AppSettings, locator: ReadiumLocatorLike) => Promise<ContinuousResourceStrip | null>) | null>(null);
  const navigatorRef = useRef<EpubNavigator | null>(null);
  const publicationRef = useRef<ReadiumPublicationLike | null>(null);
  const settingsRef = useRef(settings);
  const appliedLayoutSettingsRef = useRef(settings);
  const onProgressChangeRef = useRef(callbacks.onProgressChange);
  const onToggleChromeRef = useRef(callbacks.onToggleChrome);
  const onPresentableRef = useRef(callbacks.onPresentable);
  const onCurrentTocChangeRef = useRef(callbacks.onCurrentTocChange);
  const loadingResolvedRef = useRef(false);
  const settingsApplyTimerRef = useRef<number | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const pageCounterRefreshRef = useRef<(locator?: ReadiumLocator, delay?: number) => void>(() => {});
  const settingsRevisionRef = useRef(0);
  const resizeAnchorRef = useRef<ReadiumLocator | undefined>(undefined);
  const stableViewportAnchorRef = useRef<ReadiumLocator | undefined>(undefined);
  const anchorCaptureRafRef = useRef<number | null>(null);
  const layoutQueueRef = useRef(new ReaderLayoutTransactionQueue());
  const suppressResizeUntilRef = useRef(0);
  const layoutRestoringRef = useRef(false);
  const lastEmittedProgressRef = useRef(-1);
  const lastSavedLocationRef = useRef('');
  const pendingProgressRef = useRef<ProgressPayload | null>(null);
  const progressSaveTimerRef = useRef<number | null>(null);
  const previewImageRef = useRef(previewImage);
  const suppressChromeToggleUntilRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelLastEventAtRef = useRef(0);
  const scrollBoundaryGestureLockedRef = useRef(false);
  const scrollBoundaryGestureTimerRef = useRef<number | null>(null);
  const scrollBoundaryPendingDirectionRef = useRef<-1 | 0 | 1>(0);
  const navigationLockedRef = useRef(false);
  const pendingNavigationRef = useRef(0);
  const navigationUnlockTimerRef = useRef<number | null>(null);
  const navigationTokenRef = useRef(0);
  const navigationRetryTimerRef = useRef<number | null>(null);
  const navigationRetryCountRef = useRef(0);
  const navigationIdRef = useRef(0);
  const navigationByTurnRequestRef = useRef(new Map<number, number>());
  const stablePrefetchTimerRef = useRef<number | null>(null);
  const refinementTimerRef = useRef<number | null>(null);
  const refinementIdleRef = useRef<ReaderIdleHandle | null>(null);
  const refinementAbortRef = useRef<AbortController | null>(null);
  const positionsRefinedRef = useRef(false);
  const absoluteNavigationPendingRef = useRef<{ locator: ReadiumLocatorLike; requestId: number } | null>(null);
  const absoluteNavigationRunningRef = useRef(false);
  const absoluteNavigationTimerRef = useRef<number | null>(null);
  const absoluteNavigationTokenRef = useRef(0);
  const seekPreviewTimerRef = useRef<number | null>(null);
  const seekPreviewPendingRef = useRef<{ locator: ReadiumLocatorLike; requestId: number } | null>(null);
  const deferredHrefRef = useRef('');
  const deferredDirectionRef = useRef<-1 | 0 | 1>(0);
  const layoutCacheRef = useRef(new ReaderLayoutCache(3));
  const preparedTargetRef = useRef<{ currentHref: string; direction: -1 | 1; href: string; generation: number } | null>(null);
  const prepareGenerationRef = useRef(0);
  const navigationStartedAtRef = useRef<number | null>(null);
  const pageTransitionRef = useRef<Animation | null>(null);
  const settingsLayoutFingerprintRef = useRef(createReaderSettingsLayoutFingerprint(settings, book.type));

  runtimeRef.current ??= {
    bookType: book.type, containerRef, resourceStripHostRef, resourceStripRef, ensureResourceStripRef,
    navigatorRef, publicationRef, settingsRef, appliedLayoutSettingsRef, onProgressChangeRef,
    onToggleChromeRef, onPresentableRef, onCurrentTocChangeRef, loadingResolvedRef,
    settingsApplyTimerRef, resizeTimerRef, pageCounterRefreshRef, settingsRevisionRef,
    resizeAnchorRef, stableViewportAnchorRef, anchorCaptureRafRef, layoutQueueRef,
    suppressResizeUntilRef, layoutRestoringRef, lastEmittedProgressRef, lastSavedLocationRef,
    pendingProgressRef, progressSaveTimerRef, previewImageRef, suppressChromeToggleUntilRef,
    wheelDeltaRef, wheelLastEventAtRef, scrollBoundaryGestureLockedRef,
    scrollBoundaryGestureTimerRef, scrollBoundaryPendingDirectionRef, navigationLockedRef,
    pendingNavigationRef, navigationUnlockTimerRef, navigationTokenRef, navigationRetryTimerRef,
    navigationRetryCountRef, navigationIdRef, navigationByTurnRequestRef, stablePrefetchTimerRef,
    refinementTimerRef, refinementIdleRef, refinementAbortRef, positionsRefinedRef,
    absoluteNavigationPendingRef, absoluteNavigationRunningRef, absoluteNavigationTimerRef, absoluteNavigationTokenRef,
    seekPreviewTimerRef, seekPreviewPendingRef, deferredHrefRef, deferredDirectionRef,
    layoutCacheRef, preparedTargetRef, prepareGenerationRef, navigationStartedAtRef,
    pageTransitionRef, settingsLayoutFingerprintRef, operations: createReadiumReaderOperations(),
  };
  return runtimeRef.current;
}
