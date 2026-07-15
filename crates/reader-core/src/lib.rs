use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, HashMap},
    fs::{self, File},
    io::{self, Read, Write},
    path::{Component, Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use thiserror::Error;
use walkdir::WalkDir;

static INDEX_TEMP_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);
static REPLACE_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);
static REPLACE_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

mod reader;
pub use reader::*;

pub const FINGERPRINT_VERSION: &str = "sha256-full-v1";
const INDEX_VERSION: u8 = 1;

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

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CachedFile {
    relative_path: String,
    len: u64,
    modified_ns: u64,
    fingerprint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredIndex {
    version: u8,
    files: Vec<CachedFile>,
    resources: BTreeMap<String, String>,
}

impl Default for StoredIndex {
    fn default() -> Self {
        Self {
            version: INDEX_VERSION,
            files: Vec::new(),
            resources: BTreeMap::new(),
        }
    }
}

pub struct LibraryRegistry {
    root: PathBuf,
    state_dir: PathBuf,
    index: StoredIndex,
}

impl std::fmt::Debug for LibraryRegistry {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("LibraryRegistry")
            .field("root", &self.root)
            .field("state_dir", &self.state_dir)
            .finish_non_exhaustive()
    }
}

impl LibraryRegistry {
    pub fn open(root: impl AsRef<Path>, state_dir: impl AsRef<Path>) -> Result<Self, CoreError> {
        let root = fs::canonicalize(root).map_err(|_| CoreError::InvalidRoot)?;
        if !root.is_dir() {
            return Err(CoreError::InvalidRoot);
        }
        let state_dir = state_dir.as_ref().to_path_buf();
        fs::create_dir_all(&state_dir)?;
        let index_path = state_dir.join("library-index-v1.json");
        let index = match fs::read(index_path) {
            Ok(bytes) => serde_json::from_slice::<StoredIndex>(&bytes)
                .ok()
                .filter(|index| index.version == INDEX_VERSION)
                .unwrap_or_default(),
            Err(error) if error.kind() == io::ErrorKind::NotFound => StoredIndex::default(),
            Err(error) => return Err(error.into()),
        };
        Ok(Self {
            root,
            state_dir,
            index,
        })
    }

    pub fn scan<F>(&mut self, mut progress: F) -> Result<Vec<Book>, CoreError>
    where
        F: FnMut(ScanProgress),
    {
        let cached: HashMap<_, _> = self
            .index
            .files
            .iter()
            .map(|file| (file.relative_path.clone(), file.clone()))
            .collect();
        let mut candidates = Vec::new();
        let mut visited = 0;
        for entry in WalkDir::new(&self.root).follow_links(false).into_iter() {
            let entry = entry?;
            visited += 1;
            if entry.file_type().is_symlink() || !entry.file_type().is_file() {
                continue;
            }
            let extension = supported_extension(entry.path());
            let Some(book_type) = extension else {
                continue;
            };
            let relative_path = normalized_relative_path(&self.root, entry.path())?;
            let metadata = entry.metadata()?;
            let modified_ns = modified_ns(&metadata);
            let fingerprint = cached
                .get(&relative_path)
                .filter(|old| old.len == metadata.len() && old.modified_ns == modified_ns)
                .map(|old| old.fingerprint.clone())
                .unwrap_or(fingerprint_file(entry.path())?);
            candidates.push((
                relative_path.clone(),
                book_type,
                metadata.len(),
                modified_ns,
                fingerprint,
            ));
            progress(ScanProgress {
                visited,
                matched: candidates.len(),
                current_relative_path: relative_path,
            });
        }
        candidates.sort_by(|a, b| a.0.cmp(&b.0));
        let mut resources = BTreeMap::new();
        let mut files = Vec::new();
        let mut books = Vec::new();
        for (relative_path, book_type, len, modified_ns, fingerprint) in candidates {
            files.push(CachedFile {
                relative_path: relative_path.clone(),
                len,
                modified_ns,
                fingerprint: fingerprint.clone(),
            });
            if resources.contains_key(&fingerprint) {
                continue;
            }
            resources.insert(fingerprint.clone(), relative_path.clone());
            let file_name = Path::new(&relative_path)
                .file_name()
                .and_then(|v| v.to_str())
                .unwrap_or_default()
                .to_string();
            let title = Path::new(&file_name)
                .file_stem()
                .and_then(|v| v.to_str())
                .unwrap_or("Unknown Title")
                .to_string();
            books.push(Book {
                id: fingerprint.clone(),
                resource_id: fingerprint.clone(),
                fingerprint,
                title,
                author: "Unknown Author".into(),
                book_type: book_type.into(),
                file_name,
                len,
                modified_at: modified_ns / 1_000_000,
                cover: None,
                series_name: None,
                series_index: None,
            });
        }
        self.index = StoredIndex {
            version: INDEX_VERSION,
            files,
            resources,
        };
        self.persist()?;
        progress(ScanProgress {
            visited,
            matched: books.len(),
            current_relative_path: String::new(),
        });
        Ok(books)
    }

