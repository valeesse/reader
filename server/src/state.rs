mod io;

use crate::error::ApiError;
use axum::{
    Json,
    extract::{Path as AxumPath, State},
    http::StatusCode,
};
use reader_core::ReaderService;
use serde_json::{Value, json};
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};
use tokio::sync::RwLock;

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) reader: Arc<ReaderService>,
    pub(crate) scan: Arc<RwLock<ScanStatus>>,
    web_state: Arc<StateRepository>,
}

impl AppState {
    pub(crate) fn new(reader: Arc<ReaderService>, state_path: PathBuf) -> Self {
        Self {
            reader,
            scan: Arc::new(RwLock::new(ScanStatus::default())),
            web_state: Arc::new(StateRepository {
                path: state_path,
                lock: Mutex::new(()),
            }),
        }
    }
}

struct StateRepository {
    path: PathBuf,
    lock: Mutex<()>,
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
    let repository = s.web_state.clone();
    Ok(Json(run_state(move || repository.get()).await?))
}

pub(crate) async fn get_progress(
    State(s): State<AppState>,
    AxumPath(book_id): AxumPath<String>,
) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(
        run_state(move || repository.get_progress(&book_id)).await?,
    ))
}

pub(crate) async fn put_progress(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(
        run_state(move || repository.put_progress(input)).await?,
    ))
}

pub(crate) async fn put_reading(
    State(s): State<AppState>,
    Json(input): Json<Value>,
) -> Result<Json<Value>, ApiError> {
    let repository = s.web_state.clone();
    Ok(Json(
        run_state(move || repository.put_reading(input)).await?,
    ))
}

pub(crate) async fn put_settings(
    s: State<AppState>,
    b: Json<Value>,
) -> Result<Json<Value>, ApiError> {
    put_section(s.0, "settings", b.0).await
}

pub(crate) async fn put_series(
    s: State<AppState>,
    b: Json<Value>,
) -> Result<Json<Value>, ApiError> {
    put_section(s.0, "series", b.0).await
}

pub(crate) async fn put_last_read(
    s: State<AppState>,
    b: Json<Value>,
) -> Result<Json<Value>, ApiError> {
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
    fn lock(&self) -> Result<std::sync::MutexGuard<'_, ()>, ApiError> {
        self.lock.lock().map_err(|_| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "state lock poisoned".into(),
            )
        })
    }

    fn get(&self) -> Result<Value, ApiError> {
        let _guard = self.lock()?;
        io::read_json_object(&self.path)
    }

    fn get_progress(&self, book_id: &str) -> Result<Value, ApiError> {
        let _guard = self.lock()?;
        let stored = io::read_json_object(&self.path)?;
        Ok(stored
            .get("progress")
            .and_then(Value::as_object)
            .and_then(|progress| progress.get(book_id))
            .cloned()
            .unwrap_or(Value::Null))
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

    fn put_reading(&self, input: Value) -> Result<Value, ApiError> {
        let input = input.as_object().ok_or_else(|| {
            ApiError(
                StatusCode::BAD_REQUEST,
                "reading state must be an object".into(),
            )
        })?;
        let progress = input.get("progress").cloned().ok_or_else(|| {
            ApiError(
                StatusCode::BAD_REQUEST,
                "reading progress is required".into(),
            )
        })?;
        let book_id = progress
            .get("bookId")
            .and_then(Value::as_str)
            .ok_or_else(|| {
                ApiError(
                    StatusCode::BAD_REQUEST,
                    "progress bookId is required".into(),
                )
            })?
            .to_string();
        let last_read = input
            .get("lastRead")
            .filter(|value| !value.is_null())
            .cloned();
        self.update(|stored| {
            let progress_state = stored.entry("progress").or_insert_with(|| json!({}));
            let target = progress_state.as_object_mut().ok_or_else(|| {
                ApiError(
                    StatusCode::BAD_REQUEST,
                    "stored progress must be an object".into(),
                )
            })?;
            if is_newer(&progress, target.get(&book_id)) {
                target.insert(book_id, progress);
            }
            if let Some(last_read) = last_read
                && is_newer(&last_read, stored.get("lastRead"))
            {
                stored.insert("lastRead".into(), last_read);
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
        let _guard = self.lock()?;
        let mut stored = io::read_json_object(&self.path)?;
        let object = stored.as_object_mut().ok_or_else(|| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                "state must be an object".into(),
            )
        })?;
        operation(object)?;
        io::write_json(&self.path, &stored)?;
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
