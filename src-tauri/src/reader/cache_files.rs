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

