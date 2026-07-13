#[tauri::command]
async fn open_txt_book(app: AppHandle, path: String) -> Result<TxtBookInfo, String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        open_txt_book_blocking(&task_app, &state, path)
    })
    .await
    .map_err(|err| format!("TXT 打开任务中断: {err}"))?
}

#[tauri::command]
async fn read_txt_preview(path: String, max_chars: usize) -> Result<TxtPreview, String> {
    tauri::async_runtime::spawn_blocking(move || read_txt_preview_blocking(&path, max_chars))
        .await
        .map_err(|err| format!("TXT 预读任务中断: {err}"))?
}

fn read_txt_preview_blocking(path: &str, max_chars: usize) -> Result<TxtPreview, String> {
    let mut file = File::open(path).map_err(|error| format!("打开 TXT 预读源失败: {error}"))?;
    let mut bytes = Vec::with_capacity(256 * 1024);
    std::io::Read::by_ref(&mut file)
        .take(256 * 1024)
        .read_to_end(&mut bytes)
        .map_err(|error| format!("读取 TXT 预览失败: {error}"))?;
    let (text, encoding) = if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        (UTF_8.decode(&bytes[3..]).0.into_owned(), "utf-8")
    } else if bytes.starts_with(&[0xFF, 0xFE]) {
        (UTF_16LE.decode(&bytes[2..]).0.into_owned(), "utf-16le")
    } else if bytes.starts_with(&[0xFE, 0xFF]) {
        (UTF_16BE.decode(&bytes[2..]).0.into_owned(), "utf-16be")
    } else if std::str::from_utf8(&bytes).is_ok() {
        (UTF_8.decode(&bytes).0.into_owned(), "utf-8")
    } else {
        (GBK.decode(&bytes).0.into_owned(), "gbk")
    };
    Ok(TxtPreview {
        text: text.chars().take(max_chars.clamp(1, 24_000)).collect(),
        encoding: encoding.to_string(),
    })
}

fn open_txt_book_blocking(
    app: &AppHandle,
    state: &ReaderState,
    path: String,
) -> Result<TxtBookInfo, String> {
    let signature = file_signature(&path)?;
    let should_reload = {
        let books = state
            .txt_books
            .lock()
            .map_err(|_| "TXT 缓存被占用".to_string())?;
        cache_requires_reload(&books, &path, signature)
    };

    if should_reload {
        let loaded = load_txt_book(app, &path, signature)?;
        let mut books = state
            .txt_books
            .lock()
            .map_err(|_| "TXT 缓存被占用".to_string())?;
        if cache_requires_reload(&books, &path, signature) {
            books.insert(path.clone(), loaded);
        }
    }

    let session_id = state.new_session_id("txt");
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    let cache = books
        .get_mut(&path)
        .ok_or_else(|| "TXT 缓存初始化失败".to_string())?;
    start_book_session(cache, session_id.clone());
    let info = TxtBookInfo {
        session_id,
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        chapters: cache.chapters.clone(),
    };
    trim_book_cache(&mut books, TXT_BOOK_CACHE_LIMIT);
    Ok(info)
}

#[tauri::command]
async fn read_txt_window(
    app: AppHandle,
    path: String,
    session_id: String,
    start: usize,
    end: usize,
) -> Result<TxtTextWindow, String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        read_txt_window_blocking(&state, &path, &session_id, start, end)
    })
    .await
    .map_err(|err| format!("TXT 窗口读取任务中断: {err}"))?
}

fn read_txt_window_blocking(
    state: &ReaderState,
    path: &str,
    session_id: &str,
    start: usize,
    end: usize,
) -> Result<TxtTextWindow, String> {
    let signature = file_signature(path)?;
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    let cache = books
        .get_mut(path)
        .ok_or_else(|| "TXT 尚未打开".to_string())?;
    validate_book_session(cache, signature, session_id, "TXT")?;
    let start = start.min(cache.total_chars);
    let end = end.max(start).min(cache.total_chars);
    let text = read_txt_char_range(cache, start, end)?;

    Ok(TxtTextWindow { start, end, text })
}

#[tauri::command]
fn close_txt_book(
    state: tauri::State<'_, ReaderState>,
    path: String,
    session_id: String,
) -> Result<(), String> {
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    if let Some(cache) = books.get_mut(&path) {
        close_book_session(cache, &session_id);
    }
    trim_book_cache(&mut books, TXT_BOOK_CACHE_LIMIT);
    Ok(())
}
