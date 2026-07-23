import { close, evaluate } from './reader-cdp.mjs';

const EPUB_QUERY = '魔女之旅 01.epub';
const EPUB_SEARCH = EPUB_QUERY.replace(/\.epub$/i, '');
const TXT_QUERY = '《傲世九重天》（精校版全本）作者：风凌天下.txt';
const TXT_SEARCH = TXT_QUERY.replace(/\.txt$/i, '');
const TXT_TURNS = Number.parseInt(process.env.ZENITH_TXT_TURNS || '48', 10);
const ENFORCE_PERFORMANCE = process.argv.includes('--enforce-performance');
const BASELINES = {
  epubPresentableMs: Number(process.env.ZENITH_EPUB_PRESENTABLE_BASELINE_MS || 91),
  txtPresentableMs: Number(process.env.ZENITH_TXT_PRESENTABLE_BASELINE_MS || 67.8),
  epubForwardCallbackMs: Number(process.env.ZENITH_EPUB_FORWARD_CALLBACK_P95_MS || 2.2),
  epubForwardFrameMs: Number(process.env.ZENITH_EPUB_FORWARD_FRAME_P95_MS || 4.5),
  epubBackwardCallbackMs: Number(process.env.ZENITH_EPUB_BACKWARD_CALLBACK_P95_MS || 1.5),
  epubBackwardFrameMs: Number(process.env.ZENITH_EPUB_BACKWARD_FRAME_P95_MS || 5.6),
  txtForwardCallbackMs: Number(process.env.ZENITH_TXT_FORWARD_CALLBACK_P95_MS || 5.7),
  txtForwardFrameMs: Number(process.env.ZENITH_TXT_FORWARD_FRAME_P95_MS || 9.6),
  txtBackwardCallbackMs: Number(process.env.ZENITH_TXT_BACKWARD_CALLBACK_P95_MS || 5.1),
  txtBackwardFrameMs: Number(process.env.ZENITH_TXT_BACKWARD_FRAME_P95_MS || 8.6),
  boundaryHitRate: Number(process.env.ZENITH_L1_HIT_RATE || 1),
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(expression, timeoutMs = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return Date.now() - started;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

async function waitForLoadMetric(name, timeoutMs = 10000) {
  return evaluate(`new Promise((resolve, reject) => {
    const name = ${JSON.stringify(name)};
    const existing = window.__ZENITH_READER_PERF__?.snapshot().metrics
      .find((metric) => metric.kind === 'load' && metric.name === name);
    if (existing) return resolve(existing);
    const onMetric = (event) => {
      if (event.detail?.kind !== 'load' || event.detail.name !== name) return;
      cleanup();
      resolve(event.detail);
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for load metric: ' + name));
    }, ${timeoutMs});
    function cleanup() {
      window.removeEventListener('zenith-reader-metric', onMetric);
      window.clearTimeout(timeout);
    }
    window.addEventListener('zenith-reader-metric', onMetric);
  })`);
}

const pageStateExpression = `(() => {
  const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
    .find((item) => getComputedStyle(item).visibility === 'visible');
  if (!frame?.contentDocument) return null;
  const root = frame.contentDocument.documentElement;
  const scroller = frame.contentDocument.scrollingElement;
  return {
    href: frame.dataset.originalHref || frame.src,
    columnCount: Number.parseInt(frame.contentWindow.getComputedStyle(root).columnCount, 10) || 1,
    scrollLeft: Math.round(scroller?.scrollLeft || 0),
    transform: scroller?.style.transform || '',
    text: frame.contentDocument.body?.innerText.slice(0, 80) || '',
  };
})()`;
const readerReadyExpression = `Boolean(
  document.querySelector("button[title=下一页]")
  && Array.from(document.querySelectorAll('.readium-container iframe')).some((frame) =>
    getComputedStyle(frame).visibility === 'visible'
    && (frame.contentDocument?.body?.innerText.trim()
      || Array.from(frame.contentDocument?.images || []).some((image) => image.complete && image.naturalWidth > 0)))
)`;

async function verifyInitialLayout() {
  const state = await evaluate(pageStateExpression);
  if (!state) throw new Error('No visible reader frame after loading');
  if (state.transform) throw new Error(`Reader started with a transformed scroller: ${state.transform}`);
  return state;
}

async function returnToLibrary() {
  if (await evaluate('Boolean(document.querySelector("button[title=下一页]"))')) {
    await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await sleep(260);
    await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await waitFor('!document.querySelector("button[title=下一页]")');
  }
  if (!await evaluate('Boolean(document.querySelector("input[placeholder*=搜索]"))')) {
    await evaluate(`(() => {
      const button = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.startsWith('所有书籍'));
      button?.click();
      return Boolean(button);
    })()`);
    await waitFor('Boolean(document.querySelector("input[placeholder*=搜索]"))');
  }
}

async function setSearch(value) {
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*=搜索]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(350);
}

async function openEpub() {
  await returnToLibrary();
  await setSearch(EPUB_SEARCH);
  await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
  const openedDirectly = await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) =>
      item.innerText.includes(${JSON.stringify(EPUB_SEARCH)}) && item.innerText.includes('EPUB'));
    book?.click();
    return Boolean(book);
  })()`);
  if (openedDirectly) {
    const presentable = await waitForLoadMetric('epub-bounded-presentable');
    await waitFor(readerReadyExpression, 10000);
    const loadMetrics = await evaluate(`window.__ZENITH_READER_PERF__.snapshot().metrics.filter((metric) => metric.kind === 'load')`);
    return { presentableMs: presentable.durationMs, loadMetrics, initialLayout: await verifyInitialLayout() };
  }
  throw new Error('Exact EPUB book not found');
}

async function openTxt() {
  await returnToLibrary();
  await setSearch(TXT_SEARCH);
  await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
  await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) =>
      item.innerText.includes(${JSON.stringify(TXT_SEARCH)}) && item.innerText.includes('TXT'));
    if (!book) throw new Error('Exact TXT book not found');
    book.click();
    return true;
  })()`);
  const presentable = await waitForLoadMetric('txt-bounded-presentable');
  await waitFor(readerReadyExpression, 10000);
  const loadMetrics = await evaluate(`window.__ZENITH_READER_PERF__.snapshot().metrics.filter((metric) => metric.kind === 'load')`);
  await ensureMinimalPaging();
  await openTocItem('第一章 若是有来生，伴君天下舞！');
  await waitFor(`Array.from(document.querySelectorAll('iframe')).some((frame) =>
    getComputedStyle(frame).visibility === 'visible'
    && frame.contentDocument?.body?.innerText.includes('第一章 若是有来生，伴君天下舞！'))`, 15000);
  await sleep(600);
  await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
  return { presentableMs: presentable.durationMs, loadMetrics, initialLayout: await verifyInitialLayout() };
}

