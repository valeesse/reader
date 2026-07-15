use axum::{
    Json, Router,
    body::Body,
    extract::{Query, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
    routing::{delete, get, post, put},
};
use reader_core::{Book, LibraryRegistry, ReaderError, ReaderService, ScanProgress};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{
    fs, io,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};
use tokio::sync::RwLock;
use tokio_util::io::ReaderStream;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

#[derive(Clone)]
pub struct ServerConfig {
    pub library_dir: PathBuf,
    pub state_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub dist_dir: PathBuf,
}

#[derive(Clone)]
struct AppState {
    reader: Arc<ReaderService>,
    scan: Arc<RwLock<ScanStatus>>,
    web_state: Arc<StateRepository>,
}

struct StateRepository {
    path: PathBuf,
    lock: Mutex<()>,
}

#[derive(Debug, Clone, Default, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanStatus {
    running: bool,
    visited: usize,
    matched: usize,
    current_relative_path: String,
    error: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResourceRequest {
    resource_id: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionRequest {
    resource_id: String,
    session_id: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TxtPreviewRequest {
    resource_id: String,
    max_chars: usize,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TxtWindowRequest {
    resource_id: String,
    session_id: String,
    start: usize,
    end: usize,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubOpenRequest {
    resource_id: String,
    fallback_title: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubReadRequest {
    resource_id: String,
    session_id: String,
    href: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubPrefetchRequest {
    resource_id: String,
    session_id: String,
    hrefs: Vec<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WebBook {
    id: String,
    resource_id: String,
    fingerprint: String,
    title: String,
    author: String,
    #[serde(rename = "type")]
    book_type: String,
    file_name: String,
    len: u64,
    modified_at: u64,
    cover: Option<String>,
    series_name: Option<String>,
    series_index: Option<f64>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WebEpubResourcePayload {
    href: String,
    media_type: String,
    text: Option<String>,
    binary_url: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CoverRequest {
    resource_id: String,
}

pub fn build_router(config: ServerConfig) -> Result<Router, Box<dyn std::error::Error>> {
    fs::create_dir_all(&config.library_dir)?;
    fs::create_dir_all(&config.state_dir)?;
    fs::create_dir_all(&config.cache_dir)?;
    let registry = LibraryRegistry::open(&config.library_dir, &config.state_dir)?;
    let reader = Arc::new(ReaderService::new(
        registry,
        &config.state_dir,
        &config.cache_dir,
    )?);
    if reader.books()?.is_empty() {
        reader.scan(|_| {})?;
    }
    let state = AppState {
        reader,
        scan: Arc::new(RwLock::new(ScanStatus::default())),
        web_state: Arc::new(StateRepository {
            path: config.state_dir.join("web-state-v1.json"),
            lock: Mutex::new(()),
        }),
    };
    Ok(Router::new()
        .route("/api/capabilities", get(capabilities))
        .route("/api/library/config", get(library_config))
        .route("/api/books", get(books))
        .route("/api/rescan", post(rescan))
        .route("/api/scan/status", get(scan_status))
        .route("/api/state", get(get_web_state))
        .route("/api/state/progress", put(put_progress))
        .route("/api/state/settings", put(put_settings))
        .route("/api/state/series", put(put_series))
        .route("/api/state/lastRead", put(put_last_read))
        .route("/api/cache/stats", get(cache_stats))
        .route("/api/cache", delete(clear_cache))
        .route("/api/txt/open", post(txt_open))
        .route("/api/txt/preview", post(txt_preview))
        .route("/api/txt/read", post(txt_read))
        .route("/api/txt/close", post(txt_close))
        .route("/api/epub/open", post(epub_open))
        .route("/api/epub/read", post(epub_read))
        .route("/api/epub/binary", get(epub_binary))
        .route("/api/covers", get(cover))
        .route("/api/epub/prefetch", post(epub_prefetch))
        .route("/api/epub/close", post(epub_close))
        .fallback_service(
            ServeDir::new(&config.dist_dir)
                .not_found_service(ServeFile::new(config.dist_dir.join("index.html"))),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(state))
}

async fn capabilities() -> Json<Value> {
    Json(
        json!({"library": true, "state": true, "txtReader": true, "epubReader": true, "authentication": false}),
    )
}
async fn library_config() -> Json<Value> {
    Json(json!({"configured": true, "root": null}))
}
async fn books(State(s): State<AppState>) -> Result<Json<Vec<WebBook>>, ApiError> {
    let books = s.reader.books()?;
    Ok(Json(books.into_iter().map(web_book).collect()))
}
async fn scan_status(State(s): State<AppState>) -> Json<ScanStatus> {
    Json(s.scan.read().await.clone())
}

async fn rescan(State(state): State<AppState>) -> Result<StatusCode, ApiError> {
    {
        let mut status = state.scan.write().await;
        if status.running {
            return Ok(StatusCode::ACCEPTED);
        }
        *status = ScanStatus {
            running: true,
            ..Default::default()
        };
    }
    tokio::spawn(async move {
        let reader = state.reader.clone();
        let scan = state.scan.clone();
        let result = tokio::task::spawn_blocking(move || {
            reader.scan(|p: ScanProgress| {
                if let Ok(mut status) = scan.try_write() {
                    *status = ScanStatus {
                        running: true,
                        visited: p.visited,
                        matched: p.matched,
                        current_relative_path: p.current_relative_path,
                        error: None,
                    };
                }
            })
        })
        .await;
        let mut status = state.scan.write().await;
        status.running = false;
        status.current_relative_path.clear();
        status.error = match result {
            Ok(Ok(_)) => None,
            Ok(Err(e)) => Some(e.to_string()),
            Err(e) => Some(e.to_string()),
        };
    });
    Ok(StatusCode::ACCEPTED)
}

async fn txt_open(
    State(s): State<AppState>,
    Json(r): Json<ResourceRequest>,
) -> Result<Json<reader_core::TxtBookInfo>, ApiError> {
    Ok(Json(run(move || s.reader.open_txt(&r.resource_id)).await?))
}
async fn txt_preview(
    State(s): State<AppState>,
    Json(r): Json<TxtPreviewRequest>,
) -> Result<Json<reader_core::TxtPreview>, ApiError> {
    Ok(Json(
        run(move || s.reader.txt_preview(&r.resource_id, r.max_chars)).await?,
    ))
}
async fn txt_read(
    State(s): State<AppState>,
    Json(r): Json<TxtWindowRequest>,
) -> Result<Json<reader_core::TxtTextWindow>, ApiError> {
    Ok(Json(
        run(move || {
            s.reader
                .read_txt_window(&r.resource_id, &r.session_id, r.start, r.end)
        })
        .await?,
    ))
}
async fn txt_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.reader.close_txt(&r.resource_id, &r.session_id)?;
    Ok(StatusCode::NO_CONTENT)
}
async fn epub_open(
    State(s): State<AppState>,
    Json(r): Json<EpubOpenRequest>,
) -> Result<Json<reader_core::EpubOpenResult>, ApiError> {
    Ok(Json(
        run(move || s.reader.open_epub(&r.resource_id, &r.fallback_title)).await?,
    ))
}
async fn epub_read(
    State(s): State<AppState>,
    Json(r): Json<EpubReadRequest>,
) -> Result<Json<WebEpubResourcePayload>, ApiError> {
    let resource_id = r.resource_id.clone();
    let session_id = r.session_id.clone();
    let href = r.href.clone();
    let payload = run(move || {
        s.reader
            .read_epub_resource(&r.resource_id, &r.session_id, &r.href)
    })
    .await?;
    let binary_url = payload
        .file_path
        .as_ref()
        .map(|_| binary_url(&resource_id, &session_id, &href));
    Ok(Json(WebEpubResourcePayload {
        href: payload.href,
        media_type: payload.media_type,
        text: payload.text,
        binary_url,
    }))
}

async fn epub_binary(
    State(s): State<AppState>,
    Query(r): Query<EpubReadRequest>,
) -> Result<Response, ApiError> {
    let resource = run(move || {
        s.reader
            .epub_binary_resource(&r.resource_id, &r.session_id, &r.href)
    })
    .await?;
    stream_file(
        resource.path,
        &resource.media_type,
        "private, max-age=31536000, immutable",
    )
    .await
}

async fn cover(
    State(s): State<AppState>,
    Query(r): Query<CoverRequest>,
) -> Result<Response, ApiError> {
    let cover = run(move || s.reader.cover(&r.resource_id)).await?;
    stream_file(
        cover.path,
        &cover.media_type,
        "public, max-age=31536000, immutable",
    )
    .await
}
async fn epub_prefetch(
    State(s): State<AppState>,
    Json(r): Json<EpubPrefetchRequest>,
) -> Result<StatusCode, ApiError> {
    run(move || {
        s.reader
            .prefetch_epub_resources(&r.resource_id, &r.session_id, r.hrefs)
    })
    .await?;
    Ok(StatusCode::NO_CONTENT)
}
async fn epub_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.reader.close_epub(&r.resource_id, &r.session_id)?;
    Ok(StatusCode::NO_CONTENT)
}
async fn cache_stats(
    State(s): State<AppState>,
) -> Result<Json<reader_core::ReaderCacheStats>, ApiError> {
    Ok(Json(run(move || s.reader.cache_stats()).await?))
}
async fn clear_cache(State(s): State<AppState>) -> Result<StatusCode, ApiError> {
    run(move || s.reader.clear_cache()).await?;
    Ok(StatusCode::NO_CONTENT)
}

fn web_book(book: Book) -> WebBook {
    let cover = book
        .cover
        .as_ref()
        .map(|_| format!("/api/covers?resourceId={}", encode_query(&book.resource_id)));
    WebBook {
        id: book.id,
        resource_id: book.resource_id,
        fingerprint: book.fingerprint,
        title: book.title,
        author: book.author,
        book_type: book.book_type,
        file_name: book.file_name,
        len: book.len,
        modified_at: book.modified_at,
        cover,
        series_name: book.series_name,
        series_index: book.series_index,
    }
}

fn binary_url(resource_id: &str, session_id: &str, href: &str) -> String {
    format!(
        "/api/epub/binary?resourceId={}&sessionId={}&href={}",
        encode_query(resource_id),
        encode_query(session_id),
        encode_query(href)
    )
}

fn encode_query(value: &str) -> String {
    url::form_urlencoded::byte_serialize(value.as_bytes()).collect()
}

async fn stream_file(
    path: PathBuf,
    media_type: &str,
    cache_control: &str,
) -> Result<Response, ApiError> {
    let file = tokio::fs::File::open(path).await.map_err(io_api)?;
    Response::builder()
        .header(header::CONTENT_TYPE, media_type)
        .header(header::CACHE_CONTROL, cache_control)
        .body(Body::from_stream(ReaderStream::new(file)))
        .map_err(|error| ApiError(StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))
}
async fn run<T: Send + 'static>(
    task: impl FnOnce() -> Result<T, ReaderError> + Send + 'static,
) -> Result<T, ApiError> {
    tokio::task::spawn_blocking(task)
        .await
        .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map_err(Into::into)
}

async fn get_web_state(State(s): State<AppState>) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(run_state(move || repository.get()).await?))
}
async fn put_progress(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(
        run_state(move || repository.put_progress(input)).await?,
    ))
}
async fn put_settings(s: State<AppState>, b: Json<Value>) -> Result<Json<Value>, ApiError> {
    put_section(s.0, "settings", b.0).await
}
async fn put_series(s: State<AppState>, b: Json<Value>) -> Result<Json<Value>, ApiError> {
    put_section(s.0, "series", b.0).await
}
async fn put_last_read(s: State<AppState>, b: Json<Value>) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(
        run_state(move || repository.put_last_read(b.0)).await?,
    ))
}
async fn put_section(s: AppState, name: &str, value: Value) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    let name = name.to_string();
    Ok(Json(
        run_state(move || repository.put_section(&name, value)).await?,
    ))
}

async fn run_state(
    task: impl FnOnce() -> Result<Value, ApiError> + Send + 'static,
) -> Result<Value, ApiError> {
    tokio::task::spawn_blocking(task)
        .await
        .map_err(|error| ApiError(StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?
}

impl StateRepository {
    fn get(&self) -> Result<Value, ApiError> {
        let _guard = self.lock.lock().map_err(|_| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "state lock poisoned".into(),
            )
        })?;
        read_json_object(&self.path)
    }

    fn put_progress(&self, input: Value) -> Result<Value, ApiError> {
        let updates = input.as_object().ok_or_else(|| {
            ApiError(StatusCode::BAD_REQUEST, "progress must be an object".into())
        })?;
        self.update(|stored| {
            let progress = stored.entry("progress").or_insert_with(|| json!({}));
            let target = progress.as_object_mut().ok_or_else(|| {
                ApiError(
                    StatusCode::BAD_REQUEST,
                    "stored progress must be an object".into(),
                )
            })?;
            for (id, value) in updates {
                if is_newer(value, target.get(id)) {
                    target.insert(id.clone(), value.clone());
                }
            }
            Ok(())
        })
    }

    fn put_last_read(&self, input: Value) -> Result<Value, ApiError> {
        self.update(|stored| {
            if is_newer(&input, stored.get("lastRead")) {
                stored.insert("lastRead".into(), input);
            }
            Ok(())
        })
    }

    fn put_section(&self, name: &str, value: Value) -> Result<Value, ApiError> {
        self.update(|stored| {
            stored.insert(name.into(), value);
            Ok(())
        })
    }

    fn update(
        &self,
        operation: impl FnOnce(&mut serde_json::Map<String, Value>) -> Result<(), ApiError>,
    ) -> Result<Value, ApiError> {
        let _guard = self.lock.lock().map_err(|_| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "state lock poisoned".into(),
            )
        })?;
        let mut stored = read_json_object(&self.path)?;
        let object = stored.as_object_mut().ok_or_else(|| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "state must be an object".into(),
            )
        })?;
        operation(object)?;
        write_json(&self.path, &stored)?;
        Ok(stored)
    }
}

