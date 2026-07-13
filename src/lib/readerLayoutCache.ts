import { AppSettings } from '../types';
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
    version: 2,
    contentKey,
    bookType,
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
    devicePixelRatio: Math.round(viewport.devicePixelRatio * 100) / 100,
    pageMode: settings.pageMode,
    txtReadingFlow: bookType === 'txt' ? settings.txtReadingFlow : undefined,
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
    txtReadingFlow: bookType === 'txt' ? settings.txtReadingFlow : undefined,
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
  private pending = new Map<string, Promise<void>>();

  constructor(private maxEntries = 3) {}

  isReady(key: string) {
    const hit = this.ready.has(key);
    recordReaderMetric({ kind: 'layout-cache', name: 'readium-frame', durationMs: 0, hit });
    if (hit) this.touch(key);
    return hit;
  }

  prepare(key: string, task: () => Promise<void>) {
    if (this.isReady(key)) return Promise.resolve();
    const existing = this.pending.get(key);
    if (existing) return existing;
    const started = performance.now();
    const pending = task().then(() => {
      this.ready.set(key, performance.now());
      this.trim();
      recordReaderMetric({
        kind: 'layout-prepare',
        name: 'readium-frame',
        durationMs: performance.now() - started,
      });
    }).finally(() => this.pending.delete(key));
    this.pending.set(key, pending);
    return pending;
  }

  invalidate() {
    this.ready.clear();
    this.pending.clear();
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
