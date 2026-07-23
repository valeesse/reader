import React from 'react';
import { ReadiumFrameClickEvent } from '../../../vendor/readium-navigator';
import { AppSettings } from '../../../types';
import { isContinuousScroll } from './readiumViewerModel';
import { installReadiumFrameStyles } from './readiumViewerPresentation';

export function installReadiumWheel(
  wnd: Window,
  onPagedWheel: (event: WheelEvent) => void,
  onScrollBoundary: (event: WheelEvent, wnd: Window) => void,
  settingsRef: React.MutableRefObject<AppSettings>,
) {
  const doc = wnd.document;
  if (doc.documentElement.dataset.zenithReadiumWheelBound === 'true') return;
  doc.documentElement.dataset.zenithReadiumWheelBound = 'true';
  wnd.addEventListener('wheel', (event) => {
    if (isContinuousScroll(settingsRef.current)) onScrollBoundary(event, wnd);
    else onPagedWheel(event);
  }, { passive: false, capture: true });
}

export function installImagePreview(wnd: Window, onOpen: (image: { src: string; name: string }) => void) {
  const doc = wnd.document;
  installReadiumFrameStyles(doc);
  if (!doc || doc.body.dataset.zenithReadiumImageBound === 'true') return;
  doc.body.dataset.zenithReadiumImageBound = 'true';
  let lastOpenedAt = 0;
  const imageFromEvent = (event: Event) => (event.target as Element | null)?.closest?.('img, svg image') as Element | null;
  const primary = (event: Event) => !('button' in event) || typeof event.button !== 'number' || event.button === 0;
  doc.addEventListener('contextmenu', (event) => event.stopPropagation(), true);
  doc.addEventListener('pointerdown', (event) => {
    if (!primary(event) || !imageFromEvent(event)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);
  doc.addEventListener('click', (event) => {
    if (!primary(event)) return;
    const image = imageFromEvent(event);
    if (!image || Date.now() - lastOpenedAt < 260) return;
    lastOpenedAt = Date.now();
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const src = getImageSource(image);
    if (src) onOpen({ src, name: getImageName(image) });
  }, true);
}

export function handleReadiumClick(event: ReadiumFrameClickEvent, onOpen: (image: { src: string; name: string }) => void) {
  const image = imageFromInteractiveElement(event.interactiveElement);
  if (!image) return false;
  onOpen(image);
  return true;
}

function imageFromInteractiveElement(value?: string) {
  if (!value || (!value.includes('<img') && !value.includes('<image'))) return null;
  const image = new DOMParser().parseFromString(value, 'text/html').querySelector('img, svg image');
  const src = image ? getImageSource(image) : '';
  return src ? { src, name: image ? getImageName(image) : 'image' } : null;
}
function getImageSource(image: Element) {
  if (image.tagName.toLowerCase() === 'img') {
    return image.getAttribute('currentSrc') || (image as HTMLImageElement).currentSrc || image.getAttribute('src') || (image as HTMLImageElement).src || '';
  }
  return image.getAttribute('href') || image.getAttribute('xlink:href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
}
function getImageName(image: Element) {
  return image.getAttribute('alt') || image.getAttribute('title') || image.getAttribute('aria-label') || 'image';
}
