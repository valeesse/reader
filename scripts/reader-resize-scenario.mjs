import { close, command, evaluate } from './reader-cdp.mjs';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForSample(predicate, timeout = 1600) {
  const started = performance.now();
  let sample = null;
  while (performance.now() - started < timeout) {
    sample = await evaluate(sampleExpression);
    if (sample && predicate(sample)) return { sample, elapsed: Math.round(performance.now() - started) };
    await sleep(16);
  }
  throw new Error(`Resize did not settle within ${timeout}ms: ${JSON.stringify(sample)}`);
}

const sampleExpression = `(() => {
  const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
    .find((item) => getComputedStyle(item).visibility === 'visible');
  const doc = frame?.contentDocument;
  const wnd = frame?.contentWindow;
  const scroller = doc?.scrollingElement;
  if (!doc?.body || !wnd || !scroller) return null;
  const targetX = wnd.innerWidth / 2;
  const targetY = wnd.innerHeight / 2;
  const candidates = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
    .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
    .filter(({ element, rect }) => element.textContent?.trim()
      && rect.right > 0 && rect.left < wnd.innerWidth && rect.bottom > 0 && rect.top < wnd.innerHeight)
    .sort((a, b) => Math.hypot((a.rect.left + a.rect.right) / 2 - targetX, (a.rect.top + a.rect.bottom) / 2 - targetY)
      - Math.hypot((b.rect.left + b.rect.right) / 2 - targetX, (b.rect.top + b.rect.bottom) / 2 - targetY));
  const candidate = candidates[0];
  const probeX = candidate ? Math.max(candidate.rect.left + 1, Math.min(targetX, candidate.rect.right - 1)) : targetX;
  const probeY = candidate ? Math.max(candidate.rect.top + 1, Math.min(targetY, candidate.rect.bottom - 1)) : targetY;
  const caret = doc.caretPositionFromPoint?.(probeX, probeY);
  const caretText = caret?.offsetNode?.nodeType === Node.TEXT_NODE ? caret.offsetNode.data : '';
  let start = Math.min(caret?.offset || 0, caretText.length);
  let end = start;
  while (start > 0 && (caret?.offset || 0) - start < 100 && !/[。！？!?\\n]/.test(caretText[start - 1])) start -= 1;
  while (end < caretText.length && end - (caret?.offset || 0) < 100) {
    const character = caretText[end++];
    if (/[。！？!?\\n]/.test(character)) break;
  }
  const caretAnchor = caretText.slice(start, end).replace(/\\s+/g, ' ').trim();
  const visibleAnchors = candidates.slice(0, 16).map(({ element, rect }) => {
    const x = Math.max(rect.left + 1, Math.min(targetX, rect.right - 1));
    const y = Math.max(rect.top + 1, Math.min(targetY, rect.bottom - 1));
    const position = doc.caretPositionFromPoint?.(x, y);
    const value = position?.offsetNode?.nodeType === Node.TEXT_NODE ? position.offsetNode.data : '';
    const offset = Math.min(position?.offset || 0, value.length);
    return (value.slice(Math.max(0, offset - 36), Math.min(value.length, offset + 36))
      || element.textContent || '').replace(/\\s+/g, ' ').trim();
  }).filter(Boolean);
  const columnCount = Number.parseInt(wnd.getComputedStyle(doc.documentElement).columnCount, 10) || 1;
  const columnGap = Number.parseFloat(wnd.getComputedStyle(doc.documentElement).columnGap) || 0;
  const horizontal = scroller.scrollWidth > wnd.innerWidth * 1.1;
  const stride = horizontal ? (wnd.innerWidth + (columnCount > 1 ? columnGap : 0)) / columnCount : wnd.innerHeight;
  const extent = horizontal ? scroller.scrollWidth : scroller.scrollHeight;
  const expectedChapterTotal = Math.max(1, Math.ceil((extent - 1) / stride));
  const pageCounter = document.querySelector('[data-reader-page-counter]')?.textContent?.trim() || '';
  const pageCounterTotal = Number(pageCounter.match(/\\/\\s*(\\d+)\\s*·/)?.[1] || 0);
  return {
    anchor: caretAnchor || (candidate?.element?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120),
    visibleAnchors,
    containerWidth: document.querySelector('.readium-container')?.clientWidth || 0,
    innerWidth: wnd.innerWidth,
    innerHeight: wnd.innerHeight,
    scrollLeft: scroller.scrollLeft,
    scrollTop: scroller.scrollTop,
    columnCount,
    columnGap,
    expectedChapterTotal,
    pageCounter,
    pageCounterTotal,
  };
})()`;

