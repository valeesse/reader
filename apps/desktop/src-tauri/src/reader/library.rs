const LIBRARY_CONFIG_FILE: &str = "library-config-v1.json";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LibraryConfig {
    root: String,
}

#[tauri::command]
fn get_library_root(app: AppHandle) -> Result<Option<String>, String> {
    let path = library_config_path(&app)?;
    match fs::read(path) {
        Ok(bytes) => serde_json::from_slice::<LibraryConfig>(&bytes)
            .map(|config| Some(config.root))
            .map_err(|error| format!("读取书库配置失败: {error}")),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("读取书库配置失败: {error}")),
    }
}

#[tauri::command]
fn set_library_root(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    root: String,
) -> Result<(), String> {
    let _external_open_guard = state
        .external_open_lock
        .lock()
        .map_err(|_| "外部文件打开任务被占用".to_string())?;
    let root = fs::canonicalize(root).map_err(|error| format!("书库根目录无效: {error}"))?;
    if !root.is_dir() {
        return Err("书库根目录不是文件夹".into());
    }
    let application = create_reader_application(&app, &root)?;
    let config = LibraryConfig {
        root: root.to_string_lossy().to_string(),
    };
    write_atomic(
        &library_config_path(&app)?,
        &serde_json::to_vec(&config).map_err(|error| error.to_string())?,
    )?;
    *state.application.lock().map_err(|_| "阅读服务被占用".to_string())? = Some(application);
    Ok(())
}

#[tauri::command]
async fn import_managed_books(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    paths: Vec<String>,
) -> Result<Vec<NativeBook>, String> {
    import_external_books(app, state, paths).await
}

#[tauri::command]
async fn open_external_books(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    paths: Vec<String>,
) -> Result<Vec<NativeBook>, String> {
    import_external_books(app, state, paths).await
}

async fn import_external_books(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    paths: Vec<String>,
) -> Result<Vec<NativeBook>, String> {
    if paths.is_empty() {
        return Ok(Vec::new());
    }
    let external_open_lock = state.external_open_lock.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let _guard = external_open_lock
            .lock()
            .map_err(|_| "外部文件打开任务被占用".to_string())?;
        let state = app.state::<ReaderState>();
        let (root, application) = ensure_external_open_library(&app, &state)?;
        let sources = paths.into_iter().map(PathBuf::from).collect::<Vec<_>>();
        import_external_books_into_library(&application, &root, &sources)
            .map(|books| books.into_iter().map(native_book_from_core).collect())
    })
    .await
    .map_err(|error| format!("外部文件打开任务中断: {error}"))?
}

fn ensure_external_open_library(
    app: &AppHandle,
    state: &ReaderState,
) -> Result<(PathBuf, Arc<reader_application::ReaderApplication>), String> {
    let root = match get_library_root(app.clone())? {
        Some(root) => fs::canonicalize(root).map_err(|error| format!("书库根目录无效: {error}"))?,
        None => {
            let managed_root = app
                .path()
                .app_data_dir()
                .map_err(|error| error.to_string())?
                .join("managed-library");
            fs::create_dir_all(&managed_root).map_err(|error| format!("创建受管书库失败: {error}"))?;
            let managed_root = fs::canonicalize(managed_root)
                .map_err(|error| format!("初始化受管书库失败: {error}"))?;
            let config = LibraryConfig { root: managed_root.to_string_lossy().into_owned() };
            write_atomic(
                &library_config_path(app)?,
                &serde_json::to_vec(&config).map_err(|error| error.to_string())?,
            )?;
            managed_root
        }
    };
    if !root.is_dir() {
        return Err("书库根目录不是文件夹".into());
    }
    let mut application = state.application.lock().map_err(|_| "阅读服务被占用".to_string())?;
    if application.is_none() {
        *application = Some(create_reader_application(app, &root)?);
    }
    Ok((root, application.clone().expect("application initialized")))
}

