import type { ReaderFontPack } from '../contracts/readerGateway';
import { desktopFileSrc, readerFontPacks, runtimeCapabilities } from './backend';
import wenkaiWebCss from 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreenr.css?inline';
import yuanWebCss from '@free-fonts/lxgw-975-yuan/lxgw-975-yuan.css?inline';

const STYLE_ATTRIBUTE = 'data-zenith-font-pack';
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
let installedPacks: ReaderFontPack[] = [];
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
  if (selected.length > 0 && doc.defaultView) {
    void doc.fonts?.ready.then(() => doc.defaultView?.dispatchEvent(new Event('resize')));
  }
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
    return `url("${new URL(value, document.baseURI)}")`;
  });
}
