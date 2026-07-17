import { recordReaderMetric } from './readerPerformance';

export type CachePriority = 0 | 1 | 2 | 3;

type CacheEntry<T> = {
  value: Promise<T>;
  bytes: number;
  touchedAt: number;
  settled: boolean;
};

export class ReaderContentCache<T> {
  private entries = new Map<string, CacheEntry<T>>();
  private residentBytes = 0;

  constructor(
    private name: string,
    private maxEntries: number,
    private maxBytes: number,
  ) {}

  get(key: string) {
    const entry = this.entries.get(key);
    recordReaderMetric({
      kind: 'content-cache',
      name: this.name,
      durationMs: 0,
      hit: Boolean(entry),
    });
    if (!entry) return undefined;
    entry.touchedAt = performance.now();
    return entry.value;
  }

  getOrCreate(key: string, load: () => Promise<T>, estimatedBytes = 0) {
    const existing = this.get(key);
    if (existing) return existing;
    const started = performance.now();
    let value: Promise<T>;
    value = load().then((result) => {
      const entry = this.entries.get(key);
      if (entry?.value === value) entry.settled = true;
      recordReaderMetric({
        kind: 'content-prepare',
        name: this.name,
        durationMs: performance.now() - started,
        detail: { bytes: estimatedBytes },
      });
      this.trim();
      return result;
    }).catch((error) => {
      if (this.entries.get(key)?.value === value) this.remove(key);
      throw error;
    });
    this.entries.set(key, { value, bytes: estimatedBytes, touchedAt: performance.now(), settled: false });
    this.residentBytes += estimatedBytes;
    this.trim();
    return value;
  }

  updateSize(key: string, bytes: number) {
    const entry = this.entries.get(key);
    if (!entry) return;
    this.residentBytes += bytes - entry.bytes;
    entry.bytes = bytes;
    this.trim();
  }

  remove(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return;
    this.residentBytes = Math.max(0, this.residentBytes - entry.bytes);
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
    this.residentBytes = 0;
  }

  snapshot() {
    return { entries: this.entries.size, bytes: this.residentBytes };
  }

  private trim() {
    while (this.entries.size > this.maxEntries || this.residentBytes > this.maxBytes) {
      let oldestKey: string | undefined;
      let oldestAt = Number.POSITIVE_INFINITY;
      for (const [key, entry] of this.entries) {
        if (entry.settled && entry.touchedAt < oldestAt) {
          oldestAt = entry.touchedAt;
          oldestKey = key;
        }
      }
      if (!oldestKey) break;
      this.remove(oldestKey);
    }
  }
}

type ScheduledTask<T> = {
  key: string;
  priority: CachePriority;
  generation: number;
  run: (signal: AbortSignal) => Promise<T>;
  controller: AbortController;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

export class ReaderWorkScheduler {
  private generation = 0;
  private active = 0;
  private queued: ScheduledTask<unknown>[] = [];
  private pending = new Map<string, Promise<unknown>>();
  private controllers = new Set<AbortController>();
  private running = new Set<ScheduledTask<unknown>>();

  constructor(private concurrency = 2) {}

  schedule<T>(key: string, priority: CachePriority, run: (signal: AbortSignal) => Promise<T>) {
    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;
    const controller = new AbortController();
    this.controllers.add(controller);
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    });
    this.pending.set(key, promise);
    this.queued.push({ key, priority, generation: this.generation, run, controller, resolve, reject } as ScheduledTask<unknown>);
    this.queued.sort((a, b) => a.priority - b.priority);
    this.drain();
    return promise;
  }

  advanceGeneration(cancelPriorityAtOrBelow: CachePriority = 2) {
    this.generation++;
    const stale = this.queued.filter((task) => task.priority >= cancelPriorityAtOrBelow);
    this.queued = this.queued.filter((task) => task.priority < cancelPriorityAtOrBelow);
    for (const task of stale) {
      task.controller.abort();
      task.reject(new DOMException('Stale reader prefetch', 'AbortError'));
      this.pending.delete(task.key);
      this.controllers.delete(task.controller);
    }
    for (const task of this.running) {
      if (task.priority >= cancelPriorityAtOrBelow && task.generation < this.generation) {
        task.controller.abort();
      }
    }
  }

  close() {
    for (const controller of this.controllers) controller.abort();
    for (const task of this.queued) task.reject(new DOMException('Reader closed', 'AbortError'));
    this.queued = [];
    this.pending.clear();
    this.controllers.clear();
  }

  private drain() {
    while (this.active < this.concurrency && this.queued.length > 0) {
      const task = this.queued.shift()!;
      if (task.controller.signal.aborted) continue;
      this.active++;
      this.running.add(task);
      Promise.resolve(task.run(task.controller.signal))
        .then(task.resolve, task.reject)
        .finally(() => {
          this.active--;
          this.running.delete(task);
          this.pending.delete(task.key);
          this.controllers.delete(task.controller);
          this.drain();
        });
    }
  }
}

export function estimateStringBytes(value: string) {
  return value.length * 2;
}

export function adaptiveReaderBudget(preferredBytes: number, constrainedBytes: number) {
  if (typeof navigator === 'undefined') return preferredBytes;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return deviceMemory !== undefined && deviceMemory <= 4 ? constrainedBytes : preferredBytes;
}
