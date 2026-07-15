static TEMP_FILE_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Default)]
struct ReaderState {
    reader: Mutex<Option<Arc<reader_core::ReaderService>>>,
    export_paths: Mutex<HashMap<String, String>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeBook {
    id: String,
    title: String,
    author: String,
    cover: Option<String>,
    #[serde(rename = "type")]
    book_type: String,
    resource_id: String,
    file_name: String,
    series_name: Option<String>,
    series_index: Option<f64>,
    added_at: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WebDavConfig { url: String, username: String, password: Option<String> }

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WebDavBook {
    id: String, title: String, author: String,
    #[serde(rename = "type")]
    book_type: String,
    path: String, fingerprint: String, file_name: String, added_at: u64, source: String,
    remote_path: String, size: Option<u64>, modified_at: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CachedWebDavBook { resource_id: String }

#[derive(Debug)]
struct WebDavEntry { remote_path: String, file_name: String, is_dir: bool, size: Option<u64>, modified_at: Option<u64> }

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanProgress { visited: usize, matched: usize, current_path: String }
