export type ReaderTaskPriority = 'user-blocking' | 'user-visible' | 'background';

export type ReaderIdleHandle =
  | { kind: 'idle'; id: number }
  | { kind: 'timeout'; id: number };

export function scheduleReaderIdle(
  callback: () => void,
  options: { timeout?: number } = {},
): ReaderIdleHandle {
  if (typeof window.requestIdleCallback === 'function') {
    return {
      kind: 'idle',
      id: window.requestIdleCallback(callback, { timeout: options.timeout }),
    };
  }
  return {
    kind: 'timeout',
    id: window.setTimeout(callback, Math.min(options.timeout ?? 50, 50)),
  };
}

export function cancelReaderIdle(handle?: ReaderIdleHandle | null) {
  if (!handle) return;
  if (handle.kind === 'idle' && typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle.id);
    return;
  }
  window.clearTimeout(handle.id);
}

export async function yieldReaderTask(
  priority: ReaderTaskPriority = 'background',
  options: { timeout?: number; signal?: AbortSignal } = {},
) {
  throwIfAborted(options.signal);
  const taskScheduler = (globalThis as typeof globalThis & {
    scheduler?: {
      postTask?: (
        task: () => void,
        options: { priority: ReaderTaskPriority; signal?: AbortSignal },
      ) => Promise<void>;
    };
  }).scheduler;
  if (taskScheduler?.postTask) {
    await taskScheduler.postTask(() => {}, { priority, signal: options.signal });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const handle = scheduleReaderIdle(resolve, { timeout: options.timeout ?? 120 });
    const abort = () => {
      cancelReaderIdle(handle);
      reject(new DOMException('Reader task aborted', 'AbortError'));
    };
    options.signal?.addEventListener('abort', abort, { once: true });
  });
}

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw signal.reason || new DOMException('Operation aborted', 'AbortError');
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError';
}
