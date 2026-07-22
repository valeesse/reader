mod support;

use crate::{
    Book, CoreError, ScanProgress,
    fingerprint::{fingerprint_file, valid_resource_id},
};
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, HashMap, HashSet},
    fs::{self, File},
    io::{self, Write},
    path::{Component, Path, PathBuf},
    sync::atomic::{AtomicU64, Ordering},
};
use support::{modified_ns, normalized_relative_path, supported_extension};
use walkdir::WalkDir;

const INDEX_VERSION: u8 = 2;
static INDEX_TEMP_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CachedFile {
    book_id: String,
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

#[derive(Clone)]
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
            let Some(book_type) = supported_extension(entry.path()) else {
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
        let current_paths = candidates
            .iter()
            .map(|candidate| candidate.0.clone())
            .collect::<HashSet<_>>();
        let reserved_ids = self
            .index
            .files
            .iter()
            .filter(|file| current_paths.contains(&file.relative_path))
            .map(|file| file.book_id.clone())
            .collect::<HashSet<_>>();
        let mut previous_by_content: HashMap<String, Vec<String>> = HashMap::new();
        for file in &self.index.files {
            previous_by_content
                .entry(file.fingerprint.clone())
                .or_default()
                .push(file.book_id.clone());
        }
        let mut resources = BTreeMap::new();
        let mut files = Vec::new();
        let mut books = Vec::new();
        for (relative_path, book_type, len, modified_ns, fingerprint) in candidates {
            let book_id = cached
                .get(&relative_path)
                .map(|file| file.book_id.clone())
                .or_else(|| {
                    previous_by_content.get(&fingerprint).and_then(|ids| {
                        ids.iter()
                            .find(|id| !reserved_ids.contains(*id) && !resources.contains_key(*id))
                            .cloned()
                    })
                })
                .unwrap_or_else(|| new_book_id(&fingerprint, &relative_path));
            files.push(CachedFile {
                book_id: book_id.clone(),
                relative_path: relative_path.clone(),
                len,
                modified_ns,
                fingerprint: fingerprint.clone(),
            });
            resources.insert(book_id.clone(), relative_path.clone());
            let file_name = Path::new(&relative_path)
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or_default()
                .to_string();
            let title = Path::new(&file_name)
                .file_stem()
                .and_then(|value| value.to_str())
                .unwrap_or("Unknown Title")
                .to_string();
            books.push(Book {
                id: book_id.clone(),
                resource_id: book_id,
                content_id: fingerprint.clone(),
                fingerprint,
                title,
                author: "Unknown Author".into(),
                book_type: book_type.into(),
                file_name,
                relative_path,
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
                    content_id: file.fingerprint.clone(),
                    fingerprint: file.fingerprint.clone(),
                    title,
                    author: "Unknown Author".into(),
                    book_type: book_type.into(),
                    file_name,
                    relative_path: relative.clone(),
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
            INDEX_TEMP_COUNTER.fetch_add(1, Ordering::Relaxed)
        ));
        let mut file = File::create(&temp)?;
        serde_json::to_writer(&mut file, &self.index)?;
        file.flush()?;
        drop(file);
        crate::replace_file(&temp, &target)?;
        Ok(())
    }
}

fn new_book_id(fingerprint: &str, relative_path: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(fingerprint.as_bytes());
    hasher.update([0]);
    hasher.update(relative_path.as_bytes());
    hasher.update(
        INDEX_TEMP_COUNTER
            .fetch_add(1, Ordering::Relaxed)
            .to_le_bytes(),
    );
    hasher.update(std::process::id().to_le_bytes());
    let value = hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    format!("{}:{value}", crate::BOOK_ID_VERSION)
}

#[cfg(test)]
mod tests;
