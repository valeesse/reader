export type ReadiumLocator = {
  href: string;
  type: string;
  title?: string;
  locations?: {
    fragments?: string[];
    progression?: number;
    totalProgression?: number;
    position?: number;
    [key: string]: unknown;
  };
  text?: unknown;
  serialize?: () => unknown;
};

export type ReadiumFrameClickEvent = {
  x: number;
  y: number;
  targetFrameSrc?: string;
  interactiveElement?: string;
  doNotDisturb?: boolean;
};

export type ReadiumNavigatorListeners = Partial<{
  frameLoaded: (wnd: Window) => void;
  positionChanged: (locator: ReadiumLocator) => void;
  tap: (event: ReadiumFrameClickEvent) => boolean;
  click: (event: ReadiumFrameClickEvent) => boolean;
  zoom: (scale: number) => void;
  miscPointer: (amount: number) => void;
  scroll: (delta: number) => void;
  customEvent: (key: string, data: unknown) => void;
  handleLocator: (locator: ReadiumLocator) => boolean;
  textSelected: (selection: unknown) => void;
  contentProtection: (type: string, data: unknown) => void;
  contextMenu: (data: unknown) => void;
  peripheral: (data: unknown) => void;
}>;

export class EpubNavigator {
  constructor(
    container: HTMLElement,
    publication: any,
    listeners: ReadiumNavigatorListeners,
    positions?: ReadiumLocator[],
    initialPosition?: ReadiumLocator,
    configuration?: any,
  );
  load(): Promise<void>;
  destroy(): Promise<void>;
  submitPreferences(preferences: any): Promise<void>;
  resizeHandler(): Promise<void>;
  prepare(locator: ReadiumLocator): Promise<Window[]>;
  goBackward(animated: boolean, callback: (ok: boolean) => void): void;
  goForward(animated: boolean, callback: (ok: boolean) => void): void;
  go(locator: ReadiumLocator, animated: boolean, callback: (ok: boolean) => void): void;
  readonly currentLocator: ReadiumLocator;
  readonly viewport: {
    readingOrder: string[];
    progressions: Map<string, { start: number; end: number }>;
    positions: number[] | null;
  };
}

export class EpubPreferences {
  constructor(preferences?: Record<string, unknown>);
}
