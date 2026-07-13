#[tauri::command]
async fn scan_library(app: AppHandle, path: String) -> Result<Vec<NativeBook>, String> {
    tauri::async_runtime::spawn_blocking(move || scan_library_blocking(app, PathBuf::from(path)))
        .await
        .map_err(|err| format!("扫描任务中断: {err}"))?
}

fn scan_library_blocking(app: AppHandle, root: PathBuf) -> Result<Vec<NativeBook>, String> {
    if !root.exists() || !root.is_dir() {
        return Err("路径不存在或不是文件夹".into());
    }

    let mut visited = 0usize;
    let mut matched = 0usize;
    let mut books = Vec::new();

    for entry in WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
    {
        visited += 1;
        if !entry.file_type().is_file() {
            if visited.is_multiple_of(500) {
                emit_scan_progress(&app, visited, matched, entry.path());
            }
            continue;
        }

        let path = entry.path();
        let ext = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        if ext != "epub" && ext != "txt" {
            if visited.is_multiple_of(500) {
                emit_scan_progress(&app, visited, matched, path);
            }
            continue;
        }

        matched += 1;
        emit_scan_progress(&app, visited, matched, path);

        books.push(native_book_from_path(&app, path, &ext, "external")?);
    }

    books.sort_by(|a, b| a.title.cmp(&b.title));
    let _ = app.emit(
        "library-scan://complete",
        ScanProgress {
            visited,
            matched,
            current_path: String::new(),
        },
    );
    Ok(books)
}

#[tauri::command]
async fn import_managed_books(app: AppHandle, paths: Vec<String>) -> Result<Vec<NativeBook>, String> {
    tauri::async_runtime::spawn_blocking(move || import_managed_books_blocking(&app, paths))
        .await
        .map_err(|error| format!("导入任务中断: {error}"))?
}

#[tauri::command]
async fn identify_local_books(paths: Vec<String>) -> Result<Vec<BookIdentity>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        paths
            .into_iter()
            .filter_map(|path| {
                let source = PathBuf::from(&path);
                if supported_book_extension(&source).is_err() || !source.is_file() {
                    return None;
                }
                let fingerprint = book_fingerprint(&source).ok()?;
                Some(BookIdentity {
                    path: path.clone(),
                    local_resource_id: fingerprint.clone(),
                    fingerprint,
                })
            })
            .collect::<Vec<_>>()
    })
    .await
    .map_err(|error| format!("书籍身份迁移中断: {error}"))
}

fn import_managed_books_blocking(app: &AppHandle, paths: Vec<String>) -> Result<Vec<NativeBook>, String> {
    let library_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("books");
    fs::create_dir_all(&library_dir).map_err(|error| format!("创建托管书库失败: {error}"))?;
    let mut books = Vec::new();
    for source_value in paths {
        let source = PathBuf::from(source_value);
        if !source.is_file() {
            return Err("导入源不是有效文件".to_string());
        }
        let extension = supported_book_extension(&source)?;
        let fingerprint = book_fingerprint(&source)?;
        let fingerprint_key = fingerprint.trim_start_matches("sha256:");
        let target = library_dir.join(format!("{fingerprint_key}.{extension}"));
        if !target.is_file() {
            let temp = temporary_sibling_path(&target);
            fs::copy(&source, &temp).map_err(|error| format!("复制书籍失败: {error}"))?;
            replace_file_atomically(&temp, &target)?;
        }
        books.push(native_book_from_path_with_fingerprint(
            app,
            &target,
            &source,
            &extension,
            "managed",
            fingerprint,
        )?);
    }
    Ok(books)
}

fn supported_book_extension(path: &Path) -> Result<String, String> {
    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    if matches!(extension.as_str(), "epub" | "txt") {
        Ok(extension)
    } else {
        Err("仅支持 EPUB 和 TXT 文件".to_string())
    }
}

fn native_book_from_path(
    app: &AppHandle,
    path: &Path,
    extension: &str,
    source: &str,
) -> Result<NativeBook, String> {
    native_book_from_path_with_fingerprint(
        app,
        path,
        path,
        extension,
        source,
        book_fingerprint(path)?,
    )
}

fn native_book_from_path_with_fingerprint(
    app: &AppHandle,
    path: &Path,
    metadata_path: &Path,
    extension: &str,
    source: &str,
    fingerprint: String,
) -> Result<NativeBook, String> {
    let id = stable_book_id(path);
    let (title, author, cover, series_name, series_index) = if extension == "epub" {
        parse_epub_metadata(app, path, &id).unwrap_or_else(|_| {
            let (title, author) = parse_filename_metadata(metadata_path);
            (title, author, None, None, None)
        })
    } else {
        let (title, author) = parse_filename_metadata(metadata_path);
        (title, author, None, None, None)
    };
    let path_value = path.to_string_lossy().to_string();
    Ok(NativeBook {
        id,
        title,
        author,
        cover,
        book_type: extension.to_string(),
        path: path_value.clone(),
        local_resource_id: fingerprint.clone(),
        fingerprint,
        file_name: metadata_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .to_string(),
        series_name,
        series_index,
        added_at: now_millis(),
        source: source.to_string(),
    })
}

fn emit_scan_progress(app: &AppHandle, visited: usize, matched: usize, path: &Path) {
    let _ = app.emit(
        "library-scan://progress",
        ScanProgress {
            visited,
            matched,
            current_path: path.to_string_lossy().to_string(),
        },
    );
}

impl ReaderState {
    fn new_session_id(&self, prefix: &str) -> String {
        let id = self.next_session_id.fetch_add(1, Ordering::Relaxed);
        format!("{prefix}-{}-{id}", now_millis_u128())
    }
}
