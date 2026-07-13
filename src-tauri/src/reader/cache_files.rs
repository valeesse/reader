fn file_signature(path: &str) -> Result<FileSignature, String> {
    let metadata = fs::metadata(path).map_err(|err| format!("读取文件信息失败: {err}"))?;
    let modified_ns = metadata
        .modified()
        .unwrap_or(UNIX_EPOCH)
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    Ok(FileSignature {
        len: metadata.len(),
        modified_ns,
    })
}

fn reader_cache_dir(app: &AppHandle, name: &str) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("reader-cache")
        .join(name);
    fs::create_dir_all(&dir).map_err(|err| format!("创建阅读缓存失败: {err}"))?;
    Ok(dir)
}

fn trim_reader_disk_cache(app: &AppHandle, max_bytes: u64) -> Result<(), String> {
    let app_cache = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?;
    trim_cache_directories(
        &[app_cache.join("reader-cache"), app_cache.join("epub-resources")],
        max_bytes,
    )
}

#[cfg(test)]
fn trim_cache_directory(root: &Path, max_bytes: u64) -> Result<(), String> {
    trim_cache_directories(&[root.to_path_buf()], max_bytes)
}

fn trim_cache_directories(roots: &[PathBuf], max_bytes: u64) -> Result<(), String> {
    let mut files = roots
        .iter()
        .filter(|root| root.is_dir())
        .flat_map(|root| WalkDir::new(root).into_iter())
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .filter_map(|entry| {
            let metadata = entry.metadata().ok()?;
            let modified = metadata.modified().unwrap_or(UNIX_EPOCH);
            Some((entry.into_path(), metadata.len(), modified))
        })
        .collect::<Vec<_>>();
    let mut total = files.iter().map(|(_, len, _)| *len).sum::<u64>();
    if total <= max_bytes {
        return Ok(());
    }
    files.sort_by_key(|(_, _, modified)| *modified);
    for (path, len, _) in files {
        if total <= max_bytes {
            break;
        }
        if fs::remove_file(path).is_ok() {
            total = total.saturating_sub(len);
        }
    }
    Ok(())
}

fn reader_cache_roots(app: &AppHandle) -> Result<Vec<PathBuf>, String> {
    let app_cache = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?;
    Ok(vec![
        app_cache.join("reader-cache"),
        app_cache.join("epub-resources"),
    ])
}

#[tauri::command]
async fn reader_cache_stats(app: AppHandle) -> Result<ReaderCacheStats, String> {
    tauri::async_runtime::spawn_blocking(move || reader_cache_stats_blocking(&app))
        .await
        .map_err(|error| format!("阅读缓存统计任务中断: {error}"))?
}

fn reader_cache_stats_blocking(app: &AppHandle) -> Result<ReaderCacheStats, String> {
    let mut bytes = 0u64;
    let mut files = 0usize;
    for root in reader_cache_roots(app)? {
        if !root.is_dir() {
            continue;
        }
        for entry in WalkDir::new(root).into_iter().filter_map(Result::ok) {
            if !entry.file_type().is_file() {
                continue;
            }
            if let Ok(metadata) = entry.metadata() {
                bytes = bytes.saturating_add(metadata.len());
                files += 1;
            }
        }
    }
    Ok(ReaderCacheStats {
        bytes,
        files,
        max_bytes: reader_disk_cache_max_bytes(),
    })
}

#[tauri::command]
async fn clear_reader_cache(app: AppHandle) -> Result<(), String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        clear_reader_cache_blocking(&task_app, &state)
    })
    .await
    .map_err(|error| format!("阅读缓存清理任务中断: {error}"))?
}

fn clear_reader_cache_blocking(app: &AppHandle, state: &ReaderState) -> Result<(), String> {
    let mut txt_books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    let mut epub_books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    if txt_books.values().any(|book| !book.active_sessions.is_empty())
        || epub_books
            .values()
            .any(|book| !book.active_sessions.is_empty())
    {
        return Err("请先退出阅读页面再清理缓存".to_string());
    }
    txt_books.clear();
    epub_books.clear();
    for root in reader_cache_roots(app)? {
        if root.exists() {
            fs::remove_dir_all(&root).map_err(|error| format!("清理阅读缓存失败: {error}"))?;
        }
    }
    Ok(())
}

fn txt_index_cache_path(app: &AppHandle, path: &str) -> Result<PathBuf, String> {
    Ok(reader_cache_dir(app, "txt-index")?.join(format!("{}.json", hash_string(path))))
}

