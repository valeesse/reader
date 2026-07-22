use crate::error::ApiError;
use axum::{
    Json,
    extract::{Path as AxumPath, State},
    http::StatusCode,
};
use reader_application::ReaderApplication;
use reader_state::{StateError, StateRepository};
use serde_json::Value;
use std::{path::PathBuf, sync::Arc};
use tokio::sync::RwLock;

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) application: Arc<ReaderApplication>,
    pub(crate) scan: Arc<RwLock<ScanStatus>>,
    pub(crate) authentication: bool,
    state: Arc<StateRepository>,
}

impl AppState {
    pub(crate) fn new(
        application: Arc<ReaderApplication>,
        state_path: PathBuf,
        authentication: bool,
    ) -> Result<Self, StateError> {
        Ok(Self {
            application,
            scan: Arc::new(RwLock::new(ScanStatus::default())),
            authentication,
            state: Arc::new(StateRepository::open(state_path)?),
        })
    }
}

#[derive(Debug, Clone, Default, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ScanStatus {
    pub(crate) running: bool,
    pub(crate) visited: usize,
    pub(crate) matched: usize,
    pub(crate) current_relative_path: String,
    pub(crate) error: Option<String>,
}

pub(crate) async fn get_web_state(State(s): State<AppState>) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.get()).await.map(Json)
}

pub(crate) async fn get_progress(
    State(s): State<AppState>,
    AxumPath(book_id): AxumPath<String>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.get_progress(&book_id))
        .await
        .map(Json)
}

pub(crate) async fn put_progress(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.put_progress_map(input))
        .await
        .map(Json)
}

pub(crate) async fn put_reading(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.put_reading(input))
        .await
        .map(Json)
}

pub(crate) async fn put_settings(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.put_section("settings", input))
        .await
        .map(Json)
}

pub(crate) async fn put_series(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.put_section("series", input))
        .await
        .map(Json)
}

pub(crate) async fn put_last_read(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    run_state(move || s.state.put_last_read(input))
        .await
        .map(Json)
}

async fn run_state(
    task: impl FnOnce() -> Result<Value, StateError> + Send + 'static,
) -> Result<Value, ApiError> {
    tokio::task::spawn_blocking(task)
        .await
        .map_err(|error| ApiError(StatusCode::INTERNAL_SERVER_ERROR, error.to_string()))?
        .map_err(|error| match error {
            StateError::Invalid(message) => ApiError(StatusCode::BAD_REQUEST, message),
            other => ApiError(StatusCode::INTERNAL_SERVER_ERROR, other.to_string()),
        })
}
