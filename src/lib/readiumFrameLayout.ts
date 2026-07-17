import { EpubNavigator } from '../vendor/readium-navigator';
import { AppSettings } from '../types';
import { applyReaderDocumentProperties } from './readerDocumentStyles';
import { getLiveReadiumIframe, currentReadiumFrame, readiumFrames } from './readiumNavigatorAdapter';
import { invalidateReadiumDocumentGeometry } from './readiumViewerPresentation';
import { isContinuousScroll } from './readiumViewerModel';

const fittedEpubMedia = new WeakMap<Document, Map<HTMLElement, Map<string, { value: string; priority: string }>>>();
const FITTED_MEDIA_PROPERTIES = [
  'block-size', 'break-inside', 'display', 'height', 'margin-inline', 'max-block-size',
  'max-height', 'max-width', 'object-fit', 'width',
] as const;

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
  root.dataset.zenithPageMode = isContinuousScroll(settings) ? 'scroll' : settings.pageMode;
  root.dataset.zenithBookType = bookType;
  const viewportHeight = Math.max(1, doc.defaultView?.innerHeight || root.clientHeight || 1);
  root.style.setProperty('--ZENITH__pageImageMaxHeight', `${viewportHeight}px`);
  fitSinglePageEpubMedia(doc, settings, bookType, viewportHeight);
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

function fitSinglePageEpubMedia(
  doc: Document,
  settings: AppSettings,
  bookType: 'epub' | 'txt',
  viewportHeight: number,
) {
  const previous = fittedEpubMedia.get(doc);
  previous?.forEach((properties, element) => {
    properties.forEach(({ value, priority }, property) => {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    });
  });
  fittedEpubMedia.delete(doc);
  if (bookType !== 'epub' || settings.pageMode !== 'single' || isContinuousScroll(settings)) return;

  const maximumHeight = `${Math.max(1, viewportHeight - 16)}px`;
  const viewportWidth = Math.max(1, doc.defaultView?.innerWidth || doc.documentElement.clientWidth || 1);
  const maximumWidth = Math.max(1, viewportWidth - 16);
  const targets = [
    ...Array.from(doc.querySelectorAll<HTMLElement>('img')),
    ...Array.from(doc.querySelectorAll<HTMLElement>('body > svg, body > * > svg:only-child')),
  ];
  const saved = new Map<HTMLElement, Map<string, { value: string; priority: string }>>();
  targets.forEach((element) => {
    const properties = new Map<string, { value: string; priority: string }>();
    FITTED_MEDIA_PROPERTIES.forEach((property) => properties.set(property, {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    }));
    saved.set(element, properties);
    element.style.setProperty('break-inside', 'avoid', 'important');
    element.style.setProperty('display', 'block', 'important');
    element.style.setProperty('height', 'auto', 'important');
    element.style.setProperty('margin-inline', 'auto', 'important');
    element.style.setProperty('max-block-size', maximumHeight, 'important');
    element.style.setProperty('max-height', maximumHeight, 'important');
    element.style.setProperty('max-width', '100%', 'important');
    element.style.setProperty('object-fit', 'contain', 'important');
    element.style.setProperty('width', 'auto', 'important');
    const image = element.tagName.toLowerCase() === 'img' ? element as HTMLImageElement : undefined;
    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
      const scale = Math.min(1, maximumWidth / image.naturalWidth, (viewportHeight - 16) / image.naturalHeight);
      element.style.setProperty('height', `${Math.max(1, Math.floor(image.naturalHeight * scale))}px`, 'important');
      element.style.setProperty('width', `${Math.max(1, Math.floor(image.naturalWidth * scale))}px`, 'important');
    }
  });
  fittedEpubMedia.set(doc, saved);
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
