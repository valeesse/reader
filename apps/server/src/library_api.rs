use crate::{error::ApiError, state::AppState};
use axum::{Json, extract::State, http::StatusCode};
use reader_contracts::{Capabilities, ResourceTransport};
use reader_core::{Book, ScanProgress};

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

pub(crate) async fn scan_status(State(s): State<AppState>) -> Json<crate::state::ScanStatus> {
    Json(s.scan.read().await.clone())
}

pub(crate) async fn rescan(State(state): State<AppState>) -> Result<StatusCode, ApiError> {
    {
        let mut status = state.scan.write().await;
        if status.running {
            return Ok(StatusCode::ACCEPTED);
        }
        *status = crate::state::ScanStatus {
            running: true,
            ..Default::default()
        };
    }
    tokio::spawn(async move {
        let application = state.application.clone();
        let scan = state.scan.clone();
        let result = tokio::task::spawn_blocking(move || {
            application.scan(|p: ScanProgress| {
                if let Ok(mut status) = scan.try_write() {
                    *status = crate::state::ScanStatus {
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
