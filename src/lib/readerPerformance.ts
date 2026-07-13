export type ReaderMetricKind =
  | 'load'
  | 'navigation'
  | 'content-cache'
  | 'layout-cache'
  | 'content-prepare'
  | 'layout-prepare';

export type ReaderMetric = {
  kind: ReaderMetricKind;
  name: string;
  durationMs: number;
  at: number;
  hit?: boolean;
  detail?: Record<string, string | number | boolean | undefined>;
};

const MAX_METRICS = 400;
const metrics: ReaderMetric[] = [];

export function recordReaderMetric(metric: Omit<ReaderMetric, 'at'>) {
  metrics.push({ ...metric, at: Date.now() });
  if (metrics.length > MAX_METRICS) metrics.splice(0, metrics.length - MAX_METRICS);
}

export function measureReaderTask<T>(
  kind: ReaderMetricKind,
  name: string,
  task: () => Promise<T>,
  detail?: ReaderMetric['detail'],
) {
  const started = performance.now();
  return task().finally(() => {
    recordReaderMetric({ kind, name, durationMs: performance.now() - started, detail });
  });
}

export function getReaderPerformanceSnapshot() {
  const snapshot = metrics.slice();
  const groups = new Map<string, number[]>();
  for (const metric of snapshot) {
    const key = `${metric.kind}:${metric.name}`;
    const values = groups.get(key) || [];
    values.push(metric.durationMs);
    groups.set(key, values);
  }
  return {
    metrics: snapshot,
    summaries: Array.from(groups, ([key, values]) => {
      values.sort((a, b) => a - b);
      return {
        key,
        count: values.length,
        p50: percentile(values, 0.5),
        p95: percentile(values, 0.95),
        max: values[values.length - 1] || 0,
      };
    }),
  };
}

export function clearReaderPerformanceMetrics() {
  metrics.length = 0;
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) return 0;
  return values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];
}

declare global {
  interface Window {
    __ZENITH_READER_PERF__?: {
      snapshot: typeof getReaderPerformanceSnapshot;
      clear: typeof clearReaderPerformanceMetrics;
    };
  }
}

if (typeof window !== 'undefined') {
  window.__ZENITH_READER_PERF__ = {
    snapshot: getReaderPerformanceSnapshot,
    clear: clearReaderPerformanceMetrics,
  };
}
