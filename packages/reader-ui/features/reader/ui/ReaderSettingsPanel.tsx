import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.mjs';
import Columns2 from 'lucide-react/dist/esm/icons/columns-2.mjs';
import Monitor from 'lucide-react/dist/esm/icons/monitor.mjs';
import Moon from 'lucide-react/dist/esm/icons/moon.mjs';
import Sun from 'lucide-react/dist/esm/icons/sun.mjs';
import { motion } from 'motion/react';
import { AppSettings } from '../../../types';
import { READER_FONT_OPTIONS, READING_SETTING_LIMITS } from '../../../lib/readingSettings';
import {
  MarginInput,
  PAGE_TURN_OPTIONS,
  PanelLabel,
  SegmentButton,
  Segmented,
  SettingsSection,
  SliderRow,
} from './ReaderSettingsControls';

export function ReaderSettingsPanel({
  settings,
  updateSettings,
}: {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 8, y: -6, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
      style={{ transformOrigin: 'bottom center' }}
      role="dialog"
      aria-label="阅读设置"
      className="reader-settings-panel absolute inset-x-0 bottom-0 z-50 max-h-[82vh] w-full overflow-y-auto rounded-t-3xl border border-black/[0.08] bg-[#F7F7F5]/96 shadow-2xl backdrop-blur-2xl dark:border-white/[0.09] dark:bg-[#171816]/96 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-16 sm:max-h-[calc(100vh-92px)] sm:w-[min(410px,calc(100vw-32px))] sm:rounded-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="sticky top-0 z-20 border-b border-black/[0.06] bg-[#F7F7F5]/90 px-5 py-4 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#171816]/90">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#1C1C1E] dark:text-white">阅读设置</h2>
      </div>
      <div className="space-y-3 p-4">
        <SettingsSection title="主题">
          <Segmented className="grid grid-cols-3">
            {[
              { value: 'light', icon: Sun, label: '浅色' },
              { value: 'sepia', icon: Monitor, label: '护眼' },
              { value: 'dark', icon: Moon, label: '深色' },
            ].map((item) => (
              <SegmentButton key={item.value} active={settings.theme === item.value} onClick={() => updateSettings({ theme: item.value as AppSettings['theme'] })} title={item.label} layoutId="reader-theme-segment">
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </SegmentButton>
            ))}
          </Segmented>
        </SettingsSection>
        <SettingsSection title="阅读方式">
          <div className="space-y-3">
            <div>
              <PanelLabel>页面布局</PanelLabel>
              <Segmented className="mt-2 grid grid-cols-2">
                <SegmentButton active={settings.pageMode === 'single'} onClick={() => updateSettings({ pageMode: 'single' })} title="单页" layoutId="reader-page-segment">
                  <BookOpen className="w-4 h-4" /><span className="text-xs">单页</span>
                </SegmentButton>
                <SegmentButton active={settings.pageMode === 'double'} onClick={() => updateSettings({ pageMode: 'double' })} disabled={settings.pageTurnAnimation === 'scroll'} title="双页" layoutId="reader-page-segment">
                  <Columns2 className="w-4 h-4" /><span className="text-xs">双页</span>
                </SegmentButton>
              </Segmented>
            </div>
            <div className="h-px bg-black/[0.055] dark:bg-white/[0.07]" />
            <div>
              <PanelLabel>翻页动画</PanelLabel>
              <Segmented className="mt-2 grid grid-cols-2">
                {PAGE_TURN_OPTIONS.map((item) => (
                  <SegmentButton key={item.value} active={settings.pageTurnAnimation === item.value} onClick={() => updateSettings(item.value === 'scroll' ? { pageTurnAnimation: item.value, pageMode: 'single' } : { pageTurnAnimation: item.value })} title={item.description} layoutId="reader-page-turn-segment">
                    <item.icon className="w-4 h-4" /><span className="text-xs">{item.label}</span>
                  </SegmentButton>
                ))}
              </Segmented>
            </div>
          </div>
        </SettingsSection>
        <SettingsSection title="文字排版">
          <div className="relative">
            <select value={settings.fontFamily} onChange={(event) => updateSettings({ fontFamily: event.target.value })} className="reader-settings-select h-11 w-full appearance-none border border-black/[0.06] bg-black/[0.035] px-3 pr-10 text-sm text-[#1C1C1E] outline-none transition focus:border-[#007AFF]/40 focus:ring-2 focus:ring-[#007AFF]/15 dark:border-white/[0.07] dark:bg-white/[0.055] dark:text-white" style={{ fontFamily: settings.fontFamily }}>
              {READER_FONT_OPTIONS.map((option) => <option key={option.value} value={option.value} style={{ fontFamily: option.value, fontSize: '14px' }}>{option.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
          </div>
          <div className="mt-3 divide-y divide-black/[0.055] dark:divide-white/[0.07]">
            <SliderRow label="文字大小" value={settings.fontSize} {...READING_SETTING_LIMITS.fontSize} unit="px" onChange={(fontSize) => updateSettings({ fontSize })} />
            <SliderRow label="段间距" value={settings.paragraphSpacing} {...READING_SETTING_LIMITS.paragraphSpacing} unit="em" onChange={(paragraphSpacing) => updateSettings({ paragraphSpacing })} />
            <SliderRow label="行间距" value={settings.lineHeight} {...READING_SETTING_LIMITS.lineHeight} onChange={(lineHeight) => updateSettings({ lineHeight })} />
            <SliderRow label="字间距" value={settings.letterSpacing} {...READING_SETTING_LIMITS.letterSpacing} unit="em" onChange={(letterSpacing) => updateSettings({ letterSpacing })} />
          </div>
        </SettingsSection>
        <SettingsSection title="页面留白">
          <div className="grid grid-cols-2 gap-2">
            <MarginInput label="水平" value={settings.pageMargins.left} limits={READING_SETTING_LIMITS.horizontalMargin} onChange={(horizontal) => updateSettings({ pageMargins: { ...settings.pageMargins, left: horizontal, right: horizontal } })} />
            <MarginInput label="垂直" value={(settings.pageMargins.top + settings.pageMargins.bottom) / 2} onChange={(vertical) => updateSettings({ pageMargins: { ...settings.pageMargins, top: vertical, bottom: vertical } })} />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-black/35 dark:text-white/35">水平留白同时作为双页模式的中缝宽度。</p>
        </SettingsSection>
      </div>
    </motion.div>
  );
}
