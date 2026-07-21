import type { EpubNavigator } from '../vendor/readium-navigator';
import { createScrollTransitionSnapshot, revealReadiumFrames } from './readiumViewerPresentation';
import { currentReadiumFrame, getLiveReadiumIframe, readiumFrames } from './readiumNavigatorAdapter';
import { isContinuousScroll } from './readiumViewerModel';
import type { ReadiumReaderRuntime } from './readiumReaderRuntime';

export function createFrameTransition(runtime: ReadiumReaderRuntime, navigator: EpubNavigator) {
  // Paged mode already has its own exit/entry animation. Its iframe must stay
  // under navigator control; cloning it used to create a sandboxed about:blank
  // frame for every click and made rapid wheel turns race frame replacement.
  if (!isContinuousScroll(runtime.settingsRef.current)) return () => {};
  const outgoingScrollFrame = getLiveReadiumIframe(currentReadiumFrame(navigator))
    || Array.from(runtime.containerRef.current?.querySelectorAll<HTMLIFrameElement>('.readium-navigator-iframe') || [])
      .find((iframe) => {
        const style = getComputedStyle(iframe);
        return style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0;
      });
  const outgoingScrollDocument = outgoingScrollFrame?.contentDocument;
  outgoingScrollFrame?.classList.add('zenith-scroll-transition-outgoing');
  const scrollTransitionSnapshot = outgoingScrollFrame && runtime.containerRef.current
    ? createScrollTransitionSnapshot(outgoingScrollFrame, runtime.containerRef.current)
    : undefined;

  return () => {
    if (!outgoingScrollFrame && !scrollTransitionSnapshot) return;
    let remainingFrames = 120;
    const handOff = () => {
      const container = runtime.containerRef.current;
      if (!container) {
        outgoingScrollFrame?.classList.remove('zenith-scroll-transition-outgoing');
        scrollTransitionSnapshot?.remove();
        return;
      }
      revealReadiumFrames(container, navigator);
      const currentHandle = readiumFrames(navigator)[0];
      const incomingFrame = getLiveReadiumIframe(currentHandle);
      const incomingChanged = Boolean(incomingFrame && (
        !outgoingScrollFrame
        || incomingFrame !== outgoingScrollFrame
        || incomingFrame.contentDocument !== outgoingScrollDocument
      ));
      const incomingDocument = incomingFrame?.contentDocument;
      const incomingRenderable = Boolean(incomingDocument?.body && (
        incomingDocument.body.textContent?.trim()
        || incomingDocument.body.querySelector('img, picture, svg, canvas, video, object, embed')
      ));
      const incomingReady = Boolean(incomingChanged && incomingRenderable && currentHandle?.msg?.ready);
      remainingFrames -= 1;
      if ((!incomingReady || runtime.scrollBoundaryGestureLockedRef.current) && remainingFrames > 0) {
        window.requestAnimationFrame(handOff);
        return;
      }
      incomingFrame?.classList.add('zenith-scroll-transition-incoming');
      incomingFrame?.getAnimations().forEach((animation) => animation.cancel());
      incomingFrame?.style.setProperty('visibility', 'visible', 'important');
      incomingFrame?.style.setProperty('opacity', '1', 'important');
      window.requestAnimationFrame(() => {
        revealReadiumFrames(runtime.containerRef.current, navigator);
        window.requestAnimationFrame(() => {
          outgoingScrollFrame?.classList.remove('zenith-scroll-transition-outgoing');
          scrollTransitionSnapshot?.remove();
          revealReadiumFrames(runtime.containerRef.current, navigator);
          window.setTimeout(() => {
            incomingFrame?.classList.remove('zenith-scroll-transition-incoming');
            incomingFrame?.style.removeProperty('visibility');
            incomingFrame?.style.removeProperty('opacity');
            revealReadiumFrames(runtime.containerRef.current, navigator);
          }, 220);
        });
      });
    };
    window.requestAnimationFrame(handOff);
  };
}
