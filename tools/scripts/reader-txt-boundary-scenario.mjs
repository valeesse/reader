import { close, evaluate } from './reader-cdp.mjs';

const BOOK = '《傲世九重天》（精校版全本）作者：风凌天下';
const CHAPTERS = ['第七章 大师兄肚子疼？', '第八章 金血玄参', '第九章 真正的九劫总纲！'];
const MODES = [
  ['直接重新加载文字', '单页'],
  ['直接重新加载文字', '双页'],
  ['左右整体切换', '单页'],
  ['上下整体切换', '单页'],
  ['上下连续滚动加载', '单页'],
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(expression, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await sleep(50);
  }
  throw new Error(`Timed out: ${expression}`);
}

async function openBook() {
  await waitFor('Boolean(document.querySelector("input[placeholder*=搜索]"))');
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*=搜索]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(BOOK)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(300);
  await evaluate(`(() => {
    const button = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.includes(${JSON.stringify(BOOK)}) && item.innerText.includes('TXT'));
    if (!button) throw new Error('TXT book not found');
    button.click();
    return true;
  })()`);
  await waitFor('Boolean(document.querySelector("button[title=下一页]"))');
}

async function openSettings() {
  if (!await evaluate('Boolean(document.querySelector("button[title=阅读设置]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await waitFor('Boolean(document.querySelector("button[title=阅读设置]"))');
  }
  await evaluate('document.querySelector("button[title=阅读设置]").click(); true');
  await sleep(120);
}

async function setMode(animation, pageMode) {
  await openSettings();
  await evaluate(`document.querySelector(${JSON.stringify(`button[title="${animation}"]`)})?.click(); true`);
  await sleep(350);
  if (animation !== '上下连续滚动加载') {
    await evaluate(`document.querySelector(${JSON.stringify(`button[title="${pageMode}"]`)})?.click(); true`);
    await sleep(350);
  }
  await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
}

async function openChapter(title) {
  if (!await evaluate('Boolean(document.querySelector("button[title=目录]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
  }
  await waitFor('Boolean(document.querySelector("button[title=目录]"))');
  await evaluate('document.querySelector("button[title=目录]").click(); true');
  await waitFor(`Boolean(document.querySelector(${JSON.stringify(`button[title="${title}"]`)}))`);
  await evaluate(`document.querySelector(${JSON.stringify(`button[title="${title}"]`)}).click(); true`);
  await sleep(700);
}

const snapshotExpression = `(() => {
  const frames = Array.from(document.querySelectorAll('iframe')).filter((frame) => getComputedStyle(frame).visibility === 'visible' && frame.contentDocument?.body);
  const visible = frames.flatMap((frame) => Array.from(frame.contentDocument.querySelectorAll('[data-txt-start]')).filter((element) => {
    const rect = element.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    return frameRect.left + rect.right > 0 && frameRect.left + rect.left < innerWidth
      && frameRect.top + rect.bottom > 0 && frameRect.top + rect.top < innerHeight;
  }).map((element) => {
    const rect = element.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    return { offset: Number(element.dataset.txtStart), text: element.textContent.trim(), rect: { top: frameRect.top + rect.top, bottom: frameRect.top + rect.bottom } };
  }));
  const counter = Array.from(document.querySelectorAll('div')).map((item) => item.textContent).filter((text) => text?.startsWith('本章') && text.includes('全书')).at(-1) || '';
  const viewport = document.querySelector('.zenith-resource-strip-scroller, .readium-container')?.getBoundingClientRect();
  const largestGap = visible.sort((a, b) => a.rect.top - b.rect.top).reduce((gap, item, index, items) => index ? Math.max(gap, item.rect.top - items[index - 1].rect.bottom) : gap, 0);
  return { offsets: visible.map((item) => item.offset).filter(Number.isFinite), texts: visible.map((item) => item.text.slice(0, 60)), counter, largestGap, viewportHeight: viewport?.height || 0 };
})()`;

await openBook();
const report = [];
for (const [animation, pageMode] of MODES) {
  await setMode(animation, pageMode);
  for (const chapter of CHAPTERS) {
    await openChapter(chapter);
    const before = await evaluate(snapshotExpression);
    for (let turn = 0; turn < 4; turn++) {
      await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); true');
      await sleep(1000);
    }
    const after = await evaluate(snapshotExpression);
    if (before.offsets.length === 0 || after.offsets.length === 0) throw new Error(`No visible offsets: ${animation}/${chapter}`);
    if (Math.min(...after.offsets) <= Math.min(...before.offsets)) throw new Error(`Position did not advance: ${animation}/${chapter}`);
    if (after.largestGap > after.viewportHeight * 0.75) throw new Error(`Large blank gap: ${animation}/${chapter}`);
    if (!after.counter || after.counter === before.counter) throw new Error(`Page counter did not update: ${animation}/${chapter}`);
    report.push({ animation, pageMode, chapter, before, after });
  }
}
await setMode('上下连续滚动加载', '单页');
await openChapter(CHAPTERS[1]);
const layoutBefore = await evaluate(snapshotExpression);
await openSettings();
await evaluate(`(() => {
  const slider = Array.from(document.querySelectorAll('input[type=range]')).find((input) => input.parentElement?.parentElement?.innerText.includes('文字大小'));
  if (!slider) throw new Error('Font-size slider not found');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(slider, String(Math.min(Number(slider.max), Number(slider.value) + Number(slider.step || 1) * 2)));
  slider.dispatchEvent(new Event('input', { bubbles: true }));
  slider.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await sleep(1000);
await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
const layoutAfter = await evaluate(snapshotExpression);
if (layoutAfter.counter === layoutBefore.counter) throw new Error('Page counter did not react to typography change');
if (Math.abs(Math.min(...layoutAfter.offsets) - Math.min(...layoutBefore.offsets)) > 500) throw new Error('Typography change lost semantic position');
report.push({ layoutRevision: { before: layoutBefore, after: layoutAfter } });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
await close();
