import { useEffect, useState } from 'react';
import { runtimeCapabilities } from '../../lib/backend';
import { clearReaderCache, downloadWebDavSnapshot, getReaderCacheStats, ReaderCacheStats, uploadWebDavSnapshot } from '../../lib/native';
import { cancelReaderIdle, ReaderIdleHandle, scheduleReaderIdle } from '../../lib/readerScheduler';
import { applySyncSnapshot, createSyncSnapshot } from '../../lib/storage';
import { useAppContext } from '../../store/AppStore';
import { SyncSnapshot } from '../../types';
import {
  AppearanceSettingsSection,
  CacheSettingsSection,
  LibrarySettingsSection,
  ReadingDefaultsSection,
} from './SettingsSections';
import { WebDavSettingsSection } from './WebDavSettingsSection';

export function SettingsView({
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
  const { settings, updateSettings, reloadState } = useAppContext();
  const [syncStatus, setSyncStatus] = useState('');
  const [cacheStats, setCacheStats] = useState<ReaderCacheStats>();
  const [cacheStatus, setCacheStatus] = useState('');
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    let idleId: ReaderIdleHandle | undefined;
    const timerId = window.setTimeout(() => {
      idleId = scheduleReaderIdle(() => getReaderCacheStats().then(setCacheStats).catch(() => {}), { timeout: 1500 });
    }, 4000);
    return () => {
      window.clearTimeout(timerId);
      cancelReaderIdle(idleId);
    };
  }, []);

  const pushSync = async () => {
    try {
      setSyncStatus('正在上传同步快照...');
      await uploadWebDavSnapshot(settings.webDavConfig, JSON.stringify(await createSyncSnapshot()));
      setSyncStatus('已上传阅读进度、系列和偏好设置。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '上传失败。');
    }
  };
  const pullSync = async () => {
    try {
      setSyncStatus('正在下载同步快照...');
      const remote = await downloadWebDavSnapshot(settings.webDavConfig);
      if (!remote) return setSyncStatus('远端还没有同步数据。');
      await applySyncSnapshot(JSON.parse(remote) as SyncSnapshot);
      await reloadState();
      setSyncStatus('已从 WebDAV 恢复同步数据。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '下载失败。');
    }
  };
  const clearCache = async () => {
    setClearingCache(true);
    setCacheStatus('');
    try {
      await clearReaderCache();
      setCacheStats(await getReaderCacheStats());
      setCacheStatus('阅读缓存已清理；书籍原文件不会被删除。');
    } catch (error) {
      setCacheStatus(error instanceof Error ? error.message : '缓存清理失败。');
    } finally {
      setClearingCache(false);
    }
  };
  const canSync = Boolean(settings.webDavConfig.enabled && settings.webDavConfig.url.trim() && settings.webDavConfig.username.trim());

  return (
    <div className="flex-1 flex flex-col relative bg-white/70 dark:bg-[#121212]/70">
      <header className="h-14 border-b border-black/5 dark:border-white/5 flex items-center px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#1C1C1E] dark:text-white">偏好设置</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-8">
        <LibrarySettingsSection {...{ onRescan, onChangeLibraryRoot, scanMessage, isScanning }} />
        <CacheSettingsSection stats={cacheStats} status={cacheStatus} clearing={clearingCache} onClear={clearCache} />
        <AppearanceSettingsSection settings={settings} updateSettings={updateSettings} />
        <ReadingDefaultsSection settings={settings} updateSettings={updateSettings} />
        {runtimeCapabilities.webDav && (
          <WebDavSettingsSection
            settings={settings}
            updateSettings={updateSettings}
            canSync={canSync}
            syncStatus={syncStatus}
            onPush={pushSync}
            onPull={pullSync}
            onSave={() => setSyncStatus('配置已保存在本机。')}
          />
        )}
      </div>
    </div>
  );
}
