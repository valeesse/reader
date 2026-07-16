import { Database, Folder, LoaderCircle, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { AppSettings } from '../../types';
import { ReaderCacheStats } from '../../lib/native';
import { READER_FONT_OPTIONS, READING_SETTING_LIMITS } from '../../lib/readingSettings';
import { runtimeCapabilities } from '../../lib/backend';

type UpdateSettings = (settings: Partial<AppSettings>) => void;

export function LibrarySettingsSection({
  onRescan,
  onChangeLibraryRoot,
  scanMessage,
  isScanning,
}: {
  onRescan: () => Promise<void>;
  onChangeLibraryRoot: () => Promise<void>;
  scanMessage?: string;
  isScanning?: boolean;
}) {
  return (
    <SettingsSection title="内容库">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SectionIcon><Folder className="w-5 h-5" /></SectionIcon>
          <div>
            <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">{runtimeCapabilities.libraryRootMutable ? '本地书库' : '服务器书库'}</h4>
            <p className="text-xs text-black/50 dark:text-white/50">{runtimeCapabilities.libraryRootMutable ? '选择书库目录并重新建立索引' : '目录由服务器固定配置，可重新建立索引'}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {runtimeCapabilities.libraryRootMutable && <ActionButton onClick={onChangeLibraryRoot} disabled={isScanning}><Folder className="w-4 h-4" />更改目录</ActionButton>}
          <ActionButton onClick={onRescan} disabled={isScanning}>
            {isScanning ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}重新扫描
          </ActionButton>
        </div>
      </div>
      {scanMessage && <p className="mt-4 text-xs text-black/50 dark:text-white/50">{scanMessage}</p>}
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <SectionIcon><Database className="w-5 h-5" /></SectionIcon>
          <div>
            <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">本地派生缓存</h4>
            <p className="text-xs text-black/50 dark:text-white/50">
              {stats ? `${formatBytes(stats.bytes)} · ${stats.files} 个文件 · 上限 ${formatBytes(stats.maxBytes)}` : '正在统计缓存…'}
            </p>
          </div>
        </div>
        <button onClick={onClear} disabled={clearing} className="flex items-center justify-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/15 disabled:opacity-50">
          {clearing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}清理
        </button>
      </div>
      {status && <p className="mt-3 text-xs text-black/50 dark:text-white/50">{status}</p>}
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
      <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
          <MarginInput label="水平" value={settings.pageMargins.left} limits={READING_SETTING_LIMITS.horizontalMargin} onChange={(horizontal) => updateSettings({ pageMargins: { ...settings.pageMargins, left: horizontal, right: horizontal } })} />
          <MarginInput label="顶部" value={settings.pageMargins.top} onChange={(top) => updateSettings({ pageMargins: { ...settings.pageMargins, top } })} />
          <MarginInput label="底部" value={settings.pageMargins.bottom} onChange={(bottom) => updateSettings({ pageMargins: { ...settings.pageMargins, bottom } })} />
        </div>
      </div>
    </SettingsSection>
  );
}

function SettingsSection({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return <section className="space-y-3"><h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">{title}</h3><div className={`bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm ${compact ? 'p-1' : 'p-5 space-y-6'}`}>{children}</div></section>;
}
function SectionIcon({ children }: { children: React.ReactNode }) { return <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">{children}</div>; }
function ActionButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/10 disabled:opacity-60 px-4 py-2 rounded-lg text-sm font-medium">{children}</button>; }
function ChoiceGroup({ label, options, value, disabledValue, onChange }: { label: string; options: readonly (readonly [string, string])[]; value: string; disabledValue?: string; onChange: (value: string) => void }) { return <div className="space-y-2"><div className="text-sm font-medium text-[#1C1C1E] dark:text-white">{label}</div><div className="grid grid-cols-2 rounded-lg bg-black/5 p-1 dark:bg-white/5">{options.map(([option, text]) => <button key={option} disabled={option === disabledValue} onClick={() => onChange(option)} className={`rounded-md py-1.5 text-xs disabled:opacity-35 ${value === option ? 'bg-white dark:bg-[#3A3A3C]' : 'text-black/50 dark:text-white/50'}`}>{text}</button>)}</div></div>; }
function RangeSetting({ label, value, unit = '', limits, onChange }: { label: string; value: number; unit?: string; limits: { min: number; max: number; step: number }; onChange: (value: number) => void }) { return <label className="block space-y-3"><div className="flex justify-between text-sm"><span className="font-medium text-[#1C1C1E] dark:text-white">{label}</span><span className="text-gray-500 text-xs">{value}{unit}</span></div><input type="range" {...limits} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#007AFF]" /></label>; }
function MarginInput({ label, value, limits = READING_SETTING_LIMITS.pageMargin, onChange }: { label: string; value: number; limits?: { min: number; max: number; step: number }; onChange: (value: number) => void }) { return <label className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55"><span className="w-8">{label}</span><input type="number" {...limits} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 rounded-lg bg-black/5 px-2 py-1.5 text-right outline-none dark:bg-white/5" /></label>; }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`; if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`; return `${(bytes / 1024 ** 3).toFixed(1)} GB`; }
