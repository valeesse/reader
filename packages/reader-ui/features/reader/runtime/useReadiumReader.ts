import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../../store/AppStore';
import type { ReaderViewerProps } from '../ui/ReaderShared';
import { saveImageFromSource } from '../../../lib/nativeImage';
import { useReadiumReaderRuntime } from './useReadiumReaderRuntime';
import { installDeferredOperations } from './readiumReaderDeferred';
import { installLayoutOperations, useReadiumReaderResize, useReadiumReaderSettingsLayout } from './useReadiumReaderLayout';
import { installRelativeNavigation } from './readiumReaderRelativeNavigation';
import { installWheelController } from './readiumReaderWheel';
import { installAbsoluteNavigation, useReadiumReaderInput, useReadiumReaderRequests } from './useReadiumReaderRequests';
import { useReadiumReaderLifecycle } from './useReadiumReaderLifecycle';

export function useReadiumReader({
  book,
  chromeVisible,
  onProgressChange,
  onToggleChrome,
  onTocChange,
  onCurrentTocChange,
  tocTarget,
  seekRequest,
  onPresentable,
}: ReaderViewerProps & { chromeVisible: boolean }) {
  const { settings } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [pageCounter, setPageCounter] = useState('');
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const runtime = useReadiumReaderRuntime(book, settings, {
    onProgressChange, onToggleChrome, onPresentable, onCurrentTocChange,
  }, previewImage);
  runtime.bookType = book.type;

  installLayoutOperations(runtime);
  installDeferredOperations(runtime, setPageCounter);
  installRelativeNavigation(runtime);
  installWheelController(runtime);
  installAbsoluteNavigation(runtime);

  useEffect(() => { runtime.settingsRef.current = settings; }, [settings]);
  useEffect(() => { runtime.onProgressChangeRef.current = onProgressChange; }, [onProgressChange]);
  useEffect(() => { runtime.onToggleChromeRef.current = onToggleChrome; }, [onToggleChrome]);
  useEffect(() => { runtime.onPresentableRef.current = onPresentable; }, [onPresentable]);
  useEffect(() => { runtime.onCurrentTocChangeRef.current = onCurrentTocChange; }, [onCurrentTocChange]);
  useEffect(() => { runtime.previewImageRef.current = previewImage; }, [previewImage]);

  useReadiumReaderLifecycle(runtime, {
    book, reloadToken, onTocChange, setLoading, setLoadError,
    setPageCounter, setPreviewImage, setSaveStatus,
  });
  useReadiumReaderSettingsLayout(runtime, settings);
  useReadiumReaderResize(runtime, loading);
  useReadiumReaderRequests(runtime, tocTarget, seekRequest, loading);
  useReadiumReaderInput(runtime, previewImage, loading);

  const closePreview = () => {
    if (savingImage) return;
    setPreviewImage(null);
    setSaveStatus('');
  };
  const savePreviewImage = async () => {
    if (!previewImage) return;
    try {
      setSavingImage(true);
      setSaveStatus('');
      await saveImageFromSource(previewImage.src, previewImage.name);
      setSaveStatus('已保存');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingImage(false);
    }
  };
  const navigate = (direction: -1 | 1) => (event: React.MouseEvent | React.PointerEvent) => {
    event.stopPropagation();
    runtime.operations.navigatePage(direction);
  };

  return {
    chromeVisible,
    closePreview,
    containerRef: runtime.containerRef,
    goBackward: navigate(-1),
    goForward: navigate(1),
    loadError,
    loading,
    pageCounter,
    previewImage,
    resourceStripHostRef: runtime.resourceStripHostRef,
    retry: () => setReloadToken((value) => value + 1),
    savePreviewImage,
    saveStatus,
    savingImage,
    settings,
  };
}
