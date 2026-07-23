export type BookType = 'epub' | 'txt';

export interface Book {
  id: string;
  resourceId: string;
  contentId: string;
  title: string;
  author: string;
  cover?: string; // base64 or blob URL
  type: BookType;
  fileName?: string;
  relativePath?: string;
  seriesName?: string;
  seriesIndex?: number;
  addedAt: number;
}

export interface Series {
  id: string;
  name: string;
  bookIds: string[];
}

export interface ReadingProgress {
  bookId: string;
  location?: string; // epubcfi for epub
  scrollPercentage?: number; // for txt
  updatedAt: number;
}

export interface ReaderTocItem {
  id: string;
  title: string;
  href?: string;
  index?: number;
  txtOffset?: number;
  progression?: number;
}

export interface ReaderSeekRequest {
  progress: number;
  requestId: number;
  phase: 'preview' | 'commit';
}

export interface AppSettings {
  pageMode: 'single' | 'double';
  pageTurnAnimation: 'scroll' | 'minimal' | 'slide-horizontal' | 'slide-vertical';
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  letterSpacing: number;
  pageMargins: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  theme: 'light' | 'dark' | 'sepia';
  webDavConfig: {
    enabled: boolean;
    url: string;
    username: string;
    password?: string;
  };
}

export interface SyncSnapshot {
  version: 2;
  books: Book[];
  series: Series[];
  settings: AppSettings;
  progress: ReadingProgress[];
  lastReadBookId?: string;
  updatedAt: number;
}

export interface WebDavBook {
  id: string;
  title: string;
  author: string;
  type: BookType;
  fingerprint: string;
  fileName: string;
  addedAt: number;
  remotePath: string;
  size?: number;
  modifiedAt?: number;
}

export const defaultSettings: AppSettings = {
  pageMode: 'single',
  pageTurnAnimation: 'minimal',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 18,
  lineHeight: 1.6,
  paragraphSpacing: 1.5,
  letterSpacing: 0,
  pageMargins: {
    left: 32,
    right: 32,
    top: 12,
    bottom: 16,
  },
  theme: 'light',
  webDavConfig: {
    enabled: false,
    url: '',
    username: '',
  }
};