    pub fn books(&self) -> Vec<Book> {
        let files_by_path: HashMap<&str, &CachedFile> = self
            .index
            .files
            .iter()
            .map(|file| (file.relative_path.as_str(), file))
            .collect();
        self.index
            .resources
            .iter()
            .filter_map(|(id, relative)| {
                let file = files_by_path.get(relative.as_str()).copied()?;
                let book_type = supported_extension(Path::new(relative))?;
                let file_name = Path::new(relative).file_name()?.to_str()?.to_string();
                let title = Path::new(&file_name).file_stem()?.to_str()?.to_string();
                Some(Book {
                    id: id.clone(),
                    resource_id: id.clone(),
                    fingerprint: id.clone(),
                    title,
                    author: "Unknown Author".into(),
                    book_type: book_type.into(),
                    file_name,
                    len: file.len,
                    modified_at: file.modified_ns / 1_000_000,
                    cover: None,
                    series_name: None,
                    series_index: None,
                })
            })
            .collect()
    }

    pub fn resolve(&self, resource_id: &str) -> Result<PathBuf, CoreError> {
        if !valid_resource_id(resource_id) {
            return Err(CoreError::InvalidResourceId);
        }
        let relative = self
            .index
            .resources
            .get(resource_id)
            .ok_or(CoreError::InvalidResourceId)?;
        let relative_path = Path::new(relative);
        if relative_path.is_absolute()
            || relative_path
                .components()
                .any(|part| !matches!(part, Component::Normal(_)))
        {
            return Err(CoreError::UnsafePath);
        }
        let candidate = self.root.join(relative_path);
        let metadata = fs::symlink_metadata(&candidate)?;
        if metadata.file_type().is_symlink() || !metadata.is_file() {
            return Err(CoreError::UnsafePath);
        }
        let canonical = fs::canonicalize(&candidate)?;
        if !canonical.starts_with(&self.root) {
            return Err(CoreError::UnsafePath);
        }
        Ok(canonical)
    }

    fn persist(&self) -> Result<(), CoreError> {
        let target = self.state_dir.join("library-index-v1.json");
        let temp = self.state_dir.join(format!(
            ".library-index-{}-{}.tmp",
            std::process::id(),
            INDEX_TEMP_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
        ));
        let mut file = File::create(&temp)?;
        serde_json::to_writer(&mut file, &self.index)?;
        file.flush()?;
        drop(file);
        replace_file(&temp, &target)?;
        Ok(())
    }
}

pub fn fingerprint_file(path: impl AsRef<Path>) -> Result<String, CoreError> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(format!("{FINGERPRINT_VERSION}:{}", hex(&hasher.finalize())))
}

fn valid_resource_id(value: &str) -> bool {
    value
        .strip_prefix(&format!("{FINGERPRINT_VERSION}:"))
        .is_some_and(|hex| {
            hex.len() == 64
                && hex
                    .bytes()
                    .all(|v| v.is_ascii_hexdigit() && !v.is_ascii_uppercase())
        })
}

