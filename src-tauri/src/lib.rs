use base64::{Engine as _, engine::general_purpose};
use encoding_rs::{GBK, UTF_8, UTF_16BE, UTF_16LE};
use encoding_rs_io::DecodeReaderBytesBuilder;
use percent_encoding::percent_decode_str;
use reqwest::{Method, StatusCode, Url};
use roxmltree::Document;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::{BufWriter, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicU64, Ordering},
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Manager};
use walkdir::WalkDir;
use zip::ZipArchive;

const TXT_CHAR_CHECKPOINT_INTERVAL: usize = 4096;
const TXT_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_RESOURCE_CACHE_LIMIT: usize = 96;
const EPUB_RESOURCE_CACHE_MAX_BYTES: usize = 48 * 1024 * 1024;
const EPUB_PREFETCH_MAX_RESOURCES: usize = 16;
const PERSISTENT_CACHE_VERSION: u8 = 3;
const STREAM_BUFFER_BYTES: usize = 64 * 1024;
static TEMP_FILE_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Default)]
struct ReaderState {
    txt_books: Mutex<HashMap<String, TxtBookCache>>,
    epub_books: Mutex<HashMap<String, EpubBookCache>>,
    next_session_id: AtomicU64,
}

#[derive(Debug)]
struct TxtBookCache {
    signature: FileSignature,
    last_used_at: u128,
    active_sessions: HashSet<String>,
    encoding: String,
    data_path: PathBuf,
    total_chars: usize,
    total_bytes: u64,
    checkpoints: Vec<(usize, usize)>,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TxtChapterInfo {
    id: String,
    title: String,
    start_index: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TxtBookInfo {
    session_id: String,
    total_chars: usize,
    total_bytes: u64,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TxtTextWindow {
    start: usize,
    end: usize,
    text: String,
}

struct EpubBookCache {
    signature: FileSignature,
    last_used_at: u128,
    active_sessions: HashSet<String>,
    info: EpubBookInfo,
    manifest_items: Vec<EpubManifestItem>,
    resource_cache: HashMap<String, EpubCachedResource>,
    resource_order: VecDeque<String>,
    resource_bytes: usize,
    archive: ZipArchive<File>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
struct FileSignature {
    len: u64,
    modified_ns: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EpubManifestItem {
    id: String,
    absolute_href: String,
    media_type: String,
    properties: Vec<String>,
}

#[derive(Debug, Clone)]
struct EpubCachedResource {
    bytes: Arc<[u8]>,
    media_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubBookInfo {
    metadata: EpubMetadataInfo,
    reading_order: Vec<EpubLinkInfo>,
    resources: Vec<EpubLinkInfo>,
    toc: Vec<EpubLinkInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EpubOpenResult {
    session_id: String,
    book: EpubBookInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubMetadataInfo {
    title: String,
    author: Option<String>,
    language: String,
    layout: String,
    reading_progression: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubLinkInfo {
    href: String,
    media_type: String,
    title: Option<String>,
    rels: Vec<String>,
    properties: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EpubResourcePayload {
    href: String,
    media_type: String,
    text: Option<String>,
    base64: Option<String>,
    file_path: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeBook {
    id: String,
    title: String,
    author: String,
    cover: Option<String>,
    #[serde(rename = "type")]
    book_type: String,
    path: String,
    file_name: String,
    series_name: Option<String>,
    series_index: Option<f64>,
    added_at: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WebDavConfig {
    url: String,
    username: String,
    password: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WebDavBook {
    id: String,
    title: String,
    author: String,
    #[serde(rename = "type")]
    book_type: String,
    path: String,
    file_name: String,
    added_at: u64,
    source: String,
    remote_path: String,
    size: Option<u64>,
    modified_at: Option<u64>,
}

#[derive(Debug)]
struct WebDavEntry {
    remote_path: String,
    file_name: String,
    is_dir: bool,
    size: Option<u64>,
    modified_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanProgress {
    visited: usize,
    matched: usize,
    current_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistentTxtIndexCache {
    version: u8,
    path: String,
    signature: FileSignature,
    encoding: String,
    data_path: String,
    data_bytes: u64,
    total_chars: usize,
    total_bytes: u64,
    checkpoints: Vec<(usize, usize)>,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistentEpubBookCache {
    version: u8,
    path: String,
    signature: FileSignature,
    info: EpubBookInfo,
    manifest_items: Vec<EpubManifestItem>,
}

type TxtIndex = (usize, Vec<(usize, usize)>, Vec<TxtChapterInfo>);
type ParsedEpubMetadata = (String, String, Option<String>, Option<String>, Option<f64>);

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
        books
            .get(&path)
            .map(|cache| cache.signature != signature)
            .unwrap_or(true)
    };

    if should_reload {
        let loaded = load_txt_book(app, &path, signature)?;
        let mut books = state
            .txt_books
            .lock()
            .map_err(|_| "TXT 缓存被占用".to_string())?;
        if books
            .get(&path)
            .map(|cache| cache.signature != signature)
            .unwrap_or(true)
        {
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
    cache.active_sessions.insert(session_id.clone());
    cache.last_used_at = now_millis_u128();
    let info = TxtBookInfo {
        session_id,
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        chapters: cache.chapters.clone(),
    };
    trim_txt_cache(&mut books);
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
    if cache.signature != signature {
        return Err("TXT 文件已变更，请重新打开".to_string());
    }
    if !cache.active_sessions.contains(session_id) {
        return Err("TXT 阅读会话已失效".to_string());
    }
    cache.last_used_at = now_millis_u128();
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
        cache.active_sessions.remove(&session_id);
        cache.last_used_at = now_millis_u128();
    }
    trim_txt_cache(&mut books);
    Ok(())
}

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
        books
            .get(&path)
            .map(|cache| cache.signature != signature)
            .unwrap_or(true)
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
        if books
            .get(&path)
            .map(|cache| cache.signature != signature)
            .unwrap_or(true)
        {
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
    cache.active_sessions.insert(session_id.clone());
    cache.last_used_at = now_millis_u128();
    let result = EpubOpenResult {
        session_id,
        book: cache.info.clone(),
    };
    trim_epub_cache(&mut books);
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
        cache.active_sessions.remove(&session_id);
        cache.last_used_at = now_millis_u128();
    }
    trim_epub_cache(&mut books);
    Ok(())
}

#[tauri::command]
fn write_binary_file(path: String, base64_data: String) -> Result<(), String> {
    let bytes = general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|err| format!("图片数据解析失败: {err}"))?;
    fs::write(&path, bytes).map_err(|err| format!("保存图片失败: {err}"))
}

#[tauri::command]
async fn webdav_upload_snapshot(config: WebDavConfig, snapshot: String) -> Result<(), String> {
    let target = webdav_state_url(&config)?;
    let client = reqwest::Client::new();
    let response = client
        .put(target)
        .basic_auth(config.username, config.password)
        .header("content-type", "application/json; charset=utf-8")
        .body(snapshot)
        .send()
        .await
        .map_err(|err| format!("WebDAV 上传失败: {err}"))?;

    if response.status().is_success() {
        Ok(())
    } else {
        Err(format!("WebDAV 上传失败，服务器返回 {}", response.status()))
    }
}

#[tauri::command]
async fn webdav_download_snapshot(config: WebDavConfig) -> Result<Option<String>, String> {
    let target = webdav_state_url(&config)?;
    let client = reqwest::Client::new();
    let response = client
        .get(target)
        .basic_auth(config.username, config.password)
        .send()
        .await
        .map_err(|err| format!("WebDAV 下载失败: {err}"))?;

    if response.status() == StatusCode::NOT_FOUND {
        return Ok(None);
    }

    if !response.status().is_success() {
        return Err(format!("WebDAV 下载失败，服务器返回 {}", response.status()));
    }

    response
        .text()
        .await
        .map(Some)
        .map_err(|err| format!("WebDAV 响应解析失败: {err}"))
}

#[tauri::command]
async fn webdav_list_books(config: WebDavConfig) -> Result<Vec<WebDavBook>, String> {
    let client = reqwest::Client::new();
    let base_url = webdav_base_url(&config)?;
    let mut pending = VecDeque::from([base_url.clone()]);
    let mut visited = HashSet::new();
    let mut books = Vec::new();

    while let Some(current_url) = pending.pop_front() {
        let current_key = current_url.as_str().to_string();
        if !visited.insert(current_key) {
            continue;
        }

        let entries = webdav_list_directory(&client, &config, &base_url, &current_url).await?;
        for entry in entries {
            if entry.is_dir {
                if let Ok(child_url) = webdav_url_for_remote_path(&config, &entry.remote_path) {
                    pending.push_back(child_url);
                }
                continue;
            }

            let extension = Path::new(&entry.file_name)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or_default()
                .to_ascii_lowercase();
            if extension != "epub" && extension != "txt" {
                continue;
            }

            let (title, author) = parse_filename_metadata_str(&entry.file_name);
            books.push(WebDavBook {
                id: stable_remote_book_id(&entry.remote_path),
                title,
                author,
                book_type: extension,
                path: entry.remote_path.clone(),
                file_name: entry.file_name,
                added_at: entry.modified_at.unwrap_or_else(now_millis),
                source: "webdav".to_string(),
                remote_path: entry.remote_path,
                size: entry.size,
                modified_at: entry.modified_at,
            });
        }
    }

    books.sort_by(|a, b| a.remote_path.cmp(&b.remote_path));
    Ok(books)
}

#[tauri::command]
async fn webdav_cache_book(
    app: AppHandle,
    config: WebDavConfig,
    remote_path: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let bytes = webdav_download_file_bytes(&client, &config, &remote_path).await?;
    let target_path = webdav_cached_book_path(&app, &remote_path)?;
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("创建缓存目录失败: {err}"))?;
    }
    fs::write(&target_path, bytes).map_err(|err| format!("写入缓存文件失败: {err}"))?;
    Ok(target_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn webdav_download_book_to_path(
    config: WebDavConfig,
    remote_path: String,
    target_path: String,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let bytes = webdav_download_file_bytes(&client, &config, &remote_path).await?;
    fs::write(&target_path, bytes).map_err(|err| format!("保存下载文件失败: {err}"))?;
    Ok(())
}

fn load_txt_book(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Result<TxtBookCache, String> {
    if let Some(index) = load_txt_index_from_persistent_cache(app, path, signature) {
        return Ok(TxtBookCache {
            signature,
            last_used_at: now_millis_u128(),
            active_sessions: HashSet::new(),
            encoding: index.encoding,
            data_path: PathBuf::from(index.data_path),
            total_chars: index.total_chars,
            total_bytes: index.total_bytes,
            checkpoints: index.checkpoints,
            chapters: index.chapters,
        });
    }

    let bom = detect_txt_bom(path)?;
    let (data_path, encoding, total_chars, checkpoints, chapters) = if let Some(bom) = bom {
        let (skip, source_encoding, encoding_name) = match bom {
            TxtBom::Utf8 => (3, None, "utf-8"),
            TxtBom::Utf16Le => (2, Some(UTF_16LE), "utf-16le"),
            TxtBom::Utf16Be => (2, Some(UTF_16BE), "utf-16be"),
        };
        let data_path = create_utf8_txt_cache(app, path, signature, Some(skip), source_encoding)?;
        let (total_chars, checkpoints, chapters) =
            build_txt_index(&data_path).map_err(|error| format!("TXT 转码索引失败: {error}"))?;
        (
            data_path,
            encoding_name.to_string(),
            total_chars,
            checkpoints,
            chapters,
        )
    } else {
        match build_txt_index(Path::new(path)) {
            Ok((total_chars, checkpoints, chapters)) => (
                PathBuf::from(path),
                "utf-8".to_string(),
                total_chars,
                checkpoints,
                chapters,
            ),
            Err(TxtIndexError::InvalidUtf8) => {
                let data_path = create_utf8_txt_cache(app, path, signature, None, Some(GBK))?;
                let (total_chars, checkpoints, chapters) = build_txt_index(&data_path)
                    .map_err(|error| format!("GBK 转码后的 TXT 索引失败: {error}"))?;
                (
                    data_path,
                    "gbk".to_string(),
                    total_chars,
                    checkpoints,
                    chapters,
                )
            }
            Err(TxtIndexError::Io(error)) => return Err(error),
        }
    };
    let cache = TxtBookCache {
        signature,
        last_used_at: now_millis_u128(),
        active_sessions: HashSet::new(),
        encoding,
        data_path,
        total_chars,
        total_bytes: signature.len,
        checkpoints,
        chapters,
    };
    save_txt_index_to_persistent_cache(app, path, &cache);
    Ok(cache)
}

fn load_txt_index_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Option<PersistentTxtIndexCache> {
    let cache_path = txt_index_cache_path(app, path).ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentTxtIndexCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
        || cached.checkpoints.first() != Some(&(0, 0))
    {
        return None;
    }
    let metadata = fs::metadata(&cached.data_path).ok()?;
    if metadata.len() != cached.data_bytes {
        return None;
    }
    Some(cached)
}

fn save_txt_index_to_persistent_cache(app: &AppHandle, path: &str, cache: &TxtBookCache) {
    let Ok(cache_path) = txt_index_cache_path(app, path) else {
        return;
    };
    let payload = PersistentTxtIndexCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        encoding: cache.encoding.clone(),
        data_path: cache.data_path.to_string_lossy().to_string(),
        data_bytes: fs::metadata(&cache.data_path)
            .map(|metadata| metadata.len())
            .unwrap_or_default(),
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        checkpoints: cache.checkpoints.clone(),
        chapters: cache.chapters.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = write_atomic(&cache_path, &bytes);
    }
}

#[derive(Debug)]
enum TxtIndexError {
    InvalidUtf8,
    Io(String),
}

#[derive(Debug, Clone, Copy)]
enum TxtBom {
    Utf8,
    Utf16Le,
    Utf16Be,
}

impl std::fmt::Display for TxtIndexError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidUtf8 => formatter.write_str("TXT 不是有效的 UTF-8"),
            Self::Io(error) => formatter.write_str(error),
        }
    }
}

fn build_txt_index(path: &Path) -> Result<TxtIndex, TxtIndexError> {
    let mut file = File::open(path)
        .map_err(|error| TxtIndexError::Io(format!("打开 TXT 索引源失败: {error}")))?;
    let mut buffer = vec![0u8; STREAM_BUFFER_BYTES];
    let mut pending = Vec::<u8>::with_capacity(4);
    let mut total_read = 0usize;
    let mut char_index = 0usize;
    let mut line_start = 0usize;
    let mut line_chars = 0usize;
    let mut line_too_long = false;
    let mut line_title = String::with_capacity(128);
    let mut checkpoints = vec![(0, 0)];
    let mut chapters = Vec::new();

    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|error| TxtIndexError::Io(format!("读取 TXT 索引源失败: {error}")))?;
        if read == 0 {
            if !pending.is_empty() {
                return Err(TxtIndexError::InvalidUtf8);
            }
            break;
        }

        let chunk_start = total_read.saturating_sub(pending.len());
        total_read += read;
        let mut combined = Vec::with_capacity(pending.len() + read);
        combined.extend_from_slice(&pending);
        combined.extend_from_slice(&buffer[..read]);
        let valid_len = match std::str::from_utf8(&combined) {
            Ok(_) => combined.len(),
            Err(error) if error.error_len().is_none() => error.valid_up_to(),
            Err(_) => return Err(TxtIndexError::InvalidUtf8),
        };
        let text =
            std::str::from_utf8(&combined[..valid_len]).map_err(|_| TxtIndexError::InvalidUtf8)?;

        for (local_byte, ch) in text.char_indices() {
            if char_index > 0 && char_index.is_multiple_of(TXT_CHAR_CHECKPOINT_INTERVAL) {
                checkpoints.push((char_index, chunk_start + local_byte));
            }
            if ch == '\n' {
                push_txt_chapter(&mut chapters, &line_title, line_too_long, line_start);
                line_title.clear();
                line_chars = 0;
                line_too_long = false;
                line_start = char_index + 1;
            } else {
                line_chars += 1;
                if line_chars <= 90 {
                    line_title.push(ch);
                } else {
                    line_too_long = true;
                }
            }
            char_index += 1;
        }
        pending.clear();
        pending.extend_from_slice(&combined[valid_len..]);
    }

    if line_chars > 0 {
        push_txt_chapter(&mut chapters, &line_title, line_too_long, line_start);
    }
    checkpoints.push((char_index, total_read));
    Ok((char_index, checkpoints, finalize_txt_chapters(chapters)))
}

fn push_txt_chapter(
    chapters: &mut Vec<TxtChapterInfo>,
    line: &str,
    too_long: bool,
    start_index: usize,
) {
    if too_long {
        return;
    }
    let title = line.trim();
    if is_txt_chapter_heading(title) {
        chapters.push(TxtChapterInfo {
            id: format!("chapter-{}", chapters.len() + 1),
            title: title.to_string(),
            start_index,
        });
    }
}

fn finalize_txt_chapters(mut chapters: Vec<TxtChapterInfo>) -> Vec<TxtChapterInfo> {
    if chapters.is_empty() {
        return vec![TxtChapterInfo {
            id: "chapter-1".to_string(),
            title: "Beginning".to_string(),
            start_index: 0,
        }];
    }

    if chapters
        .first()
        .map(|chapter| chapter.start_index > 50)
        .unwrap_or(false)
    {
        chapters.insert(
            0,
            TxtChapterInfo {
                id: "chapter-0".to_string(),
                title: "Prologue".to_string(),
                start_index: 0,
            },
        );
    }

    chapters
}

fn read_txt_char_range(cache: &TxtBookCache, start: usize, end: usize) -> Result<String, String> {
    let start_checkpoint = cache
        .checkpoints
        .partition_point(|(char_index, _)| *char_index <= start)
        .saturating_sub(1);
    let end_checkpoint = cache
        .checkpoints
        .partition_point(|(char_index, _)| *char_index <= end)
        .min(cache.checkpoints.len().saturating_sub(1));
    let (base_char, base_byte) = cache.checkpoints[start_checkpoint];
    let (_, bound_byte) = cache.checkpoints[end_checkpoint];
    let mut file =
        File::open(&cache.data_path).map_err(|error| format!("打开 TXT 数据缓存失败: {error}"))?;
    file.seek(SeekFrom::Start(base_byte as u64))
        .map_err(|error| format!("定位 TXT 窗口失败: {error}"))?;
    let mut bytes = Vec::with_capacity(bound_byte.saturating_sub(base_byte));
    file.take(bound_byte.saturating_sub(base_byte) as u64)
        .read_to_end(&mut bytes)
        .map_err(|error| format!("读取 TXT 窗口失败: {error}"))?;
    let text = std::str::from_utf8(&bytes).map_err(|error| format!("TXT 数据缓存损坏: {error}"))?;
    let start_byte = byte_offset_for_char(text, start.saturating_sub(base_char));
    let end_byte = byte_offset_for_char(text, end.saturating_sub(base_char));
    Ok(text[start_byte..end_byte].to_string())
}

fn byte_offset_for_char(text: &str, target: usize) -> usize {
    if target == 0 {
        return 0;
    }
    text.char_indices()
        .nth(target)
        .map(|(byte, _)| byte)
        .unwrap_or(text.len())
}

fn detect_txt_bom(path: &str) -> Result<Option<TxtBom>, String> {
    let mut file = File::open(path).map_err(|error| format!("打开 TXT 失败: {error}"))?;
    let mut prefix = [0u8; 3];
    let read = file
        .read(&mut prefix)
        .map_err(|error| format!("读取 TXT 编码标记失败: {error}"))?;
    if read >= 3 && prefix == [0xEF, 0xBB, 0xBF] {
        return Ok(Some(TxtBom::Utf8));
    }
    if read >= 2 && prefix[..2] == [0xFF, 0xFE] {
        return Ok(Some(TxtBom::Utf16Le));
    }
    if read >= 2 && prefix[..2] == [0xFE, 0xFF] {
        return Ok(Some(TxtBom::Utf16Be));
    }
    Ok(None)
}

fn create_utf8_txt_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    skip_bytes: Option<u64>,
    encoding: Option<&'static encoding_rs::Encoding>,
) -> Result<PathBuf, String> {
    let target = txt_data_cache_path(app, path, signature)?;
    if target.exists() {
        return Ok(target);
    }
    let temp = temporary_sibling_path(&target);
    let mut source = File::open(path).map_err(|error| format!("打开 TXT 失败: {error}"))?;
    if let Some(skip) = skip_bytes {
        source
            .seek(SeekFrom::Start(skip))
            .map_err(|error| format!("跳过 TXT 编码标记失败: {error}"))?;
    }
    write_utf8_txt_cache(source, &temp, encoding)?;
    replace_file_atomically(&temp, &target)?;
    clean_old_txt_data_cache_files(app, path, signature);
    Ok(target)
}

fn write_utf8_txt_cache(
    mut source: File,
    target: &Path,
    encoding: Option<&'static encoding_rs::Encoding>,
) -> Result<(), String> {
    let temp_file = File::create(target).map_err(|error| format!("创建 TXT 缓存失败: {error}"))?;
    let mut writer = BufWriter::with_capacity(STREAM_BUFFER_BYTES, temp_file);
    if let Some(encoding) = encoding {
        let mut decoder = DecodeReaderBytesBuilder::new()
            .encoding(Some(encoding))
            .strip_bom(true)
            .build(source);
        std::io::copy(&mut decoder, &mut writer)
            .map_err(|error| format!("流式转码 TXT 失败: {error}"))?;
    } else {
        std::io::copy(&mut source, &mut writer)
            .map_err(|error| format!("复制 TXT 缓存失败: {error}"))?;
    }
    writer
        .flush()
        .map_err(|error| format!("写入 TXT 缓存失败: {error}"))?;
    Ok(())
}

fn is_txt_chapter_heading(title: &str) -> bool {
    let len = title.chars().count();
    if title.is_empty() || len > 90 {
        return false;
    }
    let lower = title.to_ascii_lowercase();
    if lower.starts_with("chapter ") || lower.starts_with("volume ") || lower.starts_with("vol.") {
        return true;
    }
    if title.starts_with('卷') && title.chars().take(8).any(is_cjk_or_ascii_number) {
        return true;
    }
    title.starts_with('第')
        && title
            .chars()
            .take(24)
            .any(|ch| matches!(ch, '部' | '卷' | '集' | '篇' | '章' | '节' | '回'))
}

fn is_cjk_or_ascii_number(ch: char) -> bool {
    ch.is_ascii_digit() || "一二三四五六七八九十百千万零〇两".contains(ch)
}

fn load_epub_book(
    path: &str,
    fallback_title: &str,
) -> Result<(Vec<EpubManifestItem>, EpubBookInfo), String> {
    let file = File::open(path).map_err(|err| format!("打开 EPUB 失败: {err}"))?;
    let mut archive = ZipArchive::new(file).map_err(|err| format!("读取 EPUB 失败: {err}"))?;
    let container = read_zip_text(&mut archive, "META-INF/container.xml")?;
    let container_doc = Document::parse(&container).map_err(|err| err.to_string())?;
    let opf_path = container_doc
        .descendants()
        .find(|node| node.tag_name().name() == "rootfile")
        .and_then(|node| node.attribute("full-path"))
        .ok_or_else(|| "EPUB 缺少 OPF 路径".to_string())?
        .to_string();
    let opf_path = normalize_zip_path(&opf_path);
    let opf_dir = zip_dirname(&opf_path);
    let opf = read_zip_text(&mut archive, &opf_path)?;
    let opf_doc = Document::parse(&opf).map_err(|err| err.to_string())?;
    let manifest_items = epub_manifest_items(&opf_doc, &opf_dir);
    let spine_items = epub_spine_items(&opf_doc, &manifest_items);
    let reading_order = spine_items
        .iter()
        .enumerate()
        .map(|(index, item)| {
            epub_link_from_manifest(
                item,
                Some(item.id.clone())
                    .filter(|id| !id.is_empty())
                    .or_else(|| Some(format!("Chapter {}", index + 1))),
                vec![],
            )
        })
        .collect::<Vec<_>>();
    let reading_hrefs = reading_order
        .iter()
        .map(|link| link.href.clone())
        .collect::<std::collections::HashSet<_>>();
    let resources = manifest_items
        .iter()
        .filter(|item| !reading_hrefs.contains(&item.absolute_href))
        .map(|item| {
            let rels = if item
                .properties
                .iter()
                .any(|property| property == "cover-image")
            {
                vec!["cover".to_string()]
            } else {
                vec![]
            };
            epub_link_from_manifest(item, Some(item.id.clone()), rels)
        })
        .collect::<Vec<_>>();
    let toc = epub_toc_links(&mut archive, &manifest_items, &opf_dir)?;
    let metadata = epub_metadata_info(&opf_doc, fallback_title);

    Ok((
        manifest_items,
        EpubBookInfo {
            metadata,
            reading_order,
            resources,
            toc,
        },
    ))
}

fn load_epub_book_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Option<Result<(Vec<EpubManifestItem>, EpubBookInfo), String>> {
    let cache_path = epub_metadata_cache_path(app, path).ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentEpubBookCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
    {
        return None;
    }
    Some(Ok((cached.manifest_items, cached.info)))
}

fn save_epub_book_to_persistent_cache(app: &AppHandle, path: &str, cache: &EpubBookCache) {
    let Ok(cache_path) = epub_metadata_cache_path(app, path) else {
        return;
    };
    let payload = PersistentEpubBookCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        info: cache.info.clone(),
        manifest_items: cache.manifest_items.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = write_atomic(&cache_path, &bytes);
    }
}

fn epub_manifest_items(doc: &Document, opf_dir: &str) -> Vec<EpubManifestItem> {
    doc.descendants()
        .filter(|node| node.tag_name().name() == "item")
        .map(|node| {
            let href = node.attribute("href").unwrap_or_default();
            EpubManifestItem {
                id: node.attribute("id").unwrap_or(href).to_string(),
                absolute_href: resolve_zip_href(opf_dir, href),
                media_type: node
                    .attribute("media-type")
                    .map(str::to_string)
                    .unwrap_or_else(|| mime_from_path(href)),
                properties: node
                    .attribute("properties")
                    .unwrap_or_default()
                    .split_whitespace()
                    .map(str::to_string)
                    .collect(),
            }
        })
        .collect()
}

fn epub_spine_items(doc: &Document, manifest_items: &[EpubManifestItem]) -> Vec<EpubManifestItem> {
    let by_id = manifest_items
        .iter()
        .map(|item| (item.id.as_str(), item))
        .collect::<HashMap<_, _>>();
    doc.descendants()
        .filter(|node| node.tag_name().name() == "itemref")
        .filter_map(|node| {
            node.attribute("idref")
                .and_then(|id| by_id.get(id))
                .copied()
        })
        .cloned()
        .collect()
}

fn epub_metadata_info(doc: &Document, fallback_title: &str) -> EpubMetadataInfo {
    let title = first_text(doc, "title").unwrap_or_else(|| fallback_title.to_string());
    let author = first_text(doc, "creator");
    let language = first_text(doc, "language").unwrap_or_else(|| "zh".to_string());
    let layout = doc
        .descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node.attribute("property") == Some("rendition:layout")
        })
        .and_then(|node| node.text())
        .map(str::trim)
        .filter(|value| *value == "pre-paginated")
        .map(|_| "fixed".to_string())
        .unwrap_or_else(|| "reflowable".to_string());
    let reading_progression = doc
        .descendants()
        .find(|node| node.tag_name().name() == "spine")
        .and_then(|node| node.attribute("page-progression-direction"))
        .filter(|value| *value == "rtl")
        .map(str::to_string)
        .unwrap_or_else(|| "ltr".to_string());

    EpubMetadataInfo {
        title,
        author,
        language,
        layout,
        reading_progression,
    }
}

fn epub_toc_links(
    archive: &mut ZipArchive<File>,
    manifest_items: &[EpubManifestItem],
    opf_dir: &str,
) -> Result<Vec<EpubLinkInfo>, String> {
    if let Some(nav_item) = manifest_items
        .iter()
        .find(|item| item.properties.iter().any(|property| property == "nav"))
        && let Ok(nav) = read_zip_text(archive, &nav_item.absolute_href)
        && let Ok(doc) = Document::parse(&nav)
    {
        let nav_node = doc.descendants().find(|node| {
            node.tag_name().name() == "nav"
                && (node.attribute("type") == Some("toc")
                    || node.attribute(("http://www.idpf.org/2007/ops", "type")) == Some("toc"))
        });
        if let Some(nav_node) = nav_node {
            return Ok(nav_node
                .descendants()
                .filter(|node| node.tag_name().name() == "a")
                .filter_map(|anchor| {
                    let href = anchor.attribute("href")?;
                    Some(EpubLinkInfo {
                        href: resolve_zip_href(&zip_dirname(&nav_item.absolute_href), href),
                        media_type: mime_from_path(href),
                        title: anchor.text().map(|value| value.trim().to_string()),
                        rels: vec![],
                        properties: vec![],
                    })
                })
                .collect());
        }
    }

    if let Some(ncx_item) = manifest_items
        .iter()
        .find(|item| item.media_type == "application/x-dtbncx+xml")
        && let Ok(ncx) = read_zip_text(archive, &ncx_item.absolute_href)
        && let Ok(doc) = Document::parse(&ncx)
    {
        return Ok(doc
            .descendants()
            .filter(|node| node.tag_name().name() == "navPoint")
            .filter_map(|point| {
                let content = point
                    .descendants()
                    .find(|node| node.tag_name().name() == "content")?;
                let href = content.attribute("src")?;
                let title = point
                    .descendants()
                    .find(|node| node.tag_name().name() == "text")
                    .and_then(|node| node.text())
                    .map(|value| value.trim().to_string());
                Some(EpubLinkInfo {
                    href: resolve_zip_href(opf_dir, href),
                    media_type: mime_from_path(href),
                    title,
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }

    Ok(vec![])
}

fn epub_link_from_manifest(
    item: &EpubManifestItem,
    title: Option<String>,
    rels: Vec<String>,
) -> EpubLinkInfo {
    EpubLinkInfo {
        href: item.absolute_href.clone(),
        media_type: item.media_type.clone(),
        title,
        rels,
        properties: item.properties.clone(),
    }
}

fn read_cached_epub_resource(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<EpubCachedResource, String> {
    let signature = file_signature(path)?;
    let normalized_href = strip_fragment(&normalize_zip_path(href));
    {
        let mut books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        if let Some(book) = books.get_mut(path) {
            if book.signature != signature {
                return Err("EPUB 文件已变更，请重新打开".to_string());
            }
            book.last_used_at = now_millis_u128();
            if let Some(resource) = book.resource_cache.get(&normalized_href).cloned() {
                touch_epub_resource(book, &normalized_href);
                return Ok(resource);
            }
        }
    }

    let (media_type, bytes) = read_epub_resource_bytes(state, path, &normalized_href)?;
    let resource = EpubCachedResource {
        bytes: Arc::from(bytes),
        media_type,
    };
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let book = books
        .get_mut(path)
        .ok_or_else(|| "EPUB 尚未打开".to_string())?;
    if book.signature != signature {
        return Err("EPUB 文件已变更，请重新打开".to_string());
    }
    book.last_used_at = now_millis_u128();
    cache_epub_resource(book, normalized_href, resource.clone());
    Ok(resource)
}

fn read_epub_resource_bytes(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<(String, Vec<u8>), String> {
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let book = books
        .get_mut(path)
        .ok_or_else(|| "EPUB 尚未打开".to_string())?;
    let manifest_item = book
        .manifest_items
        .iter()
        .find(|item| strip_fragment(&item.absolute_href) == href)
        .cloned();
    let (archive_path, media_type) = manifest_item
        .map(|item| (item.absolute_href, item.media_type))
        .unwrap_or_else(|| (href.to_string(), mime_from_path(href)));
    let (_, bytes) = read_zip_bytes_flexible(&mut book.archive, &archive_path)
        .map_err(|err| format!("读取 EPUB 资源失败: {err}"))?;
    Ok((media_type, bytes))
}

fn open_epub_archive(path: &str) -> Result<ZipArchive<File>, String> {
    let file = File::open(path).map_err(|error| format!("打开 EPUB 失败: {error}"))?;
    ZipArchive::new(file).map_err(|error| format!("读取 EPUB 失败: {error}"))
}

fn validate_epub_session(state: &ReaderState, path: &str, session_id: &str) -> Result<(), String> {
    let signature = file_signature(path)?;
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let book = books
        .get_mut(path)
        .ok_or_else(|| "EPUB 尚未打开".to_string())?;
    if book.signature != signature {
        return Err("EPUB 文件已变更，请重新打开".to_string());
    }
    if !book.active_sessions.contains(session_id) {
        return Err("EPUB 阅读会话已失效".to_string());
    }
    book.last_used_at = now_millis_u128();
    Ok(())
}

fn epub_manifest_item_for_href(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<Option<EpubManifestItem>, String> {
    let books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    Ok(books.get(path).and_then(|book| {
        book.manifest_items
            .iter()
            .find(|item| strip_fragment(&item.absolute_href) == href)
            .cloned()
    }))
}

fn existing_epub_binary_resource(
    app: &AppHandle,
    state: &ReaderState,
    path: &str,
    signature: FileSignature,
    href: &str,
) -> Option<(String, PathBuf)> {
    let item = epub_manifest_item_for_href(state, path, href).ok()??;
    if is_epub_text_resource(&item.media_type) {
        return None;
    }
    let file_path = epub_resource_file_path(app, path, signature, href, &item.media_type).ok()?;
    file_path.is_file().then_some((item.media_type, file_path))
}

fn prefetch_epub_resources_blocking(
    app: &AppHandle,
    state: &ReaderState,
    path: &str,
    session_id: &str,
    hrefs: Vec<String>,
) -> Result<(), String> {
    validate_epub_session(state, path, session_id)?;
    let signature = file_signature(path)?;
    let mut seen = HashSet::new();
    let normalized_hrefs = hrefs
        .into_iter()
        .map(|href| strip_fragment(&normalize_zip_path(&href)))
        .filter(|href| !href.is_empty() && seen.insert(href.clone()))
        .take(EPUB_PREFETCH_MAX_RESOURCES)
        .collect::<Vec<_>>();
    let manifest_items = {
        let mut books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        let book = books
            .get_mut(path)
            .ok_or_else(|| "EPUB 尚未打开".to_string())?;
        let mut missing = Vec::new();
        for href in normalized_hrefs {
            if let Some(resource) = book.resource_cache.get(&href).cloned() {
                touch_epub_resource(book, &href);
                drop(resource);
                continue;
            }
            let item = book
                .manifest_items
                .iter()
                .find(|item| strip_fragment(&item.absolute_href) == href)
                .cloned()
                .unwrap_or_else(|| EpubManifestItem {
                    id: href.clone(),
                    absolute_href: href.clone(),
                    media_type: mime_from_path(&href),
                    properties: vec![],
                });
            if !is_epub_text_resource(&item.media_type)
                && let Ok(file_path) =
                    epub_resource_file_path(app, path, signature, &href, &item.media_type)
                && file_path.is_file()
            {
                continue;
            }
            missing.push((href, item));
        }
        missing
    };
    if manifest_items.is_empty() {
        return Ok(());
    }

    let file = File::open(path).map_err(|error| format!("打开 EPUB 失败: {error}"))?;
    let mut archive = ZipArchive::new(file).map_err(|error| format!("读取 EPUB 失败: {error}"))?;
    for (href, item) in manifest_items {
        let Ok((_, bytes)) = read_zip_bytes_flexible(&mut archive, &item.absolute_href) else {
            continue;
        };
        let resource = EpubCachedResource {
            bytes: Arc::from(bytes),
            media_type: item.media_type,
        };
        if is_epub_text_resource(&resource.media_type) {
            let mut books = state
                .epub_books
                .lock()
                .map_err(|_| "EPUB 缓存被占用".to_string())?;
            if let Some(book) = books.get_mut(path)
                && book.signature == signature
            {
                cache_epub_resource(book, href, resource);
            }
        } else {
            let _ = save_epub_resource_file(app, path, signature, &href, &resource);
        }
    }
    Ok(())
}

fn touch_epub_resource(book: &mut EpubBookCache, href: &str) {
    if let Some(index) = book.resource_order.iter().position(|item| item == href) {
        book.resource_order.remove(index);
    }
    book.resource_order.push_back(href.to_string());
}

fn cache_epub_resource(book: &mut EpubBookCache, href: String, resource: EpubCachedResource) {
    let resource_size = resource.bytes.len();
    if resource_size > EPUB_RESOURCE_CACHE_MAX_BYTES {
        return;
    }
    if let Some(previous) = book.resource_cache.remove(&href) {
        book.resource_bytes = book.resource_bytes.saturating_sub(previous.bytes.len());
    }
    if let Some(index) = book.resource_order.iter().position(|item| item == &href) {
        book.resource_order.remove(index);
    }
    book.resource_bytes = book.resource_bytes.saturating_add(resource_size);
    book.resource_cache.insert(href.clone(), resource);
    book.resource_order.push_back(href);
    trim_epub_resource_cache(
        book,
        EPUB_RESOURCE_CACHE_LIMIT,
        EPUB_RESOURCE_CACHE_MAX_BYTES,
    );
}

fn trim_epub_resource_cache(book: &mut EpubBookCache, max_count: usize, max_bytes: usize) {
    while book.resource_cache.len() > max_count || book.resource_bytes > max_bytes {
        let Some(oldest) = book.resource_order.pop_front() else {
            break;
        };
        if let Some(removed) = book.resource_cache.remove(&oldest) {
            book.resource_bytes = book.resource_bytes.saturating_sub(removed.bytes.len());
        }
    }
}

fn read_zip_bytes_flexible(
    archive: &mut ZipArchive<File>,
    path: &str,
) -> Result<(String, Vec<u8>), String> {
    if let Ok(bytes) = read_zip_bytes_exact(archive, path) {
        return Ok((path.to_string(), bytes));
    }

    let decoded = percent_decode_str(path).decode_utf8_lossy().to_string();
    if decoded != path
        && let Ok(bytes) = read_zip_bytes_exact(archive, &decoded)
    {
        return Ok((decoded, bytes));
    }

    let normalized = normalize_zip_path(&decoded);
    let normalized_lower = normalized.to_ascii_lowercase();
    let path_without_root_lower = strip_first_zip_segment(&normalized_lower);
    let file_name_lower = Path::new(&normalized)
        .file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.to_ascii_lowercase());
    let mut suffix_match: Option<String> = None;
    let mut basename_match: Option<String> = None;
    let mut basename_ambiguous = false;

    for index in 0..archive.len() {
        let Ok(file) = archive.by_index(index) else {
            continue;
        };
        let candidate = normalize_zip_path(file.name());
        let candidate_lower = candidate.to_ascii_lowercase();
        drop(file);

        if candidate_lower == normalized_lower {
            let bytes = read_zip_bytes_exact(archive, &candidate)?;
            return Ok((candidate, bytes));
        }

        if !path_without_root_lower.is_empty()
            && (candidate_lower == path_without_root_lower
                || candidate_lower.ends_with(&format!("/{path_without_root_lower}")))
        {
            let bytes = read_zip_bytes_exact(archive, &candidate)?;
            return Ok((candidate, bytes));
        }

        if candidate_lower.ends_with(&format!("/{normalized_lower}")) {
            suffix_match = Some(candidate);
            continue;
        }

        if let Some(file_name) = &file_name_lower {
            let candidate_file_name = Path::new(&candidate_lower)
                .file_name()
                .and_then(|name| name.to_str());
            if candidate_file_name == Some(file_name.as_str()) {
                if basename_match.is_some() {
                    basename_ambiguous = true;
                } else {
                    basename_match = Some(candidate);
                }
            }
        }
    }

    let fallback_match = suffix_match.or({
        if basename_ambiguous {
            None
        } else {
            basename_match
        }
    });
    if let Some(candidate) = fallback_match {
        let bytes = read_zip_bytes_exact(archive, &candidate)?;
        eprintln!("EPUB resource fallback matched: requested={path}, actual={candidate}");
        return Ok((candidate, bytes));
    }

    Err(format!("EPUB 缺少资源: {path}"))
}

fn read_zip_bytes_exact(archive: &mut ZipArchive<File>, path: &str) -> Result<Vec<u8>, String> {
    let mut file = archive.by_name(path).map_err(|err| err.to_string())?;
    let mut bytes = Vec::with_capacity(file.size() as usize);
    file.read_to_end(&mut bytes)
        .map_err(|err| err.to_string())?;
    Ok(bytes)
}

fn strip_first_zip_segment(path: &str) -> String {
    path.split_once('/')
        .map(|(_, rest)| rest.to_string())
        .unwrap_or_default()
}

fn is_epub_text_resource(media_type: &str) -> bool {
    media_type.starts_with("text/")
        || matches!(
            media_type,
            "application/xhtml+xml"
                | "application/xml"
                | "application/x-dtbncx+xml"
                | "application/javascript"
                | "application/json"
                | "image/svg+xml"
        )
}

fn parse_epub_metadata(
    app: &AppHandle,
    path: &Path,
    book_id: &str,
) -> Result<ParsedEpubMetadata, String> {
    let file = File::open(path).map_err(|err| err.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|err| err.to_string())?;
    let container = read_zip_text(&mut archive, "META-INF/container.xml")?;
    let doc = Document::parse(&container).map_err(|err| err.to_string())?;
    let opf_path = doc
        .descendants()
        .find(|node| node.tag_name().name() == "rootfile")
        .and_then(|node| node.attribute("full-path"))
        .ok_or_else(|| "EPUB 缺少 OPF 路径".to_string())?
        .to_string();

    let opf = read_zip_text(&mut archive, &opf_path)?;
    let opf_doc = Document::parse(&opf).map_err(|err| err.to_string())?;
    let title = first_text(&opf_doc, "title").unwrap_or_else(|| fallback_title(path));
    let author = first_text(&opf_doc, "creator").unwrap_or_else(|| "Unknown Author".to_string());
    let series_name = epub_meta_content(&opf_doc, "calibre:series")
        .or_else(|| epub_collection_metadata(&opf_doc));
    let series_index =
        epub_meta_content(&opf_doc, "calibre:series_index").and_then(|value| value.parse().ok());
    let cover = find_epub_cover(app, &mut archive, &opf_doc, &opf_path, book_id).ok();

    Ok((title, author, cover, series_name, series_index))
}

fn first_text(doc: &Document, tag_name: &str) -> Option<String> {
    doc.descendants()
        .find(|node| node.tag_name().name() == tag_name)
        .and_then(|node| node.text())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn epub_meta_content(doc: &Document, name: &str) -> Option<String> {
    doc.descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("name")
                    .map(|value| value.eq_ignore_ascii_case(name))
                    .unwrap_or(false)
        })
        .and_then(|node| node.attribute("content"))
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn epub_collection_metadata(doc: &Document) -> Option<String> {
    doc.descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("property")
                    .map(|value| value == "belongs-to-collection")
                    .unwrap_or(false)
        })
        .and_then(|node| node.text())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn find_epub_cover(
    app: &AppHandle,
    archive: &mut ZipArchive<File>,
    doc: &Document,
    opf_path: &str,
    book_id: &str,
) -> Result<String, String> {
    let cover_id = doc
        .descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("name")
                    .map(|value| value.eq_ignore_ascii_case("cover"))
                    .unwrap_or(false)
        })
        .and_then(|node| node.attribute("content"))
        .map(str::to_string);

    let cover_item = doc.descendants().find(|node| {
        if node.tag_name().name() != "item" {
            return false;
        }

        let id_matches = cover_id
            .as_deref()
            .and_then(|id| node.attribute("id").map(|item_id| item_id == id))
            .unwrap_or(false);
        let property_matches = node
            .attribute("properties")
            .map(|properties| {
                properties
                    .split_whitespace()
                    .any(|property| property == "cover-image")
            })
            .unwrap_or(false);

        id_matches || property_matches
    });

    let href = cover_item
        .and_then(|node| node.attribute("href"))
        .ok_or_else(|| "EPUB 未声明封面".to_string())?;
    let archive_path = resolve_epub_path(opf_path, href);
    let mut file = archive
        .by_name(&archive_path)
        .map_err(|err| err.to_string())?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|err| err.to_string())?;
    let mime = mime_guess::from_path(&archive_path).first_or_octet_stream();
    let extension = mime_guess::get_mime_extensions(&mime)
        .and_then(|extensions| extensions.first().copied())
        .or_else(|| {
            Path::new(&archive_path)
                .extension()
                .and_then(|ext| ext.to_str())
        })
        .unwrap_or("img");
    let covers_dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("covers");
    fs::create_dir_all(&covers_dir).map_err(|err| err.to_string())?;
    let target = covers_dir.join(format!("{book_id}.{extension}"));
    fs::write(&target, bytes).map_err(|err| err.to_string())?;

    Ok(target.to_string_lossy().to_string())
}

fn read_zip_text(archive: &mut ZipArchive<File>, path: &str) -> Result<String, String> {
    let mut file = archive.by_name(path).map_err(|err| err.to_string())?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|err| err.to_string())?;
    Ok(content)
}

fn normalize_zip_path(path: &str) -> String {
    path.replace('\\', "/")
        .split('/')
        .fold(Vec::<&str>::new(), |mut parts, part| {
            if part.is_empty() || part == "." {
                return parts;
            }
            if part == ".." {
                parts.pop();
            } else {
                parts.push(part);
            }
            parts
        })
        .join("/")
}

fn strip_fragment(path: &str) -> String {
    path.split(['#', '?']).next().unwrap_or(path).to_string()
}

fn zip_dirname(path: &str) -> String {
    let normalized = normalize_zip_path(path);
    normalized
        .rfind('/')
        .map(|index| normalized[..index].to_string())
        .unwrap_or_default()
}

fn resolve_zip_href(base_dir: &str, href: &str) -> String {
    if is_external_href(href) {
        return href.to_string();
    }
    let decoded_href = percent_decode_str(href).decode_utf8_lossy();
    normalize_zip_path(&format!(
        "{}{}{}",
        base_dir,
        if base_dir.is_empty() { "" } else { "/" },
        decoded_href
    ))
}

fn is_external_href(value: &str) -> bool {
    value.starts_with('#')
        || value.contains("://")
        || value.starts_with("data:")
        || value.starts_with("blob:")
}

fn mime_from_path(path: &str) -> String {
    let clean = strip_fragment(path);
    match clean
        .rsplit('.')
        .next()
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "xhtml" | "xml" => "application/xhtml+xml",
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "otf" => "font/otf",
        "ttf" => "font/ttf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ncx" => "application/x-dtbncx+xml",
        "js" => "application/javascript",
        "json" => "application/json",
        _ => "application/octet-stream",
    }
    .to_string()
}

fn resolve_epub_path(opf_path: &str, href: &str) -> String {
    let decoded_href = percent_decode_str(href).decode_utf8_lossy();
    let parent = Path::new(opf_path)
        .parent()
        .map(|path| path.to_string_lossy().replace('\\', "/"));
    match parent {
        Some(parent) if !parent.is_empty() => format!("{parent}/{decoded_href}"),
        _ => decoded_href.to_string(),
    }
}

fn parse_filename_metadata(path: &Path) -> (String, String) {
    let stem = fallback_title(path);
    parse_filename_metadata_from_stem(&stem)
}

fn parse_filename_metadata_str(file_name: &str) -> (String, String) {
    let stem = Path::new(file_name)
        .file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or(file_name)
        .trim()
        .to_string();
    parse_filename_metadata_from_stem(&stem)
}

fn parse_filename_metadata_from_stem(stem: &str) -> (String, String) {
    if let Some((author, title)) = stem.split_once(" - ") {
        return (title.trim().to_string(), author.trim().to_string());
    }
    (stem.to_string(), "Unknown Author".to_string())
}

fn fallback_title(path: &Path) -> String {
    path.file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or("Unknown Title")
        .trim()
        .to_string()
}

fn stable_book_id(path: &Path) -> String {
    let mut hasher = Sha256::new();
    hasher.update(path.to_string_lossy().as_bytes());
    let digest = hasher.finalize();
    format!(
        "book-{:x}",
        &digest[..8]
            .iter()
            .fold(0u64, |acc, byte| (acc << 8) | u64::from(*byte))
    )
}

fn stable_remote_book_id(remote_path: &str) -> String {
    format!("webdav-{}", hash_string(remote_path))
}

fn now_millis() -> u64 {
    now_millis_u128() as u64
}

fn now_millis_u128() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}

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

async fn webdav_list_directory(
    client: &reqwest::Client,
    config: &WebDavConfig,
    base_url: &Url,
    directory_url: &Url,
) -> Result<Vec<WebDavEntry>, String> {
    let response = client
        .request(
            Method::from_bytes(b"PROPFIND").map_err(|err| err.to_string())?,
            directory_url.clone(),
        )
        .basic_auth(&config.username, config.password.clone())
        .header("depth", "1")
        .header("content-type", "application/xml; charset=utf-8")
        .body(
            r#"<?xml version="1.0" encoding="utf-8" ?>
<propfind xmlns="DAV:">
  <prop>
    <displayname />
    <getcontentlength />
    <getlastmodified />
    <resourcetype />
  </prop>
</propfind>"#,
        )
        .send()
        .await
        .map_err(|err| format!("WebDAV 目录读取失败: {err}"))?;

    if !response.status().is_success() && response.status().as_u16() != 207 {
        return Err(format!(
            "WebDAV 目录读取失败，服务器返回 {}",
            response.status()
        ));
    }

    let body = response
        .text()
        .await
        .map_err(|err| format!("WebDAV 目录响应解析失败: {err}"))?;
    parse_webdav_multistatus(base_url, directory_url, &body)
}

fn parse_webdav_multistatus(
    base_url: &Url,
    directory_url: &Url,
    xml: &str,
) -> Result<Vec<WebDavEntry>, String> {
    let doc = Document::parse(xml).map_err(|err| format!("WebDAV XML 解析失败: {err}"))?;
    let directory_href = directory_url.path().trim_end_matches('/').to_string();
    let mut entries = Vec::new();

    for response in doc
        .descendants()
        .filter(|node| node.tag_name().name() == "response")
    {
        let href_value = response
            .children()
            .find(|node| node.tag_name().name() == "href")
            .and_then(|node| node.text())
            .map(str::trim)
            .unwrap_or_default();
        if href_value.is_empty() {
            continue;
        }

        let Ok(absolute_url) = base_url.join(href_value) else {
            continue;
        };
        let absolute_path = absolute_url.path().trim_end_matches('/').to_string();
        if absolute_path == directory_href {
            continue;
        }

        let prop = response
            .descendants()
            .find(|node| node.tag_name().name() == "prop");
        let is_dir = prop
            .and_then(|node| {
                node.children()
                    .find(|child| child.tag_name().name() == "resourcetype")
            })
            .map(|node| {
                node.children()
                    .any(|child| child.tag_name().name() == "collection")
            })
            .unwrap_or(false);
        let remote_path = webdav_remote_path_from_url(base_url, &absolute_url)?;
        let file_name = remote_path
            .rsplit('/')
            .next()
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| {
                href_value
                    .trim_end_matches('/')
                    .rsplit('/')
                    .next()
                    .unwrap_or("untitled")
            })
            .to_string();
        let size = prop
            .and_then(|node| {
                node.children()
                    .find(|child| child.tag_name().name() == "getcontentlength")
            })
            .and_then(|node| node.text())
            .and_then(|value| value.trim().parse::<u64>().ok());

        entries.push(WebDavEntry {
            remote_path,
            file_name,
            is_dir,
            size,
            modified_at: None,
        });
    }

    Ok(entries)
}

async fn webdav_download_file_bytes(
    client: &reqwest::Client,
    config: &WebDavConfig,
    remote_path: &str,
) -> Result<Vec<u8>, String> {
    let target = webdav_url_for_remote_path(config, remote_path)?;
    let response = client
        .get(target)
        .basic_auth(&config.username, config.password.clone())
        .send()
        .await
        .map_err(|err| format!("WebDAV 文件下载失败: {err}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "WebDAV 文件下载失败，服务器返回 {}",
            response.status()
        ));
    }

    response
        .bytes()
        .await
        .map(|bytes| bytes.to_vec())
        .map_err(|err| format!("WebDAV 文件读取失败: {err}"))
}

fn webdav_base_url(config: &WebDavConfig) -> Result<Url, String> {
    let base = config.url.trim();
    if base.is_empty() {
        return Err("请填写 WebDAV 地址".into());
    }
    let with_trailing_slash = if base.ends_with('/') {
        base.to_string()
    } else {
        format!("{base}/")
    };
    Url::parse(&with_trailing_slash).map_err(|err| format!("WebDAV 地址无效: {err}"))
}

fn webdav_url_for_remote_path(config: &WebDavConfig, remote_path: &str) -> Result<Url, String> {
    let mut url = webdav_base_url(config)?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "WebDAV 地址不支持路径拼接".to_string())?;
        segments.pop_if_empty();
        for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
            segments.push(segment);
        }
    }
    Ok(url)
}

