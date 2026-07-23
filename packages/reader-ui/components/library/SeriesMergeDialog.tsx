import { GitMerge, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Series } from '../../types';

export function SeriesMergeDialog({
  source,
  series,
  onMerge,
  onCancel,
}: {
  source: Series;
  series: Series[];
  onMerge: (targetId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const targets = useMemo(() => series.filter((item) => item.id !== source.id), [series, source.id]);
  const [targetId, setTargetId] = useState(targets[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled)');
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel]);

  const submit = async () => {
    if (!targetId || busy) return;
    setBusy(true);
    try {
      await onMerge(targetId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="merge-dialog-title" className="w-full max-w-md rounded-2xl border border-black/10 bg-[#FFFDF9] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.24)] dark:border-white/10 dark:bg-[#1C1C1E] sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087DF1]/10 text-[#087DF1]"><GitMerge className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 id="merge-dialog-title" className="text-base font-semibold text-[#1C1C1E] dark:text-white">合并“{source.name}”</h2>
            <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">选择目标系列。当前系列关系会被移除，书籍文件不会受到影响。</p>
          </div>
          <button onClick={onCancel} disabled={busy} aria-label="关闭" className="flex h-9 w-9 items-center justify-center rounded-xl text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <label className="mt-5 block space-y-2 text-sm font-medium">
          合并到
          <select ref={selectRef} value={targetId} onChange={(event) => setTargetId(event.target.value)} className="h-11 w-full rounded-xl border border-black/10 bg-black/[0.035] px-3 text-sm dark:border-white/10 dark:bg-white/10">
            {targets.map((item) => <option key={item.id} value={item.id}>{item.name}（{item.bookIds.length} 本）</option>)}
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="h-10 rounded-xl bg-black/5 px-4 text-sm font-medium hover:bg-black/10 dark:bg-white/10">取消</button>
          <button onClick={() => void submit()} disabled={!targetId || busy} className="h-10 rounded-xl bg-[#087DF1] px-4 text-sm font-semibold text-white hover:bg-[#006ED6] disabled:opacity-50">{busy ? '正在合并…' : '确认合并'}</button>
        </div>
      </section>
    </div>
  );
}
