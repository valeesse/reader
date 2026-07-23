const OPEN_FILES_AVAILABLE_EVENT: &str = "open-files://available";

fn supported_book_path(path: &Path) -> bool {
    path.extension()
        .and_then(|value| value.to_str())
        .map(|value| matches!(value.to_ascii_lowercase().as_str(), "epub" | "txt"))
        .unwrap_or(false)
}

fn canonical_book_path(path: PathBuf, cwd: &Path) -> Option<PathBuf> {
    let candidate = if path.is_absolute() { path } else { cwd.join(path) };
    if !supported_book_path(&candidate) {
        return None;
    }
    let canonical = fs::canonicalize(candidate).ok()?;
    let metadata = fs::metadata(&canonical).ok()?;
    metadata.is_file().then_some(canonical)
}

fn same_queued_path(left: &Path, right: &Path) -> bool {
    #[cfg(windows)]
    {
        left.to_string_lossy().eq_ignore_ascii_case(&right.to_string_lossy())
    }
    #[cfg(not(windows))]
    {
        left == right
    }
}

fn queue_open_file_arguments<I>(state: &ReaderState, arguments: I, cwd: &Path) -> usize
where
    I: IntoIterator<Item = PathBuf>,
{
    let Ok(mut pending) = state.pending_open_files.lock() else {
        return 0;
    };
    let mut queued = 0;
    for argument in arguments {
        let Some(path) = canonical_book_path(argument, cwd) else {
            continue;
        };
        if pending.iter().any(|existing| same_queued_path(existing, &path)) {
            continue;
        }
        pending.push_back(path);
        queued += 1;
    }
    queued
}

#[tauri::command]
fn drain_pending_open_files(state: tauri::State<'_, ReaderState>) -> Result<Vec<String>, String> {
    let mut pending = state
        .pending_open_files
        .lock()
        .map_err(|_| "待打开文件队列被占用".to_string())?;
    Ok(pending
        .drain(..)
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}
