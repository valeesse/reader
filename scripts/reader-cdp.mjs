const port = Number(process.env.ZENITH_CDP_PORT || 9222);
const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = pages.find((item) => item.type === 'page' && item.title === 'Zenith Reader') || pages[0];
if (!page?.webSocketDebuggerUrl) throw new Error('Zenith Reader WebView is not available');

const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const events = new Map();

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  for (const listener of events.get(message.method) || []) listener(message.params);
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

export function command(method, params = {}) {
  const id = nextId++;
  const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  socket.send(JSON.stringify({ id, method, params }));
  return result;
}

export async function evaluate(expression, awaitPromise = true) {
  const result = await command('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

export function on(method, listener) {
  const listeners = events.get(method) || [];
  listeners.push(listener);
  events.set(method, listeners);
  return () => events.set(method, listeners.filter((item) => item !== listener));
}

export async function close() {
  socket.close();
}

await command('Runtime.enable');
await command('Page.enable');

if (process.argv[1]?.endsWith('reader-cdp.mjs')) {
  const expression = process.argv[2];
  const snapshot = expression ? await evaluate(expression) : await evaluate(`(() => ({
    title: document.title,
    text: document.body.innerText.slice(0, 4000),
    iframes: Array.from(document.querySelectorAll('iframe')).map((frame) => ({
      src: frame.src,
      visible: getComputedStyle(frame).visibility,
      images: frame.contentDocument ? Array.from(frame.contentDocument.images).map((image) => ({
        src: image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })) : [],
    })),
    performance: window.__ZENITH_READER_PERF__?.snapshot(),
  }))()`);
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
  await close();
}
