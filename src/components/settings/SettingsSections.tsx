import { Database, FilePlus2, Folder, LoaderCircle, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { AppSettings } from '../../types';
import type { ReaderCacheStats } from '../../lib/backend';
import { READER_FONT_OPTIONS, READING_SETTING_LIMITS } from '../../lib/readingSettings';
import { runtimeCapabilities } from '../../lib/backend';

type UpdateSettings = (settings: Partial<AppSettings>) => void;

export function LibrarySettingsSection({
  onRescan,
  onChangeLibraryRoot,
  onImportBooks,
  scanMessage,
  isScanning,
}: {
  onRescan: () => Promise<void>;
  onChangeLibraryRoot: () => Promise<void>;
  onImportBooks: () => Promise<void>;
  scanMessage?: string;
  isScanning?: boolean;
}) {
  return (
    <SettingsSection title="内容库">
      <div className="space-y-4">
        <div className="flex min-w-0 items-center gap-3">
          <SectionIcon><Folder className="w-5 h-5" /></SectionIcon>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">{runtimeCapabilities.mutableLibraryRoot ? '本地书库' : '服务器书库'}</h4>
            <p className="mt-0.5 text-xs leading-5 text-black/55 dark:text-white/55">{runtimeCapabilities.mutableLibraryRoot ? '选择书库目录并重新建立索引' : '目录由服务器固定配置，可重新建立索引'}</p>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
          {runtimeCapabilities.librarySources.includes('managed') && <ActionButton onClick={onImportBooks} disabled={isScanning}><FilePlus2 className="w-4 h-4" />导入</ActionButton>}
          {runtimeCapabilities.mutableLibraryRoot && <ActionButton onClick={onChangeLibraryRoot} disabled={isScanning}><Folder className="w-4 h-4" />更改目录</ActionButton>}
          <ActionButton onClick={onRescan} disabled={isScanning}>
            {isScanning ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}重新扫描
          </ActionButton>
        </div>
      </div>
      {scanMessage && <p className="mt-4 text-xs leading-5 text-black/60 dark:text-white/60" role="status">{scanMessage}</p>}
    </SettingsSection>
  );
}

export function CacheSettingsSection({
  stats,
  status,
  clearing,
  onClear,
}: {
  stats?: ReaderCacheStats;
  status: string;
  clearing: boolean;
  onClear: () => Promise<void>;
}) {
  return (
    <SettingsSection title="阅读缓存">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SectionIcon><Database className="w-5 h-5" /></SectionIcon>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">本地派生缓存</h4>
            <p className="text-xs text-black/50 dark:text-white/50">
              {stats ? `${formatBytes(stats.bytes)} · ${stats.files} 个文件 · 上限 ${formatBytes(stats.maxBytes)}` : '正在统计缓存…'}
            </p>
          </div>
        </div>
        <button onClick={onClear} disabled={clearing} className="flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-500/10 px-3 text-sm font-medium text-red-600 hover:bg-red-500/15 disabled:opacity-50 dark:text-red-400 sm:px-4">
          {clearing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}清理
        </button>
      </div>
      {status && <p className="mt-3 text-xs text-black/60 dark:text-white/60" role="status">{status}</p>}
    </SettingsSection>
  );
}

export function AppearanceSettingsSection({ settings, updateSettings }: { settings: AppSettings; updateSettings: UpdateSettings }) {
  return (
    <SettingsSection title="外观" compact>
      <div className="flex p-1">
        {[
          { value: 'light', label: '浅色', icon: Sun },
          { value: 'sepia', label: '护眼', icon: Monitor },
          { value: 'dark', label: '深色', icon: Moon },
        ].map((theme) => (
          <button key={theme.value} onClick={() => updateSettings({ theme: theme.value as AppSettings['theme'] })} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${settings.theme === theme.value ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <theme.icon className="w-4 h-4" />{theme.label}
          </button>
        ))}
      </div>
    </SettingsSection>
  );
}

export function ReadingDefaultsSection({ settings, updateSettings }: { settings: AppSettings; updateSettings: UpdateSettings }) {
  return (
    <SettingsSection title="排版与字体">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceGroup label="分页版式" options={[['single', '单页'], ['double', '双页']]} value={settings.pageMode} disabledValue={settings.pageTurnAnimation === 'scroll' ? 'double' : undefined} onChange={(pageMode) => updateSettings({ pageMode: pageMode as AppSettings['pageMode'] })} />
        <ChoiceGroup label="翻页动画" options={[['scroll', '连续滚动'], ['minimal', '极简切换'], ['slide-horizontal', '左右滑动'], ['slide-vertical', '上下滑动']]} value={settings.pageTurnAnimation} onChange={(pageTurnAnimation) => updateSettings(pageTurnAnimation === 'scroll' ? { pageTurnAnimation, pageMode: 'single' } : { pageTurnAnimation: pageTurnAnimation as AppSettings['pageTurnAnimation'] })} />
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#1C1C1E] dark:text-white">字体选择</span>
        <select value={settings.fontFamily} onChange={(event) => updateSettings({ fontFamily: event.target.value })} className="w-full bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2 text-sm outline-none" style={{ fontFamily: settings.fontFamily }}>
          {READER_FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <RangeSetting label="字体大小" value={settings.fontSize} unit="px" limits={READING_SETTING_LIMITS.fontSize} onChange={(fontSize) => updateSettings({ fontSize })} />
      <RangeSetting label="行间距" value={settings.lineHeight} limits={READING_SETTING_LIMITS.lineHeight} onChange={(lineHeight) => updateSettings({ lineHeight })} />
      <RangeSetting label="段间距" value={settings.paragraphSpacing} unit="em" limits={READING_SETTING_LIMITS.paragraphSpacing} onChange={(paragraphSpacing) => updateSettings({ paragraphSpacing })} />
      <RangeSetting label="字间距" value={settings.letterSpacing} unit="em" limits={READING_SETTING_LIMITS.letterSpacing} onChange={(letterSpacing) => updateSettings({ letterSpacing })} />
      <div className="space-y-3">
        <div className="text-sm font-medium text-[#1C1C1E] dark:text-white">页面空白</div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <MarginInput label="水平" value={settings.pageMargins.left} limits={READING_SETTING_LIMITS.horizontalMargin} onChange={(horizontal) => updateSettings({ pageMargins: { ...settings.pageMargins, left: horizontal, right: horizontal } })} />
          <MarginInput label="顶部" value={settings.pageMargins.top} onChange={(top) => updateSettings({ pageMargins: { ...settings.pageMargins, top } })} />
          <MarginInput label="底部" value={settings.pageMargins.bottom} onChange={(bottom) => updateSettings({ pageMargins: { ...settings.pageMargins, bottom } })} />
        </div>
      </div>
    </SettingsSection>
  );
}

function SettingsSection({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return <section className="space-y-3"><h3 className="pl-1 text-xs font-semibold text-black/55 dark:text-white/55">{title}</h3><div className={`app-card ${compact ? 'p-1' : 'space-y-6 p-4 sm:p-5'}`}>{children}</div></section>;
}
function SectionIcon({ children }: { children: React.ReactNode }) { return <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">{children}</div>; }
function ActionButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className="flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-black/5 px-3 text-sm font-medium hover:bg-black/10 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/15 sm:px-4">{children}</button>; }
function ChoiceGroup({ label, options, value, disabledValue, onChange }: { label: string; options: readonly (readonly [string, string])[]; value: string; disabledValue?: string; onChange: (value: string) => void }) { return <div className="space-y-2"><div className="text-sm font-medium text-[#1C1C1E] dark:text-white">{label}</div><div className="grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">{options.map(([option, text]) => <button key={option} disabled={option === disabledValue} aria-pressed={value === option} onClick={() => onChange(option)} className={`min-h-9 rounded-lg px-2 py-1.5 text-xs disabled:opacity-35 ${value === option ? 'bg-white font-medium shadow-sm dark:bg-[#3A3A3C]' : 'text-black/60 dark:text-white/60'}`}>{text}</button>)}</div>{disabledValue && <p className="text-[11px] leading-4 text-black/50 dark:text-white/50">连续滚动模式仅支持单页布局。</p>}</div>; }
function RangeSetting({ label, value, unit = '', limits, onChange }: { label: string; value: number; unit?: string; limits: { min: number; max: number; step: number }; onChange: (value: number) => void }) { return <label className="block space-y-3"><div className="flex justify-between text-sm"><span className="font-medium text-[#1C1C1E] dark:text-white">{label}</span><span className="text-gray-500 text-xs">{value}{unit}</span></div><input type="range" {...limits} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#007AFF]" /></label>; }
function MarginInput({ label, value, limits = READING_SETTING_LIMITS.pageMargin, onChange }: { label: string; value: number; limits?: { min: number; max: number; step: number }; onChange: (value: number) => void }) { return <label className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55"><span className="w-8">{label}</span><input type="number" {...limits} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 rounded-lg bg-black/5 px-2 py-1.5 text-right outline-none dark:bg-white/5" /></label>; }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`; if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`; return `${(bytes / 1024 ** 3).toFixed(1)} GB`; }
