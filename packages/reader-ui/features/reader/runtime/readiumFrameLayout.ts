import { EpubNavigator } from '../../../vendor/readium-navigator';
import { AppSettings } from '../../../types';
import { applyReaderDocumentProperties } from './readerDocumentStyles';
import { getLiveReadiumIframe, currentReadiumFrame, readiumFrames } from './readiumNavigatorAdapter';
import { invalidateReadiumDocumentGeometry } from './readiumViewerPresentation';
import { isContinuousScroll } from './readiumViewerModel';

const fittedEpubMedia = new WeakMap<Document, Map<HTMLElement, Map<string, { value: string; priority: string }>>>();
const MEDIA_PAGE_ATTRIBUTE = 'data-zenith-media-page';
const FITTED_MEDIA_PROPERTIES = [
  'block-size', 'break-inside', 'display', 'height', 'margin-inline', 'max-block-size',
  'max-height', 'max-width', 'min-block-size', 'min-height', 'min-width', 'object-fit', 'width',
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
    if (doc) layoutChanged = applyReadiumFrameSettings(doc, settings, bookType, navigator.layout) || layoutChanged;
  }
  return layoutChanged;
}

export function applyReadiumFrameSettings(
  doc: Document,
  settings: AppSettings,
  bookType: 'epub' | 'txt',
  layout?: EpubNavigator['layout'],
) {
  const root = doc.documentElement;
  const before = frameLayoutFingerprint(root);
  root.dataset.zenithPageMode = isContinuousScroll(settings) ? 'scroll' : settings.pageMode;
  root.dataset.zenithBookType = bookType;
  root.dataset.zenithLayout = layout || 'reflowable';
  markMediaOnlyEpubPages(doc, bookType, layout);
  applyReaderDocumentProperties(doc, settings, bookType);
  const viewportHeight = Math.max(1, doc.defaultView?.innerHeight || root.clientHeight || 1);
  const viewportWidth = Math.max(1, doc.defaultView?.innerWidth || root.clientWidth || 1);
  const contentScale = readiumContentScale(doc);
  root.style.setProperty('--ZENITH__pageImageMaxHeight', `${viewportHeight / contentScale}px`);
  root.style.setProperty('--ZENITH__pageImageMaxWidth', `${viewportWidth / contentScale}px`);
  fitSinglePageEpubMedia(doc, settings, bookType, viewportWidth, viewportHeight, layout);
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

function markMediaOnlyEpubPages(
  doc: Document,
  bookType: 'epub' | 'txt',
  layout?: EpubNavigator['layout'],
) {
  const body = doc.body;
  const existingPages = Array.from(doc.querySelectorAll<HTMLElement>(`[${MEDIA_PAGE_ATTRIBUTE}]`));
  const clearMediaPages = () => {
    existingPages.forEach((element) => element.removeAttribute(MEDIA_PAGE_ATTRIBUTE));
    delete doc.documentElement.dataset.zenithMediaOnly;
  };
  if (!body || bookType !== 'epub' || layout === 'fixed' || hasMeaningfulBodyText(doc)) {
    clearMediaPages();
    return;
  }

  const media = Array.from(body.querySelectorAll<HTMLElement>('img, svg'));
  if (media.length === 0) {
    clearMediaPages();
    return;
  }

  const pages = new Set<HTMLElement>();
  const semanticPages = Array.from(body.querySelectorAll<HTMLElement>('figure, picture'))
    .filter((element) => element.querySelector('img, svg'))
    .filter((element) => !element.parentElement?.closest('figure, picture'));
  semanticPages.forEach((element) => pages.add(element));

  media.forEach((element) => {
    if (semanticPages.some((page) => page.contains(element))) return;
    let page: HTMLElement = element;
    let parent = element.parentElement;
    while (parent && parent !== body && parent.querySelectorAll('img, svg').length === 1) {
      page = parent;
      parent = parent.parentElement;
    }
    pages.add(page);
  });

  existingPages.forEach((element) => {
    if (!pages.has(element)) element.removeAttribute(MEDIA_PAGE_ATTRIBUTE);
  });
  pages.forEach((element) => {
    if (!element.hasAttribute(MEDIA_PAGE_ATTRIBUTE)) element.setAttribute(MEDIA_PAGE_ATTRIBUTE, '');
  });
  if (doc.documentElement.dataset.zenithMediaOnly !== 'true') {
    doc.documentElement.dataset.zenithMediaOnly = 'true';
  }
}

function hasMeaningfulBodyText(doc: Document) {
  const walker = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest('svg, script, style, noscript') && node.textContent?.trim()) return true;
    node = walker.nextNode();
  }
  return false;
}

