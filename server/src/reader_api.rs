use crate::{
    error::{ApiError, io_api, run},
    state::AppState,
};
use axum::{
    Json,
    body::Body,
    extract::{Query, State},
    http::{StatusCode, header},
    response::Response,
};
use serde::Deserialize;
use std::path::PathBuf;
use tokio_util::io::ReaderStream;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ResourceRequest {
    resource_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionRequest {
    resource_id: String,
    session_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TxtPreviewRequest {
    resource_id: String,
    max_chars: usize,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TxtWindowRequest {
    resource_id: String,
    session_id: String,
    start: usize,
    end: usize,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct EpubOpenRequest {
    resource_id: String,
    fallback_title: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct EpubReadRequest {
    resource_id: String,
    session_id: String,
    href: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct EpubPrefetchRequest {
    resource_id: String,
    session_id: String,
    hrefs: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CoverRequest {
    resource_id: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WebEpubResourcePayload {
    href: String,
    media_type: String,
    text: Option<String>,
    binary_url: Option<String>,
}

pub(crate) async fn txt_open(
    State(s): State<AppState>,
    Json(r): Json<ResourceRequest>,
) -> Result<Json<reader_core::TxtBookInfo>, ApiError> {
    Ok(Json(run(move || s.reader.open_txt(&r.resource_id)).await?))
}

pub(crate) async fn txt_preview(
    State(s): State<AppState>,
    Json(r): Json<TxtPreviewRequest>,
) -> Result<Json<reader_core::TxtPreview>, ApiError> {
    Ok(Json(
        run(move || s.reader.txt_preview(&r.resource_id, r.max_chars)).await?,
    ))
}

pub(crate) async fn txt_read(
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

pub(crate) async fn txt_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.reader.close_txt(&r.resource_id, &r.session_id)?;
    Ok(StatusCode::NO_CONTENT)
}

pub(crate) async fn epub_open(
    State(s): State<AppState>,
    Json(r): Json<EpubOpenRequest>,
) -> Result<Json<reader_core::EpubOpenResult>, ApiError> {
    Ok(Json(
        run(move || s.reader.open_epub(&r.resource_id, &r.fallback_title)).await?,
    ))
}

pub(crate) async fn epub_read(
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

pub(crate) async fn epub_binary(
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

pub(crate) async fn cover(
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

pub(crate) async fn epub_prefetch(
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

pub(crate) async fn epub_positions(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<Json<Vec<reader_core::EpubPositionCount>>, ApiError> {
    Ok(Json(
        run(move || s.reader.epub_position_counts(&r.resource_id, &r.session_id)).await?,
    ))
}

pub(crate) async fn epub_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.reader.close_epub(&r.resource_id, &r.session_id)?;
    Ok(StatusCode::NO_CONTENT)
}

pub(crate) async fn cache_stats(
    State(s): State<AppState>,
) -> Result<Json<reader_core::ReaderCacheStats>, ApiError> {
    Ok(Json(run(move || s.reader.cache_stats()).await?))
}

pub(crate) async fn clear_cache(State(s): State<AppState>) -> Result<StatusCode, ApiError> {
    run(move || s.reader.clear_cache()).await?;
    Ok(StatusCode::NO_CONTENT)
}

fn binary_url(resource_id: &str, session_id: &str, href: &str) -> String {
    format!(
        "/api/epub/binary?resourceId={}&sessionId={}&href={}",
        encode_query(resource_id),
        encode_query(session_id),
        encode_query(href)
    )
}

pub(crate) fn encode_query(value: &str) -> String {
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
