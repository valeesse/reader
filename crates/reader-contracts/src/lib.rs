use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Capabilities {
    pub api_version: u16,
    pub mutable_library_root: bool,
    pub managed_library: bool,
    pub folder_library: bool,
    pub web_dav: bool,
    pub authentication: bool,
    pub resource_transport: ResourceTransport,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ResourceTransport {
    AssetUrl,
    HttpUrl,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    InvalidSession,
    BookNotFound,
    UnsupportedFormat,
    CacheBusy,
    PermissionDenied,
    SourceUnavailable,
    Internal,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResourceRequest {
    pub resource_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRequest {
    pub resource_id: String,
    pub session_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtPreviewRequest {
    pub resource_id: String,
    pub max_chars: usize,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TxtWindowRequest {
    pub resource_id: String,
    pub session_id: String,
    pub start: usize,
    pub end: usize,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubOpenRequest {
    pub resource_id: String,
    pub fallback_title: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubReadRequest {
    pub resource_id: String,
    pub session_id: String,
    pub href: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpubPrefetchRequest {
    pub resource_id: String,
    pub session_id: String,
    pub hrefs: Vec<String>,
}
