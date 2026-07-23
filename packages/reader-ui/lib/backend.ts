import type { ReaderGateway, ScanProgress } from '../contracts/readerGateway';
import { HttpReaderGateway } from '../adapters/httpReaderGateway';
import { TauriReaderGateway } from '../adapters/tauriReaderGateway';

export type { Capabilities as BackendCapabilities, FileAssociationStatus, ReaderCacheStats, ReaderFontPack, ScanProgress } from '../contracts/readerGateway';

export const isDesktopRuntime = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
export const readerGateway = isDesktopRuntime ? new TauriReaderGateway() : new HttpReaderGateway();
export const runtimeCapabilities = readerGateway.capabilities;

export const getCapabilities = () => readerGateway.getCapabilities();
export const getLibraryRoot = () => readerGateway.getLibraryRoot();
export const setLibraryRoot = (root: string) => readerGateway.setLibraryRoot(root);
export const pickLibraryRoot = () => readerGateway.pickLibraryRoot();
export const prewarmLibraryPicker = () => readerGateway.prewarmLibraryPicker();
export const importBooks = () => readerGateway.importBooks();
export const drainPendingOpenFiles = () => readerGateway.drainPendingOpenFiles();
export const openExternalBooks = (paths: string[]) => readerGateway.openExternalBooks(paths);
export const listBooks = () => readerGateway.listBooks();
export const resolveBookCover = (resourceId: string) => readerGateway.resolveBookCover(resourceId);
export const rescanBooks = (onProgress?: (progress: ScanProgress) => void) => readerGateway.scanBooks(onProgress);
export const getCacheStats = () => readerGateway.getCacheStats();
export const clearCache = () => readerGateway.clearCache();
export const readerFontPacks = () => readerGateway.readerFontPacks();
export const downloadReaderFontPack = (id: string) => readerGateway.downloadReaderFontPack(id);
export const removeReaderFontPack = (id: string) => readerGateway.removeReaderFontPack(id);
export const fileAssociationStatus = () => readerGateway.fileAssociationStatus();
export const openFileAssociationSettings = () => readerGateway.openFileAssociationSettings();

export function txtCommand<T>(route: string, command: string, body: Record<string, unknown>, signal?: AbortSignal) {
  return readerGateway.readerCommand<T>('txt', route, command, body, signal);
}
export function epubCommand<T>(route: string, command: string, body: Record<string, unknown>, signal?: AbortSignal) {
  return readerGateway.readerCommand<T>('epub', route, command, body, signal);
}
export function getWebState<T>() { return readerGateway.getState<T>(); }
export function getWebProgress<T>(bookId: string) { return readerGateway.getProgress<T>(bookId); }
export function putWebStateSection<T>(section: 'progress' | 'settings' | 'series' | 'lastRead', value: unknown) {
  return readerGateway.putStateSection<T>(section, value);
}
export function putWebReadingState<T>(value: unknown, keepalive = false) {
  return readerGateway.putReadingState<T>(value, keepalive);
}
export const uploadWebDavSnapshot = (...args: Parameters<ReaderGateway['uploadWebDavSnapshot']>) => readerGateway.uploadWebDavSnapshot(...args);
export const downloadWebDavSnapshot = (...args: Parameters<ReaderGateway['downloadWebDavSnapshot']>) => readerGateway.downloadWebDavSnapshot(...args);
export const listWebDavBooks = (...args: Parameters<ReaderGateway['listWebDavBooks']>) => readerGateway.listWebDavBooks(...args);
export const downloadWebDavBook = (...args: Parameters<ReaderGateway['downloadWebDavBook']>) => readerGateway.downloadWebDavBook(...args);
export function desktopInvoke<T>(command: string, args?: Record<string, unknown>) { return readerGateway.invokeHost<T>(command, args); }
export function desktopFileSrc(path: string) { return readerGateway.fileUrl(path); }