fn txt_data_cache_path(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Result<PathBuf, String> {
    Ok(reader_cache_dir(app, "txt-data")?.join(format!(
        "{}-{}-{}.utf8",
        hash_string(path),
        signature.len,
        signature.modified_ns
    )))
}

fn epub_metadata_cache_path(app: &AppHandle, path: &str) -> Result<PathBuf, String> {
    Ok(reader_cache_dir(app, "epub-metadata")?.join(format!("{}.json", hash_string(path))))
}

fn temporary_sibling_path(target: &Path) -> PathBuf {
    let file_name = target
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("cache");
    target.with_file_name(format!(
        ".{file_name}.{}-{}-{}.tmp",
        std::process::id(),
        now_millis_u128(),
        TEMP_FILE_COUNTER.fetch_add(1, Ordering::Relaxed)
    ))
}

fn replace_file_atomically(temp: &Path, target: &Path) -> Result<(), String> {
    match fs::rename(temp, target) {
        Ok(()) => Ok(()),
        Err(_) if target.exists() => {
            let _ = fs::remove_file(temp);
            Ok(())
        }
        Err(error) => {
            let _ = fs::remove_file(temp);
            Err(format!("提交阅读缓存失败: {error}"))
        }
    }
}

fn write_atomic(target: &Path, bytes: &[u8]) -> Result<(), String> {
    let temp = temporary_sibling_path(target);
    fs::write(&temp, bytes).map_err(|error| format!("写入阅读缓存失败: {error}"))?;
    if target.exists() {
        fs::remove_file(target).map_err(|error| format!("替换阅读缓存失败: {error}"))?;
    }
    replace_file_atomically(&temp, target)
}

fn clean_old_txt_data_cache_files(app: &AppHandle, path: &str, signature: FileSignature) {
    let Ok(current) = txt_data_cache_path(app, path, signature) else {
        return;
    };
    let Some(root) = current.parent() else {
        return;
    };
    let prefix = format!("{}-", hash_string(path));
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };
    for entry in entries.filter_map(Result::ok) {
        if entry.path() == current {
            continue;
        }
        if entry.file_name().to_string_lossy().starts_with(&prefix) {
            let _ = fs::remove_file(entry.path());
        }
    }
}

fn epub_resource_cache_dir(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Result<PathBuf, String> {
    let root = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("epub-resources");
    fs::create_dir_all(&root).map_err(|err| format!("创建 EPUB 资源缓存失败: {err}"))?;
    Ok(root.join(format!(
        "{}-{}-{}",
        hash_string(path),
        signature.len,
        signature.modified_ns
    )))
}

fn save_epub_resource_file(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    href: &str,
    resource: &EpubCachedResource,
) -> Option<PathBuf> {
    let file_path =
        epub_resource_file_path(app, path, signature, href, &resource.media_type).ok()?;
    if file_path.exists() {
        return Some(file_path);
    }
    let temp = temporary_sibling_path(&file_path);
    fs::write(&temp, resource.bytes.as_ref()).ok()?;
    replace_file_atomically(&temp, &file_path).ok()?;
    Some(file_path)
}

fn epub_resource_file_path(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    href: &str,
    media_type: &str,
) -> Result<PathBuf, String> {
    let dir = epub_resource_cache_dir(app, path, signature)?;
    fs::create_dir_all(&dir).map_err(|error| format!("创建 EPUB 资源缓存失败: {error}"))?;
    let extension = resource_extension(href, media_type);
    Ok(dir.join(format!("{}.{}", hash_string(href), extension)))
}

fn clean_old_epub_resource_cache_dirs(app: &AppHandle, path: &str, signature: FileSignature) {
    let Ok(current_dir) = epub_resource_cache_dir(app, path, signature) else {
        return;
    };
    let Some(root) = current_dir.parent().map(Path::to_path_buf) else {
        return;
    };
    let book_prefix = format!("{}-", hash_string(path));
    let current_name = current_dir.file_name().map(|name| name.to_os_string());
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };
    for entry in entries.filter_map(Result::ok) {
        let entry_name = entry.file_name();
        let entry_name = entry_name.to_string_lossy();
        if !entry_name.starts_with(&book_prefix) {
            continue;
        }
        if current_name
            .as_ref()
            .map(|name| entry_name.as_ref() == name.to_string_lossy())
            .unwrap_or(false)
        {
            continue;
        }
        let _ = fs::remove_dir_all(entry.path());
    }
}

fn resource_extension(href: &str, media_type: &str) -> String {
    Path::new(strip_fragment(href).as_str())
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.to_ascii_lowercase())
        .filter(|extension| !extension.is_empty())
        .unwrap_or_else(|| {
            mime_guess::get_mime_extensions_str(media_type)
                .and_then(|extensions| extensions.first().copied())
                .unwrap_or("bin")
                .to_string()
        })
}

fn hash_string(value: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(value.as_bytes());
    let digest = hasher.finalize();
    digest
        .iter()
        .take(16)
        .map(|byte| format!("{byte:02x}"))
        .collect()
}