fn webdav_remote_path_from_url(base_url: &Url, absolute_url: &Url) -> Result<String, String> {
    let base_path = base_url.path().trim_end_matches('/');
    let absolute_path = absolute_url.path();
    let is_within_base = absolute_path == base_path
        || absolute_path
            .strip_prefix(base_path)
            .is_some_and(|suffix| suffix.starts_with('/'));
    if !is_within_base {
        return Err("WebDAV 返回了不在当前目录下的路径".into());
    }
    let relative = absolute_path
        .trim_start_matches(base_path)
        .trim_start_matches('/');
    Ok(percent_decode_str(relative).decode_utf8_lossy().to_string())
}

fn webdav_cached_book_path(app: &AppHandle, remote_path: &str) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("webdav-books");
    fs::create_dir_all(&dir).map_err(|err| format!("创建 WebDAV 图书缓存失败: {err}"))?;
    let extension = Path::new(remote_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .filter(|ext| !ext.is_empty())
        .unwrap_or("book");
    Ok(dir.join(format!("{}.{}", hash_string(remote_path), extension)))
}

fn trim_txt_cache(books: &mut HashMap<String, TxtBookCache>) {
    while books.len() > TXT_BOOK_CACHE_LIMIT {
        let Some(path) = books
            .iter()
            .filter(|(_, cache)| cache.active_sessions.is_empty())
            .min_by_key(|(_, cache)| cache.last_used_at)
            .map(|(path, _)| path.clone())
        else {
            break;
        };
        books.remove(&path);
    }
}

