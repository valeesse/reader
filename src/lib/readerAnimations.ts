import React from 'react';
import { AppSettings } from '../types';

export function shouldReducePageAnimation(pendingTurns = 0) {
  return pendingTurns > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animatePageExit(
  element: HTMLElement | null,
  animation: AppSettings['pageTurnAnimation'],
  direction: -1 | 1,
  animationRef: React.MutableRefObject<Animation | null>,
  navigate: () => void,
  options: { reduce?: boolean } = {},
) {
  if (!element || animation === 'minimal' || animation === 'scroll' || options.reduce || shouldReducePageAnimation()) {
    navigate();
    return;
  }
  animationRef.current?.cancel();
  const horizontal = animation === 'slide-horizontal';
  const distance = direction * -Math.min(horizontal ? element.clientWidth : element.clientHeight, 72);
  const transform = horizontal ? `translate3d(${distance}px, 0, 0)` : `translate3d(0, ${distance}px, 0)`;
  const running = element.animate(
    [{ transform: 'translate3d(0, 0, 0)', opacity: 1 }, { transform, opacity: 0.15 }],
    { duration: 130, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
  );
  animationRef.current = running;
  running.finished.then(navigate, navigate);
}

export function animatePageEntry(
  element: HTMLElement | null,
  animation: AppSettings['pageTurnAnimation'],
  direction: -1 | 1,
  animationRef: React.MutableRefObject<Animation | null>,
  options: { reduce?: boolean } = {},
) {
  if (!element || options.reduce || (animation !== 'slide-horizontal' && animation !== 'slide-vertical')) return;
  animationRef.current?.cancel();
  const horizontal = animation === 'slide-horizontal';
  const distance = direction * Math.min(horizontal ? element.clientWidth : element.clientHeight, 72);
  const transform = horizontal ? `translate3d(${distance}px, 0, 0)` : `translate3d(0, ${distance}px, 0)`;
  animationRef.current = element.animate(
    [{ transform, opacity: 0.15 }, { transform: 'translate3d(0, 0, 0)', opacity: 1 }],
    { duration: 210, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' },
  );
}
