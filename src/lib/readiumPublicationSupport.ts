import type { ReadiumLocatorLike, ReadiumTextLike } from './readiumPublication';

const rewriteWarnings = new Set<string>();

export function createLocator(values: {
  href: string;
  type: string;
  title?: string;
  locations?: Record<string, unknown>;
  text?: unknown;
}): ReadiumLocatorLike {
  const text = createLocatorText(values.text);
  const locations = createLocatorLocations(values.locations);
  const locator: ReadiumLocatorLike = {
    href: values.href,
    type: values.type,
    title: values.title,
    locations,
    text,
    serialize: () => ({
      href: locator.href,
      type: locator.type,
      title: locator.title,
      locations: locator.locations,
      text: locator.text?.serialize(),
    }),
    copyWithLocations: (next) => createLocator({
      href: locator.href,
      type: locator.type,
      title: locator.title,
      locations: { ...locator.locations, ...next },
      text: locator.text,
    }),
  };
  return locator;
}

function createLocatorLocations(value?: Record<string, unknown>) {
  const serializedHtmlId = typeof value?.htmlId === 'string' ? value.htmlId : undefined;
  const locations: Record<string, unknown> & {
    getCssSelector: () => string | undefined;
    htmlId: () => string | undefined;
  } = {
    ...(value || {}),
    getCssSelector: () => typeof locations.cssSelector === 'string' ? locations.cssSelector : undefined,
    htmlId: () => typeof locations.htmlIdValue === 'string' ? locations.htmlIdValue : serializedHtmlId,
  };
  return locations;
}

function createLocatorText(value: unknown): ReadiumTextLike | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Partial<ReadiumTextLike>;
  if (typeof source.serialize === 'function') return source as ReadiumTextLike;
  const text: ReadiumTextLike = {
    after: typeof source.after === 'string' ? source.after : undefined,
    before: typeof source.before === 'string' ? source.before : undefined,
    highlight: typeof source.highlight === 'string' ? source.highlight : undefined,
    serialize: () => Object.fromEntries(
      Object.entries({ after: text.after, before: text.before, highlight: text.highlight })
        .filter((entry): entry is [string, string] => entry[1] !== undefined),
    ),
  };
  return text.after === undefined && text.before === undefined && text.highlight === undefined ? undefined : text;
}

export async function rewriteUrlAttributes(
  doc: XMLDocument,
  baseDir: string,
  resolveUrl: (href: string) => Promise<string>,
) {
  const tasks: Promise<void>[] = [];
  doc.querySelectorAll('[src], [poster]').forEach((element) => {
    for (const attribute of ['src', 'poster']) tasks.push(rewriteElementUrl(element, attribute, baseDir, resolveUrl));
  });
  doc.querySelectorAll('link, image, use').forEach((element) => {
    tasks.push(rewriteElementUrl(element, 'href', baseDir, resolveUrl));
    tasks.push(rewriteElementUrl(element, 'xlink:href', baseDir, resolveUrl));
  });
  await Promise.all(tasks);
}

async function rewriteElementUrl(element: Element, attribute: string, baseDir: string, resolveUrl: (href: string) => Promise<string>) {
  const value = element.getAttribute(attribute);
  if (!value || isExternalUrl(value) || value.startsWith('#')) return;
  const [pathPart, suffix = ''] = value.split(/(?=[?#])/);
  const resolved = resolveZipPath(baseDir, pathPart);
  try {
    element.setAttribute(attribute, `${await resolveUrl(resolved)}${suffix}`);
  } catch (error) {
    if (isMissingOptionalEpubResource(error)) return;
    warnEpubRewriteOnce(`html:${resolved}`, 'Failed to rewrite EPUB resource URL', { attribute, value, resolved, error });
  }
}

export function parseXml(text: string, type: DOMParserSupportedType) {
  return new DOMParser().parseFromString(text, type);
}
export function normalizeZipPath(path: string) {
  return path.replace(/\\/g, '/').split('/').reduce<string[]>((parts, part) => {
    if (!part || part === '.') return parts;
    if (part === '..') parts.pop();
    else parts.push(part);
    return parts;
  }, []).join('/');
}
export function normalizeHref(href: string) {
  const index = href.search(/[?#]/);
  return `${normalizeZipPath(index >= 0 ? href.slice(0, index) : href)}${index >= 0 ? href.slice(index) : ''}`;
}
export function resolveZipPath(baseDir: string, href: string) {
  return isExternalUrl(href) ? href : normalizeZipPath(`${baseDir ? `${baseDir}/` : ''}${href}`);
}
export function dirname(path: string) {
  const normalized = normalizeZipPath(stripHash(path));
  const index = normalized.lastIndexOf('/');
  return index >= 0 ? normalized.slice(0, index) : '';
}
export function stripHash(path: string) { return path.split('#')[0].split('?')[0]; }
export function fragmentFromHref(href: string) {
  const fragment = href.split('#')[1]?.split('?')[0];
  if (!fragment) return undefined;
  try { return decodeURIComponent(fragment); } catch { return fragment; }
}
export function touchKey(order: string[], key: string) {
  const index = order.indexOf(key);
  if (index >= 0) order.splice(index, 1);
  order.push(key);
}
export function isExternalUrl(value: string) { return /^(?:[a-z][a-z0-9+.-]*:|data:|blob:|#)/i.test(value); }
export function isMissingOptionalEpubResource(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /(?:missing resource|resource is not in the manifest)/i.test(message);
}
export function warnEpubRewriteOnce(key: string, message: string, detail: Record<string, unknown>) {
  if (rewriteWarnings.has(key)) return;
  rewriteWarnings.add(key);
  if (rewriteWarnings.size > 100) rewriteWarnings.delete(rewriteWarnings.values().next().value!);
  console.warn(message, detail);
}
export function mimeFromPath(path: string) {
  const extension = stripHash(path).split('.').pop()?.toLowerCase();
  return ({
    xhtml: 'application/xhtml+xml', xml: 'application/xhtml+xml', html: 'text/html', htm: 'text/html',
    css: 'text/css', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', otf: 'font/otf', ttf: 'font/ttf',
    woff: 'font/woff', woff2: 'font/woff2', ncx: 'application/x-dtbncx+xml',
  } as Record<string, string>)[extension || ''] || 'application/octet-stream';
}
export function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