fn trim_epub_cache(books: &mut HashMap<String, EpubBookCache>) {
    while books.len() > EPUB_BOOK_CACHE_LIMIT {
        let Some(path) = books
            .iter()
            .filter(|(_, cache)| cache.active_sessions.is_empty())
            .min_by_key(|(_, cache)| cache.last_used_at)
            .map(|(path, _)| path.clone())
        else {
            break;
        };
        books.remove(&path);
    }
}

fn webdav_state_url(config: &WebDavConfig) -> Result<String, String> {
    let mut url = webdav_base_url(config)?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "WebDAV 地址不支持状态文件路径".to_string())?;
        segments.pop_if_empty();
        segments.push("zenith-reader-state.json");
    }
    Ok(url.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .manage(ReaderState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_library,
            open_txt_book,
            read_txt_window,
            close_txt_book,
            open_epub_book,
            read_epub_resource,
            prefetch_epub_resources,
            close_epub_book,
            write_binary_file,
            webdav_upload_snapshot,
            webdav_download_snapshot,
            webdav_list_books,
            webdav_cache_book,
            webdav_download_book_to_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use zip::ZipWriter;

    fn test_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "zenith-reader-{name}-{}-{}",
            std::process::id(),
            now_millis_u128()
        ))
    }

    #[test]
    fn txt_index_and_window_reads_are_character_accurate() {
        let path = test_path("utf8-window.txt");
        let text = format!(
            "第一章 序\n{}第二章 开始\n尾声🙂\n",
            "正文🙂alpha\n".repeat(900)
        );
        fs::write(&path, text.as_bytes()).unwrap();

        let (total_chars, checkpoints, chapters) = build_txt_index(&path).unwrap();
        assert_eq!(total_chars, text.chars().count());
        assert!(checkpoints.len() >= 3);
        assert_eq!(
            chapters.first().map(|chapter| chapter.title.as_str()),
            Some("第一章 序")
        );
        assert!(
            chapters
                .iter()
                .any(|chapter| chapter.title == "第二章 开始")
        );

        let cache = TxtBookCache {
            signature: file_signature(path.to_str().unwrap()).unwrap(),
            last_used_at: 0,
            active_sessions: HashSet::new(),
            encoding: "utf-8".to_string(),
            data_path: path.clone(),
            total_chars,
            total_bytes: text.len() as u64,
            checkpoints,
            chapters,
        };
        let start = TXT_CHAR_CHECKPOINT_INTERVAL - 17;
        let end = TXT_CHAR_CHECKPOINT_INTERVAL + 31;
        let expected = text
            .chars()
            .skip(start)
            .take(end - start)
            .collect::<String>();
        assert_eq!(read_txt_char_range(&cache, start, end).unwrap(), expected);

        fs::remove_file(path).unwrap();
    }

    #[test]
    fn txt_index_rejects_non_utf8_input_without_retaining_the_book() {
        let path = test_path("invalid-utf8.txt");
        fs::write(&path, [0xD6, 0xD0, 0xCE, 0xC4, b'\n']).unwrap();
        assert!(matches!(
            build_txt_index(&path),
            Err(TxtIndexError::InvalidUtf8)
        ));
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn gbk_txt_cache_is_streamed_to_utf8() {
        let source_path = test_path("gbk-source.txt");
        let target_path = test_path("gbk-target.txt");
        let expected = "第一章 中文测试\n正文\n";
        let (encoded, _, _) = GBK.encode(expected);
        fs::write(&source_path, encoded.as_ref()).unwrap();

        write_utf8_txt_cache(File::open(&source_path).unwrap(), &target_path, Some(GBK)).unwrap();
        let decoded = fs::read_to_string(&target_path).unwrap();
        assert_eq!(decoded, expected);

        fs::remove_file(source_path).unwrap();
        fs::remove_file(target_path).unwrap();
    }

    #[test]
    fn utf16_bom_is_detected_and_streamed_to_utf8() {
        let source_path = test_path("utf16-source.txt");
        let target_path = test_path("utf16-target.txt");
        let expected = "第一章 UTF-16\n正文\n";
        let mut bytes = vec![0xFF, 0xFE];
        bytes.extend(expected.encode_utf16().flat_map(|unit| unit.to_le_bytes()));
        fs::write(&source_path, bytes).unwrap();
        assert!(matches!(
            detect_txt_bom(source_path.to_str().unwrap()).unwrap(),
            Some(TxtBom::Utf16Le)
        ));

        let mut source = File::open(&source_path).unwrap();
        source.seek(SeekFrom::Start(2)).unwrap();
        write_utf8_txt_cache(source, &target_path, Some(UTF_16LE)).unwrap();
        assert_eq!(fs::read_to_string(&target_path).unwrap(), expected);

        fs::remove_file(source_path).unwrap();
        fs::remove_file(target_path).unwrap();
    }

    #[test]
    fn stale_txt_session_cannot_read_a_newer_session() {
        let path = test_path("session.txt");
        let text = "第一章\n会话隔离\n";
        fs::write(&path, text).unwrap();
        let (total_chars, checkpoints, chapters) = build_txt_index(&path).unwrap();
        let path_string = path.to_string_lossy().to_string();
        let mut sessions = HashSet::new();
        sessions.insert("current".to_string());
        let state = ReaderState::default();
        state.txt_books.lock().unwrap().insert(
            path_string.clone(),
            TxtBookCache {
                signature: file_signature(&path_string).unwrap(),
                last_used_at: 0,
                active_sessions: sessions,
                encoding: "utf-8".to_string(),
                data_path: path.clone(),
                total_chars,
                total_bytes: text.len() as u64,
                checkpoints,
                chapters,
            },
        );

        assert!(read_txt_window_blocking(&state, &path_string, "stale", 0, 3).is_err());
        assert_eq!(
            read_txt_window_blocking(&state, &path_string, "current", 0, 3)
                .unwrap()
                .text,
            "第一章"
        );

        drop(state);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn epub_resource_cache_honors_lru_count_and_byte_limits() {
        let path = test_path("empty.epub");
        ZipWriter::new(File::create(&path).unwrap())
            .finish()
            .unwrap();
        let mut cache = EpubBookCache {
            signature: file_signature(path.to_str().unwrap()).unwrap(),
            last_used_at: 0,
            active_sessions: HashSet::new(),
            info: EpubBookInfo {
                metadata: EpubMetadataInfo {
                    title: "Test".to_string(),
                    author: None,
                    language: "en".to_string(),
                    layout: "reflowable".to_string(),
                    reading_progression: "ltr".to_string(),
                },
                reading_order: vec![],
                resources: vec![],
                toc: vec![],
            },
            manifest_items: vec![],
            resource_cache: HashMap::new(),
            resource_order: VecDeque::new(),
            resource_bytes: 0,
            archive: open_epub_archive(path.to_str().unwrap()).unwrap(),
        };

        for (href, size) in [("a", 3usize), ("b", 4), ("c", 5)] {
            let resource = EpubCachedResource {
                bytes: Arc::from(vec![0u8; size]),
                media_type: "text/plain".to_string(),
            };
            cache.resource_bytes += size;
            cache.resource_order.push_back(href.to_string());
            cache.resource_cache.insert(href.to_string(), resource);
        }
        touch_epub_resource(&mut cache, "a");
        trim_epub_resource_cache(&mut cache, 2, 8);
        assert!(cache.resource_cache.contains_key("a"));
        assert!(cache.resource_cache.contains_key("c"));
        assert!(!cache.resource_cache.contains_key("b"));
        assert_eq!(cache.resource_bytes, 8);

        drop(cache);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn webdav_paths_must_stay_on_a_segment_boundary() {
        let base = Url::parse("https://example.com/dav/books/").unwrap();
        let valid = Url::parse("https://example.com/dav/books/series/book.epub").unwrap();
        let sibling = Url::parse("https://example.com/dav/books-private/book.epub").unwrap();

        assert_eq!(
            webdav_remote_path_from_url(&base, &valid).unwrap(),
            "series/book.epub"
        );
        assert!(webdav_remote_path_from_url(&base, &sibling).is_err());
    }

    #[test]
    #[ignore = "set ZENITH_EPUB_PROBE to exercise a real EPUB"]
    fn probe_real_epub_from_environment() {
        let path = std::env::var("ZENITH_EPUB_PROBE").expect("ZENITH_EPUB_PROBE is required");
        let started = std::time::Instant::now();
        let (manifest, info) = load_epub_book(&path, "Probe").unwrap();
        let first_href = info
            .reading_order
            .first()
            .map(|link| link.href.as_str())
            .expect("EPUB reading order must not be empty");
        let mut archive = open_epub_archive(&path).unwrap();
        let (_, first_resource) = read_zip_bytes_flexible(&mut archive, first_href).unwrap();
        eprintln!(
            "EPUB probe: {} ms, {} manifest items, {} spine items, first resource {} bytes",
            started.elapsed().as_millis(),
            manifest.len(),
            info.reading_order.len(),
            first_resource.len()
        );
    }
}