fn is_newer(incoming: &Value, current: Option<&Value>) -> bool {
    let incoming_at = incoming
        .get("updatedAt")
        .and_then(Value::as_u64)
        .unwrap_or_default();
    let current_at = current
        .and_then(|value| value.get("updatedAt"))
        .and_then(Value::as_u64)
        .unwrap_or_default();
    incoming_at >= current_at
}

fn read_json_object(path: &Path) -> Result<Value, ApiError> {
    let value = read_json(path)?;
    if value.is_object() {
        Ok(value)
    } else {
        Err(ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            "state must be a JSON object".into(),
        ))
    }
}
fn read_json(path: &Path) -> Result<Value, ApiError> {
    match fs::read(path) {
        Ok(v) => serde_json::from_slice(&v)
            .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(json!({})),
        Err(e) => Err(ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
fn write_json(path: &Path, value: &Value) -> Result<(), ApiError> {
    static TEMP_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);
    let temp = path.with_extension(format!(
        "{}-{}.tmp",
        std::process::id(),
        TEMP_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    ));
    let bytes = serde_json::to_vec(value)
        .map_err(|error| ApiError(StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?;
    fs::write(&temp, bytes).map_err(io_api)?;
    if !path.exists() {
        return fs::rename(temp, path).map_err(io_api);
    }
    let backup = path.with_extension("backup");
    let _ = fs::remove_file(&backup);
    fs::rename(path, &backup).map_err(io_api)?;
    match fs::rename(&temp, path) {
        Ok(()) => {
            let _ = fs::remove_file(backup);
            Ok(())
        }
        Err(error) => {
            let _ = fs::rename(backup, path);
            Err(io_api(error))
        }
    }
}
fn io_api(e: io::Error) -> ApiError {
    ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
}
struct ApiError(StatusCode, String);
impl From<ReaderError> for ApiError {
    fn from(e: ReaderError) -> Self {
        let status = if matches!(e, ReaderError::InvalidSession | ReaderError::WrongType) {
            StatusCode::BAD_REQUEST
        } else {
            StatusCode::INTERNAL_SERVER_ERROR
        };
        Self(status, e.to_string())
    }
}
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({"error": self.1}))).into_response()
    }
}
