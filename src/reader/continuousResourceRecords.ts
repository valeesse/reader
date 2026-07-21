import { applyContinuousReaderDocumentStyles } from './readerDocumentStyles';
import { normalizeResourcePath, resolvePublicationHref } from './continuousResourceDom';
import { StripRecord, StripRecordEnvironment } from './continuousResourceStripTypes';
import { sortedRecords } from './continuousResourceLocator';

const DEFAULT_RESOURCE_HEIGHT = 1600;

export function createRecord(environment: StripRecordEnvironment, index: number) {
  const { publication, content, records } = environment;
  const existing = records.get(index);
  if (existing) return existing.loadPromise;
  const wrapper = document.createElement('div');
  wrapper.className = 'zenith-resource-strip-item';
  wrapper.dataset.resourceIndex = String(index);
  wrapper.dataset.resourceHref = publication.readingOrder.items[index]?.href || '';
  wrapper.style.height = `${environment.estimatedHeight(index)}px`;
  const iframe = document.createElement('iframe');
  iframe.className = 'zenith-resource-strip-frame';
  // Executable publication content is stripped by the resource manager. Keeping
  // same-origin frames avoids two WebView diagnostics for every warm resource.
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('aria-label', publication.readingOrder.items[index]?.title || `资源 ${index + 1}`);
  wrapper.appendChild(iframe);
  const next = sortedRecords(records).find((record) => record.index > index);
  const height = environment.estimatedHeight(index);
  content.insertBefore(wrapper, next?.wrapper || environment.bottomSpacer);
  const record = {
    index,
    wrapper,
    iframe,
    height,
    loaded: false,
    layoutReady: false,
    loadPromise: Promise.resolve(),
    readyPromise: Promise.resolve(),
    abortController: new AbortController(),
  } as StripRecord;
  records.set(index, record);
  environment.positionRecord(record);
  record.loadPromise = loadRecord(environment, record).catch((error) => {
    if (records.get(index) === record) removeRecord(environment, record);
    throw error;
  });
  return record.loadPromise;
}

async function loadRecord(environment: StripRecordEnvironment, record: StripRecord) {
  const { publication, records } = environment;
  const link = publication.readingOrder.items[record.index];
  if (!link || environment.destroyed()) return;
  const source = await publication.get(link).readAsString(record.abortController.signal);
  if (!source || environment.destroyed() || records.get(record.index) !== record) return;
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(`Resource strip frame timed out: ${link.href}`)), 2500);
    record.iframe.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    record.iframe.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error(`Resource strip frame failed: ${link.href}`));
    };
    record.iframe.srcdoc = source;
  });
  if (environment.destroyed() || records.get(record.index) !== record) return;
  const doc = record.iframe.contentDocument;
  if (!doc) throw new Error(`Resource strip frame has no document: ${link.href}`);
  await applyDocumentSettings(environment, doc);
  installDocumentInteractions(environment, record, doc);
  record.loaded = true;
  measureRecord(environment, record);
  record.resizeObserver = new ResizeObserver(() => measureRecord(environment, record));
  if (doc.body) record.resizeObserver.observe(doc.body);
  record.readyPromise = settleRecordLayout(environment, record, doc).then(() => {
    if (!environment.destroyed() && records.get(record.index) === record && !record.abortController.signal.aborted) {
      record.layoutReady = true;
    }
  });
}

async function settleRecordLayout(environment: StripRecordEnvironment, record: StripRecord, doc: Document) {
  const fontSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
  await Promise.race([
    fontSet?.ready.catch(() => {}),
    new Promise<void>((resolve) => window.setTimeout(resolve, 400)),
  ]);
  await Promise.race([
    Promise.all(Array.from(doc.querySelectorAll('img')).slice(0, 8).map(async (image) => {
      if (!image.complete) await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
      await image.decode?.().catch(() => {});
    })),
    new Promise<void>((resolve) => window.setTimeout(resolve, 400)),
  ]);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  if (environment.destroyed() || environment.records.get(record.index) !== record) return;
  measureRecord(environment, record);
  doc.querySelectorAll('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', () => measureRecord(environment, record), { once: true });
  });
}

