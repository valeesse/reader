import { AppSettings, BookType } from '../types';
import { ReadiumLocatorLike, ReadiumPublicationLike } from './readiumPublication';

export type StripCallbacks = {
  onLocator: (locator: ReadiumLocatorLike) => void;
  onImage: (image: { src: string; name: string }) => void;
  onToggleChrome: () => void;
};

export type StripRecord = {
  index: number;
  wrapper: HTMLDivElement;
  iframe: HTMLIFrameElement;
  height: number;
  loaded: boolean;
  loadPromise: Promise<void>;
  resizeObserver?: ResizeObserver;
};

export type StripRecordEnvironment = {
  publication: ReadiumPublicationLike;
  scroller: HTMLDivElement;
  content: HTMLDivElement;
  records: Map<number, StripRecord>;
  callbacks: StripCallbacks;
  settings: () => AppSettings;
  bookType: BookType;
  destroyed: () => boolean;
  go: (locator: ReadiumLocatorLike, smooth?: boolean) => Promise<boolean>;
  estimatedHeight: (index: number) => number;
  positionRecord: (record: StripRecord) => void;
  onRecordHeightChange: (record: StripRecord, previousHeight: number) => void;
  bottomSpacer: HTMLDivElement;
};
