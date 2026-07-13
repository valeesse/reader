import React, { useState } from 'react';
import { useAppContext } from '../store/AppStore';
import { Cloud, Check, DownloadCloud, LoaderCircle, Moon, Plus, Sun, Monitor, Folder, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { applySyncSnapshot, createSyncSnapshot } from '../lib/storage';
import { downloadWebDavSnapshot, uploadWebDavSnapshot } from '../lib/native';
import { SyncSnapshot } from '../types';
import { READER_FONT_OPTIONS, READING_SETTING_LIMITS } from '../lib/readingSettings';

export function SettingsView({
  onAddFiles,
  scanMessage,
  isScanning,
}: {
  onAddFiles: () => Promise<void>,
  scanMessage?: string,
  isScanning?: boolean,
}) {
  const { settings, updateSettings, reloadState } = useAppContext();
  const [syncStatus, setSyncStatus] = useState('');

  const canSync = settings.webDavConfig.enabled && settings.webDavConfig.url.trim() && settings.webDavConfig.username.trim();

  const pushSync = async () => {
    try {
      setSyncStatus('正在上传同步快照...');
      const snapshot = await createSyncSnapshot();
      await uploadWebDavSnapshot(settings.webDavConfig, JSON.stringify(snapshot));
      setSyncStatus('已上传阅读进度、系列和偏好设置。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '上传失败。');
    }
  };

  const pullSync = async () => {
    try {
      setSyncStatus('正在下载同步快照...');
      const remoteSnapshot = await downloadWebDavSnapshot(settings.webDavConfig);
      if (!remoteSnapshot) {
        setSyncStatus('远端还没有同步数据。');
        return;
      }
      await applySyncSnapshot(JSON.parse(remoteSnapshot) as SyncSnapshot);
      await reloadState();
      setSyncStatus('已从 WebDAV 恢复同步数据。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '下载失败。');
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-white/70 dark:bg-[#121212]/70">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#1C1C1E] dark:text-white">偏好设置</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-8">
        
        {/* Library Section */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">内容库</h3>
          <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">本地书库</h4>
                  <p className="text-xs text-black/50 dark:text-white/50">添加本地文件夹以扫描书籍</p>
                </div>
              </div>
              <button 
                onClick={onAddFiles}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-blue-600 disabled:hover:bg-[#007AFF] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {isScanning ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isScanning ? '扫描中' : '添加路径'}
              </button>
            </div>
            {scanMessage && (
              <p className="mt-4 text-xs text-black/50 dark:text-white/50">{scanMessage}</p>
            )}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">外观</h3>
          <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-1 overflow-hidden shadow-sm">
            <div className="flex p-1">
              {[
                { value: 'light', label: '浅色', icon: Sun },
                { value: 'sepia', label: '护眼', icon: Monitor },
                { value: 'dark', label: '深色', icon: Moon }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateSettings({ theme: t.value as any })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    settings.theme === t.value 
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white'
                      : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="capitalize">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">排版与字体</h3>
          <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-[#1C1C1E] dark:text-white">分页版式</div>
                <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  {(['single', 'double'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ pageMode: mode })}
                      className={`flex-1 rounded-md py-1.5 text-xs ${settings.pageMode === mode ? 'bg-white dark:bg-[#3A3A3C]' : 'text-black/50 dark:text-white/50'}`}
                    >
                      {mode === 'single' ? '单页' : '双页'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-[#1C1C1E] dark:text-white">TXT 阅读流</div>
                <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  {(['paged', 'scroll'] as const).map((flow) => (
                    <button
                      key={flow}
                      onClick={() => updateSettings({ txtReadingFlow: flow })}
                      className={`flex-1 rounded-md py-1.5 text-xs ${settings.txtReadingFlow === flow ? 'bg-white dark:bg-[#3A3A3C]' : 'text-black/50 dark:text-white/50'}`}
                    >
                      {flow === 'paged' ? '翻页' : '滚动'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#1C1C1E] dark:text-white">字体选择</span>
                <span className="text-gray-500 text-xs">{settings.fontFamily.split(',')[0]}</span>
              </div>
              <select 
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
              >
                {READER_FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#1C1C1E] dark:text-white">字体大小</span>
                <span className="text-gray-500 text-xs">{settings.fontSize}px</span>
              </div>
              <input 
                type="range" {...READING_SETTING_LIMITS.fontSize}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-[#007AFF]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#1C1C1E] dark:text-white">行间距</span>
                <span className="text-gray-500 text-xs">{settings.lineHeight}</span>
              </div>
              <input 
                type="range" {...READING_SETTING_LIMITS.lineHeight}
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                className="w-full accent-[#007AFF]"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#1C1C1E] dark:text-white">段间距</span>
                <span className="text-gray-500 text-xs">{settings.paragraphSpacing}em</span>
              </div>
              <input 
                type="range" {...READING_SETTING_LIMITS.paragraphSpacing}
                value={settings.paragraphSpacing}
                onChange={(e) => updateSettings({ paragraphSpacing: parseFloat(e.target.value) })}
                className="w-full accent-[#007AFF]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-[#1C1C1E] dark:text-white">字间距</span>
                <span className="text-gray-500 text-xs">{settings.letterSpacing}em</span>
              </div>
              <input
                type="range" {...READING_SETTING_LIMITS.letterSpacing}
                value={settings.letterSpacing}
                onChange={(e) => updateSettings({ letterSpacing: parseFloat(e.target.value) })}
                className="w-full accent-[#007AFF]"
              />
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-[#1C1C1E] dark:text-white">页面空白</div>
              <div className="grid grid-cols-2 gap-3">
                {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
                  <label key={side} className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55">
                    <span className="w-8">{{ left: '左侧', right: '右侧', top: '顶部', bottom: '底部' }[side]}</span>
                    <input
                      type="number"
                      {...READING_SETTING_LIMITS.pageMargin}
                      value={settings.pageMargins[side]}
                      onChange={(event) => updateSettings({ pageMargins: { ...settings.pageMargins, [side]: Number(event.target.value) } })}
                      className="min-w-0 flex-1 rounded-lg bg-black/5 px-2 py-1.5 text-right outline-none dark:bg-white/5"
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Sync Section */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider pl-1">WebDAV 同步</h3>
          <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#1C1C1E] dark:text-white">进度同步</h4>
                  <p className="text-xs text-black/50 dark:text-white/50">跨设备同步阅读进度</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.webDavConfig.enabled}
                  onChange={(e) => updateSettings({ webDavConfig: { ...settings.webDavConfig, enabled: e.target.checked }})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#007AFF]"></div>
              </label>
            </div>

            <motion.div 
              initial={false}
              animate={{ height: settings.webDavConfig.enabled ? 'auto' : 0, opacity: settings.webDavConfig.enabled ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">服务器地址 URL</label>
                  <input 
                    type="url" 
                    placeholder="https://webdav.example.com"
                    value={settings.webDavConfig.url}
                    onChange={(e) => updateSettings({ webDavConfig: { ...settings.webDavConfig, url: e.target.value }})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
                  <input 
                    type="text" 
                    value={settings.webDavConfig.username}
                    onChange={(e) => updateSettings({ webDavConfig: { ...settings.webDavConfig, username: e.target.value }})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">密码 / 授权码</label>
                  <input 
                    type="password" 
                    value={settings.webDavConfig.password || ''}
                    onChange={(e) => updateSettings({ webDavConfig: { ...settings.webDavConfig, password: e.target.value }})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!canSync}
                    onClick={pushSync}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#007AFF] transition-colors mt-2 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" /> 上传
                  </button>
                  <button
                    disabled={!canSync}
                    onClick={pullSync}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-black/5 dark:bg-white/10 text-[#1C1C1E] dark:text-white rounded-lg text-sm font-medium hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40 transition-colors mt-2"
                  >
                    <DownloadCloud className="w-4 h-4" /> 下载
                  </button>
                </div>
                <button
                  onClick={() => setSyncStatus('配置已保存在本机。')}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-black/5 dark:bg-white/10 text-[#1C1C1E] dark:text-white rounded-lg text-sm font-medium hover:bg-black/10 dark:hover:bg-white/15 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" /> 保存配置
                </button>
                {syncStatus && (
                  <p className="text-xs text-black/50 dark:text-white/50">{syncStatus}</p>
                )}
              </div>
            </motion.div>

          </div>
        </section>

      </div>
    </div>
  );
}
