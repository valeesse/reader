use serde::{Deserialize, Serialize};
use std::io;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("library root is not a directory")]
    InvalidRoot,
    #[error("invalid resource id")]
    InvalidResourceId,
    #[error("indexed path is invalid or outside the library")]
    UnsafePath,
    #[error(transparent)]
    Io(#[from] io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Walk(#[from] walkdir::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: String,
    pub resource_id: String,
    pub fingerprint: String,
    pub title: String,
    pub author: String,
    #[serde(rename = "type")]
    pub book_type: String,
    pub file_name: String,
    pub len: u64,
    pub modified_at: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub series_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub series_index: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgress {
    pub visited: usize,
    pub matched: usize,
    pub current_relative_path: String,
}