async function ensureMinimalPaging() {
  if (!await evaluate('Boolean(document.querySelector("button[title=阅读设置]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await waitFor('Boolean(document.querySelector("button[title=阅读设置]"))');
  }
  await evaluate('document.querySelector("button[title=阅读设置]")?.click(); true');
  await sleep(250);
  await evaluate(`document.querySelector('button[title="直接重新加载文字"]')?.click(); true`);
  await sleep(900);
  await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
}

async function verifyLayoutRelocation() {
  const result = await evaluate(`(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const centerSentence = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const doc = frame?.contentDocument;
      if (!doc?.body) return '';
      const x = frame.contentWindow.innerWidth / 2;
      const y = frame.contentWindow.innerHeight / 2;
      const candidates = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
        .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
        .filter(({ element, rect }) => element.textContent?.trim() && rect.right > 0 && rect.left < frame.contentWindow.innerWidth && rect.bottom > 0 && rect.top < frame.contentWindow.innerHeight)
        .sort((a, b) => {
          const distance = (rect) => {
            const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
            const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
            return dx * dx + dy * dy;
          };
          return distance(a.rect) - distance(b.rect);
        });
      const text = candidates[0]?.element.textContent?.replace(/\\s+/g, ' ').trim() || '';
      return text.match(/^.*?[。！？!?]/)?.[0] || text.slice(0, 160);
    };
    const openSettings = async () => {
      if (!document.querySelector('button[title=阅读设置]')) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(250);
      }
      document.querySelector('button[title=阅读设置]')?.click();
      await sleep(200);
    };
    const pageAlignment = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const wnd = frame?.contentWindow;
      const doc = frame?.contentDocument;
      const scroller = doc?.scrollingElement;
      if (!wnd || !doc || !scroller) return null;
      const style = wnd.getComputedStyle(doc.documentElement);
      const columns = Number.parseInt(style.columnCount, 10) || 1;
      const gap = Number.parseFloat(style.columnGap) || 0;
      // scrollLeft advances by one physical column.  A two-page spread whose
      // final page is unpaired is valid at an odd column offset, so measuring
      // only full-spread width would report a false half-page error.
      const stride = (wnd.innerWidth + (columns > 1 ? gap : 0)) / columns;
      const remainder = stride > 0 ? Math.abs(scroller.scrollLeft) % stride : 0;
      return {
        columns,
        scrollLeft: scroller.scrollLeft,
        stride,
        alignmentError: Math.min(remainder, Math.max(0, stride - remainder)),
        transform: scroller.style.transform,
      };
    };
    const pageState = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const scroller = frame?.contentDocument?.scrollingElement;
      return frame
        ? [frame.dataset.originalHref || frame.src, Math.round(scroller?.scrollLeft || 0), centerSentence()].join('|')
        : '';
    };
    const before = centerSentence();
    await openSettings();
    document.querySelector('button[title=上下连续滚动加载]')?.click();
    await sleep(1200);
    const scrolling = centerSentence();
    const scrollingAnchorVisible = Array.from(document.querySelectorAll('.readium-container iframe'))
      .filter((frame) => getComputedStyle(frame).visibility === 'visible')
      .some((frame) => Array.from(frame.contentDocument?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || [])
        .some((element) => element.textContent?.replace(/\\s+/g, ' ').includes(before)
          && Array.from(element.getClientRects()).some((rect) => rect.bottom > 0 && rect.top < frame.contentWindow.innerHeight)));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
    await openSettings();
    document.querySelector('button[title=直接重新加载文字]')?.click();
    await sleep(1200);
    const restored = centerSentence();
    const restoredAnchorVisible = Array.from(document.querySelectorAll('.readium-container iframe'))
      .filter((frame) => getComputedStyle(frame).visibility === 'visible')
      .some((frame) => Array.from(frame.contentDocument?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || [])
        .some((element) => element.textContent?.replace(/\s+/g, ' ').includes(before)
          && Array.from(element.getClientRects()).some((rect) => rect.right > 0 && rect.left < frame.contentWindow.innerWidth && rect.bottom > 0 && rect.top < frame.contentWindow.innerHeight)));
    document.querySelector('button[title=单页]')?.click();
    await sleep(700);
    const singleAlignment = pageAlignment();
    document.querySelector('button[title=双页]')?.click();
    await sleep(700);
    const doubleAlignment = pageAlignment();
    const beforeSingleTurn = pageState();
    document.querySelector('button[title=单页]')?.click();
    await sleep(20);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await sleep(1000);
    const afterSingleTurn = pageState();
    const singleTurnAlignment = pageAlignment();
    const beforeDoubleTurn = afterSingleTurn;
    document.querySelector('button[title=双页]')?.click();
    await sleep(20);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await sleep(1000);
    const afterDoubleTurn = pageState();
    const doubleTurnAlignment = pageAlignment();
    const readerBox = document.querySelector('.readium-container')?.getBoundingClientRect();
    const contentAspect = readerBox ? readerBox.width / readerBox.height : 0;
    document.querySelector(contentAspect >= 1.25 ? 'button[title=双页]' : 'button[title=单页]')?.click();
    await sleep(700);
    const pageMode = Array.from(document.querySelectorAll('button[title=单页], button[title=双页]'))
      .find((button) => button.querySelector('span.absolute'))?.title || '';
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return {
      before, scrolling, scrollingAnchorVisible, restored, restoredAnchorVisible, pageMode, contentAspect,
      singleAlignment, doubleAlignment,
      switchTurns: {
        beforeSingleTurn, afterSingleTurn, singleTurnAlignment,
        beforeDoubleTurn, afterDoubleTurn, doubleTurnAlignment,
      },
    };
  })()`);
  if (!result.before || !result.scrollingAnchorVisible || !result.restoredAnchorVisible) {
    throw new Error(`Layout relocation failed: ${JSON.stringify(result)}`);
  }
  const expectedPageMode = result.contentAspect >= 1.25 ? '双页' : '单页';
  if (result.pageMode !== expectedPageMode) {
    throw new Error(`Automatic page mode failed: expected ${expectedPageMode}, got ${result.pageMode}`);
  }
  if (result.singleAlignment?.columns !== 1 || result.singleAlignment.alignmentError > 1 || result.singleAlignment.transform) {
    throw new Error(`Single-page alignment failed: ${JSON.stringify(result.singleAlignment)}`);
  }
  if (result.doubleAlignment?.columns !== 2 || result.doubleAlignment.alignmentError > 1 || result.doubleAlignment.transform) {
    throw new Error(`Double-page alignment failed: ${JSON.stringify(result.doubleAlignment)}`);
  }
  if (result.switchTurns.beforeSingleTurn === result.switchTurns.afterSingleTurn
    || result.switchTurns.singleTurnAlignment?.columns !== 1
    || result.switchTurns.singleTurnAlignment?.alignmentError > 1) {
    throw new Error(`Immediate turn after single-page switch failed: ${JSON.stringify(result.switchTurns)}`);
  }
  if (result.switchTurns.beforeDoubleTurn === result.switchTurns.afterDoubleTurn
    || result.switchTurns.doubleTurnAlignment?.columns !== 2
    || result.switchTurns.doubleTurnAlignment?.alignmentError > 1) {
    throw new Error(`Immediate turn after double-page switch failed: ${JSON.stringify(result.switchTurns)}`);
  }
  return result;
}

async function verifyMixedLayoutSwitching() {
  const result = await evaluate(`(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const frame = () => Array.from(document.querySelectorAll('.readium-container iframe'))
      .find((item) => getComputedStyle(item).visibility === 'visible');
    const centerSentence = () => {
      const current = frame();
      const doc = current?.contentDocument;
      if (!doc?.body) return '';
      const candidates = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre'))
        .flatMap((element) => Array.from(element.getClientRects()).map((rect) => ({ element, rect })))
        .filter(({ element, rect }) => element.textContent?.trim() && rect.right > 0 && rect.left < current.contentWindow.innerWidth && rect.bottom > 0 && rect.top < current.contentWindow.innerHeight)
        .sort((a, b) => {
          const x = current.contentWindow.innerWidth / 2;
          const y = current.contentWindow.innerHeight / 2;
          const distance = (rect) => Math.hypot((rect.left + rect.right) / 2 - x, (rect.top + rect.bottom) / 2 - y);
          return distance(a.rect) - distance(b.rect);
        });
      const text = candidates[0]?.element.textContent?.replace(/\s+/g, ' ').trim() || '';
      return text.match(/^.*?[。！？!?]/)?.[0] || text.slice(0, 160);
    };
    const anchorVisible = (text) => {
      const current = frame();
      return Boolean(current && Array.from(current.contentDocument?.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre') || [])
        .filter((element) => element.textContent?.replace(/\s+/g, ' ').includes(text))
        .some((element) => Array.from(element.getClientRects()).some((rect) => rect.right > 0 && rect.left < current.contentWindow.innerWidth && rect.bottom > 0 && rect.top < current.contentWindow.innerHeight)));
    };
    const geometry = () => {
      const current = frame();
      const wnd = current?.contentWindow;
      const doc = current?.contentDocument;
      const scroller = doc?.scrollingElement;
      if (!wnd || !doc || !scroller) return null;
      const style = wnd.getComputedStyle(doc.documentElement);
      const columns = Number.parseInt(style.columnCount, 10) || 1;
      const gap = Number.parseFloat(style.columnGap) || 0;
      const horizontal = scroller.scrollWidth > wnd.innerWidth * 1.25;
      const stride = horizontal ? (wnd.innerWidth + (columns > 1 ? gap : 0)) / columns : 0;
      const remainder = stride ? Math.abs(scroller.scrollLeft) % stride : 0;
      return { horizontal, columns, scrollLeft: scroller.scrollLeft, alignmentError: stride ? Math.min(remainder, stride - remainder) : 0, transform: scroller.style.transform };
    };
    const pageState = () => {
      const current = frame();
      const scroller = current?.contentDocument?.scrollingElement;
      return [current?.contentDocument?.title || '', Math.round(scroller?.scrollLeft || 0), Math.round(scroller?.scrollTop || 0), centerSentence()].join('|');
    };
    const activePageTab = () => Array.from(document.querySelectorAll('button[title="单页"], button[title="双页"]'))
      .find((button) => button.querySelector('span.absolute'))?.title || '';
    const waitForStateChange = async (before, equal) => {
      const started = performance.now();
      while ((pageState() === before) !== equal && performance.now() - started < 1800) await sleep(8);
      return pageState();
    };
    const choose = async (title, expectedColumns) => {
      const button = document.querySelector('button[title="' + title + '"]');
      if (!button || button.disabled) throw new Error('Unavailable layout option: ' + title);
      button.click();
      const expectsScroll = title === '上下连续滚动加载';
      const started = performance.now();
      let ready = false;
      while (performance.now() - started < 5000) {
        const current = frame();
        const doc = current?.contentDocument;
        const view = current?.contentWindow && doc
          ? current.contentWindow.getComputedStyle(doc.documentElement).getPropertyValue('--USER__view')
          : '';
        const currentGeometry = geometry();
        const viewReady = expectsScroll ? view === 'readium-scroll-on' : view === 'readium-paged-on';
        const columnsReady = expectedColumns === undefined || currentGeometry?.columns === expectedColumns;
        if (viewReady && columnsReady) {
          ready = true;
          break;
        }
        await sleep(12);
      }
      if (!ready) throw new Error('Layout did not settle: ' + title + ' / columns=' + expectedColumns + ' / actual=' + JSON.stringify(geometry()));
      await sleep(80);
      return geometry();
    };
    const turnPair = async () => {
      const before = pageState();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      const forward = await waitForStateChange(before, false);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      const returned = await waitForStateChange(before, true);
      return { before, forward, returned, moved: forward !== before, restored: returned === before, geometry: geometry() };
    };
    if (!document.querySelector('button[title=阅读设置]')) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await sleep(250);
    }
    document.querySelector('button[title=阅读设置]')?.click();
    await sleep(250);
    const anchor = centerSentence();
    for (const title of ['单页', '页面整体左右平滑切换', '双页', '上下连续滚动加载', '单页', '页面整体上下平滑切换', '双页', '直接重新加载文字']) {
      const button = document.querySelector('button[title="' + title + '"]');
      if (button && !button.disabled) button.click();
      await sleep(35);
    }
    await sleep(1400);
    const rapid = { anchorVisible: anchorVisible(anchor), geometry: geometry() };
    const stableFrame = frame();
    const stableState = pageState();
    let visibilityDrops = 0;
    const visibilityObserver = stableFrame && new MutationObserver(() => {
      if (getComputedStyle(stableFrame).visibility !== 'visible' || Number.parseFloat(getComputedStyle(stableFrame).opacity || '1') < 0.99) {
        visibilityDrops += 1;
      }
    });
    visibilityObserver?.observe(stableFrame, { attributes: true, attributeFilter: ['style', 'class'] });
    for (const title of ['页面整体左右平滑切换', '页面整体上下平滑切换', '直接重新加载文字']) {
      document.querySelector('button[title="' + title + '"]')?.click();
      await sleep(80);
    }
    visibilityObserver?.disconnect();
    const animationOnly = {
      sameFrame: frame() === stableFrame,
      samePosition: pageState() === stableState,
      visibilityDrops,
      anchorVisible: anchorVisible(anchor),
    };
    const stages = [];
    stages.push({ name: 'scroll', geometry: await choose('上下连续滚动加载', 1), anchorVisible: anchorVisible(anchor), pageTab: activePageTab() });
    document.querySelector('button[title="单页"]')?.click();
    await sleep(40);
    stages.push({ name: 'single-horizontal', geometry: await choose('页面整体左右平滑切换', 1), anchorVisible: anchorVisible(anchor) });
    const singleTurns = await turnPair();
    stages.push({ name: 'double-horizontal', geometry: await choose('双页', 2), anchorVisible: anchorVisible(anchor) });
    const doubleTurns = await turnPair();
    stages.push({ name: 'scroll-again', geometry: await choose('上下连续滚动加载', 1), anchorVisible: anchorVisible(anchor), pageTab: activePageTab() });
    await choose('页面整体上下平滑切换', 1);
    stages.push({ name: 'double-vertical', geometry: await choose('双页', 2), anchorVisible: anchorVisible(anchor), pageTab: activePageTab() });
    document.querySelector('button[title=阅读设置]')?.click();
    return { anchor, rapid, animationOnly, stages, singleTurns, doubleTurns };
  })()`);
  if (!result.anchor || !result.rapid.anchorVisible || result.rapid.geometry?.columns !== 2 || result.rapid.geometry?.alignmentError > 1) {
    throw new Error(`Rapid mixed layout switching lost position: ${JSON.stringify(result)}`);
  }
  if (!result.animationOnly.sameFrame || !result.animationOnly.samePosition || result.animationOnly.visibilityDrops !== 0 || !result.animationOnly.anchorVisible) {
    throw new Error(`Paged animation switching flashed or moved the page: ${JSON.stringify(result)}`);
  }
  if (result.stages.some((stage) => !stage.anchorVisible || stage.geometry?.alignmentError > 1 || stage.geometry?.transform)) {
    throw new Error(`Mixed layout switching lost its semantic anchor: ${JSON.stringify(result)}`);
  }
  if (result.stages.filter((stage) => stage.name.startsWith('scroll')).some((stage) => stage.pageTab !== '单页')) {
    throw new Error(`Continuous scrolling did not select the single-page tab: ${JSON.stringify(result)}`);
  }
  for (const [name, turns] of [['single', result.singleTurns], ['double', result.doubleTurns]]) {
    if (!turns.moved || !turns.restored || turns.geometry?.alignmentError > 1 || turns.geometry?.transform) {
      throw new Error(`${name} paging failed after mixed layout switching: ${JSON.stringify(result)}`);
    }
  }
  return result;
}

async function openTocItem(title) {
  if (!await evaluate('Boolean(document.querySelector("button[title=目录]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await waitFor('Boolean(document.querySelector("button[title=目录]"))');
  }
  await evaluate('document.querySelector("button[title=目录]")?.click(); true');
  await waitFor(`Boolean(document.querySelector(${JSON.stringify(`button[title="${title}"]`)}))`);
  await evaluate(`document.querySelector(${JSON.stringify(`button[title="${title}"]`)}).click(); true`);
  await sleep(900);
}

async function verifyEpubImages() {
  await openTocItem('illustration1.xhtml');
  await waitFor(`Array.from(document.querySelectorAll('iframe')).some((frame) =>
    getComputedStyle(frame).visibility === 'visible' && Array.from(frame.contentDocument?.images || []).some((image) => image.naturalWidth > 0))`);
  return evaluate(`Array.from(document.querySelectorAll('iframe'))
    .filter((frame) => getComputedStyle(frame).visibility === 'visible')
    .flatMap((frame) => Array.from(frame.contentDocument?.images || []).map((image) => ({
      src: image.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      complete: image.complete,
    })))`);
}

async function runTurns(count, intervalMs, direction = 1, timeoutPerTurnMs = 1200) {
  return evaluate(`(async () => {
    window.__ZENITH_READER_PERF__.clear();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const callbacks = () => window.__ZENITH_READER_PERF__.snapshot().metrics
      .filter((metric) => metric.kind === 'navigation' && metric.name === 'navigator-callback');
    const pageState = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const scroller = frame?.contentDocument?.scrollingElement;
      const content = frame?.contentDocument?.body?.innerText.replace(/\s+/g, ' ').trim().slice(0, 180) || '';
      const images = Array.from(frame?.contentDocument?.images || []).map((image) => image.currentSrc || image.src).join(',');
      return frame ? [frame.dataset.originalHref || frame.src, Math.round(scroller?.scrollLeft || 0), content, images].join('|') : '';
    };
    const successfulNavigationIds = [];
    let moved = 0;
    for (let index = 0; index < ${count}; index++) {
      const existingNavigationIds = new Set(callbacks().map((metric) => metric.detail?.navigationId));
      const beforePage = pageState();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(direction > 0 ? 'ArrowRight' : 'ArrowLeft')}, bubbles: true }));
      const started = performance.now();
      let successfulCallback;
      while (!successfulCallback && performance.now() - started < ${timeoutPerTurnMs}) {
        successfulCallback = callbacks().find((metric) => metric.detail?.ok === true
          && typeof metric.detail?.navigationId === 'number'
          && !existingNavigationIds.has(metric.detail.navigationId)
          && !successfulNavigationIds.includes(metric.detail.navigationId));
        if (!successfulCallback) await sleep(4);
      }
      if (successfulCallback) successfulNavigationIds.push(successfulCallback.detail.navigationId);
      const moveStarted = performance.now();
      while (pageState() === beforePage && performance.now() - moveStarted < ${timeoutPerTurnMs}) await sleep(4);
      if (pageState() !== beforePage) moved++;
      await sleep(${intervalMs});
    }
    const settleStarted = performance.now();
    while (performance.now() - settleStarted < 6000) {
      const inputFrameIds = new Set(window.__ZENITH_READER_PERF__.snapshot().metrics
        .filter((metric) => metric.kind === 'navigation' && metric.name === 'input-to-next-frame')
        .map((metric) => metric.detail?.navigationId));
      if (successfulNavigationIds.every((navigationId) => inputFrameIds.has(navigationId))) break;
      await sleep(20);
    }
    await sleep(100);
    const completeSnapshot = window.__ZENITH_READER_PERF__.snapshot();
    const successfulIdSet = new Set(successfulNavigationIds);
    const correlatedMetricNames = new Set(['navigator-callback', 'input-to-next-frame', 'iframe-turn', 'locator-lookup']);
    const failedAttempts = completeSnapshot.metrics.filter((metric) => metric.kind === 'navigation'
      && metric.name === 'navigator-callback'
      && metric.detail?.ok !== true);
    return {
      requested: ${count},
      completed: successfulNavigationIds.length,
      moved,
      successfulNavigationIds,
      failedAttempts,
      snapshot: {
        ...completeSnapshot,
        metrics: completeSnapshot.metrics.filter((metric) => metric.kind !== 'navigation'
          || !correlatedMetricNames.has(metric.name)
          || successfulIdSet.has(metric.detail?.navigationId)),
      },
      visible: Array.from(document.querySelectorAll('iframe'))
        .filter((frame) => getComputedStyle(frame).visibility === 'visible')
        .map((frame) => ({
          title: frame.contentDocument?.title,
          text: frame.contentDocument?.body?.innerText.slice(0, 80),
          transform: frame.contentDocument?.documentElement?.style.transform || '',
          scrollLeft: frame.contentDocument?.scrollingElement?.scrollLeft || 0,
        })),
    };
  })()`);
}

async function runWheelTurns(count, intervalMs, direction = 1) {
  return evaluate(`(async () => {
    window.__ZENITH_READER_PERF__.clear();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const pageState = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const scroller = frame?.contentDocument?.scrollingElement;
      const content = frame?.contentDocument?.body?.innerText.replace(/\s+/g, ' ').trim().slice(0, 180) || '';
      const images = Array.from(frame?.contentDocument?.images || []).map((image) => image.currentSrc || image.src).join(',');
      return frame ? [frame.dataset.originalHref || frame.src, Math.round(scroller?.scrollLeft || 0), content, images].join('|') : '';
    };
    const initialPage = pageState();
    for (let index = 0; index < ${count}; index++) {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      (frame?.contentWindow || window).dispatchEvent(new WheelEvent('wheel', {
        deltaY: ${direction > 0 ? 100 : -100},
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        bubbles: true,
        cancelable: true,
      }));
      await sleep(${intervalMs});
    }
    const settleStarted = performance.now();
    let stableSince = performance.now();
    let lastCount = -1;
    while (performance.now() - settleStarted < 6000) {
      const count = window.__ZENITH_READER_PERF__.snapshot().metrics
        .filter((metric) => metric.kind === 'navigation' && metric.name === 'navigator-callback').length;
      if (count !== lastCount) {
        lastCount = count;
        stableSince = performance.now();
      } else if (performance.now() - stableSince > 300) {
        break;
      }
      await sleep(20);
    }
    const snapshot = window.__ZENITH_READER_PERF__.snapshot();
    const completed = snapshot.metrics
      .filter((metric) => metric.kind === 'navigation' && metric.name === 'navigator-callback').length;
    return {
      requested: ${count},
      completed,
      moved: pageState() !== initialPage ? completed : 0,
      snapshot,
      visible: Array.from(document.querySelectorAll('iframe'))
        .filter((frame) => getComputedStyle(frame).visibility === 'visible')
        .map((frame) => ({
          title: frame.contentDocument?.title,
          text: frame.contentDocument?.body?.innerText.slice(0, 80),
          transform: frame.contentDocument?.documentElement?.style.transform || '',
          scrollLeft: frame.contentDocument?.scrollingElement?.scrollLeft || 0,
        })),
    };
  })()`);
}

function summarizeTurns(result) {
  const metrics = result.snapshot.metrics.filter((metric) => metric.kind === 'navigation');
  const callback = metrics.filter((metric) => metric.name === 'navigator-callback').map((metric) => metric.durationMs);
  const nextFrame = metrics.filter((metric) => metric.name === 'input-to-next-frame').map((metric) => metric.durationMs);
  const iframeTurns = metrics.filter((metric) => metric.name === 'iframe-turn').map((metric) => metric.durationMs);
  const locatorLookups = metrics.filter((metric) => metric.name === 'locator-lookup').map((metric) => metric.durationMs);
  const callbackMetrics = metrics.filter((metric) => metric.name === 'navigator-callback');
  const warm = callbackMetrics.filter((metric) => metric.hit).map((metric) => metric.durationMs);
  const cold = callbackMetrics.filter((metric) => !metric.hit).map((metric) => metric.durationMs);
  const boundaryMetrics = callbackMetrics.filter((metric) => metric.detail?.crossesResource === true);
  const boundaryHits = boundaryMetrics.filter((metric) => metric.hit);
  const transportCounts = {
    direct: callbackMetrics.filter((metric) => metric.detail?.transport === 'direct').length,
    postMessage: callbackMetrics.filter((metric) => metric.detail?.transport === 'postMessage').length,
  };
  return {
    requested: result.requested,
    completed: result.completed,
    completionRate: result.requested ? result.completed / result.requested : 0,
    moved: result.moved,
    successfulNavigationIds: result.successfulNavigationIds,
    failedAttempts: result.failedAttempts,
    callback: distribution(callback),
    warmCallback: distribution(warm),
    coldCallback: distribution(cold),
    inputToFrame: distribution(nextFrame),
    iframeTurn: distribution(iframeTurns),
    locatorLookup: distribution(locatorLookups),
    transportCounts,
    warmHitRate: callback.length ? warm.length / callback.length : 0,
    l1: {
      all: {
        callback: distribution(callback),
        hitRate: callbackMetrics.length ? warm.length / callbackMetrics.length : 0,
      },
      boundary: {
        callback: distribution(boundaryMetrics.map((metric) => metric.durationMs)),
        hitRate: boundaryMetrics.length ? boundaryHits.length / boundaryMetrics.length : null,
        samples: boundaryMetrics.map((metric) => ({ durationMs: metric.durationMs, hit: metric.hit, detail: metric.detail })),
      },
    },
    visible: result.visible,
  };
}

function requireTurns(label, result, minimumCompleted) {
  if (result.completed < minimumCompleted || result.moved === 0) {
    throw new Error(`${label} failed: completed ${result.completed}/${result.requested}, moved ${result.moved}`);
  }
  return summarizeTurns(result);
}

function requireAllTurns(label, result) {
  if (result.completed !== result.requested || result.moved !== result.requested) {
    throw new Error(`${label} failed: completed ${result.completed}/${result.requested}, moved ${result.moved}/${result.requested}`);
  }
  const summary = summarizeTurns(result);
  const successfulIds = new Set(result.successfulNavigationIds);
  const correlatedCounts = result.snapshot.metrics
    .filter((metric) => metric.kind === 'navigation' && ['navigator-callback', 'input-to-next-frame'].includes(metric.name))
    .reduce((counts, metric) => {
      const navigationId = metric.detail?.navigationId;
      if (!successfulIds.has(navigationId)) return counts;
      const byName = counts[metric.name] || new Map();
      byName.set(navigationId, (byName.get(navigationId) || 0) + 1);
      counts[metric.name] = byName;
      return counts;
    }, {});
  const hasExactlyOnePerId = (name) => successfulIds.size === result.requested
    && successfulIds.size === (correlatedCounts[name]?.size || 0)
    && Array.from(correlatedCounts[name]?.values() || []).every((count) => count === 1);
  if (!hasExactlyOnePerId('navigator-callback') || !hasExactlyOnePerId('input-to-next-frame')) {
    throw new Error(`${label} metrics incomplete: callback ${summary.callback.count}, input-to-frame ${summary.inputToFrame.count}, expected ${result.requested}`);
  }
  return summary;
}

function distribution(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const percentile = (ratio) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] || 0;
  return { count: sorted.length, p50: percentile(0.5), p95: percentile(0.95), max: sorted.at(-1) || 0 };
}

function performanceComparison(value, baseline, lowerIsBetter = true) {
  const pass = lowerIsBetter ? value <= baseline : value >= baseline;
  return { value, baseline, pass, ratio: baseline ? value / baseline : null };
}

function addBaselineReport(report) {
  const scenarios = {
    epubForward: [report.epub?.forwardTurns, BASELINES.epubForwardCallbackMs, BASELINES.epubForwardFrameMs],
    epubBackward: [report.epub?.backwardTurns, BASELINES.epubBackwardCallbackMs, BASELINES.epubBackwardFrameMs],
    txtForward: [report.txt?.forwardTurns, BASELINES.txtForwardCallbackMs, BASELINES.txtForwardFrameMs],
    txtBackward: [report.txt?.backwardTurns, BASELINES.txtBackwardCallbackMs, BASELINES.txtBackwardFrameMs],
  };
  report.againstBaseline = {
    epubPresentable: report.epub ? performanceComparison(report.epub.presentableMs, BASELINES.epubPresentableMs) : null,
    txtPresentable: report.txt ? performanceComparison(report.txt.presentableMs, BASELINES.txtPresentableMs) : null,
    ...Object.fromEntries(Object.entries(scenarios).map(([name, [summary, callbackBaseline, frameBaseline]]) => [name, summary ? {
      callbackP95: performanceComparison(summary.callback.p95, callbackBaseline),
      inputToFrameP95: performanceComparison(summary.inputToFrame.p95, frameBaseline),
      boundaryHitRate: summary.l1.boundary.hitRate === null
        ? null
        : performanceComparison(summary.l1.boundary.hitRate, BASELINES.boundaryHitRate, false),
      boundarySamples: summary.l1.boundary.callback.count,
    } : null])),
  };
  if (ENFORCE_PERFORMANCE) {
    const failed = Object.entries(report.againstBaseline).flatMap(([name, result]) => {
      if (!result) return [];
      if ('pass' in result) return result.pass ? [] : [name];
      const comparisons = ['callbackP95', 'inputToFrameP95', 'boundaryHitRate']
        .filter((key) => result[key] && !result[key].pass)
        .map((key) => `${name}.${key}`);
      if (name.startsWith('epub') && result.boundarySamples < 1) comparisons.push(`${name}.boundarySamples`);
      return comparisons;
    });
    if (failed.length) throw new Error(`Performance baseline failed: ${failed.join(', ')}`);
  }
}

try {
  const report = {
    generatedAt: new Date().toISOString(),
  };
  if (!process.argv.includes('--txt-only')) {
    const { presentableMs, loadMetrics, initialLayout } = await openEpub();
    const images = await verifyEpubImages();
    await ensureMinimalPaging();
    await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
    await openTocItem('chapter1.xhtml');
    // TOC navigation can reuse an already prepared frame, so absence of a new
    // layout-prepare metric is a valid warm-cache result.
    await sleep(600);
    const relocation = await verifyLayoutRelocation();
    const mixedLayoutSwitching = await verifyMixedLayoutSwitching();
    // The switching test intentionally ends on a 130 ms slide animation.
    // Restore the minimal path before comparing turn latency with the minimal
    // animation performance baselines.
    await ensureMinimalPaging();
    await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
    report.epub = {
      path: EPUB_QUERY,
      presentableMs,
      loadMetrics,
      initialLayout,
      images,
      relocation,
      mixedLayoutSwitching,
      forwardTurns: requireAllTurns('EPUB forward', await runTurns(36, 20, 1)),
      backwardTurns: requireAllTurns('EPUB backward', await runTurns(24, 20, -1)),
      continuousWheel: requireTurns('EPUB continuous wheel', await runWheelTurns(24, 45, 1), 4),
    };
  }
  if (!process.argv.includes('--epub-only')) {
    const { presentableMs, loadMetrics: txtLoadMetrics, initialLayout } = await openTxt();
    const relocation = await verifyLayoutRelocation();
    const mixedLayoutSwitching = await verifyMixedLayoutSwitching();
    await ensureMinimalPaging();
    await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
    report.txt = {
      path: TXT_QUERY,
      presentableMs,
      loadMetrics: txtLoadMetrics,
      initialLayout,
      relocation,
      mixedLayoutSwitching,
      forwardTurns: requireAllTurns('TXT forward', await runTurns(TXT_TURNS, 20, 1)),
      backwardTurns: requireAllTurns('TXT backward', await runTurns(Math.min(24, TXT_TURNS), 20, -1)),
      continuousWheel: requireTurns('TXT continuous wheel', await runWheelTurns(24, 45, 1), 4),
    };
  }
  addBaselineReport(report);
  const output = process.argv.includes('--summary') ? summarizeReport(report) : report;
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} finally {
  await close();
}

function summarizeReport(report) {
  const turns = (value) => value && ({
    completed: `${value.completed}/${value.requested}`,
    moved: `${value.moved}/${value.requested}`,
    callbackP95: value.callback.p95,
    inputToFrameP95: value.inputToFrame.p95,
    l1HitRate: value.l1.all.hitRate,
    boundaryHitRate: value.l1.boundary.hitRate,
    boundarySamples: value.l1.boundary.callback.count,
  });
  return {
    generatedAt: report.generatedAt,
    epub: report.epub && {
      presentableMs: report.epub.presentableMs,
      image: report.epub.images[0],
      relocation: report.epub.relocation,
      mixedLayoutSwitching: report.epub.mixedLayoutSwitching,
      forward: turns(report.epub.forwardTurns),
      backward: turns(report.epub.backwardTurns),
      continuousWheel: turns(report.epub.continuousWheel),
    },
    txt: report.txt && {
      presentableMs: report.txt.presentableMs,
      relocation: report.txt.relocation,
      mixedLayoutSwitching: report.txt.mixedLayoutSwitching,
      forward: turns(report.txt.forwardTurns),
      backward: turns(report.txt.backwardTurns),
      continuousWheel: turns(report.txt.continuousWheel),
    },
    againstBaseline: report.againstBaseline,
  };
}