function fitSinglePageEpubMedia(
  doc: Document,
  settings: AppSettings,
  bookType: 'epub' | 'txt',
  viewportWidth: number,
  viewportHeight: number,
  layout?: EpubNavigator['layout'],
) {
  const previous = fittedEpubMedia.get(doc);
  if (bookType !== 'epub' || layout === 'fixed' || settings.pageMode !== 'single' || isContinuousScroll(settings)) {
    previous?.forEach((properties, element) => restoreInlineProperties(element, properties));
    fittedEpubMedia.delete(doc);
    return;
  }

  const bodyStyle = doc.defaultView?.getComputedStyle(doc.body);
  const contentScale = readiumContentScale(doc);
  const paddingBlock = numericCssValue(bodyStyle?.paddingTop) + numericCssValue(bodyStyle?.paddingBottom);
  const paddingInline = numericCssValue(bodyStyle?.paddingLeft) + numericCssValue(bodyStyle?.paddingRight);
  const logicalViewportHeight = viewportHeight / contentScale;
  const logicalViewportWidth = viewportWidth / contentScale;
  const bodyWidth = numericCssValue(bodyStyle?.width);
  const maximumHeightValue = Math.max(1, logicalViewportHeight - paddingBlock - 16 / contentScale);
  const maximumWidthValue = Math.max(1, Math.min(
    logicalViewportWidth - paddingInline - 16 / contentScale,
    bodyWidth > 0 ? bodyWidth - paddingInline : Number.POSITIVE_INFINITY,
  ));
  const maximumHeight = `${maximumHeightValue}px`;
  const maximumWidth = `${maximumWidthValue}px`;
  const targets = [
    ...Array.from(doc.querySelectorAll<HTMLElement>('img')),
    ...Array.from(doc.querySelectorAll<HTMLElement>('body > svg, body > * > svg:only-child')),
  ];
  const saved = previous || new Map<HTMLElement, Map<string, { value: string; priority: string }>>();
  targets.forEach((element) => {
    if (!saved.has(element)) {
      const properties = new Map<string, { value: string; priority: string }>();
      FITTED_MEDIA_PROPERTIES.forEach((property) => properties.set(property, {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      }));
      saved.set(element, properties);
    }
    setInlineProperty(element, 'break-inside', 'avoid');
    setInlineProperty(element, 'display', 'block');
    setInlineProperty(element, 'height', 'auto');
    setInlineProperty(element, 'margin-inline', 'auto');
    setInlineProperty(element, 'max-block-size', maximumHeight);
    setInlineProperty(element, 'max-height', maximumHeight);
    setInlineProperty(element, 'max-width', `min(100%, ${maximumWidth})`);
    setInlineProperty(element, 'min-block-size', '0');
    setInlineProperty(element, 'min-height', '0');
    setInlineProperty(element, 'min-width', '0');
    setInlineProperty(element, 'object-fit', 'contain');
    setInlineProperty(element, 'width', 'auto');
    const image = element.tagName.toLowerCase() === 'img' ? element as HTMLImageElement : undefined;
    if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
      const scale = Math.min(1, maximumWidthValue / image.naturalWidth, maximumHeightValue / image.naturalHeight);
      setInlineProperty(element, 'height', `${Math.max(1, Math.floor(image.naturalHeight * scale))}px`);
      setInlineProperty(element, 'width', `${Math.max(1, Math.floor(image.naturalWidth * scale))}px`);
    }
  });
  fittedEpubMedia.set(doc, saved);
}

function setInlineProperty(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) === value && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function restoreInlineProperties(
  element: HTMLElement,
  properties: Map<string, { value: string; priority: string }>,
) {
  properties.forEach(({ value, priority }, property) => {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  });
}

function readiumContentScale(doc: Document) {
  const zoom = Number.parseFloat(doc.defaultView?.getComputedStyle(doc.body).zoom || '');
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

function numericCssValue(value?: string) {
  const parsed = Number.parseFloat(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function frameLayoutFingerprint(root: HTMLElement) {
  return [
    root.dataset.zenithMediaOnly || '',
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
