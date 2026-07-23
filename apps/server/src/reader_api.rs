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
use reader_contracts::{
    EpubOpenRequest, EpubPrefetchRequest, EpubReadRequest, ResourceRequest, SessionRequest,
    TxtPreviewRequest, TxtWindowRequest,
};
use std::path::PathBuf;
use tokio_util::io::ReaderStream;

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
    Ok(Json(run(move || s.application.open_txt(&r)).await?))
}

pub(crate) async fn txt_preview(
    State(s): State<AppState>,
    Json(r): Json<TxtPreviewRequest>,
) -> Result<Json<reader_core::TxtPreview>, ApiError> {
    Ok(Json(run(move || s.application.txt_preview(&r)).await?))
}

pub(crate) async fn txt_read(
    State(s): State<AppState>,
    Json(r): Json<TxtWindowRequest>,
) -> Result<Json<reader_core::TxtTextWindow>, ApiError> {
    Ok(Json(run(move || s.application.read_txt(&r)).await?))
}

pub(crate) async fn txt_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.application.close_txt(&r)?;
    Ok(StatusCode::NO_CONTENT)
}

pub(crate) async fn epub_open(
    State(s): State<AppState>,
    Json(r): Json<EpubOpenRequest>,
) -> Result<Json<reader_core::EpubOpenResult>, ApiError> {
    Ok(Json(run(move || s.application.open_epub(&r)).await?))
}

pub(crate) async fn epub_read(
    State(s): State<AppState>,
    Json(r): Json<EpubReadRequest>,
) -> Result<Json<WebEpubResourcePayload>, ApiError> {
    let resource_id = r.resource_id.clone();
    let session_id = r.session_id.clone();
    let href = r.href.clone();
    let payload = run(move || s.application.read_epub(&r)).await?;
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
    let resource = run(move || s.application.epub_binary(&r)).await?;
    stream_file(
        resource.path,
        &resource.media_type,
        "private, max-age=31536000, immutable",
    )
    .await
}

pub(crate) async fn cover(
    State(s): State<AppState>,
    Query(r): Query<ResourceRequest>,
) -> Result<Response, ApiError> {
    let cover = run(move || s.application.cover(&r.resource_id)).await?;
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
    run(move || s.application.prefetch_epub(r)).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub(crate) async fn epub_positions(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<Json<Vec<reader_core::EpubPositionCount>>, ApiError> {
    Ok(Json(run(move || s.application.epub_positions(&r)).await?))
}

pub(crate) async fn epub_close(
    State(s): State<AppState>,
    Json(r): Json<SessionRequest>,
) -> Result<StatusCode, ApiError> {
    s.application.close_epub(&r)?;
    Ok(StatusCode::NO_CONTENT)
}

pub(crate) async fn cache_stats(
    State(s): State<AppState>,
) -> Result<Json<reader_core::ReaderCacheStats>, ApiError> {
    Ok(Json(run(move || s.application.cache_stats()).await?))
}

pub(crate) async fn clear_cache(State(s): State<AppState>) -> Result<StatusCode, ApiError> {
    run(move || s.application.clear_cache()).await?;
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
