mod error;
mod library_api;
mod reader_api;
mod state;

#[cfg(test)]
mod tests;

use axum::{
    Router,
    body::Body,
    http::{HeaderValue, Request, StatusCode, header},
    middleware::{self, Next},
    response::Response,
    routing::{delete, get, post, put},
};
use reader_application::ReaderApplication;
use reader_core::{LibraryRegistry, ReaderService};
use state::AppState;
use std::{fs, path::PathBuf, sync::Arc};
use tower_http::{
    compression::CompressionLayer,
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

#[derive(Clone)]
pub struct ServerConfig {
    pub library_dir: PathBuf,
    pub state_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub dist_dir: PathBuf,
    pub auth_token: Option<String>,
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
    let application = Arc::new(ReaderApplication::new(reader));
    let state = AppState::new(
        application,
        config.state_dir.join("reader-state-v1.sqlite3"),
        config.auth_token.is_some(),
    )?;
    let auth_token = config.auth_token.clone().map(Arc::new);
    Ok(Router::new()
        .route("/api/capabilities", get(library_api::capabilities))
        .route("/api/library/config", get(library_api::library_config))
        .route("/api/books", get(library_api::books))
        .route("/api/rescan", post(library_api::rescan))
        .route("/api/scan/status", get(library_api::scan_status))
        .route("/api/state", get(state::get_web_state))
        .route("/api/state/progress/{book_id}", get(state::get_progress))
        .route("/api/state/progress", put(state::put_progress))
        .route("/api/state/reading", put(state::put_reading))
        .route("/api/state/settings", put(state::put_settings))
        .route("/api/state/series", put(state::put_series))
        .route("/api/state/lastRead", put(state::put_last_read))
        .route("/api/cache/stats", get(reader_api::cache_stats))
        .route("/api/cache", delete(reader_api::clear_cache))
        .route("/api/txt/open", post(reader_api::txt_open))
        .route("/api/txt/preview", post(reader_api::txt_preview))
        .route("/api/txt/read", post(reader_api::txt_read))
        .route("/api/txt/close", post(reader_api::txt_close))
        .route("/api/epub/open", post(reader_api::epub_open))
        .route("/api/epub/read", post(reader_api::epub_read))
        .route("/api/epub/binary", get(reader_api::epub_binary))
        .route("/api/covers", get(reader_api::cover))
        .route("/api/epub/prefetch", post(reader_api::epub_prefetch))
        .route("/api/epub/positions", post(reader_api::epub_positions))
        .route("/api/epub/close", post(reader_api::epub_close))
        .fallback_service(
            ServeDir::new(&config.dist_dir)
                .not_found_service(ServeFile::new(config.dist_dir.join("index.html"))),
        )
        .layer(middleware::from_fn(move |request, next| {
            api_auth(request, next, auth_token.clone())
        }))
        .layer(middleware::from_fn(static_cache_headers))
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(state))
}

async fn api_auth(request: Request<Body>, next: Next, token: Option<Arc<String>>) -> Response {
    let Some(token) = token else {
        return next.run(request).await;
    };
    if !request.uri().path().starts_with("/api/") {
        return next.run(request).await;
    }
    let bearer = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "));
    let alternate = request
        .headers()
        .get("x-zenith-token")
        .and_then(|value| value.to_str().ok());
    let cookie = request
        .headers()
        .get(header::COOKIE)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            value
                .split(';')
                .map(str::trim)
                .find_map(|part| part.strip_prefix("zenith_token="))
        })
        .and_then(|value| {
            url::form_urlencoded::parse(format!("token={value}").as_bytes())
                .next()
                .map(|(_, value)| value.into_owned())
        });
    if bearer == Some(token.as_str())
        || alternate == Some(token.as_str())
        || cookie.as_deref() == Some(token.as_str())
    {
        next.run(request).await
    } else {
        Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(
                r#"{"code":"PERMISSION_DENIED","error":"authentication required"}"#,
            ))
            .expect("static unauthorized response")
    }
}

async fn static_cache_headers(request: Request<Body>, next: Next) -> Response {
    let path = request.uri().path().to_string();
    let mut response = next.run(request).await;
    if response.status().is_success() && !path.starts_with("/api/") {
        let value = if path.starts_with("/assets/") || path.starts_with("/fonts/") {
            "public, max-age=31536000, immutable"
        } else {
            "no-cache"
        };
        response
            .headers_mut()
            .insert(header::CACHE_CONTROL, HeaderValue::from_static(value));
    }
    response
}
