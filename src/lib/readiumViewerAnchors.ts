import { EpubNavigator, ReadiumLocator } from '../vendor/readium-navigator';
import { AppSettings } from '../types';
import {
  deserializeReadiumLocator,
  serializeReadiumLocator,
} from './readiumPublication';
import { currentReadiumFrame, getLiveReadiumIframe } from './readiumNavigatorAdapter';

export function snapshotLocator(locator?: ReadiumLocator) {
  return locator ? deserializeReadiumLocator(serializeReadiumLocator(locator)) : undefined;
}

export function snapshotVisibleTextLocator(navigator: EpubNavigator, _settings: AppSettings) {
  const fallback = snapshotLocator(navigator.currentLocator);
  if (!fallback) return undefined;
  const frame = currentReadiumFrame(navigator);
  const wnd = getLiveReadiumIframe(frame)?.contentWindow;
  const doc = wnd?.document;
  if (!wnd || !doc?.body) return fallback;
  const targetX = wnd.innerWidth * 0.5;
  const targetY = wnd.innerHeight * 0.5;
  const candidates = Array.from(doc.body.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
    .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
    .filter(({ element, rect }) => element.textContent?.trim() && rect.right > 0 && rect.left < wnd.innerWidth && rect.bottom > 0 && rect.top < wnd.innerHeight)
    .sort((a, b) => distanceToRectCenter(a.rect, targetX, targetY) - distanceToRectCenter(b.rect, targetX, targetY));
  const selected = candidates[0];
  const element = selected?.element;
  const probeX = selected ? Math.max(selected.rect.left + 1, Math.min(targetX, selected.rect.right - 1)) : targetX;
  const probeY = selected ? Math.max(selected.rect.top + 1, Math.min(targetY, selected.rect.bottom - 1)) : targetY;
  const text = element ? textAnchorNearPoint(element, probeX, probeY) || firstSentence(element.textContent || '') : '';
  const anchorRect = element && text ? textRangeRect(element, text) || selected?.rect : selected?.rect;
  const generator = (wnd as Window & { _readium_cssSelectorGenerator?: { getCssSelector: (element: Element) => string } })._readium_cssSelectorGenerator;
  if (!element || !text || !generator) return fallback;
  try {
    const serialized = JSON.parse(serializeReadiumLocator(fallback));
    serialized.locations = {
      ...serialized.locations,
      cssSelector: generator.getCssSelector(element),
      zenithAnchorText: text,
      zenithViewportX: anchorRect ? ((anchorRect.left + anchorRect.right) / 2) / wnd.innerWidth : 0.5,
      zenithViewportY: anchorRect ? ((anchorRect.top + anchorRect.bottom) / 2) / wnd.innerHeight : 0.5,
    };
    serialized.text = { highlight: text };
    return deserializeReadiumLocator(JSON.stringify(serialized)) || fallback;
  } catch { return fallback; }
}

export function retargetLocatorViewport(locator: ReadiumLocator, _settings: AppSettings) {
  try {
    const serialized = JSON.parse(serializeReadiumLocator(locator));
    serialized.locations = { ...serialized.locations, zenithViewportX: 0.5, zenithViewportY: 0.5 };
    return deserializeReadiumLocator(JSON.stringify(serialized)) || locator;
  } catch { return locator; }
}

export function distanceToRectCenter(rect: DOMRect, x: number, y: number) {
  const dx = (rect.left + rect.right) / 2 - x;
  const dy = (rect.top + rect.bottom) / 2 - y;
  return dx * dx + dy * dy;
}

function firstSentence(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.match(/^.*?[。！？!?](?:[”’」』】》])?/)?.[0] || normalized.slice(0, 160);
}

function textAnchorNearPoint(element: Element, x: number, y: number) {
  const doc = element.ownerDocument as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const caretPosition = doc.caretPositionFromPoint?.(x, y);
  const caretRange = caretPosition ? undefined : doc.caretRangeFromPoint?.(x, y);
  const node = caretPosition?.offsetNode || caretRange?.startContainer;
  const nodeOffset = caretPosition?.offset ?? caretRange?.startOffset;
  if (!node || nodeOffset === undefined || !element.contains(node)) return undefined;
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let combined = '';
  let caretOffset = -1;
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text;
    if (textNode === node) caretOffset = combined.length + Math.min(nodeOffset, textNode.length);
    combined += textNode.data;
  }
  if (caretOffset < 0 || !combined.trim()) return undefined;
  const boundary = /[。！？!?\n]/;
  let start = caretOffset;
  while (start > 0 && caretOffset - start < 120 && !boundary.test(combined[start - 1])) start -= 1;
  let end = caretOffset;
  while (end < combined.length && end - caretOffset < 120) {
    if (boundary.test(combined[end++])) break;
  }
  return combined.slice(start, end).replace(/\s+/g, ' ').trim() || undefined;
}

export function textRangeRect(element: Element, text: string) {
  const rects = textRangeRects(element, text);
  return rects.length > 0 ? rects[Math.floor((rects.length - 1) / 2)] : undefined;
}

export function textRangeRects(element: Element, text: string) {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let combined = '';
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push(node);
    combined += node.data;
  }
  const target = text.replace(/\s+/g, ' ').trim();
  const index = combined.replace(/\s+/g, ' ').indexOf(target);
  if (!target || index < 0) return [];
  const start = textPositionAt(nodes, rawOffsetForNormalizedOffset(combined, index));
  const end = textPositionAt(nodes, rawOffsetForNormalizedOffset(combined, index + target.length));
  if (!start || !end) return [];
  const range = element.ownerDocument.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  const rects = Array.from(range.getClientRects());
  const fallback = range.getBoundingClientRect();
  return rects.length > 0 ? rects : fallback.width > 0 || fallback.height > 0 ? [fallback] : [];
}

function rawOffsetForNormalizedOffset(text: string, target: number) {
  if (target <= 0) return 0;
  let normalized = 0;
  let whitespace = false;
  for (let index = 0; index < text.length; index++) {
    const currentWhitespace = /\s/.test(text[index]);
    if (!currentWhitespace || !whitespace) normalized += 1;
    whitespace = currentWhitespace;
    if (normalized >= target) return index + 1;
  }
  return text.length;
}

function textPositionAt(nodes: Text[], offset: number) {
  let remaining = offset;
  for (const node of nodes) {
    if (remaining <= node.length) return { node, offset: remaining };
    remaining -= node.length;
  }
  const node = nodes.at(-1);
  return node ? { node, offset: node.length } : undefined;
}
