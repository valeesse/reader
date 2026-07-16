import { EpubNavigator } from '../vendor/readium-navigator';
import { AppSettings } from '../types';
import { applyReaderDocumentProperties } from './readerDocumentStyles';
import { getLiveReadiumIframe, currentReadiumFrame, readiumFrames } from './readiumNavigatorAdapter';
import { invalidateReadiumDocumentGeometry } from './readiumViewerPresentation';
import { isContinuousScroll } from './readiumViewerModel';

export function waitForNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export function waitForLayoutFrames() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export async function waitForFrameReadiness(doc: Document, bookType: 'epub' | 'txt') {
  const fontSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (fontSet) await withTimeout(fontSet.ready.then(() => undefined), 500);
  if (bookType === 'txt') return;
  const images = Array.from(doc.images).slice(0, 8);
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return withTimeout(image.decode().catch(() => {}), 350);
  }));
}

export async function waitForCurrentFrameReadiness(navigator: EpubNavigator, bookType: 'epub' | 'txt') {
  const doc = getLiveReadiumIframe(currentReadiumFrame(navigator))?.contentDocument;
  if (doc) await waitForFrameReadiness(doc, bookType);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T | undefined>((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), timeoutMs);
    promise.then((value) => {
      window.clearTimeout(timer);
      resolve(value);
    }, () => {
      window.clearTimeout(timer);
      resolve(undefined);
    });
  });
}

export function applyReadiumFrameSettingsToNavigator(navigator: EpubNavigator, settings: AppSettings, bookType: 'epub' | 'txt') {
  let layoutChanged = false;
  for (const frame of readiumFrames(navigator)) {
    const doc = getLiveReadiumIframe(frame)?.contentDocument;
    if (doc) layoutChanged = applyReadiumFrameSettings(doc, settings, bookType) || layoutChanged;
  }
  return layoutChanged;
}

export function applyReadiumFrameSettings(doc: Document, settings: AppSettings, bookType: 'epub' | 'txt') {
  const root = doc.documentElement;
  const before = frameLayoutFingerprint(root);
  applyReaderDocumentProperties(doc, settings, bookType);
  if (isContinuousScroll(settings)) {
    root.style.removeProperty('--USER__colCount');
    root.style.removeProperty('--RS__colCount');
    root.style.removeProperty('--RS__colGap');
  } else {
    const columns = settings.pageMode === 'double' ? 2 : 1;
    root.style.setProperty('--USER__colCount', String(columns));
    root.style.setProperty('--RS__colCount', String(columns));
    root.style.setProperty('--RS__colGap', `${readiumCenterGap(settings, doc.defaultView?.innerWidth)}px`);
  }
  root.style.removeProperty('--RS__colWidth');
  root.style.setProperty('--RS__pageGutter', '0px');
  root.style.setProperty('--RS__scrollPaddingTop', '0px');
  root.style.setProperty('--RS__scrollPaddingRight', '0px');
  root.style.setProperty('--RS__scrollPaddingBottom', '0px');
  root.style.setProperty('--RS__scrollPaddingLeft', '0px');
  const layoutChanged = before !== frameLayoutFingerprint(root);
  if (layoutChanged) invalidateReadiumDocumentGeometry(doc);
  return layoutChanged;
}

function frameLayoutFingerprint(root: HTMLElement) {
  return [
    '--USER__fontFamily', '--USER__fontSize', '--USER__lineHeight', '--USER__paraSpacing',
    '--USER__letterSpacing', '--USER__colCount', '--RS__colCount', '--RS__colGap',
    '--RS__colWidth', '--RS__pageGutter', '--RS__scrollPaddingTop', '--RS__scrollPaddingRight',
    '--RS__scrollPaddingBottom', '--RS__scrollPaddingLeft',
  ].map((property) => root.style.getPropertyValue(property)).join('|');
}

function readiumCenterGap(settings: AppSettings, viewportWidth?: number) {
  if (isContinuousScroll(settings) || settings.pageMode !== 'double') return 0;
  const maximumGap = typeof viewportWidth === 'number' && Number.isFinite(viewportWidth)
    ? viewportWidth * 0.18
    : settings.pageMargins.left;
  return Math.min(settings.pageMargins.left, maximumGap);
}
