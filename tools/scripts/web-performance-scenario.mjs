import { close, command, evaluate, on } from './reader-cdp.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await command('Performance.enable');
await command('DOM.enable');

async function pageSnapshot() {
  const metrics = await command('Performance.getMetrics');
  const byName = new Map(metrics.metrics.map((metric) => [metric.name, metric.value]));
  const dom = await evaluate(`(() => ({
    nodes: document.getElementsByTagName('*').length,
    buttons: document.querySelectorAll('button').length,
    images: document.images.length,
    iframes: document.querySelectorAll('iframe').length,
    textLength: document.body.innerText.length,
    heap: performance.memory?.usedJSHeapSize,
  }))()`);
  return {
    ...dom,
    jsHeap: byName.get('JSHeapUsedSize'),
    documents: byName.get('Documents'),
    frames: byName.get('Frames'),
    layoutObjects: byName.get('LayoutObjects'),
    eventListeners: byName.get('JSEventListeners'),
  };
}

async function trace(name, action, settleMs = 700) {
  const events = [];
  const removeData = on('Tracing.dataCollected', ({ value }) => events.push(...value));
  let complete;
  const completed = new Promise((resolve) => { complete = resolve; });
  const removeComplete = on('Tracing.tracingComplete', complete);
  await command('Tracing.start', {
    categories: [
      'devtools.timeline',
      'blink.user_timing',
      'loading',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-v8.cpu_profiler',
      'disabled-by-default-v8.cpu_profiler.hires',
    ].join(','),
    options: 'sampling-frequency=10000',
    transferMode: 'ReportEvents',
  });
  const started = performance.now();
  await action();
  await sleep(settleMs);
  await command('Tracing.end');
  await completed;
  removeData();
  removeComplete();

  const mainEvents = events.filter((event) => event.ph === 'X' && event.dur);
  const durationByName = new Map();
  for (const event of mainEvents) {
    durationByName.set(event.name, (durationByName.get(event.name) || 0) + event.dur / 1000);
  }
  const tasks = mainEvents.filter((event) => event.name === 'RunTask');
  const longTasks = tasks.filter((event) => event.dur >= 50_000).map((event) => event.dur / 1000);
  const topDurations = [...durationByName.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 18)
    .map(([event, durationMs]) => ({ event, durationMs: Math.round(durationMs * 10) / 10 }));
  return {
    name,
    wallMs: Math.round((performance.now() - started) * 10) / 10,
    longTaskCount: longTasks.length,
    longestTaskMs: Math.round(Math.max(0, ...longTasks) * 10) / 10,
    totalLongTaskMs: Math.round(longTasks.reduce((total, duration) => total + duration, 0) * 10) / 10,
    topDurations,
    snapshot: await pageSnapshot(),
  };
}

async function clickByText(text, exact = true) {
  return evaluate(`(() => {
    const text = ${JSON.stringify(text)};
    const element = Array.from(document.querySelectorAll('button')).find((button) => (
      ${exact ? 'button.innerText.trim() === text' : 'button.innerText.includes(text)'}
    ));
    if (!element) throw new Error('Button not found: ' + text);
    element.click();
    return element.innerText.trim();
  })()`);
}

async function fillFirstInput(value) {
  return evaluate(`(() => {
    const input = document.querySelector('input:not([type=range])');
    if (!input) throw new Error('Text input not found');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(value.at(-1) || '')} }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return input.placeholder;
  })()`);
}

const results = [{ name: 'initial', snapshot: await pageSnapshot() }];

if ((await evaluate(`document.querySelector('input:not([type=range])') === null`))) {
  await evaluate(`(() => {
    const frame = Array.from(document.querySelectorAll('iframe')).find((item) => getComputedStyle(item).visibility === 'visible');
    frame?.contentDocument?.body?.click();
    document.querySelector('.readium-container')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  })()`);
  await sleep(200);
  results.push(await trace('reader-to-library', async () => {
    await evaluate(`document.querySelector('button[title="返回"]')?.click()`);
  }, 1200));
}

results.push(await trace('library-input', async () => {
  for (const value of ['魔', '魔女', '魔女之', '魔女之旅']) {
    await fillFirstInput(value);
    await sleep(80);
  }
}, 500));

await fillFirstInput('');
await sleep(300);
results.push(await trace('open-series-view', () => clickByText('系列', false), 1400));
results.push(await trace('series-input', async () => {
  for (const value of ['魔', '魔女', '魔女之', '魔女之旅']) {
    await fillFirstInput(value);
    await sleep(80);
  }
}, 500));

results.push(await trace('series-to-library', () => clickByText('所有书籍', false), 900));
await fillFirstInput('魔女之旅 01');
await sleep(500);
results.push(await trace('open-epub', () => clickByText('魔女之旅 01', false), 1600));
if (!(await evaluate(`document.querySelectorAll('iframe').length > 0`))) {
  results.push(await trace('open-epub-volume', async () => {
    await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const button = Array.from(dialog?.querySelectorAll('button') || []).find((item) => item.innerText.includes('魔女之旅'));
      if (!button) throw new Error('EPUB volume not found');
      button.click();
    })()`);
  }, 1800));
}
results.push(await trace('page-turns', async () => {
  for (let index = 0; index < 8; index++) {
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await sleep(180);
  }
}, 900));

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
await close();
