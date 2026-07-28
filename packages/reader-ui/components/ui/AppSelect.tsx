import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Check from 'lucide-react/dist/esm/icons/check.mjs';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.mjs';

export interface AppSelectOption<T extends string = string> {
  value: T;
  label: string;
  fontFamily?: string;
}

export function AppSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
  menuClassName = '',
  autoFocus = false,
}: {
  value: T;
  options: readonly AppSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  menuClassName?: string;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
  }>();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(undefined);
      return;
    }
    const positionMenu = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 8;
      const gap = 6;
      const desiredHeight = 256;
      const below = window.innerHeight - rect.bottom - viewportPadding - gap;
      const above = rect.top - viewportPadding - gap;
      const openBelow = below >= Math.min(desiredHeight, above);
      const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
      setMenuPosition({
        left: Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - width - viewportPadding),
        width,
        top: openBelow ? rect.bottom + gap : undefined,
        bottom: openBelow ? undefined : window.innerHeight - rect.top + gap,
        maxHeight: Math.max(96, Math.min(desiredHeight, openBelow ? below : above)),
      });
    };
    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open]);

  const moveSelection = (offset: number) => {
    const currentIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const next = options[(currentIndex + offset + options.length) % options.length];
    if (next) onChange(next.value);
  };

  return (
    <div ref={rootRef} className={`app-select relative ${className}`}>
      <button
        type="button"
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) setOpen(true);
            else moveSelection(event.key === 'ArrowDown' ? 1 : -1);
          }
        }}
        className="app-select-trigger flex h-full w-full items-center gap-2 rounded-xl border border-black/[0.06] bg-black/[0.035] px-3 text-left text-inherit outline-none transition hover:bg-black/[0.06] focus-visible:border-[#087DF1]/45 dark:border-white/[0.08] dark:bg-white/[0.07] dark:hover:bg-white/[0.11]"
        style={selected?.fontFamily ? { fontFamily: selected.fontFamily } : undefined}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-black/40 transition-transform dark:text-white/45 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`app-select-menu fixed z-[120] overflow-y-auto rounded-xl border border-black/[0.08] bg-[#FFFEFA]/98 p-1.5 text-[#1C1C1E] shadow-[0_16px_42px_rgba(40,36,30,0.18)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-[#262824]/98 dark:text-[#F2F2ED] dark:shadow-[0_18px_48px_rgba(0,0,0,0.42)] ${menuClassName}`}
          style={menuPosition}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'bg-[#087DF1]/12 text-[#087DF1] dark:bg-[#0A84FF]/18 dark:text-[#69ADFF]'
                    : 'hover:bg-black/[0.055] dark:hover:bg-white/[0.085]'
                }`}
                style={option.fontFamily ? { fontFamily: option.fontFamily } : undefined}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <Check className={`h-4 w-4 shrink-0 ${active ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
