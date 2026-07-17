import { isDesktopRuntime } from './backend';

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
  const constrained = !isDesktopRuntime && (
    saveData
    || highLatency
    || (runtimeNavigator.deviceMemory !== undefined && runtimeNavigator.deviceMemory <= 4)
  );
  return {
    desktop: isDesktopRuntime,
    constrained,
    saveData,
    highLatency,
    contentPrefetchRadius: isDesktopRuntime ? 3 : constrained ? 1 : 2,
    continuousResourceRadius: isDesktopRuntime ? 3 : constrained ? 1 : 2,
    continuousResourceLimit: isDesktopRuntime ? 12 : constrained ? 5 : 9,
    framePreparationConcurrency: isDesktopRuntime ? 2 : constrained ? 1 : 2,
  };
}
