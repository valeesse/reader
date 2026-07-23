import { close, evaluate } from './reader-cdp.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(expression, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return;
    await sleep(50);
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
  setter.call(input, '魔女之旅 01');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await sleep(400);
await evaluate(`(() => {
  const button = Array.from(document.querySelectorAll('button')).find((item) => item.innerText.includes('魔女之旅 01') && item.innerText.includes('EPUB'));
  if (!button) throw new Error('EPUB not found');
  button.click();
  return true;
})()`);
await sleep(500);
if (await evaluate('Boolean(document.querySelector("button[title=返回书库]"))')) {
  await evaluate(`(() => {
    const candidates = Array.from(document.querySelectorAll('button')).filter((item) => item.innerText.includes('魔女之旅 01'));
    const volume = candidates.find((item) => !item.innerText.includes('24 本书') && !item.innerText.includes('EPUB')) || candidates.at(-1);
    if (!volume) throw new Error('EPUB volume not found');
    volume.click();
    return true;
  })()`);
}
await waitFor('Boolean(document.querySelector("button[title=下一页]"))', 20000);
await waitFor(`Array.from(document.querySelectorAll('.readium-container iframe')).some((frame) =>
  getComputedStyle(frame).visibility === 'visible' && frame.contentDocument?.body && !frame.contentDocument.querySelector('[data-txt-start]'))`, 20000);
const modes = ['直接重新加载文字', '左右整体切换', '上下整体切换', '上下连续滚动加载'];
const report = [];
for (const mode of modes) {
  if (!await evaluate('Boolean(document.querySelector("button[title=阅读设置]"))')) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    await waitFor('Boolean(document.querySelector("button[title=阅读设置]"))');
  }
  await evaluate('document.querySelector("button[title=阅读设置]").click(); true');
  await sleep(120);
  await evaluate(`document.querySelector(${JSON.stringify(`button[title="${mode}"]`)})?.click(); true`);
  await sleep(700);
  await evaluate('document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
  const before = await evaluate(`(() => {
  const frame = Array.from(document.querySelectorAll('.readium-container iframe, .zenith-resource-strip-frame')).find((item) => getComputedStyle(item).visibility === 'visible' && item.contentDocument?.body);
  const counter = Array.from(document.querySelectorAll('div')).map((item) => item.textContent).filter((text) => text?.startsWith('本章') && text.includes('全书')).at(-1) || '';
  return { href: frame?.dataset.originalHref || frame?.src, counter };
})()`);
  for (let index = 0; index < 16; index++) {
    await evaluate('window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); true');
    await sleep(500);
  }
  const after = await evaluate(`(() => {
  const frame = Array.from(document.querySelectorAll('.readium-container iframe, .zenith-resource-strip-frame')).find((item) => getComputedStyle(item).visibility === 'visible' && item.contentDocument?.body);
  const counter = Array.from(document.querySelectorAll('div')).map((item) => item.textContent).filter((text) => text?.startsWith('本章') && text.includes('全书')).at(-1) || '';
  const body = frame?.contentDocument?.body;
  return { href: frame?.dataset.originalHref || frame?.src, counter, content: body?.innerText.trim().slice(0, 120) || '', scrollWidth: frame?.contentDocument?.documentElement.scrollWidth || 0 };
})()`);
  if (!after.content || after.counter === before.counter) throw new Error(`EPUB did not advance in ${mode}: ${JSON.stringify({ before, after })}`);
  report.push({ mode, before, after });
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
await close();
