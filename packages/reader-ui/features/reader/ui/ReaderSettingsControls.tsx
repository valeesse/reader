import React, { useEffect, useRef, useState } from 'react';
import AlignJustify from 'lucide-react/dist/esm/icons/align-justify.mjs';
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right.mjs';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down.mjs';
import Zap from 'lucide-react/dist/esm/icons/zap.mjs';
import { motion } from 'motion/react';
import { READING_SETTING_LIMITS } from '../../../lib/readingSettings';

export function PanelLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium text-black/40 dark:text-white/40">{children}</div>;
}

export function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="reader-settings-card border border-black/[0.055] bg-white/82 p-3.5 shadow-[0_1px_1px_rgba(0,0,0,0.02)] dark:border-white/[0.065] dark:bg-white/[0.045]">
      <h3 className="mb-3 px-0.5 text-[11px] font-semibold tracking-[0.08em] text-black/45 dark:text-white/45">{title}</h3>
      {children}
    </section>
  );
}

export const PAGE_TURN_OPTIONS = [
  { value: 'scroll', label: '连续滚动', description: '上下连续滚动加载', icon: AlignJustify },
  { value: 'minimal', label: '极简切换', description: '直接重新加载文字', icon: Zap },
  { value: 'slide-horizontal', label: '左右滑动', description: '页面整体左右平滑切换', icon: ArrowLeftRight },
  { value: 'slide-vertical', label: '上下滑动', description: '页面整体上下平滑切换', icon: ArrowUpDown },
] as const;

export function Segmented({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`reader-settings-segmented gap-1 bg-black/[0.045] p-1 dark:bg-black/20 ${className}`}>{children}</div>;
}

export function SegmentButton({
  active,
  children,
  onClick,
  title,
  layoutId,
  disabled = false,
}: {
  active: boolean,
  children: React.ReactNode,
  onClick: () => void,
  title: string,
  layoutId: string,
  disabled?: boolean,
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`reader-settings-option relative flex h-10 flex-1 items-center justify-center gap-2 border border-transparent transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35 ${
        active ? 'text-[#1C1C1E] dark:text-white' : 'text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="reader-settings-option-active absolute inset-0 border border-black/[0.045] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:border-white/[0.07] dark:bg-white/[0.11]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  unit?: string,
  onChange: (value: number) => void,
}) {
  const [draft, setDraft] = useState(value);
  const commitTimerRef = useRef<number | null>(null);
  const pendingValueRef = useRef(value);

  useEffect(() => {
    setDraft(value);
    pendingValueRef.current = value;
  }, [value]);
  useEffect(() => () => {
    if (commitTimerRef.current !== null) window.clearTimeout(commitTimerRef.current);
  }, []);

  const scheduleCommit = (next: number) => {
    setDraft(next);
    pendingValueRef.current = next;
    if (commitTimerRef.current !== null) return;
    commitTimerRef.current = window.setTimeout(() => {
      commitTimerRef.current = null;
      onChange(pendingValueRef.current);
    }, 32);
  };
  const commitNow = () => {
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    onChange(pendingValueRef.current);
  };

  return (
    <label className="flex items-center gap-3 px-0.5 py-3">
      <span className="w-14 text-xs font-medium text-black/55 dark:text-white/55">{label}</span>
      <input type="range" min={min} max={max} step={step} value={draft} onChange={(event) => scheduleCommit(parseFloat(event.target.value))} onPointerUp={commitNow} onKeyUp={commitNow} className="reader-setting-range min-w-0 flex-1" style={{ '--range-progress': `${((draft - min) / (max - min)) * 100}%` } as React.CSSProperties} />
      <span className="w-12 text-right text-xs tabular-nums text-black/45 dark:text-white/45">
        {Number.isInteger(draft) ? draft : draft.toFixed(step < 0.1 ? 2 : 1)}{unit}
      </span>
    </label>
  );
}

export function MarginInput({
  label,
  value,
  limits = READING_SETTING_LIMITS.pageMargin,
  onChange,
}: {
  label: string,
  value: number,
  limits?: { min: number, max: number, step: number },
  onChange: (value: number) => void,
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) onChange(parsed);
    else setDraft(String(value));
  };
  return (
    <label className="reader-settings-input flex items-center justify-between border border-black/[0.055] bg-black/[0.025] px-3 py-2.5 dark:border-white/[0.065] dark:bg-white/[0.035]">
      <span className="text-xs font-medium text-black/55 dark:text-white/55">{label}</span>
      <span className="flex items-baseline gap-1">
        <input type="number" min={limits.min} max={limits.max} step={limits.step} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-[3ch] bg-transparent text-right text-xs tabular-nums outline-none" />
        <span className="text-xs text-black/35 dark:text-white/35">px</span>
      </span>
    </label>
  );
}
