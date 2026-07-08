use base64::{Engine as _, engine::general_purpose};
use encoding_rs::{GBK, UTF_8};
use percent_encoding::percent_decode_str;
use reqwest::{Method, StatusCode, Url};
use roxmltree::Document;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::Read,
    path::{Path, PathBuf},
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Manager};
use walkdir::WalkDir;
use zip::ZipArchive;

const TXT_CHAR_CHECKPOINT_INTERVAL: usize = 4096;
const TXT_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_RESOURCE_CACHE_LIMIT: usize = 96;
const PERSISTENT_CACHE_VERSION: u8 = 2;
const TXT_PERSISTENT_CACHE_MAX_BYTES: u64 = 80 * 1024 * 1024;

#[derive(Default)]
struct ReaderState {
    txt_books: Mutex<HashMap<String, TxtBookCache>>,
    epub_books: Mutex<HashMap<String, EpubBookCache>>,
}

#[derive(Debug)]
struct TxtBookCache {
    signature: FileSignature,
    last_used_at: u128,
    open_count: usize,
    encoding: String,
    text: String,
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

#[derive(Debug, Clone)]
struct EpubBookCache {
    signature: FileSignature,
    last_used_at: u128,
    open_count: usize,
    info: EpubBookInfo,
    manifest_items: Vec<EpubManifestItem>,
    resource_cache: HashMap<String, EpubCachedResource>,
    resource_order: VecDeque<String>,
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
    bytes: Vec<u8>,
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
struct PersistentTxtBookCache {
    version: u8,
    path: String,
    signature: FileSignature,
    encoding: String,
    text: String,
    total_chars: usize,
    total_bytes: u64,
    checkpoints: Vec<(usize, usize)>,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistentTxtIndexCache {
    version: u8,
    path: String,
    signature: FileSignature,
    encoding: String,
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
            if visited % 500 == 0 {
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
            if visited % 500 == 0 {
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

#[tauri::command]
fn open_txt_book(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    path: String,
) -> Result<TxtBookInfo, String> {
    let signature = file_signature(&path)?;
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    let should_reload = books
        .get(&path)
        .map(|cache| cache.signature != signature)
        .unwrap_or(true);

    if should_reload {
        let cache = load_txt_book_from_persistent_cache(&app, &path, signature, 1)
            .unwrap_or_else(|| load_txt_book_with_persistent_index(&app, &path, signature, 1));
        let cache = cache?;
        save_txt_book_to_persistent_cache(&app, &path, &cache);
        save_txt_index_to_persistent_cache(&app, &path, &cache);
        books.insert(path.clone(), cache);
    } else if let Some(cache) = books.get_mut(&path) {
        cache.open_count = cache.open_count.saturating_add(1);
        cache.last_used_at = now_millis_u128();
    }

    trim_txt_cache(&mut books);
    let cache = books
        .get(&path)
        .ok_or_else(|| "TXT 缓存初始化失败".to_string())?;

    Ok(TxtBookInfo {
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        chapters: cache.chapters.clone(),
    })
}

#[tauri::command]
fn read_txt_window(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    path: String,
    start: usize,
    end: usize,
) -> Result<TxtTextWindow, String> {
    let signature = file_signature(&path)?;
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    let should_reload = books
        .get(&path)
        .map(|cache| cache.signature != signature)
        .unwrap_or(true);
    if should_reload {
        let cache = load_txt_book_from_persistent_cache(&app, &path, signature, 1)
            .unwrap_or_else(|| load_txt_book_with_persistent_index(&app, &path, signature, 1))?;
        save_txt_book_to_persistent_cache(&app, &path, &cache);
        save_txt_index_to_persistent_cache(&app, &path, &cache);
        books.insert(path.clone(), cache);
    }
    let cache = books
        .get_mut(&path)
        .ok_or_else(|| "TXT 缓存读取失败".to_string())?;
    cache.last_used_at = now_millis_u128();
    let start = start.min(cache.total_chars);
    let end = end.max(start).min(cache.total_chars);
    let start_byte = byte_index_for_char(cache, start);
    let end_byte = byte_index_for_char(cache, end);

    Ok(TxtTextWindow {
        start,
        end,
        text: cache.text[start_byte..end_byte].to_string(),
    })
}

#[tauri::command]
fn close_txt_book(state: tauri::State<'_, ReaderState>, path: String) -> Result<(), String> {
    let mut books = state
        .txt_books
        .lock()
        .map_err(|_| "TXT 缓存被占用".to_string())?;
    if let Some(cache) = books.get_mut(&path) {
        cache.open_count = cache.open_count.saturating_sub(1);
        cache.last_used_at = now_millis_u128();
    }
    trim_txt_cache(&mut books);
    Ok(())
}

#[tauri::command]
fn open_epub_book(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    path: String,
    fallback_title: String,
) -> Result<EpubBookInfo, String> {
    let signature = file_signature(&path)?;
    clean_old_epub_resource_cache_dirs(&app, &path, signature);
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let should_reload = books
        .get(&path)
        .map(|cache| cache.signature != signature)
        .unwrap_or(true);

    if should_reload {
        let (manifest_items, info) = load_epub_book_from_persistent_cache(&app, &path, signature)
            .unwrap_or_else(|| load_epub_book(&path, &fallback_title))?;
        books.insert(
            path.clone(),
            EpubBookCache {
                signature,
                last_used_at: now_millis_u128(),
                open_count: 1,
                info,
                manifest_items,
                resource_cache: HashMap::new(),
                resource_order: VecDeque::new(),
            },
        );
        if let Some(cache) = books.get(&path) {
            save_epub_book_to_persistent_cache(&app, &path, cache);
        }
    } else if let Some(cache) = books.get_mut(&path) {
        cache.open_count = cache.open_count.saturating_add(1);
        cache.last_used_at = now_millis_u128();
    }

    trim_epub_cache(&mut books);
    books
        .get(&path)
        .map(|cache| cache.info.clone())
        .ok_or_else(|| "EPUB 缓存初始化失败".to_string())
}

#[tauri::command]
fn read_epub_resource(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    path: String,
    href: String,
) -> Result<EpubResourcePayload, String> {
    let normalized_href = strip_fragment(&normalize_zip_path(&href));
    let resource = read_cached_epub_resource(&state, &path, &href)?;
    if is_epub_text_resource(&resource.media_type) {
        let (text, _, _) = UTF_8.decode(&resource.bytes);
        Ok(EpubResourcePayload {
            href: normalized_href,
            media_type: resource.media_type,
            text: Some(text.into_owned()),
            base64: None,
            file_path: None,
        })
    } else {
        let signature = file_signature(&path)?;
        if let Some(file_path) =
            save_epub_resource_file(&app, &path, signature, &normalized_href, &resource)
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
            base64: Some(general_purpose::STANDARD.encode(resource.bytes)),
            file_path: None,
        })
    }
}

#[tauri::command]
fn prefetch_epub_resources(
    app: AppHandle,
    state: tauri::State<'_, ReaderState>,
    path: String,
    hrefs: Vec<String>,
) -> Result<(), String> {
    let signature = file_signature(&path)?;
    for href in hrefs {
        if let Ok(resource) = read_cached_epub_resource(&state, &path, &href) {
            if !is_epub_text_resource(&resource.media_type) {
                let normalized_href = strip_fragment(&normalize_zip_path(&href));
                let _ =
                    save_epub_resource_file(&app, &path, signature, &normalized_href, &resource);
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn close_epub_book(state: tauri::State<'_, ReaderState>, path: String) -> Result<(), String> {
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    if let Some(cache) = books.get_mut(&path) {
        cache.open_count = cache.open_count.saturating_sub(1);
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

fn decode_txt_to_utf8(bytes: &[u8]) -> (String, String) {
    let (text, _, had_errors) = UTF_8.decode(bytes);
    if !had_errors {
        return (text.into_owned(), "utf-8".to_string());
    }

    let (text, _, _) = GBK.decode(bytes);
    (text.into_owned(), "gbk".to_string())
}

fn load_txt_book_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    open_count: usize,
) -> Option<Result<TxtBookCache, String>> {
    let cache_path = persistent_cache_path(app, "recent-txt.json").ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentTxtBookCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
    {
        return None;
    }

    Some(Ok(TxtBookCache {
        signature,
        last_used_at: now_millis_u128(),
        open_count,
        encoding: cached.encoding,
        text: cached.text,
        total_chars: cached.total_chars,
        total_bytes: cached.total_bytes,
        checkpoints: cached.checkpoints,
        chapters: cached.chapters,
    }))
}

fn load_txt_book_with_persistent_index(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    open_count: usize,
) -> Result<TxtBookCache, String> {
    let bytes = fs::read(path).map_err(|err| format!("读取 TXT 失败: {err}"))?;
    let total_bytes = bytes.len() as u64;
    let (text, encoding) = decode_txt_to_utf8(&bytes);
    if let Some(index) = load_txt_index_from_persistent_cache(app, path, signature) {
        if index.encoding == encoding && index.total_bytes == total_bytes {
            return Ok(TxtBookCache {
                signature,
                last_used_at: now_millis_u128(),
                open_count,
                encoding,
                text,
                total_chars: index.total_chars,
                total_bytes,
                checkpoints: index.checkpoints,
                chapters: index.chapters,
            });
        }
    }

    let checkpoints = build_char_checkpoints(&text);
    let total_chars = checkpoints
        .last()
        .map(|(char_index, _)| *char_index)
        .unwrap_or_else(|| text.chars().count());
    let chapters = parse_txt_chapter_index(&text);
    Ok(TxtBookCache {
        signature,
        last_used_at: now_millis_u128(),
        open_count,
        encoding,
        text,
        total_chars,
        total_bytes,
        checkpoints,
        chapters,
    })
}

fn load_txt_index_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Option<PersistentTxtIndexCache> {
    let cache_path = persistent_cache_path(app, "recent-txt-index.json").ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentTxtIndexCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
    {
        return None;
    }
    Some(cached)
}

fn save_txt_book_to_persistent_cache(app: &AppHandle, path: &str, cache: &TxtBookCache) {
    if cache.total_bytes > TXT_PERSISTENT_CACHE_MAX_BYTES {
        return;
    }
    let Ok(cache_path) = persistent_cache_path(app, "recent-txt.json") else {
        return;
    };
    let payload = PersistentTxtBookCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        encoding: cache.encoding.clone(),
        text: cache.text.clone(),
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        checkpoints: cache.checkpoints.clone(),
        chapters: cache.chapters.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = fs::write(cache_path, bytes);
    }
}

fn save_txt_index_to_persistent_cache(app: &AppHandle, path: &str, cache: &TxtBookCache) {
    let Ok(cache_path) = persistent_cache_path(app, "recent-txt-index.json") else {
        return;
    };
    let payload = PersistentTxtIndexCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        encoding: cache.encoding.clone(),
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        checkpoints: cache.checkpoints.clone(),
        chapters: cache.chapters.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = fs::write(cache_path, bytes);
    }
}

fn build_char_checkpoints(text: &str) -> Vec<(usize, usize)> {
    let mut checkpoints = vec![(0, 0)];
    let mut char_index = 0usize;
    for (byte_index, _) in text.char_indices() {
        if char_index > 0 && char_index % TXT_CHAR_CHECKPOINT_INTERVAL == 0 {
            checkpoints.push((char_index, byte_index));
        }
        char_index += 1;
    }
    checkpoints.push((char_index, text.len()));
    checkpoints
}

fn byte_index_for_char(cache: &TxtBookCache, target: usize) -> usize {
    let target = target.min(cache.total_chars);
    if target == cache.total_chars {
        return cache.text.len();
    }

    let checkpoint_index = cache
        .checkpoints
        .partition_point(|(char_index, _)| *char_index <= target)
        .saturating_sub(1);
    let (base_char, base_byte) = cache.checkpoints[checkpoint_index];
    let remaining = target.saturating_sub(base_char);
    if remaining == 0 {
        return base_byte;
    }

    cache.text[base_byte..]
        .char_indices()
        .nth(remaining)
        .map(|(byte_offset, _)| base_byte + byte_offset)
        .unwrap_or_else(|| cache.text.len())
}

fn parse_txt_chapter_index(text: &str) -> Vec<TxtChapterInfo> {
    let mut chapters = Vec::new();
    let mut char_index = 0usize;

    for line in text.split_inclusive('\n') {
        let title = line.trim();
        if is_txt_chapter_heading(title) {
            chapters.push(TxtChapterInfo {
                id: format!("chapter-{}", chapters.len() + 1),
                title: title.to_string(),
                start_index: char_index,
            });
        }
        char_index += line.chars().count();
    }

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
    let cache_path = persistent_cache_path(app, "recent-epub.json").ok()?;
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
    let Ok(cache_path) = persistent_cache_path(app, "recent-epub.json") else {
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
        let _ = fs::write(cache_path, bytes);
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
    {
        if let Ok(nav) = read_zip_text(archive, &nav_item.absolute_href) {
            if let Ok(doc) = Document::parse(&nav) {
                let nav_node = doc.descendants().find(|node| {
                    node.tag_name().name() == "nav"
                        && (node.attribute("type") == Some("toc")
                            || node.attribute(("http://www.idpf.org/2007/ops", "type"))
                                == Some("toc"))
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
        }
    }

    if let Some(ncx_item) = manifest_items
        .iter()
        .find(|item| item.media_type == "application/x-dtbncx+xml")
    {
        if let Ok(ncx) = read_zip_text(archive, &ncx_item.absolute_href) {
            if let Ok(doc) = Document::parse(&ncx) {
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
        }
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
    state: &tauri::State<'_, ReaderState>,
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
            if let Some(resource) = book.resource_cache.get(&normalized_href) {
                return Ok(resource.clone());
            }
        }
    }

    let (media_type, bytes) = read_epub_resource_bytes(state, path, &normalized_href)?;
    let resource = EpubCachedResource { bytes, media_type };
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
    book.resource_cache
        .insert(normalized_href.clone(), resource.clone());
    book.resource_order.push_back(normalized_href.clone());
    while book.resource_order.len() > EPUB_RESOURCE_CACHE_LIMIT {
        if let Some(oldest) = book.resource_order.pop_front() {
            if oldest != normalized_href {
                book.resource_cache.remove(&oldest);
            }
        }
    }
    Ok(resource)
}

fn read_epub_resource_bytes(
    state: &tauri::State<'_, ReaderState>,
    path: &str,
    href: &str,
) -> Result<(String, Vec<u8>), String> {
    let manifest_item = {
        let books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        books.get(path).and_then(|book| {
            book.manifest_items
                .iter()
                .find(|item| strip_fragment(&item.absolute_href) == href)
                .cloned()
        })
    };

    let file = File::open(path).map_err(|err| format!("打开 EPUB 失败: {err}"))?;
    let mut archive = ZipArchive::new(file).map_err(|err| format!("读取 EPUB 失败: {err}"))?;
    let (archive_path, media_type) = manifest_item
        .map(|item| (item.absolute_href, item.media_type))
        .unwrap_or_else(|| (href.to_string(), mime_from_path(href)));
    let (_, bytes) = read_zip_bytes_flexible(&mut archive, &archive_path)
        .map_err(|err| format!("读取 EPUB 资源失败: {err}"))?;
    Ok((media_type, bytes))
}

fn read_zip_bytes_flexible(
    archive: &mut ZipArchive<File>,
    path: &str,
) -> Result<(String, Vec<u8>), String> {
    if let Ok(bytes) = read_zip_bytes_exact(archive, path) {
        return Ok((path.to_string(), bytes));
    }

    let decoded = percent_decode_str(path).decode_utf8_lossy().to_string();
    if decoded != path {
        if let Ok(bytes) = read_zip_bytes_exact(archive, &decoded) {
            return Ok((decoded, bytes));
        }
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

    let fallback_match = suffix_match.or_else(|| {
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
) -> Result<(String, String, Option<String>, Option<String>, Option<f64>), String> {
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

fn persistent_cache_path(app: &AppHandle, file_name: &str) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("recent-book");
    fs::create_dir_all(&dir).map_err(|err| format!("创建阅读缓存失败: {err}"))?;
    Ok(dir.join(file_name))
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
    let dir = epub_resource_cache_dir(app, path, signature).ok()?;
    fs::create_dir_all(&dir).ok()?;
    let extension = resource_extension(href, &resource.media_type);
    let file_path = dir.join(format!("{}.{}", hash_string(href), extension));
    if file_path.exists() {
        return Some(file_path);
    }
    fs::write(&file_path, &resource.bytes).ok()?;
    Some(file_path)
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
        .request(Method::from_bytes(b"PROPFIND").map_err(|err| err.to_string())?, directory_url.clone())
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
        return Err(format!("WebDAV 目录读取失败，服务器返回 {}", response.status()));
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
            .unwrap_or_else(|| href_value.trim_end_matches('/').rsplit('/').next().unwrap_or("untitled"))
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
        return Err(format!("WebDAV 文件下载失败，服务器返回 {}", response.status()));
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
    if !absolute_path.starts_with(base_path) {
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
            .filter(|(_, cache)| cache.open_count == 0)
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
            .filter(|(_, cache)| cache.open_count == 0)
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
