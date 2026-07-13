import { close, evaluate } from './reader-cdp.mjs';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const expected = [
  '封面',
  '标题',
  '制作信息',
  '制作者与Logo',
  '简介',
  '彩页1',
  '彩页2',
  '目录彩页',
  'contents',
  '标题 作者 插画',
  '第一章　魔法师之国',
];

async function waitFor(expression, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function openTargetBook() {
  if (await evaluate('Boolean(document.querySelector("button[title=下一页]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await sleep(250);
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
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
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*=搜索]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, '魔女之旅 01');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(350);
  const opened = await evaluate(`(() => {
    const book = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.trimStart().startsWith('魔女之旅 01'));
    book?.click();
    return Boolean(book);
  })()`);
  if (!opened) {
    await evaluate(`(() => {
      const series = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.includes('魔女之旅') && Number.parseInt(item.innerText, 10) === 48);
      series?.click();
      return Boolean(series);
    })()`);
    await waitFor(`Array.from(document.querySelectorAll('button')).some((item) => Number.parseInt(item.innerText, 10) === 25 && item.innerText.includes('魔女之旅 01'))`);
    await evaluate(`(() => {
      const book = Array.from(document.querySelectorAll('button')).find((item) => Number.parseInt(item.innerText, 10) === 25 && item.innerText.includes('魔女之旅 01'));
      book?.click();
      return Boolean(book);
    })()`);
  }
  await waitFor('Boolean(document.querySelector("button[title=下一页]") && document.querySelector(".readium-container iframe"))');
  await sleep(600);
}

const currentResource = `(() => {
  const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
    .find((item) => getComputedStyle(item).visibility === 'visible');
  return frame ? {
    href: frame.dataset.originalHref || '',
    title: frame.contentDocument?.title || '',
    text: frame.contentDocument?.body?.innerText.trim().slice(0, 80) || '',
    images: Array.from(frame.contentDocument?.images || []).filter((image) => image.complete && image.naturalWidth > 0).length,
  } : null;
})()`;

async function waitForResource(previousTitle) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    const resource = await evaluate(currentResource);
    if (resource?.title && resource.title !== previousTitle) return resource;
    await sleep(20);
  }
  throw new Error(`Timed out leaving ${previousTitle}`);
}

try {
  await openTargetBook();
  if (!await evaluate('Boolean(document.querySelector("input[aria-label=阅读进度]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await sleep(250);
  }
  await evaluate(`(() => {
    const slider = document.querySelector('input[aria-label="阅读进度"]');
    if (!slider) throw new Error('Reader progress control is unavailable');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(slider, '0');
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await sleep(800);
  if (!await evaluate('Boolean(document.querySelector("button[title=阅读设置]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await sleep(250);
  }
  await evaluate('document.querySelector("button[title=阅读设置]")?.click(); true');
  await sleep(200);
  await evaluate(`document.querySelector('button[title="上下连续滚动加载"]')?.click(); true`);
  await sleep(1200);
  await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
  const state = await evaluate(currentResource);
  if (!state) throw new Error('Reader is not open');
  const visited = [state];
  for (let index = 1; index < expected.length; index++) {
    await evaluate(`(() => {
      const frame = Array.from(document.querySelectorAll('.readium-container iframe'))
        .find((item) => getComputedStyle(item).visibility === 'visible');
      const scroller = frame?.contentDocument?.scrollingElement;
      if (!frame || !scroller) return false;
      scroller.scrollTop = Math.max(0, scroller.scrollHeight - frame.contentWindow.innerHeight);
      frame.contentWindow.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
      return true;
    })()`);
    visited.push(await waitForResource(visited.at(-1).title));
  }
  const actual = visited.map((item) => item.title);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Frontmatter order mismatch: ${JSON.stringify(actual)}`);
  }
  if (visited.some((item) => !item.text && item.images === 0)) {
    throw new Error(`Blank frontmatter resource: ${JSON.stringify(visited)}`);
  }
  process.stdout.write(`${JSON.stringify({ expected, visited }, null, 2)}\n`);
} finally {
  await close();
}
