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

        let id = stable_book_id(path);
        let (title, author, cover, series_name, series_index) = if ext == "epub" {
            parse_epub_metadata(&app, path, &id).unwrap_or_else(|_| {
                let (title, author) = parse_filename_metadata(path);
                (title, author, None, None, None)
            })
        } else {
            let (title, author) = parse_filename_metadata(path);
            (title, author, None, None, None)
        };

        books.push(NativeBook {
            id,
            title,
            author,
            cover,
            book_type: ext,
            path: path.to_string_lossy().to_string(),
            file_name: path
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or_default()
                .to_string(),
            series_name,
            series_index,
            added_at: now_millis(),
        });
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

