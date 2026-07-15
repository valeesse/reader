use crate::CoreError;
use serde::{Deserialize, Serialize};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::File,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{SystemTime, UNIX_EPOCH},
};
use thiserror::Error;
use zip::ZipArchive;

pub(super) const TXT_CHAR_CHECKPOINT_INTERVAL: usize = 4096;
pub(super) const TXT_BOOK_CACHE_LIMIT: usize = 5;
pub(super) const EPUB_BOOK_CACHE_LIMIT: usize = 5;
pub(super) const EPUB_RESOURCE_CACHE_LIMIT: usize = 96;
pub(super) const EPUB_PREFETCH_MAX_RESOURCES: usize = 16;
pub(super) const PERSISTENT_CACHE_VERSION: u8 = 4;
pub(super) const STREAM_BUFFER_BYTES: usize = 64 * 1024;
pub(super) const EPUB_RESOURCE_MAX_BYTES: u64 = 64 * 1024 * 1024;
pub(super) const EPUB_ARCHIVE_MAX_UNCOMPRESSED_BYTES: u64 = 512 * 1024 * 1024;

pub(super) type TxtIndex = (usize, Vec<(usize, usize)>, Vec<TxtChapterInfo>);

pub(super) fn epub_resource_cache_max_bytes() -> usize {
    48 * 1024 * 1024
}
pub(super) fn reader_disk_cache_max_bytes() -> u64 {
    1024 * 1024 * 1024
}

#[derive(Debug, Error)]
pub enum ReaderError {
    #[error(transparent)]
    Core(#[from] CoreError),
    #[error("reader state is busy")]
    Busy,
    #[error("resource type does not match the operation")]
    WrongType,
    #[error("reading session is invalid or stale")]
    InvalidSession,
    #[error("invalid EPUB: {0}")]
    InvalidEpub(String),
    #[error("reader I/O failed: {0}")]
    Io(String),
}

#[derive(Debug, Clone)]
pub(super) struct ReaderConfig {
    pub state_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub cover_dir: PathBuf,
}
impl ReaderConfig {
    pub fn new(
        state: impl AsRef<std::path::Path>,
        cache: impl AsRef<std::path::Path>,
    ) -> Result<Self, ReaderError> {
        let value = Self {
            state_dir: state.as_ref().to_path_buf(),
            cache_dir: cache.as_ref().to_path_buf(),
            cover_dir: cache.as_ref().join("covers"),
        };
        for dir in [&value.state_dir, &value.cache_dir, &value.cover_dir] {
            std::fs::create_dir_all(dir).map_err(io_error)?;
        }
        Ok(value)
    }
}

#[derive(Debug)]
pub(super) struct TxtBookCache {
    pub signature: FileSignature,
    pub last_used_at: u128,
    pub active_sessions: HashSet<String>,
    pub data_path: PathBuf,
    pub total_chars: usize,
    pub total_bytes: u64,
    pub checkpoints: Vec<(usize, usize)>,
    pub chapters: Vec<TxtChapterInfo>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtChapterInfo {
    pub id: String,
    pub title: String,
    pub start_index: usize,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtBookInfo {
    pub session_id: String,
    pub total_chars: usize,
    pub total_bytes: u64,
    pub chapters: Vec<TxtChapterInfo>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtTextWindow {
    pub start: usize,
    pub end: usize,
    pub text: String,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtPreview {
    pub text: String,
    pub encoding: String,
}

pub(super) struct EpubBookCache {
    pub signature: FileSignature,
    pub last_used_at: u128,
    pub active_sessions: HashSet<String>,
    pub info: EpubBookInfo,
    pub manifest_items: Vec<EpubManifestItem>,
    pub resource_cache: HashMap<String, EpubCachedResource>,
    pub resource_order: VecDeque<String>,
    pub resource_bytes: usize,
    pub archive: Arc<Mutex<ZipArchive<File>>>,
}
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub(super) struct FileSignature {
    pub len: u64,
    pub modified_ns: u128,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(super) struct EpubManifestItem {
    pub id: String,
    pub absolute_href: String,
    pub media_type: String,
    pub properties: Vec<String>,
}
#[derive(Debug, Clone)]
pub(super) struct EpubCachedResource {
    pub bytes: Arc<[u8]>,
    pub media_type: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubBookInfo {
    pub metadata: EpubMetadataInfo,
    pub reading_order: Vec<EpubLinkInfo>,
    pub resources: Vec<EpubLinkInfo>,
    pub toc: Vec<EpubLinkInfo>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubOpenResult {
    pub session_id: String,
    pub cache_key: String,
    pub book: EpubBookInfo,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubMetadataInfo {
    pub title: String,
    pub author: Option<String>,
    pub language: String,
    pub layout: String,
    pub reading_progression: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubLinkInfo {
    pub href: String,
    pub media_type: String,
    pub title: Option<String>,
    pub rels: Vec<String>,
    pub properties: Vec<String>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubResourcePayload {
    pub href: String,
    pub media_type: String,
    pub text: Option<String>,
    pub file_path: Option<String>,
}
#[derive(Debug, Clone)]
pub struct CachedBinaryResource {
    pub path: PathBuf,
    pub media_type: String,
}
#[derive(Debug, Clone)]
pub struct CachedCover {
    pub path: PathBuf,
    pub media_type: String,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReaderCacheStats {
    pub bytes: u64,
    pub files: usize,
    pub max_bytes: u64,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub(super) struct ScanEpubMetadata {
    pub title: String,
    pub author: Option<String>,
    pub cover: Option<String>,
    pub series_name: Option<String>,
    pub series_index: Option<f64>,
}
#[derive(Serialize, Deserialize)]
pub(super) struct PersistentTxtIndexCache {
    pub version: u8,
    pub resource_id: String,
    pub signature: FileSignature,
    pub data_path: String,
    pub data_bytes: u64,
    pub total_chars: usize,
    pub total_bytes: u64,
    pub checkpoints: Vec<(usize, usize)>,
    pub chapters: Vec<TxtChapterInfo>,
}
#[derive(Serialize, Deserialize)]
pub(super) struct PersistentEpubBookCache {
    pub version: u8,
    pub resource_id: String,
    pub signature: FileSignature,
    pub info: EpubBookInfo,
    pub manifest_items: Vec<EpubManifestItem>,
}

pub(super) fn io_error(error: std::io::Error) -> ReaderError {
    ReaderError::Io(error.to_string())
}
pub(super) fn now_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
pub(super) fn file_signature(path: &std::path::Path) -> Result<FileSignature, ReaderError> {
    let m = std::fs::metadata(path).map_err(io_error)?;
    Ok(FileSignature {
        len: m.len(),
        modified_ns: m
            .modified()
            .unwrap_or(UNIX_EPOCH)
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos(),
    })
}