function installDocumentInteractions(environment: StripRecordEnvironment, record: StripRecord, doc: Document) {
  doc.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const image = target?.closest('img, image') as HTMLImageElement | SVGImageElement | null;
    if (image) {
      event.preventDefault();
      const src = image instanceof HTMLImageElement ? image.currentSrc || image.src : image.getAttribute('href') || '';
      if (src) environment.callbacks.onImage({
        src,
        name: image.getAttribute('alt') || image.getAttribute('title') || '插图',
      });
      return;
    }
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (anchor) {
      const rawHref = anchor.getAttribute('href') || '';
      if (rawHref.startsWith('#')) {
        event.preventDefault();
        const element = doc.getElementById(decodeURIComponent(rawHref.slice(1)));
        if (element) environment.scroller.scrollTo({
          top: record.wrapper.offsetTop + element.getBoundingClientRect().top,
          behavior: 'smooth',
        });
        return;
      }
      const resolvedHref = resolvePublicationHref(
        environment.publication.readingOrder.items[record.index]?.href || '',
        rawHref,
      );
      const link = resolvedHref ? findReadingOrderLink(environment, resolvedHref) : undefined;
      if (link) {
        event.preventDefault();
        const fragment = rawHref.includes('#') ? decodeURIComponent(rawHref.split('#')[1] || '') : '';
        const locator = fragment
          ? link.locator.copyWithLocations({ ...link.locator.locations, fragments: [fragment], htmlIdValue: fragment })
          : link.locator;
        void environment.go(locator, true);
        return;
      }
    }
    environment.callbacks.onToggleChrome();
  });
}

function findReadingOrderLink(environment: StripRecordEnvironment, href: string) {
  const { readingOrder } = environment.publication;
  const direct = readingOrder.findWithHref(href);
  if (direct) return direct;
  const normalized = normalizeResourcePath(href);
  const basename = normalized.split('/').at(-1);
  const suffixMatches = readingOrder.items.filter((link) => {
    const candidate = normalizeResourcePath(link.href);
    return candidate.endsWith(`/${normalized}`) || candidate === normalized;
  });
  if (suffixMatches.length === 1) return suffixMatches[0];
  const basenameMatches = basename
    ? readingOrder.items.filter((link) => normalizeResourcePath(link.href).split('/').at(-1) === basename)
    : [];
  return basenameMatches.length === 1 ? basenameMatches[0] : undefined;
}

export function applyDocumentSettings(environment: StripRecordEnvironment, doc: Document) {
  return applyContinuousReaderDocumentStyles(doc, environment.settings(), environment.bookType);
}

export function measureRecord(environment: StripRecordEnvironment, record: StripRecord) {
  if (!record.loaded || environment.destroyed()) return;
  const doc = record.iframe.contentDocument;
  if (!doc) return;
  const oldHeight = record.height;
  const measured = Math.max(
    1,
    Math.ceil(doc.documentElement.scrollHeight || 0),
    Math.ceil(doc.body?.scrollHeight || 0),
    Math.ceil(doc.body?.getBoundingClientRect().height || 0),
  );
  if (Math.abs(measured - oldHeight) < 1) return;
  record.height = measured;
  record.wrapper.style.height = `${measured}px`;
  record.iframe.style.height = `${measured}px`;
  environment.onRecordHeightChange(record, oldHeight);
}

export function removeRecord(environment: StripRecordEnvironment, record: StripRecord) {
  record.abortController.abort();
  record.resizeObserver?.disconnect();
  environment.records.delete(record.index);
  record.wrapper.remove();
}

export function defaultResourceHeight(scroller: HTMLDivElement) {
  return Math.max(DEFAULT_RESOURCE_HEIGHT, scroller.clientHeight * 1.5);
}
