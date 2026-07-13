import { close, evaluate } from './reader-cdp.mjs';

const EPUB_QUERY = '魔女之旅 01.epub';
const EPUB_SEARCH = EPUB_QUERY.replace(/\.epub$/i, '');
const TXT_QUERY = '《傲世九重天》（精校版全本）作者：风凌天下.txt';
const TXT_SEARCH = TXT_QUERY.replace(/\.txt$/i, '');
const TXT_TURNS = Number.parseInt(process.env.ZENITH_TXT_TURNS || '48', 10);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(expression, timeoutMs = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return Date.now() - started;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
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
  const started = Date.now();
  const openedDirectly = await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) =>
      item.innerText.trimStart().startsWith('魔女之旅 01') && !/^48\\b/.test(item.innerText));
    book?.click();
    return Boolean(book);
  })()`);
  if (openedDirectly) {
    await waitFor(readerReadyExpression, 10000);
    return { loadMs: Date.now() - started, initialLayout: await verifyInitialLayout() };
  }
  await evaluate(`(() => {
    const card = Array.from(document.querySelectorAll('button')).find((item) =>
      item.innerText.includes('魔女之旅') && Number.parseInt(item.innerText, 10) === 48);
    if (!card) throw new Error('魔女之旅 series card not found');
    card.click();
    return true;
  })()`);
  await waitFor(`Array.from(document.querySelectorAll('button')).some((item) => Number.parseInt(item.innerText, 10) === 25 && item.innerText.includes('魔女之旅 01'))`);
  await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) => Number.parseInt(item.innerText, 10) === 25 && item.innerText.includes('魔女之旅 01'));
    if (!book) throw new Error('Exact EPUB volume not found');
    book.click();
    return true;
  })()`);
  await waitFor(readerReadyExpression, 10000);
  return { loadMs: Date.now() - started, initialLayout: await verifyInitialLayout() };
}

