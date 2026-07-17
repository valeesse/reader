import { close, command, evaluate } from './reader-cdp.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const book = '《傲世九重天》（精校版全本）作者：风凌天下';
async function waitFor(expression, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await sleep(30);
  }
  throw new Error(`Timed out: ${expression}`);
}

if (await evaluate('Boolean(document.querySelector("button[title=返回书库]"))')) {
  await evaluate('document.querySelector("button[title=返回书库]").click(); true');
  await sleep(300);
}
await waitFor('Boolean(document.querySelector("input[placeholder*=搜索]"))');
await evaluate(`(() => {
  const input = document.querySelector('input[placeholder*=搜索]');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, ${JSON.stringify(book)}); input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await sleep(300);
await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.includes(${JSON.stringify(book)}) && item.innerText.includes('TXT'));
  if (!button) throw new Error('TXT not found'); button.click(); return true;
})()`);
await waitFor('Boolean(document.querySelector("button[title=下一页]"))', 20000);
if (!await evaluate('Boolean(document.querySelector("button[title=阅读设置]"))')) {
  await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
  await waitFor('Boolean(document.querySelector("button[title=阅读设置]"))');
}
await evaluate('document.querySelector("button[title=阅读设置]").click(); true');
await sleep(120);
await evaluate('document.querySelector("button[title=上下连续滚动加载]").click(); true');
await sleep(800);
await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
await waitFor('Boolean(document.querySelector(".zenith-resource-strip-scroller"))');
for (let index = 0; index < 10; index++) {
  await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); true');
  await sleep(300);
}
await sleep(1200);

const sample = `(() => {
  const scroller = document.querySelector('.zenith-resource-strip-scroller');
  const frames = Array.from(document.querySelectorAll('.zenith-resource-strip-frame'));
  const visible = frames.flatMap((frame) => {
    const frameRect = frame.getBoundingClientRect();
    return Array.from(frame.contentDocument?.querySelectorAll('[data-txt-start]') || []).map((element) => {
      const rect = element.getBoundingClientRect();
      return { offset: Number(element.dataset.txtStart), top: frameRect.top + rect.top, bottom: frameRect.top + rect.bottom };
    }).filter((item) => item.bottom > 0 && item.top < innerHeight);
  }).sort((left, right) => left.top - right.top);
  const counter = document.querySelector('[data-reader-page-counter]')?.textContent || '';
  return {
    width: scroller?.clientWidth || 0, height: scroller?.clientHeight || 0,
    scrollTop: scroller?.scrollTop || 0, anchor: visible.find((item) => item.top >= 0)?.offset || visible[0]?.offset,
    visibleOffsets: visible.map((item) => item.offset), counter,
    transform: scroller ? getComputedStyle(scroller).transform : '',
    left: scroller?.getBoundingClientRect().left || 0,
  };
})()`;
async function waitSample(predicate, timeout = 1800) {
  const started = Date.now();
  let value;
  while (Date.now() - started < timeout) {
    value = await evaluate(sample);
    if (predicate(value)) return value;
    await sleep(20);
  }
  throw new Error(`Continuous resize did not settle: ${JSON.stringify(value)}`);
}

const before = await evaluate(sample);
const { windowId, bounds } = await command('Browser.getWindowForTarget');
const stages = [];
try {
  for (const target of [
    { width: Math.round(bounds.width * 1.3), height: Math.round(bounds.height * 1.08) },
    { width: Math.max(760, Math.round(bounds.width * 0.76)), height: Math.max(600, Math.round(bounds.height * 0.88)) },
    { width: bounds.width, height: bounds.height },
  ]) {
    const previous = stages.at(-1) || before;
    const expectedAnchor = before.anchor;
    await command('Browser.setWindowBounds', { windowId, bounds: target });
    const next = await waitSample((value) => value.width !== previous.width && value.counter.includes('本章屏') && value.visibleOffsets.includes(expectedAnchor));
    if (next.transform && next.transform !== 'none') throw new Error(`Continuous strip transformed: ${JSON.stringify(next)}`);
    if (Math.abs(next.left - before.left) > 2) throw new Error(`Continuous strip moved horizontally: ${JSON.stringify({ before, next })}`);
    stages.push(next);
    await sleep(180);
  }
  if (stages[1].counter === before.counter) throw new Error(`Continuous page counter ignored resize: ${JSON.stringify({ before, stages })}`);
  process.stdout.write(`${JSON.stringify({ before, stages }, null, 2)}\n`);
} finally {
  await command('Browser.setWindowBounds', { windowId, bounds: { width: bounds.width, height: bounds.height } }).catch(() => {});
  await close();
}
