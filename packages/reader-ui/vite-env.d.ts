/// <reference types="vite/client" />

declare global {
interface Window {
  __TAURI_INTERNALS__?: unknown;
}

interface Window {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
}
}

export {};
