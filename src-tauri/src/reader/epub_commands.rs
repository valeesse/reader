#[tauri::command]
async fn open_epub_book(
    app: AppHandle,
    path: String,
    fallback_title: String,
) -> Result<EpubOpenResult, String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        open_epub_book_blocking(&task_app, &state, path, fallback_title)
    })
    .await
    .map_err(|err| format!("EPUB 打开任务中断: {err}"))?
}

fn open_epub_book_blocking(
    app: &AppHandle,
    state: &ReaderState,
    path: String,
    fallback_title: String,
) -> Result<EpubOpenResult, String> {
    let signature = file_signature(&path)?;
    clean_old_epub_resource_cache_dirs(app, &path, signature);
    let should_reload = {
        let books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        cache_requires_reload(&books, &path, signature)
    };

    if should_reload {
        let (manifest_items, info) = load_epub_book_from_persistent_cache(app, &path, signature)
            .unwrap_or_else(|| load_epub_book(&path, &fallback_title))?;
        let loaded = EpubBookCache {
            signature,
            last_used_at: now_millis_u128(),
            active_sessions: HashSet::new(),
            info,
            manifest_items,
            resource_cache: HashMap::new(),
            resource_order: VecDeque::new(),
            resource_bytes: 0,
            archive: open_epub_archive(&path)?,
        };
        save_epub_book_to_persistent_cache(app, &path, &loaded);
        let mut books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        if cache_requires_reload(&books, &path, signature) {
            books.insert(path.clone(), loaded);
        }
    }

    let session_id = state.new_session_id("epub");
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let cache = books
        .get_mut(&path)
        .ok_or_else(|| "EPUB 缓存初始化失败".to_string())?;
    start_book_session(cache, session_id.clone());
    let result = EpubOpenResult {
        session_id,
        book: cache.info.clone(),
    };
    trim_book_cache(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(result)
}

#[tauri::command]
async fn read_epub_resource(
    app: AppHandle,
    path: String,
    session_id: String,
    href: String,
) -> Result<EpubResourcePayload, String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        read_epub_resource_blocking(&task_app, &state, &path, &session_id, &href)
    })
    .await
    .map_err(|err| format!("EPUB 资源读取任务中断: {err}"))?
}

fn read_epub_resource_blocking(
    app: &AppHandle,
    state: &ReaderState,
    path: &str,
    session_id: &str,
    href: &str,
) -> Result<EpubResourcePayload, String> {
    validate_epub_session(state, path, session_id)?;
    let normalized_href = strip_fragment(&normalize_zip_path(href));
    let signature = file_signature(path)?;
    if let Some((media_type, file_path)) =
        existing_epub_binary_resource(app, state, path, signature, &normalized_href)
    {
        return Ok(EpubResourcePayload {
            href: normalized_href,
            media_type,
            text: None,
            base64: None,
            file_path: Some(file_path.to_string_lossy().to_string()),
        });
    }

    let resource = read_cached_epub_resource(state, path, &normalized_href)?;
    if is_epub_text_resource(&resource.media_type) {
        let (text, _, _) = UTF_8.decode(resource.bytes.as_ref());
        Ok(EpubResourcePayload {
            href: normalized_href,
            media_type: resource.media_type,
            text: Some(text.into_owned()),
            base64: None,
            file_path: None,
        })
    } else {
        if let Some(file_path) =
            save_epub_resource_file(app, path, signature, &normalized_href, &resource)
        {
            return Ok(EpubResourcePayload {
                href: normalized_href,
                media_type: resource.media_type,
                text: None,
                base64: None,
                file_path: Some(file_path.to_string_lossy().to_string()),
            });
        }

        Ok(EpubResourcePayload {
            href: normalized_href,
            media_type: resource.media_type,
            text: None,
            base64: Some(general_purpose::STANDARD.encode(resource.bytes.as_ref())),
            file_path: None,
        })
    }
}

#[tauri::command]
async fn prefetch_epub_resources(
    app: AppHandle,
    path: String,
    session_id: String,
    hrefs: Vec<String>,
) -> Result<(), String> {
    let task_app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let state = task_app.state::<ReaderState>();
        prefetch_epub_resources_blocking(&task_app, &state, &path, &session_id, hrefs)
    })
    .await
    .map_err(|err| format!("EPUB 预取任务中断: {err}"))?
}

#[tauri::command]
fn close_epub_book(
    state: tauri::State<'_, ReaderState>,
    path: String,
    session_id: String,
) -> Result<(), String> {
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    if let Some(cache) = books.get_mut(&path) {
        close_book_session(cache, &session_id);
    }
    trim_book_cache(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(())
}
