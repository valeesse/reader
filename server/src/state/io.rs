use crate::error::{ApiError, io_api};
use axum::http::StatusCode;
use serde_json::{Value, json};
use std::{
    fs, io,
    path::Path,
    sync::atomic::{AtomicU64, Ordering},
};

pub(super) fn read_json_object(path: &Path) -> Result<Value, ApiError> {
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

pub(super) fn write_json(path: &Path, value: &Value) -> Result<(), ApiError> {
    static TEMP_COUNTER: AtomicU64 = AtomicU64::new(1);
    let temp = path.with_extension(format!(
        "{}-{}.tmp",
        std::process::id(),
        TEMP_COUNTER.fetch_add(1, Ordering::Relaxed)
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
