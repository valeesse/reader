import { EpubNavigator } from '../vendor/readium-navigator';

export type ReadiumFrameHandle = {
  destroyed?: boolean;
  frame?: HTMLIFrameElement;
  msg?: { ready?: boolean };
};

type InternalNavigator = EpubNavigator & {
  _cframes?: ReadiumFrameHandle[];
  _isNavigating?: boolean;
  framePool?: {
    pool?: Map<string, unknown>;
    reservedHref?: string;
  };
};

export function readiumFrames(navigator: EpubNavigator) {
  return (navigator as InternalNavigator)._cframes || [];
}

export function getLiveReadiumIframe(handle?: ReadiumFrameHandle) {
  if (!handle || handle.destroyed) return undefined;
  const iframe = handle.frame;
  return iframe?.contentWindow ? iframe : undefined;
}

export function currentReadiumFrame(navigator: EpubNavigator) {
  const frames = readiumFrames(navigator);
  return frames.find((frame) => {
    const iframe = getLiveReadiumIframe(frame);
    return iframe && getComputedStyle(iframe).visibility === 'visible';
  }) || frames[0];
}

export function isReadiumNavigationReady(navigator: EpubNavigator) {
  const handle = readiumFrames(navigator)[0];
  return Boolean(getLiveReadiumIframe(handle) && handle?.msg?.ready);
}

export function readiumNavigationInFlight(navigator: EpubNavigator) {
  return Boolean((navigator as InternalNavigator)._isNavigating);
}

export function releaseReadiumNavigationGuard(navigator: EpubNavigator) {
  (navigator as InternalNavigator)._isNavigating = false;
}

export function navigatorHasPreparedFrame(navigator: EpubNavigator, href: string) {
  const pool = (navigator as InternalNavigator).framePool?.pool;
  if (!pool) return false;
  if (pool.has(href)) return true;
  const normalized = href.split('#')[0];
  return Array.from(pool.keys()).some((key) => key.split('#')[0] === normalized);
}

export function navigatorReservedHref(navigator: EpubNavigator) {
  return (navigator as InternalNavigator).framePool?.reservedHref;
}

export function navigatorPreparedPoolSize(navigator: EpubNavigator) {
  return (navigator as InternalNavigator).framePool?.pool?.size || 0;
}
