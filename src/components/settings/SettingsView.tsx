import { useEffect, useState } from 'react';
import { clearCache as clearReaderCache, downloadWebDavSnapshot, getCacheStats, runtimeCapabilities, type ReaderCacheStats, uploadWebDavSnapshot } from '../../lib/backend';
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
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function SettingsView({
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
  const { settings, updateSettings, reloadState } = useAppContext();
  const [syncStatus, setSyncStatus] = useState('');
  const [cacheStats, setCacheStats] = useState<ReaderCacheStats>();
  const [cacheStatus, setCacheStatus] = useState('');
  const [clearingCache, setClearingCache] = useState(false);
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null);
  const [confirmPull, setConfirmPull] = useState(false);
  const [confirmPush, setConfirmPush] = useState(false);
  const [confirmCacheClear, setConfirmCacheClear] = useState(false);

  useEffect(() => {
    let idleId: ReaderIdleHandle | undefined;
    const timerId = window.setTimeout(() => {
      idleId = scheduleReaderIdle(() => getCacheStats().then(setCacheStats).catch(() => {}), { timeout: 1500 });
    }, 4000);
    return () => {
      window.clearTimeout(timerId);
      cancelReaderIdle(idleId);
    };
  }, []);

  const pushSync = async () => {
    if (syncing) return;
    try {
      setSyncing('push');
      setSyncStatus('正在上传同步快照...');
      await uploadWebDavSnapshot(settings.webDavConfig, JSON.stringify(await createSyncSnapshot()));
      setSyncStatus('已上传阅读进度、系列和偏好设置。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '上传失败。');
    } finally {
      setSyncing(null);
    }
  };
  const pullSync = async () => {
    if (syncing) return;
    try {
      setSyncing('pull');
      setSyncStatus('正在下载同步快照...');
      const remote = await downloadWebDavSnapshot(settings.webDavConfig);
      if (!remote) return setSyncStatus('远端还没有同步数据。');
      await applySyncSnapshot(JSON.parse(remote) as SyncSnapshot);
      await reloadState();
      setSyncStatus('已从 WebDAV 恢复同步数据。');
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '下载失败。');
    } finally {
      setSyncing(null);
      setConfirmPull(false);
    }
  };
  const handleClearCache = async () => {
    setClearingCache(true);
    setCacheStatus('');
    try {
      await clearReaderCache();
      setCacheStats(await getCacheStats());
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
      <header className="min-h-14 border-b border-black/5 px-4 py-2 dark:border-white/5 sm:px-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">偏好设置</h1>
        <p className="hidden text-xs text-black/55 dark:text-white/55 sm:block">设置会自动保存在当前设备</p>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:p-6 lg:p-8">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 min-[1400px]:grid-cols-2 min-[1400px]:gap-8">
          <div className="space-y-6">
            <LibrarySettingsSection {...{ onRescan, onChangeLibraryRoot, onImportBooks, scanMessage, isScanning }} />
            <CacheSettingsSection stats={cacheStats} status={cacheStatus} clearing={clearingCache} onClear={async () => setConfirmCacheClear(true)} />
            {runtimeCapabilities.librarySources.includes('webdav') && (
              <WebDavSettingsSection
                settings={settings}
                updateSettings={updateSettings}
                canSync={canSync}
                syncStatus={syncStatus}
                syncing={syncing}
                onPush={async () => setConfirmPush(true)}
                onPull={() => setConfirmPull(true)}
              />
            )}
          </div>
          <div className="space-y-6">
            <AppearanceSettingsSection settings={settings} updateSettings={updateSettings} />
            <ReadingDefaultsSection settings={settings} updateSettings={updateSettings} />
          </div>
        </div>
      </div>
      {confirmPull && (
        <ConfirmDialog
          title="从远端恢复同步数据？"
          description="远端快照将更新本机的阅读进度、系列关系和偏好设置。建议确认当前设备的状态已经上传，或不再需要保留。"
          confirmLabel="恢复远端数据"
          tone="primary"
          busy={syncing === 'pull'}
          onCancel={() => setConfirmPull(false)}
          onConfirm={pullSync}
        />
      )}
      {confirmPush && (
        <ConfirmDialog
          title="上传本机同步状态？"
          description="本机的阅读进度、系列关系和偏好设置将写入远端快照，并替换远端现有版本。书籍文件不会上传。"
          confirmLabel="上传本机状态"
          tone="primary"
          busy={syncing === 'push'}
          onCancel={() => setConfirmPush(false)}
          onConfirm={async () => {
            await pushSync();
            setConfirmPush(false);
          }}
        />
      )}
      {confirmCacheClear && (
        <ConfirmDialog
          title="清理阅读缓存？"
          description="将删除可重新生成的索引与派生资源，书籍原文件、阅读进度和偏好设置不会被删除。下次打开书籍时可能需要重新准备。"
          confirmLabel="清理缓存"
          busy={clearingCache}
          onCancel={() => setConfirmCacheClear(false)}
          onConfirm={async () => {
            await handleClearCache();
            setConfirmCacheClear(false);
          }}
        />
      )}
    </div>
  );
}
