import { AppSettings } from '../../../types';
import { recordReaderMetric } from './readerPerformance';

export type ReaderViewport = {
  width: number;
  height: number;
  devicePixelRatio: number;
};

export function createReaderLayoutKey(
  contentKey: string,
  settings: AppSettings,
  viewport: ReaderViewport,
  bookType: 'epub' | 'txt',
) {
  const layoutValues = {
    version: 3,
    contentKey,
    bookType,
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
    devicePixelRatio: Math.round(viewport.devicePixelRatio * 100) / 100,
    pageMode: settings.pageMode,
    continuousScroll: settings.pageTurnAnimation === 'scroll',
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    margins: settings.pageMargins,
  };
  return JSON.stringify(layoutValues);
}

export function createReaderSettingsLayoutFingerprint(settings: AppSettings, bookType: 'epub' | 'txt') {
  return JSON.stringify({
    pageMode: settings.pageMode,
    continuousScroll: settings.pageTurnAnimation === 'scroll',
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    paragraphSpacing: settings.paragraphSpacing,
    letterSpacing: settings.letterSpacing,
    pageMargins: settings.pageMargins,
  });
}

export class ReaderLayoutCache {
  private ready = new Map<string, number>();
  private pending = new Map<string, { generation: number; keyGeneration: number; promise: Promise<void> }>();
  private generation = 0;
  private keyGenerations = new Map<string, number>();

  constructor(private maxEntries = 3) {}

  isReady(key: string) {
    const hit = this.ready.has(key);
    recordReaderMetric({ kind: 'layout-cache', name: 'readium-frame', durationMs: 0, hit });
    if (hit) this.touch(key);
    return hit;
  }

  prepare(key: string, task: () => Promise<boolean | void>) {
    if (this.isReady(key)) return Promise.resolve();
    const existing = this.pending.get(key);
    const generation = this.generation;
    const keyGeneration = this.keyGenerations.get(key) || 0;
    if (existing?.generation === generation && existing.keyGeneration === keyGeneration) return existing.promise;
    const started = performance.now();
    const pending = task().then((completed) => {
      if (completed === false) return;
      if (generation !== this.generation || keyGeneration !== (this.keyGenerations.get(key) || 0)) return;
      this.ready.set(key, performance.now());
      this.trim();
      recordReaderMetric({
        kind: 'layout-prepare',
        name: 'readium-frame',
        durationMs: performance.now() - started,
      });
    }).finally(() => {
      if (this.pending.get(key)?.promise === pending) this.pending.delete(key);
    });
    this.pending.set(key, { generation, keyGeneration, promise: pending });
    return pending;
  }

  delete(key: string) {
    this.ready.delete(key);
    this.keyGenerations.set(key, (this.keyGenerations.get(key) || 0) + 1);
    this.pending.delete(key);
  }

  invalidate() {
    this.generation += 1;
    this.ready.clear();
    this.pending.clear();
    this.keyGenerations.clear();
  }

  private touch(key: string) {
    this.ready.set(key, performance.now());
  }

  private trim() {
    while (this.ready.size > this.maxEntries) {
      let oldestKey: string | undefined;
      let oldest = Number.POSITIVE_INFINITY;
      for (const [key, touched] of this.ready) {
        if (touched < oldest) {
          oldest = touched;
          oldestKey = key;
        }
      }
      if (!oldestKey) break;
      this.ready.delete(oldestKey);
    }
  }
}
