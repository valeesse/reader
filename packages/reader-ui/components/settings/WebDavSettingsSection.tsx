import { Cloud, DownloadCloud, Eye, EyeOff, LoaderCircle, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { AppSettings } from '../../types';

export function WebDavSettingsSection({
  settings,
  updateSettings,
  canSync,
  syncStatus,
  syncing,
  onPush,
  onPull,
}: {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  canSync: boolean;
  syncStatus: string;
  syncing: 'push' | 'pull' | null;
  onPush: () => Promise<void>;
  onPull: () => void;
}) {
  const config = settings.webDavConfig;
  const [showPassword, setShowPassword] = useState(false);
  const updateConfig = (value: Partial<typeof config>) => updateSettings({ webDavConfig: { ...config, ...value } });
  return (
    <section className="space-y-3">
      <h3 className="pl-1 text-xs font-semibold text-black/55 dark:text-white/55">WebDAV 同步</h3>
      <div className="app-card space-y-4 p-4 sm:p-5">
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
            <Field label="密码 / 授权码" type={showPassword ? 'text' : 'password'} value={config.password || ''} onChange={(password) => updateConfig({ password })} trailing={
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="flex h-8 w-8 items-center justify-center rounded-lg text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10" aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            } />
            <div className="grid grid-cols-2 gap-3">
              <button disabled={!canSync || Boolean(syncing)} onClick={() => void onPush()} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#087DF1] px-2 text-sm font-medium text-white disabled:opacity-40">{syncing === 'push' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}上传本机状态</button>
              <button disabled={!canSync || Boolean(syncing)} onClick={onPull} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-black/5 px-2 text-sm font-medium disabled:opacity-40 dark:bg-white/10">{syncing === 'pull' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}恢复远端状态</button>
            </div>
            <p className="text-[11px] leading-5 text-black/50 dark:text-white/50">连接配置会自动保存在当前设备；同步快照不会包含密码。</p>
            {syncStatus && <p className="text-xs text-black/60 dark:text-white/60" role="status">{syncStatus}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, trailing }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; trailing?: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span><span className="flex h-11 items-center rounded-xl bg-black/5 pr-1 dark:bg-white/5"><input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />{trailing}</span></label>;
}
