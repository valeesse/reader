#[tauri::command]
async fn reader_cache_stats(
    state: tauri::State<'_, ReaderState>,
) -> Result<reader_core::ReaderCacheStats, String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.cache_stats())
        .await
        .map_err(|error| format!("阅读缓存统计任务中断: {error}"))?
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn clear_reader_cache(state: tauri::State<'_, ReaderState>) -> Result<(), String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.clear_cache())
        .await
        .map_err(|error| format!("阅读缓存清理任务中断: {error}"))?
        .map_err(|error| error.to_string())
}

fn temporary_sibling_path(target: &Path) -> PathBuf {
    let file_name = target.file_name().and_then(|name| name.to_str()).unwrap_or("cache");
    target.with_file_name(format!(
        ".{file_name}.{}-{}-{}.tmp",
        std::process::id(), now_millis_u128(), TEMP_FILE_COUNTER.fetch_add(1, Ordering::Relaxed)
    ))
}

fn replace_file_atomically(temp: &Path, target: &Path) -> Result<(), String> {
    if !target.exists() { return fs::rename(temp, target).map_err(|error| format!("提交文件失败: {error}")); }
    let backup = target.with_extension(format!("backup-{}", TEMP_FILE_COUNTER.fetch_add(1, Ordering::Relaxed)));
    fs::rename(target, &backup).map_err(|error| format!("暂存旧文件失败: {error}"))?;
    match fs::rename(temp, target) {
        Ok(()) => { let _ = fs::remove_file(backup); Ok(()) }
        Err(error) => { let _ = fs::rename(backup, target); let _ = fs::remove_file(temp); Err(format!("提交文件失败: {error}")) }
    }
}

fn write_atomic(target: &Path, bytes: &[u8]) -> Result<(), String> {
    let temp = temporary_sibling_path(target);
    fs::write(&temp, bytes).map_err(|error| format!("写入临时文件失败: {error}"))?;
    replace_file_atomically(&temp, target)
}

fn hash_string(value: &str) -> String {
    let mut hasher = Sha256::new(); hasher.update(value.as_bytes());
    hasher.finalize().iter().take(16).map(|byte| format!("{byte:02x}")).collect()
}
