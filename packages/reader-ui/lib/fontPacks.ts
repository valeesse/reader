import type { ReaderFontPack } from '../contracts/readerGateway';
import { desktopFileSrc, readerFontPacks, runtimeCapabilities } from './backend';
import { wenkaiWebCss, yuanWebCss } from 'virtual:zenith-web-font-packs';

const STYLE_ATTRIBUTE = 'data-zenith-font-pack';
const WEB_FONT_CACHE_VERSION = '3';
const FONT_PROBE_TEXT = '阅读测试漢字かなカナAa。、';
const fontReadiness = new WeakMap<Document, Promise<void>>();
const WEB_FONT_PACKS: ReaderFontPack[] = [
  {
    id: 'wenkai',
    label: '霞鹜文楷 Screen',
    family: 'Zenith LXGW WenKai',
    version: '1.7.0',
    source: 'lxgw-wenkai-screen-webfont',
    installed: true,
    bytes: 0,
    css: wenkaiWebCss.replaceAll('LXGW WenKai Screen R', 'Zenith LXGW WenKai'),
  },
  {
    id: 'yuan',
    label: '霞鹜 975 圆体',
    family: 'Zenith LXGW 975 Yuan',
    version: '1.0.0',
    source: '@free-fonts/lxgw-975-yuan',
    installed: true,
    bytes: 0,
    css: yuanWebCss.replaceAll('LXGW 975 Yuan SC', 'Zenith LXGW 975 Yuan'),
  },
];
// Web packs are bundled with the application, so expose them synchronously.
// Readium applies settings during its first layout pass; starting with an empty
// list made that pass race the resolved refresh promise in Docker browsers.
let installedPacks: ReaderFontPack[] = runtimeCapabilities.desktopShell ? [] : WEB_FONT_PACKS;
let refreshPromise: Promise<ReaderFontPack[]> | undefined;

export function getInstalledReaderFontPacks() {
  return installedPacks;
}

export function refreshReaderFontPacks() {
  if (!runtimeCapabilities.desktopShell) {
    installedPacks = WEB_FONT_PACKS;
    return Promise.resolve(WEB_FONT_PACKS);
  }
  refreshPromise ||= readerFontPacks()
    .then((packs) => {
      installedPacks = packs.filter((pack) => pack.installed && pack.css && pack.rootPath);
      return packs;
    })
    .finally(() => {
      refreshPromise = undefined;
    });
  return refreshPromise;
}

export async function installOptionalReaderFontStyles(doc: Document, selectedFamily?: string) {
  if (installedPacks.length === 0) await refreshReaderFontPacks();
  const selected = installedPacks.filter((pack) => !selectedFamily || selectedFamily.includes(pack.family));
  const selectedIds = new Set(selected.map((pack) => pack.id));
  doc.querySelectorAll<HTMLStyleElement>(`style[${STYLE_ATTRIBUTE}]`).forEach((style) => {
    if (!selectedIds.has(style.dataset.zenithFontPack || '')) style.remove();
  });
  for (const pack of selected) {
    if (doc.querySelector(`style[${STYLE_ATTRIBUTE}="${CSS.escape(pack.id)}"]`)) continue;
    const style = doc.createElement('style');
    style.dataset.zenithFontPack = pack.id;
    style.textContent = resolveFontUrls(pack);
    (doc.head || doc.documentElement).appendChild(style);
  }
  const ready = waitForSelectedFontFaces(doc, selected);
  fontReadiness.set(doc, ready);
  await ready;
  doc.defaultView?.dispatchEvent(new Event('resize'));
}

export function waitForOptionalReaderFonts(doc: Document) {
  return fontReadiness.get(doc) || Promise.resolve();
}

export function clearOptionalReaderFontStyles(doc: Document) {
  doc.querySelectorAll(`style[${STYLE_ATTRIBUTE}]`).forEach((style) => style.remove());
}

function resolveFontUrls(pack: ReaderFontPack) {
  if (!pack.rootPath) return resolveWebFontUrls(pack.css || '');
  const root = pack.rootPath || '';
  const separator = root.includes('\\') ? '\\' : '/';
  return (pack.css || '').replace(/url\((['"]?)([^'"\)]+)\1\)/g, (_match, _quote: string, relative: string) => {
    const normalized = relative.trim().replace(/^\.\//, '').replace(/[\\/]/g, separator);
    return `url("${desktopFileSrc(`${root}${separator}${normalized}`)}")`;
  });
}

function resolveWebFontUrls(css: string) {
  return css.replace(/url\((['"]?)([^'"\)]+)\1\)/g, (match, _quote: string, source: string) => {
    const value = source.trim();
    if (!value || /^(?:data:|blob:)/i.test(value)) return match;
    // Vite emits relative URLs when the web build uses a relative base. Resolve
    // them against the entry document before installing this CSS into Readium's
    // blob-backed iframe, whose own base URL cannot locate application assets.
    const url = new URL(value, document.baseURI);
    // Font files used to be cached for a year without CORS response headers.
    // A versioned query forces existing Docker clients and reverse proxies to
    // request the corrected response instead of reusing that incompatible hit.
    url.searchParams.set('zenith-font', WEB_FONT_CACHE_VERSION);
    return `url("${url}")`;
  });
}

async function waitForSelectedFontFaces(doc: Document, selected: ReaderFontPack[]) {
  const fontSet = (doc as Document & { fonts?: Partial<FontFaceSet> }).fonts;
  if (!fontSet || selected.length === 0) return;
  if (typeof fontSet.load === 'function') {
    await Promise.all(selected.map((pack) => fontSet
      .load!(`16px "${pack.family.replaceAll('"', '\\"')}"`, FONT_PROBE_TEXT)
      .then(() => undefined)
      .catch(() => undefined)));
  }
  if (fontSet.ready && typeof fontSet.ready.then === 'function') {
    await fontSet.ready.then(() => undefined).catch(() => undefined);
  }
}
