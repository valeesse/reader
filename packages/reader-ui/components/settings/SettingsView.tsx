import { useEffect, useState } from 'react';
import {
  clearCache as clearReaderCache,
  downloadReaderFontPack,
  downloadWebDavSnapshot,
  fileAssociationStatus,
  getCacheStats,
  openFileAssociationSettings,
  removeReaderFontPack,
  runtimeCapabilities,
  type FileAssociationStatus,
  type ReaderCacheStats,
  type ReaderFontPack,
  uploadWebDavSnapshot,
} from '../../lib/backend';
import { clearOptionalReaderFontStyles, installOptionalReaderFontStyles, refreshReaderFontPacks } from '../../lib/fontPacks';
import { cancelReaderIdle, ReaderIdleHandle, scheduleReaderIdle } from '../../lib/readerScheduler';
import { applySyncSnapshot, createSyncSnapshot } from '../../lib/storage';
import { useAppContext } from '../../store/AppStore';
import { defaultSettings, SyncSnapshot } from '../../types';
import {
  AppearanceSettingsSection,
  CacheSettingsSection,
  FileAssociationSettingsSection,
  FontPackSettingsSection,
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
  const [fontPacks, setFontPacks] = useState<ReaderFontPack[]>([]);
  const [fontPackBusyId, setFontPackBusyId] = useState<string>();
  const [fontPackStatus, setFontPackStatus] = useState('');
  const [association, setAssociation] = useState<FileAssociationStatus>();
  const [associationStatus, setAssociationStatus] = useState('');
  const [openingAssociationSettings, setOpeningAssociationSettings] = useState(false);

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

  useEffect(() => {
    if (!runtimeCapabilities.desktopShell) return;
    let active = true;
    const refreshAssociation = () => fileAssociationStatus()
      .then((value) => { if (active) setAssociation(value); })
      .catch((error) => { if (active) setAssociationStatus(error instanceof Error ? error.message : '读取文件关联状态失败。'); });
    void refreshReaderFontPacks()
      .then((packs) => {
        if (!active) return;
        setFontPacks(packs);
        return installOptionalReaderFontStyles(document);
      })
      .catch((error) => { if (active) setFontPackStatus(error instanceof Error ? error.message : '读取字体包失败。'); });
    void refreshAssociation();
    window.addEventListener('focus', refreshAssociation);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshAssociation);
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
  const refreshFonts = async () => {
    const packs = await refreshReaderFontPacks();
    setFontPacks(packs);
    clearOptionalReaderFontStyles(document);
    await installOptionalReaderFontStyles(document);
    return packs;
  };
  const handleDownloadFont = async (id: string) => {
    if (fontPackBusyId) return;
    setFontPackBusyId(id);
    setFontPackStatus('正在下载并校验字体包…');
    try {
      await downloadReaderFontPack(id);
      await refreshFonts();
      setFontPackStatus('字体包已安装，可在字体选择中使用。');
    } catch (error) {
      setFontPackStatus(error instanceof Error ? error.message : '字体包下载失败。');
    } finally {
      setFontPackBusyId(undefined);
    }
  };
  const handleRemoveFont = async (id: string) => {
    if (fontPackBusyId) return;
    const removing = fontPacks.find((pack) => pack.id === id);
    setFontPackBusyId(id);
    setFontPackStatus('');
    try {
      await removeReaderFontPack(id);
      await refreshFonts();
      if (removing && settings.fontFamily.includes(removing.family)) {
        await updateSettings({ fontFamily: defaultSettings.fontFamily });
      }
      setFontPackStatus('字体包已移除，阅读字体已回退到系统字体。');
    } catch (error) {
      setFontPackStatus(error instanceof Error ? error.message : '字体包移除失败。');
    } finally {
      setFontPackBusyId(undefined);
    }
  };
  const handleOpenAssociationSettings = async () => {
    setOpeningAssociationSettings(true);
    setAssociationStatus('');
    try {
      await openFileAssociationSettings();
      setAssociationStatus('请在 Windows 设置中分别选择 .epub 和 .txt 的默认应用；返回后状态会自动刷新。');
    } catch (error) {
      setAssociationStatus(error instanceof Error ? error.message : '无法打开系统设置。');
    } finally {
      setOpeningAssociationSettings(false);
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
            {runtimeCapabilities.desktopShell && (
              <FileAssociationSettingsSection
                association={association}
                status={associationStatus}
                opening={openingAssociationSettings}
                onOpenSettings={handleOpenAssociationSettings}
              />
            )}
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
            {runtimeCapabilities.desktopShell && (
              <FontPackSettingsSection
                packs={fontPacks}
                busyId={fontPackBusyId}
                status={fontPackStatus}
                onDownload={handleDownloadFont}
                onRemove={handleRemoveFont}
              />
            )}
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
