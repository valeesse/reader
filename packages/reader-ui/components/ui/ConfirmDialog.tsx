import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-2xl border border-black/10 bg-[#FFFDF9] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.24)] dark:border-white/10 dark:bg-[#1C1C1E] sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === 'danger' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-[#087DF1]/10 text-[#087DF1]'}`}>
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-[#1C1C1E] dark:text-white">{title}</h2>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">{description}</p>
          </div>
          <button onClick={onCancel} disabled={busy} aria-label="关闭" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} disabled={busy} className="h-10 rounded-xl bg-black/5 px-4 text-sm font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15">
            取消
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={busy}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#087DF1] hover:bg-[#006ED6]'}`}
          >
            {busy ? '处理中…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
