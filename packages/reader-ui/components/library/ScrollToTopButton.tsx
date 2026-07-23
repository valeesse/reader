import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      title="返回顶部"
      aria-label="返回顶部"
      className="absolute bottom-5 right-5 z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-[#FBFAF7]/95 text-[#1C1C1E] shadow-[0_8px_24px_rgba(35,40,33,0.14)] backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-[#171916]/95 dark:text-white dark:hover:bg-[#22251f] sm:bottom-7 sm:right-7"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