fn import_external_books_into_library(
    application: &Arc<reader_application::ReaderApplication>,
    root: &Path,
    sources: &[PathBuf],
) -> Result<Vec<reader_core::Book>, String> {
    let indexed = application.scan(|_| {}).map_err(|error| format!("扫描书库失败: {error}"))?;
    let indexed_fingerprints = indexed
        .iter()
        .map(|book| book.content_id.clone())
        .collect::<HashSet<_>>();
    let mut requested = Vec::new();
    let mut scheduled_fingerprints = HashSet::new();
    let mut sources_to_copy = Vec::new();

    for source in sources {
        let source = validate_external_book(source)?;
        let fingerprint = reader_core::fingerprint_file(&source)
            .map_err(|error| format!("读取书籍指纹失败: {error}"))?;
        let preferred_relative = library_relative_path(root, &source);
        if !indexed_fingerprints.contains(&fingerprint)
            && scheduled_fingerprints.insert(fingerprint.clone())
            && preferred_relative.is_none()
        {
            sources_to_copy.push(source);
        }
        requested.push((fingerprint, preferred_relative));
    }

    if !sources_to_copy.is_empty() {
        reader_application::import_books(root.join("Imported"), &sources_to_copy)
            .map_err(|error| format!("导入书籍失败: {error}"))?;
    }

    let books = if sources_to_copy.is_empty() {
        indexed
    } else {
        application.scan(|_| {}).map_err(|error| format!("扫描导入书籍失败: {error}"))?
    };
    let books_by_relative = books
        .iter()
        .map(|book| (book.relative_path.clone(), book))
        .collect::<HashMap<_, _>>();
    let books_by_fingerprint = books
        .iter()
        .map(|book| (book.content_id.clone(), book))
        .collect::<HashMap<_, _>>();
    let mut selected_ids = HashSet::new();
    let mut selected = Vec::new();
    for (fingerprint, preferred_relative) in requested {
        let book = preferred_relative
            .as_ref()
            .and_then(|relative| books_by_relative.get(relative).copied())
            .or_else(|| books_by_fingerprint.get(&fingerprint).copied())
            .ok_or_else(|| "导入后无法定位书籍".to_string())?;
        if selected_ids.insert(book.id.clone()) {
            selected.push(book.clone());
        }
    }
    Ok(selected)
}

fn validate_external_book(path: &Path) -> Result<PathBuf, String> {
    if !supported_book_path(path) {
        return Err("仅支持 EPUB / TXT 文件".into());
    }
    let path = fs::canonicalize(path).map_err(|error| format!("书籍路径无效: {error}"))?;
    if !path.is_file() {
        return Err("书籍路径不是文件".into());
    }
    Ok(path)
}

fn library_relative_path(root: &Path, path: &Path) -> Option<String> {
    let relative = path.strip_prefix(root).ok()?;
    let parts = relative
        .components()
        .map(|component| match component {
            std::path::Component::Normal(value) => value.to_str(),
            _ => None,
        })
        .collect::<Option<Vec<_>>>()?;
    (!parts.is_empty()).then(|| parts.join("/"))
}

#[tauri::command]
async fn scan_library(app: AppHandle) -> Result<Vec<NativeBook>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<ReaderState>();
        let application = reader_application(&state)?;
        let books = application
            .scan(|progress| {
                let _ = app.emit(
                    "library-scan://progress",
                    ScanProgress {
                        visited: progress.visited,
                        matched: progress.matched,
                        current_path: progress.current_relative_path,
                    },
                );
            })
            .map_err(|error| format!("扫描书库失败: {error}"))?;
        Ok(books.into_iter().map(native_book_from_core).collect())
    }).await.map_err(|error| format!("扫描任务中断: {error}"))?
}

#[tauri::command]
fn reader_books(state: tauri::State<'_, ReaderState>) -> Result<Vec<NativeBook>, String> {
    Ok(reader_application(&state)?
        .books()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(native_book_from_core)
        .collect())
}

#[tauri::command]
async fn reader_cover(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
) -> Result<String, String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.cover(&resource_id))
        .await
        .map_err(|error| format!("封面加载任务中断: {error}"))?
        .map(|cover| cover.path.to_string_lossy().into_owned())
        .map_err(|error| error.to_string())
}

fn native_book_from_core(book: reader_core::Book) -> NativeBook {
    NativeBook {
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        book_type: book.book_type,
        resource_id: book.resource_id,
        content_id: book.content_id,
        file_name: book.file_name,
        relative_path: book.relative_path,
        series_name: book.series_name,
        series_index: book.series_index,
        added_at: book.modified_at,
    }
}

fn initialize_library(app: &AppHandle, state: &ReaderState) -> Result<(), String> {
    let Some(root) = get_library_root(app.clone())? else {
        return Ok(());
    };
    let application = create_reader_application(app, Path::new(&root))?;
    *state.application.lock().map_err(|_| "阅读服务被占用".to_string())? = Some(application);
    Ok(())
}

fn create_reader_application(
    app: &AppHandle,
    root: &Path,
) -> Result<Arc<reader_application::ReaderApplication>, String> {
    let state_dir = library_state_dir(app)?;
    let registry = reader_core::LibraryRegistry::open(root, &state_dir)
        .map_err(|error| format!("初始化书库失败: {error}"))?;
    let reader = Arc::new(reader_core::ReaderService::new(
        registry,
        &state_dir,
        app.path().app_cache_dir().map_err(|error| error.to_string())?.join("reader-core"),
    ).map_err(|error| format!("初始化阅读服务失败: {error}"))?);
    Ok(Arc::new(reader_application::ReaderApplication::new(reader)))
}

fn library_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| format!("创建应用数据目录失败: {error}"))?;
    Ok(dir.join(LIBRARY_CONFIG_FILE))
}

fn library_state_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("library-state");
    fs::create_dir_all(&dir).map_err(|error| format!("创建书库状态目录失败: {error}"))?;
    Ok(dir)
}