function anchorVisibleExpression(anchor) {
  return `(() => {
    const anchor = ${JSON.stringify(anchor)};
    const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
      .find((item) => getComputedStyle(item).visibility === 'visible');
    if (!anchor || !frame?.contentDocument) return false;
    return Array.from(frame.contentDocument.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
      .filter((element) => element.textContent?.replace(/\\s+/g, ' ').includes(anchor))
      .some((element) => Array.from(element.getClientRects()).some((rect) =>
        rect.right > 0 && rect.left < frame.contentWindow.innerWidth
        && rect.bottom > 0 && rect.top < frame.contentWindow.innerHeight));
  })()`;
}

function anyAnchorVisibleExpression(anchors) {
  return `(() => {
    const anchors = ${JSON.stringify(anchors)};
    const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
      .find((item) => getComputedStyle(item).visibility === 'visible');
    if (!anchors.length || !frame?.contentDocument) return false;
    return Array.from(frame.contentDocument.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
      .filter((element) => anchors.some((anchor) => element.textContent?.replace(/\\s+/g, ' ').includes(anchor)))
      .some((element) => Array.from(element.getClientRects()).some((rect) =>
        rect.right > 0 && rect.left < frame.contentWindow.innerWidth
        && rect.bottom > 0 && rect.top < frame.contentWindow.innerHeight));
  })()`;
}

try {
  const before = await evaluate(sampleExpression);
  if (!before?.anchor) throw new Error('Reader content is not ready for resize verification');
  const { windowId, bounds } = await command('Browser.getWindowForTarget');
  const resizedBounds = {
    // Growth is the critical regression: Readium assigns the container an
    // inline pixel width, so observing that element used to miss expansion.
    width: Math.round(bounds.width * 1.35),
    height: Math.round(bounds.height * 1.05),
  };
  await command('Browser.setWindowBounds', { windowId, bounds: resizedBounds });
  const expandedGeometry = await waitForSample((sample) => sample.innerWidth !== before.innerWidth
    && sample.containerWidth !== before.containerWidth);
  const expandedResult = await waitForSample((sample) => sample.pageCounterTotal === sample.expectedChapterTotal);
  const resized = expandedResult.sample;
  const anchorVisibleAfterResize = await evaluate(anchorVisibleExpression(before.anchor));
  const contractedBounds = {
    width: Math.max(760, Math.round(bounds.width * 0.78)),
    height: Math.max(600, Math.round(bounds.height * 0.9)),
  };
  await command('Browser.setWindowBounds', { windowId, bounds: contractedBounds });
  const contractedGeometry = await waitForSample((sample) => sample.innerWidth !== resized.innerWidth);
  const contractedResult = await waitForSample((sample) => sample.pageCounterTotal === sample.expectedChapterTotal);
  const contracted = contractedResult.sample;
  // Each gesture preserves the text at the centre of the immediately previous
  // viewport. A wider two-page spread can keep the original anchor visible
  // while moving its centre; requiring that older anchor in a later one-page
  // viewport is therefore a false failure.
  const anchorVisibleAfterContract = await evaluate(anyAnchorVisibleExpression(resized.visibleAnchors));
  await command('Browser.setWindowBounds', {
    windowId,
    bounds: { width: bounds.width, height: bounds.height },
  });
  const restoredGeometry = await waitForSample((sample) => Math.abs(sample.innerWidth - before.innerWidth) <= 2);
  const restoredResult = await waitForSample((sample) => sample.pageCounterTotal === sample.expectedChapterTotal);
  const restored = restoredResult.sample;
  const anchorVisibleAfterRestore = await evaluate(anchorVisibleExpression(before.anchor));
  const report = {
    before,
    resized,
    contracted,
    restored,
    timings: {
      expandGeometryMs: expandedGeometry.elapsed,
      expandSettledMs: expandedGeometry.elapsed + expandedResult.elapsed,
      contractGeometryMs: contractedGeometry.elapsed,
      contractSettledMs: contractedGeometry.elapsed + contractedResult.elapsed,
      restoreGeometryMs: restoredGeometry.elapsed,
      restoreSettledMs: restoredGeometry.elapsed + restoredResult.elapsed,
    },
    anchorVisibleAfterResize,
    anchorVisibleAfterContract,
    anchorVisibleAfterRestore,
  };
  if (!resized || resized.innerWidth === before.innerWidth || resized.containerWidth === before.containerWidth) {
    throw new Error(`Reader iframe retained its old geometry: ${JSON.stringify(report)}`);
  }
  for (const [stage, sample] of Object.entries({ resized, contracted, restored })) {
    if (sample.columnCount !== before.columnCount) {
      throw new Error(`Reader changed page mode during ${stage}: ${JSON.stringify(report)}`);
    }
    if (before.columnCount > 1 && sample.columnGap < 1) {
      throw new Error(`Reader lost its spread gap during ${stage}: ${JSON.stringify(report)}`);
    }
  }
  if (!anchorVisibleAfterResize || !anchorVisibleAfterContract || !anchorVisibleAfterRestore) {
    throw new Error(`Reader lost its semantic anchor while resizing: ${JSON.stringify(report)}`);
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  await close();
}
