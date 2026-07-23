import type { ReaderFontPack } from '../contracts/readerGateway';
import { desktopFileSrc, readerFontPacks, runtimeCapabilities } from './backend';

const STYLE_ATTRIBUTE = 'data-zenith-font-pack';
let installedPacks: ReaderFontPack[] = [];
let refreshPromise: Promise<ReaderFontPack[]> | undefined;

export function getInstalledReaderFontPacks() {
  return installedPacks;
}

export function refreshReaderFontPacks() {
  if (!runtimeCapabilities.desktopShell) return Promise.resolve([] as ReaderFontPack[]);
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
  if (!runtimeCapabilities.desktopShell) return;
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
  const root = pack.rootPath || '';
  const separator = root.includes('\\') ? '\\' : '/';
  return (pack.css || '').replace(/url\((['"]?)([^'"\)]+)\1\)/g, (_match, _quote: string, relative: string) => {
    const normalized = relative.trim().replace(/^\.\//, '').replace(/[\\/]/g, separator);
    return `url("${desktopFileSrc(`${root}${separator}${normalized}`)}")`;
  });
}
