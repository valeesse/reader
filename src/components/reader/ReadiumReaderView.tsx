import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Check from 'lucide-react/dist/esm/icons/check.mjs';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs';
import Download from 'lucide-react/dist/esm/icons/download.mjs';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle.mjs';
import X from 'lucide-react/dist/esm/icons/x.mjs';
import type { useReadiumReader } from '../../lib/useReadiumReader';
import { ReaderLoadError, ReaderPageCounter } from './ReaderShared';

type ReadiumReaderViewProps = ReturnType<typeof useReadiumReader>;

export function ReadiumReaderView({
  chromeVisible,
  closePreview,
  containerRef,
  goBackward,
  goForward,
  loadError,
  loading,
  pageCounter,
  pageLabel,
  previewImage,
  resourceStripHostRef,
  retry,
  savePreviewImage,
  saveStatus,
  savingImage,
  settings,
}: ReadiumReaderViewProps) {
  if (loadError) return <ReaderLoadError message={loadError} onRetry={retry} />;

  return (
    <div className="group relative h-full w-full select-none overflow-hidden">
      <div
        className="absolute inset-0 box-border"
        style={{
          paddingLeft: `min(${settings.pageMargins.left}px, 18vw)`,
          paddingRight: `min(${settings.pageMargins.right}px, 18vw)`,
          paddingTop: `min(${settings.pageMargins.top}px, 30vh)`,
          paddingBottom: `min(${settings.pageMargins.bottom}px, 30vh)`,
        }}
      >
        <div className="relative h-full w-full min-h-0 min-w-0">
          <div ref={containerRef} className={`readium-container h-full w-full ${loading ? 'readium-initializing' : ''}`} />
          <div ref={resourceStripHostRef} className={`zenith-resource-strip-host ${loading ? 'zenith-resource-strip-initializing' : ''}`} aria-hidden="true" />
        </div>
      </div>

      <NavigationButton direction="backward" chromeVisible={chromeVisible} onClick={goBackward} />
      <NavigationButton direction="forward" chromeVisible={chromeVisible} onClick={goForward} />

      {pageLabel && (
        <div className={`absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-[5px] border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-black/55 shadow-sm backdrop-blur-xl transition-opacity dark:border-white/10 dark:bg-[#1C1C1E]/70 dark:text-white/55 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`}>
          {pageLabel}
        </div>
      )}

      <ReaderPageCounter value={pageCounter} />
      <ImagePreview
        image={previewImage}
        saving={savingImage}
        status={saveStatus}
        onClose={closePreview}
        onSave={savePreviewImage}
      />
    </div>
  );
}

function NavigationButton({
  chromeVisible,
  direction,
  onClick,
}: {
  chromeVisible: boolean;
  direction: 'backward' | 'forward';
  onClick: (event: React.MouseEvent | React.PointerEvent) => void;
}) {
  const backward = direction === 'backward';
  const Icon = backward ? ChevronLeft : ChevronRight;
  return (
    <div className={`pointer-events-none absolute ${backward ? 'left-3' : 'right-3'} top-1/2 z-40 -translate-y-1/2`}>
      <button
        className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-[5px] border border-black/10 bg-white/75 shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-[#1C1C1E]/75 ${chromeVisible ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
        onClick={onClick}
        onPointerDown={(event) => event.stopPropagation()}
        title={backward ? '上一页' : '下一页'}
      >
        <Icon className="h-5 w-5" />
      </button>
    </div>
  );
}

function ImagePreview({
  image,
  onClose,
  onSave,
  saving,
  status,
}: {
  image: { src: string; name: string } | null;
  onClose: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
  status: string;
}) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[92vh] max-w-[96vw]"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={image.src}
              alt={image.name}
              className="max-h-[86vh] max-w-[96vw] rounded-[5px] object-contain shadow-2xl"
              draggable={false}
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="flex h-10 items-center gap-2 rounded-[5px] border border-white/50 bg-white/88 px-3 text-sm font-medium text-[#1C1C1E] shadow-lg backdrop-blur-xl transition-all hover:bg-white active:scale-95 disabled:opacity-70"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : status === '已保存' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {status === '已保存' ? '已保存' : '保存'}
              </button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-white/50 bg-white/88 text-[#1C1C1E] shadow-lg backdrop-blur-xl transition-all hover:bg-white active:scale-95"
                title="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {status && status !== '已保存' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-[5px] bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                {status}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
