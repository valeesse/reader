import { runtimeCapabilities } from '../lib/backend';

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
  };
  deviceMemory?: number;
};

export type ReaderRuntimePolicy = {
  desktop: boolean;
  constrained: boolean;
  saveData: boolean;
  highLatency: boolean;
  contentPrefetchRadius: number;
  continuousResourceRadius: number;
  continuousResourceLimit: number;
  framePreparationConcurrency: number;
};

export function readerRuntimePolicy(): ReaderRuntimePolicy {
  const runtimeNavigator = navigator as NavigatorWithConnection;
  const connection = runtimeNavigator.connection;
  const saveData = Boolean(connection?.saveData);
  const highLatency = Boolean(
    (connection?.rtt !== undefined && connection.rtt >= 140)
    || connection?.effectiveType === '2g'
    || connection?.effectiveType === 'slow-2g',
  );
  const localTransport = runtimeCapabilities.resourceTransport === 'asset-url';
  const constrained = !localTransport && (
    saveData
    || highLatency
    || (runtimeNavigator.deviceMemory !== undefined && runtimeNavigator.deviceMemory <= 4)
  );
  return {
    desktop: runtimeCapabilities.desktopShell,
    constrained,
    saveData,
    highLatency,
    contentPrefetchRadius: localTransport ? 3 : constrained ? 1 : 2,
    continuousResourceRadius: localTransport ? 3 : constrained ? 1 : 2,
    continuousResourceLimit: localTransport ? 12 : constrained ? 5 : 9,
    framePreparationConcurrency: constrained ? 1 : 2,
  };
}
