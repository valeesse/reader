use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use reader_core::ReaderError;
use serde_json::json;
use std::io;

pub(crate) struct ApiError(pub(crate) StatusCode, pub(crate) String);

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

pub(crate) fn io_api(e: io::Error) -> ApiError {
    ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
}

pub(crate) async fn run<T: Send + 'static>(
    task: impl FnOnce() -> Result<T, ReaderError> + Send + 'static,
) -> Result<T, ApiError> {
    tokio::task::spawn_blocking(task)
        .await
        .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map_err(Into::into)
}