fn normalized_relative_path(root: &Path, path: &Path) -> Result<String, CoreError> {
    let relative = path.strip_prefix(root).map_err(|_| CoreError::UnsafePath)?;
    if relative
        .components()
        .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err(CoreError::UnsafePath);
    }
    let parts = relative
        .components()
        .map(|part| match part {
            Component::Normal(value) => value.to_str().ok_or(CoreError::UnsafePath),
            _ => Err(CoreError::UnsafePath),
        })
        .collect::<Result<Vec<_>, _>>()?;
    if parts.is_empty() {
        return Err(CoreError::UnsafePath);
    }
    Ok(parts.join("/"))
}

fn supported_extension(path: &Path) -> Option<&'static str> {
    match path.extension()?.to_str()?.to_ascii_lowercase().as_str() {
        "epub" => Some("epub"),
        "txt" => Some("txt"),
        _ => None,
    }
}

fn modified_ns(metadata: &fs::Metadata) -> u64 {
    metadata
        .modified()
        .unwrap_or(SystemTime::UNIX_EPOCH)
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos()
        .min(u128::from(u64::MAX)) as u64
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn replace_file(temp: &Path, target: &Path) -> io::Result<()> {
    let _guard = REPLACE_LOCK
        .lock()
        .map_err(|_| io::Error::other("file replacement lock poisoned"))?;
    if !target.exists() {
        return fs::rename(temp, target);
    }
    let backup = target.with_extension(format!(
        "backup-{}-{}",
        std::process::id(),
        REPLACE_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    ));
    let _ = fs::remove_file(&backup);
    fs::rename(target, &backup)?;
    match fs::rename(temp, target) {
        Ok(()) => {
            let _ = fs::remove_file(backup);
            Ok(())
        }
        Err(error) => {
            let _ = fs::rename(backup, target);
            Err(error)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn rename_and_move_keep_identity_and_duplicates_are_deterministic() {
        let temp = tempdir().unwrap();
        let root = temp.path().join("books");
        let state = temp.path().join("state");
        fs::create_dir_all(root.join("z")).unwrap();
        fs::write(root.join("z/old.txt"), b"complete bytes").unwrap();
        fs::write(root.join("duplicate.txt"), b"complete bytes").unwrap();
        let mut registry = LibraryRegistry::open(&root, &state).unwrap();
        let first = registry.scan(|_| {}).unwrap();
        assert_eq!(first.len(), 1);
        let id = first[0].resource_id.clone();
        assert!(registry.resolve(&id).unwrap().ends_with("duplicate.txt"));
        fs::remove_file(root.join("duplicate.txt")).unwrap();
        fs::create_dir_all(root.join("moved")).unwrap();
        fs::rename(root.join("z/old.txt"), root.join("moved/new.txt")).unwrap();
        let second = registry.scan(|_| {}).unwrap();
        assert_eq!(second[0].resource_id, id);
        assert!(registry.resolve(&id).unwrap().ends_with("new.txt"));
    }

    #[test]
    fn resolve_rejects_bad_ids_and_tampered_traversal() {
        let temp = tempdir().unwrap();
        let root = temp.path().join("books");
        let state = temp.path().join("state");
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("book.txt"), b"book").unwrap();
        let mut registry = LibraryRegistry::open(&root, &state).unwrap();
        registry.scan(|_| {}).unwrap();
        assert!(matches!(
            registry.resolve("../book.txt"),
            Err(CoreError::InvalidResourceId)
        ));
        let id = registry.books()[0].resource_id.clone();
        registry
            .index
            .resources
            .insert(id.clone(), "../outside.txt".into());
        assert!(matches!(registry.resolve(&id), Err(CoreError::UnsafePath)));
    }

    #[test]
    fn scan_real_files_can_be_verified_without_fixture_books() {
        let temp = tempdir().unwrap();
        let root = temp.path().join("books");
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("verify.txt"), b"known full file").unwrap();
        let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
        let books = registry.scan(|_| {}).unwrap();
        assert_eq!(
            books[0].fingerprint,
            fingerprint_file(root.join("verify.txt")).unwrap()
        );
    }
}
