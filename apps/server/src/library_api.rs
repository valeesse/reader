use crate::{error::ApiError, state::AppState};
use axum::{Json, extract::State, http::StatusCode};
use notify::{Event, EventKind, RecursiveMode, Watcher};
use reader_contracts::{Capabilities, ResourceTransport};
use reader_core::{Book, ScanProgress};
use std::{
    path::Path,
    sync::mpsc::{self, RecvTimeoutError},
    time::Duration,
};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DeleteBooksRequest {
    resource_ids: Vec<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WebBook {
    id: String,
    resource_id: String,
    content_id: String,
    fingerprint: String,
    title: String,
    author: String,
    #[serde(rename = "type")]
    book_type: String,
    file_name: String,
    relative_path: String,
    len: u64,
    modified_at: u64,
    cover: Option<String>,
    series_name: Option<String>,
    series_index: Option<f64>,
}

pub(crate) async fn capabilities(State(s): State<AppState>) -> Json<Capabilities> {
    Json(Capabilities {
        api_version: 1,
        mutable_library_root: false,
        managed_library: false,
        folder_library: true,
        web_dav: false,
        authentication: s.authentication,
        resource_transport: ResourceTransport::HttpUrl,
    })
}

pub(crate) async fn library_config() -> Json<serde_json::Value> {
    Json(serde_json::json!({"configured": true, "root": null}))
}

pub(crate) async fn books(State(s): State<AppState>) -> Result<Json<Vec<WebBook>>, ApiError> {
    let books = s.application.books()?;
    Ok(Json(books.into_iter().map(web_book).collect()))
}

pub(crate) async fn delete_books(
    State(s): State<AppState>,
    Json(request): Json<DeleteBooksRequest>,
) -> Result<Json<Vec<WebBook>>, ApiError> {
    if request.resource_ids.is_empty() {
        return Ok(Json(
            s.application.books()?.into_iter().map(web_book).collect(),
        ));
    }
    let application = s.application.clone();
    let books =
        tokio::task::spawn_blocking(move || application.delete_books(&request.resource_ids))
            .await
            .map_err(|error| ApiError(StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))??;
    Ok(Json(books.into_iter().map(web_book).collect()))
}

pub(crate) async fn scan_status(State(s): State<AppState>) -> Json<crate::state::ScanStatus> {
    Json(s.scan.read().await.clone())
}

pub(crate) async fn rescan(State(state): State<AppState>) -> Result<StatusCode, ApiError> {
    {
        let mut status = state.scan.write().await;
        if status.running {
            return Ok(StatusCode::ACCEPTED);
        }
        status.running = true;
        status.visited = 0;
        status.matched = 0;
        status.current_relative_path.clear();
        status.error = None;
    }
    tokio::spawn(async move {
        let application = state.application.clone();
        let scan = state.scan.clone();
        let result = tokio::task::spawn_blocking(move || {
            application.scan(|p: ScanProgress| {
                if let Ok(mut status) = scan.try_write() {
                    let version = status.version;
                    *status = crate::state::ScanStatus {
                        running: true,
                        visited: p.visited,
                        matched: p.matched,
                        current_relative_path: p.current_relative_path,
                        error: None,
                        version,
                    };
                }
            })
        })
        .await;
        let mut status = state.scan.write().await;
        status.running = false;
        status.current_relative_path.clear();
        status.error = match result {
            Ok(Ok(_)) => {
                status.version = status.version.saturating_add(1);
                None
            }
            Ok(Err(e)) => Some(e.to_string()),
            Err(e) => Some(e.to_string()),
        };
    });
    Ok(StatusCode::ACCEPTED)
}

pub(crate) fn start_library_watcher(state: &AppState, root: &Path) -> Result<(), notify::Error> {
    let (sender, receiver) = mpsc::channel::<notify::Result<Event>>();
    let mut watcher = notify::recommended_watcher(move |event| {
        let _ = sender.send(event);
    })?;
    watcher.watch(root, RecursiveMode::Recursive)?;
    *state.library_watcher.lock().expect("library watcher lock") = Some(watcher);

    let application = state.application.clone();
    let scan_status = state.scan.clone();
    std::thread::Builder::new()
        .name("zenith-server-library-watch".into())
        .spawn(move || {
            while let Ok(event) = receiver.recv() {
                if !event.as_ref().is_ok_and(library_event_needs_scan) {
                    continue;
                }
                loop {
                    match receiver.recv_timeout(Duration::from_millis(650)) {
                        Ok(next) if next.as_ref().is_ok_and(library_event_needs_scan) => continue,
                        Ok(_) => {}
                        Err(RecvTimeoutError::Timeout) => break,
                        Err(RecvTimeoutError::Disconnected) => return,
                    }
                }
                loop {
                    let mut status = scan_status.blocking_write();
                    if !status.running {
                        status.running = true;
                        status.error = None;
                        break;
                    }
                    drop(status);
                    std::thread::sleep(Duration::from_millis(50));
                }
                let result = application.scan(|progress| {
                    if let Ok(mut status) = scan_status.try_write() {
                        status.visited = progress.visited;
                        status.matched = progress.matched;
                        status.current_relative_path = progress.current_relative_path;
                    }
                });
                let mut status = scan_status.blocking_write();
                status.running = false;
                status.current_relative_path.clear();
                match result {
                    Ok(_) => {
                        status.version = status.version.saturating_add(1);
                        status.error = None;
                    }
                    Err(error) => status.error = Some(error.to_string()),
                }
            }
        })
        .map_err(notify::Error::io)?;
    Ok(())
}

fn library_event_needs_scan(event: &Event) -> bool {
    if matches!(event.kind, EventKind::Remove(_)) {
        return true;
    }
    matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_))
        && event.paths.iter().any(|path| {
            path.is_dir()
                || path
                    .extension()
                    .and_then(|extension| extension.to_str())
                    .is_some_and(|extension| {
                        extension.eq_ignore_ascii_case("epub")
                            || extension.eq_ignore_ascii_case("txt")
                    })
        })
}

fn web_book(book: Book) -> WebBook {
    let cover = book.cover.as_ref().map(|_| {
        format!(
            "/api/covers?resourceId={}",
            crate::reader_api::encode_query(&book.resource_id)
        )
    });
    WebBook {
        id: book.id,
        resource_id: book.resource_id,
        content_id: book.content_id,
        fingerprint: book.fingerprint,
        title: book.title,
        author: book.author,
        book_type: book.book_type,
        file_name: book.file_name,
        relative_path: book.relative_path,
        len: book.len,
        modified_at: book.modified_at,
        cover,
        series_name: book.series_name,
        series_index: book.series_index,
    }
}
