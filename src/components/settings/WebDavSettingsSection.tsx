import { Check, Cloud, DownloadCloud, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { AppSettings } from '../../types';

export function WebDavSettingsSection({
  settings,
  updateSettings,
  canSync,
  syncStatus,
  onPush,
  onPull,
  onSave,
}: {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  canSync: boolean;
  syncStatus: string;
  onPush: () => Promise<void>;
  onPull: () => Promise<void>;
  onSave: () => void;
}) {
  const config = settings.webDavConfig;
  const updateConfig = (value: Partial<typeof config>) => updateSettings({ webDavConfig: { ...config, ...value } });
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">WebDAV 同步</h3>
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]"><Cloud className="w-5 h-5" /></div>
            <div><h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">进度同步</h4><p className="text-xs text-black/50 dark:text-white/50">跨设备同步阅读进度</p></div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={config.enabled} onChange={(event) => updateConfig({ enabled: event.target.checked })} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]" />
          </label>
        </div>
        <motion.div initial={false} animate={{ height: config.enabled ? 'auto' : 0, opacity: config.enabled ? 1 : 0 }} className="overflow-hidden">
          <div className="pt-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
            <Field label="服务器地址 URL" type="url" value={config.url} placeholder="https://webdav.example.com" onChange={(url) => updateConfig({ url })} />
            <Field label="用户名" value={config.username} onChange={(username) => updateConfig({ username })} />
            <Field label="密码 / 授权码" type="password" value={config.password || ''} onChange={(password) => updateConfig({ password })} />
            <div className="grid grid-cols-2 gap-3">
              <button disabled={!canSync} onClick={onPush} className="flex items-center justify-center gap-2 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium disabled:opacity-40"><UploadCloud className="w-4 h-4" />上传</button>
              <button disabled={!canSync} onClick={onPull} className="flex items-center justify-center gap-2 py-2 bg-black/5 dark:bg-white/10 rounded-lg text-sm font-medium disabled:opacity-40"><DownloadCloud className="w-4 h-4" />下载</button>
            </div>
            <button onClick={onSave} className="flex items-center justify-center gap-2 w-full py-2 bg-black/5 dark:bg-white/10 rounded-lg text-sm font-medium"><Check className="w-4 h-4" />保存配置</button>
            {syncStatus && <p className="text-xs text-black/50 dark:text-white/50">{syncStatus}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span><input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-black/5 dark:bg-white/5 rounded-lg px-3 py-2 text-sm outline-none" /></label>;
}
