export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function resolvePublicationHref(baseHref: string, href: string) {
  if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return undefined;
  try {
    const resolved = new URL(href, new URL(baseHref, 'https://zenith.invalid/'));
    return decodeURIComponent(resolved.pathname.replace(/^\//, ''));
  } catch {
    return undefined;
  }
}

export function normalizeResourcePath(href: string) {
  return decodeURIComponent(href.split('#')[0])
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .toLowerCase();
}

export function distanceToElement(element: HTMLElement, y: number) {
  const rect = element.getBoundingClientRect();
  return Math.abs((rect.top + rect.bottom) * 0.5 - y);
}

export function cssSelector(element: HTMLElement) {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current?.parentElement && current !== current.ownerDocument.body) {
    const siblings = Array.from(current.parentElement.children).filter((item) => item.tagName === current!.tagName);
    const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : '';
    parts.unshift(`${current.tagName.toLowerCase()}${suffix}`);
    current = current.parentElement;
  }
  return parts.length > 0 ? `body > ${parts.join(' > ')}` : 'body';
}

export function nextPaint(frames = 1): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => requestAnimationFrame(() => remaining > 1 ? step(remaining - 1) : resolve());
    step(frames);
  });
}

export function waitForScrollCompletion(element: HTMLElement) {
  return new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      element.removeEventListener('scrollend', finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, 900);
    element.addEventListener('scrollend', finish, { once: true });
  });
}

export async function settleWithConcurrency(
  tasks: Array<() => Promise<void>>,
  concurrency: number,
  rejectOnError: boolean,
) {
  if (tasks.length === 0) return;
  const pending = tasks.entries();
  const errors: unknown[] = [];
  const worker = async () => {
    for (let next = pending.next(); !next.done; next = pending.next()) {
      try { await next.value[1](); } catch (error) { errors.push(error); }
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(tasks.length, Math.max(1, concurrency)) },
    () => worker(),
  ));
  if (rejectOnError && errors.length > 0) throw errors[0];
}