async function openTxt() {
  await returnToLibrary();
  await setSearch(TXT_SEARCH);
  await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
  const started = Date.now();
  await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) =>
      item.innerText.includes(${JSON.stringify(TXT_SEARCH)}) && item.innerText.includes('TXT'));
    if (!book) throw new Error('Exact TXT book not found');
    book.click();
    return true;
  })()`);
  await waitFor(readerReadyExpression, 10000);
  const loadMs = Date.now() - started;
  await waitFor(`window.__ZENITH_READER_PERF__.snapshot().metrics.some((metric) => metric.kind === 'load' && metric.name === 'txt-navigator-load')`, 10000);
  const loadMetrics = await evaluate(`window.__ZENITH_READER_PERF__.snapshot().metrics.filter((metric) => metric.kind === 'load')`);
  await ensureMinimalPaging();
  await openTocItem('第一章 若是有来生，伴君天下舞！');
  await waitFor(`Array.from(document.querySelectorAll('iframe')).some((frame) =>
    getComputedStyle(frame).visibility === 'visible'
    && frame.contentDocument?.body?.innerText.includes('第一章 若是有来生，伴君天下舞！'))`, 15000);
  await sleep(600);
  await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
  return { loadMs, loadMetrics, initialLayout: await verifyInitialLayout() };
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
      const rootStyle = frame.contentWindow.getComputedStyle(doc.documentElement);
      const columns = Number.parseInt(rootStyle.columnCount, 10) || 1;
      const x = frame.contentWindow.innerWidth / (columns === 2 ? 4 : 2);
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
    const pageMode = Array.from(document.querySelectorAll('button[title=单页], button[title=双页]'))
      .find((button) => button.querySelector('span.absolute'))?.title || '';
    const readerBox = document.querySelector('.readium-container')?.getBoundingClientRect();
    const contentAspect = readerBox ? readerBox.width / readerBox.height : 0;
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return { before, scrolling, scrollingAnchorVisible, restored, pageMode, contentAspect };
  })()`);
  if (!result.before || !result.scrollingAnchorVisible || result.before !== result.restored) {
    throw new Error(`Layout relocation failed: ${JSON.stringify(result)}`);
  }
  const expectedPageMode = result.contentAspect >= 1.25 ? '双页' : '单页';
  if (result.pageMode !== expectedPageMode) {
    throw new Error(`Automatic page mode failed: expected ${expectedPageMode}, got ${result.pageMode}`);
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
    const navigationCount = () => window.__ZENITH_READER_PERF__.snapshot().metrics
      .filter((metric) => metric.kind === 'navigation' && metric.name === 'navigator-callback').length;
    const pageState = () => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const scroller = frame?.contentDocument?.scrollingElement;
      return frame ? [frame.dataset.originalHref || frame.src, Math.round(scroller?.scrollLeft || 0)].join('|') : '';
    };
    let completed = 0;
    let moved = 0;
    for (let index = 0; index < ${count}; index++) {
      const before = navigationCount();
      const beforePage = pageState();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(direction > 0 ? 'ArrowRight' : 'ArrowLeft')}, bubbles: true }));
      const started = performance.now();
      while (navigationCount() <= before && performance.now() - started < ${timeoutPerTurnMs}) await sleep(4);
      if (navigationCount() > before) completed++;
      const moveStarted = performance.now();
      while (pageState() === beforePage && performance.now() - moveStarted < ${timeoutPerTurnMs}) await sleep(4);
      if (pageState() !== beforePage) moved++;
      await sleep(${intervalMs});
    }
    await sleep(500);
    return {
      requested: ${count},
      completed,
      moved,
      snapshot: window.__ZENITH_READER_PERF__.snapshot(),
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
      return frame ? [frame.dataset.originalHref || frame.src, Math.round(scroller?.scrollLeft || 0)].join('|') : '';
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
  const callbackMetrics = metrics.filter((metric) => metric.name === 'navigator-callback');
  const warm = callbackMetrics.filter((metric) => metric.hit).map((metric) => metric.durationMs);
  const cold = callbackMetrics.filter((metric) => !metric.hit).map((metric) => metric.durationMs);
  return {
    requested: result.requested,
    completed: result.completed,
    completionRate: result.requested ? result.completed / result.requested : 0,
    moved: result.moved,
    callback: distribution(callback),
    warmCallback: distribution(warm),
    coldCallback: distribution(cold),
    inputToFrame: distribution(nextFrame),
    warmHitRate: callback.length ? warm.length / callback.length : 0,
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
  if (summary.callback.count !== result.requested || summary.inputToFrame.count !== result.requested) {
    throw new Error(`${label} metrics incomplete: callback ${summary.callback.count}, input-to-frame ${summary.inputToFrame.count}, expected ${result.requested}`);
  }
  return summary;
}

function distribution(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const percentile = (ratio) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] || 0;
  return { count: sorted.length, p50: percentile(0.5), p95: percentile(0.95), max: sorted.at(-1) || 0 };
}

try {
  const report = {
    generatedAt: new Date().toISOString(),
  };
  if (!process.argv.includes('--txt-only')) {
    const { loadMs: epubLoadMs, initialLayout } = await openEpub();
    const images = await verifyEpubImages();
    await ensureMinimalPaging();
    await evaluate('window.__ZENITH_READER_PERF__.clear(); true');
    await openTocItem('chapter1.xhtml');
    // TOC navigation can reuse an already prepared frame, so absence of a new
    // layout-prepare metric is a valid warm-cache result.
    await sleep(600);
    report.epub = {
      path: EPUB_QUERY,
      loadMs: epubLoadMs,
      initialLayout,
      images,
      relocation: await verifyLayoutRelocation(),
      forwardTurns: requireAllTurns('EPUB forward', await runTurns(36, 20, 1)),
      backwardTurns: requireAllTurns('EPUB backward', await runTurns(24, 20, -1)),
      continuousWheel: requireTurns('EPUB continuous wheel', await runWheelTurns(24, 45, 1), 4),
    };
  }
  if (!process.argv.includes('--epub-only')) {
    const { loadMs: txtLoadMs, loadMetrics: txtLoadMetrics, initialLayout } = await openTxt();
    report.txt = {
      path: TXT_QUERY,
      loadMs: txtLoadMs,
      loadMetrics: txtLoadMetrics,
      initialLayout,
      relocation: await verifyLayoutRelocation(),
      forwardTurns: requireAllTurns('TXT forward', await runTurns(TXT_TURNS, 20, 1)),
      backwardTurns: requireAllTurns('TXT backward', await runTurns(24, 20, -1)),
      continuousWheel: requireTurns('TXT continuous wheel', await runWheelTurns(24, 45, 1), 4),
    };
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  await close();
}
