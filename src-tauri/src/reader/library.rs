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
    let root = fs::canonicalize(root).map_err(|error| format!("书库根目录无效: {error}"))?;
    if !root.is_dir() {
        return Err("书库根目录不是文件夹".into());
    }
    let state_dir = library_state_dir(&app)?;
    let registry = reader_core::LibraryRegistry::open(&root, &state_dir)
        .map_err(|error| format!("初始化书库失败: {error}"))?;
    let reader = Arc::new(reader_core::ReaderService::new(
        registry,
        &state_dir,
        app.path().app_cache_dir().map_err(|error| error.to_string())?.join("reader-core"),
    ).map_err(|error| format!("初始化阅读服务失败: {error}"))?);
    let config = LibraryConfig {
        root: root.to_string_lossy().to_string(),
    };
    write_atomic(
        &library_config_path(&app)?,
        &serde_json::to_vec(&config).map_err(|error| error.to_string())?,
    )?;
    let application = Arc::new(reader_application::ReaderApplication::new(reader));
    *state.application.lock().map_err(|_| "阅读服务被占用".to_string())? = Some(application);
    Ok(())
}

#[tauri::command]
async fn import_managed_books(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    paths: Vec<String>,
) -> Result<Vec<NativeBook>, String> {
    let managed_root = app.path().app_data_dir().map_err(|error| error.to_string())?.join("managed-library");
    let sources = paths.into_iter().map(PathBuf::from).collect::<Vec<_>>();
    let root_for_import = managed_root.clone();
    tauri::async_runtime::spawn_blocking(move || reader_application::import_books(root_for_import, &sources))
        .await.map_err(|error| error.to_string())?.map_err(|error| error.to_string())?;

    let state_dir = library_state_dir(&app)?;
    let registry = reader_core::LibraryRegistry::open(&managed_root, &state_dir)
        .map_err(|error| format!("初始化受管书库失败: {error}"))?;
    let reader = Arc::new(reader_core::ReaderService::new(
        registry,
        &state_dir,
        app.path().app_cache_dir().map_err(|error| error.to_string())?.join("reader-core"),
    ).map_err(|error| error.to_string())?);
    let application = Arc::new(reader_application::ReaderApplication::new(reader));
    let config = LibraryConfig { root: managed_root.to_string_lossy().into_owned() };
    write_atomic(&library_config_path(&app)?, &serde_json::to_vec(&config).map_err(|error| error.to_string())?)?;
    *state.application.lock().map_err(|_| "阅读服务被占用".to_string())? = Some(application.clone());
    let books = tauri::async_runtime::spawn_blocking(move || application.scan(|_| {})).await
        .map_err(|error| error.to_string())?.map_err(|error| error.to_string())?;
    Ok(books.into_iter().map(native_book_from_core).collect())
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
    let state_dir = library_state_dir(app)?;
    let registry = reader_core::LibraryRegistry::open(root, &state_dir)
        .map_err(|error| format!("初始化书库失败: {error}"))?;
    let reader = Arc::new(reader_core::ReaderService::new(
        registry,
        &state_dir,
        app.path().app_cache_dir().map_err(|error| error.to_string())?.join("reader-core"),
    ).map_err(|error| format!("初始化阅读服务失败: {error}"))?);
    let application = Arc::new(reader_application::ReaderApplication::new(reader));
    *state.application.lock().map_err(|_| "阅读服务被占用".to_string())? = Some(application);
    Ok(())
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
