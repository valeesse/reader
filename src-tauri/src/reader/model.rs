const TXT_CHAR_CHECKPOINT_INTERVAL: usize = 4096;
const TXT_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_BOOK_CACHE_LIMIT: usize = 5;
const EPUB_RESOURCE_CACHE_LIMIT: usize = 96;
const EPUB_RESOURCE_CACHE_MAX_BYTES: usize = 48 * 1024 * 1024;
const EPUB_PREFETCH_MAX_RESOURCES: usize = 16;
const PERSISTENT_CACHE_VERSION: u8 = 3;
const STREAM_BUFFER_BYTES: usize = 64 * 1024;
static TEMP_FILE_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Default)]
struct ReaderState {
    txt_books: Mutex<HashMap<String, TxtBookCache>>,
    epub_books: Mutex<HashMap<String, EpubBookCache>>,
    next_session_id: AtomicU64,
}

#[derive(Debug)]
struct TxtBookCache {
    signature: FileSignature,
    last_used_at: u128,
    active_sessions: HashSet<String>,
    encoding: String,
    data_path: PathBuf,
    total_chars: usize,
    total_bytes: u64,
    checkpoints: Vec<(usize, usize)>,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TxtChapterInfo {
    id: String,
    title: String,
    start_index: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TxtBookInfo {
    session_id: String,
    total_chars: usize,
    total_bytes: u64,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TxtTextWindow {
    start: usize,
    end: usize,
    text: String,
}

struct EpubBookCache {
    signature: FileSignature,
    last_used_at: u128,
    active_sessions: HashSet<String>,
    info: EpubBookInfo,
    manifest_items: Vec<EpubManifestItem>,
    resource_cache: HashMap<String, EpubCachedResource>,
    resource_order: VecDeque<String>,
    resource_bytes: usize,
    archive: ZipArchive<File>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
struct FileSignature {
    len: u64,
    modified_ns: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct EpubManifestItem {
    id: String,
    absolute_href: String,
    media_type: String,
    properties: Vec<String>,
}

#[derive(Debug, Clone)]
struct EpubCachedResource {
    bytes: Arc<[u8]>,
    media_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubBookInfo {
    metadata: EpubMetadataInfo,
    reading_order: Vec<EpubLinkInfo>,
    resources: Vec<EpubLinkInfo>,
    toc: Vec<EpubLinkInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EpubOpenResult {
    session_id: String,
    book: EpubBookInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubMetadataInfo {
    title: String,
    author: Option<String>,
    language: String,
    layout: String,
    reading_progression: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EpubLinkInfo {
    href: String,
    media_type: String,
    title: Option<String>,
    rels: Vec<String>,
    properties: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EpubResourcePayload {
    href: String,
    media_type: String,
    text: Option<String>,
    base64: Option<String>,
    file_path: Option<String>,
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
    path: String,
    file_name: String,
    series_name: Option<String>,
    series_index: Option<f64>,
    added_at: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WebDavConfig {
    url: String,
    username: String,
    password: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WebDavBook {
    id: String,
    title: String,
    author: String,
    #[serde(rename = "type")]
    book_type: String,
    path: String,
    file_name: String,
    added_at: u64,
    source: String,
    remote_path: String,
    size: Option<u64>,
    modified_at: Option<u64>,
}

#[derive(Debug)]
struct WebDavEntry {
    remote_path: String,
    file_name: String,
    is_dir: bool,
    size: Option<u64>,
    modified_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanProgress {
    visited: usize,
    matched: usize,
    current_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistentTxtIndexCache {
    version: u8,
    path: String,
    signature: FileSignature,
    encoding: String,
    data_path: String,
    data_bytes: u64,
    total_chars: usize,
    total_bytes: u64,
    checkpoints: Vec<(usize, usize)>,
    chapters: Vec<TxtChapterInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersistentEpubBookCache {
    version: u8,
    path: String,
    signature: FileSignature,
    info: EpubBookInfo,
    manifest_items: Vec<EpubManifestItem>,
}

type TxtIndex = (usize, Vec<(usize, usize)>, Vec<TxtChapterInfo>);
type ParsedEpubMetadata = (String, String, Option<String>, Option<String>, Option<f64>);

