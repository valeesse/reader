use super::{ReaderService, model::*};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};
use walkdir::WalkDir;

static TEMP_FILE_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

pub(super) fn cache_dir(c: &ReaderConfig, name: &str) -> Result<PathBuf, ReaderError> {
    let d = c.cache_dir.join("reader-cache").join(name);
    fs::create_dir_all(&d).map_err(io_error)?;
    Ok(d)
}
pub(super) fn txt_index(c: &ReaderConfig, id: &str) -> Result<PathBuf, ReaderError> {
    Ok(cache_dir(c, "txt-index")?.join(format!("{}.json", hash(id))))
}
pub(super) fn txt_data(
    c: &ReaderConfig,
    id: &str,
    s: FileSignature,
) -> Result<PathBuf, ReaderError> {
    Ok(cache_dir(c, "txt-data")?.join(format!("{}-{}-{}.utf8", hash(id), s.len, s.modified_ns)))
}
pub(super) fn epub_metadata(c: &ReaderConfig, id: &str) -> Result<PathBuf, ReaderError> {
    Ok(cache_dir(c, "epub-metadata")?.join(format!("{}.json", hash(id))))
}
pub(super) fn epub_resource(
    c: &ReaderConfig,
    id: &str,
    s: FileSignature,
    href: &str,
    media: &str,
) -> Result<PathBuf, ReaderError> {
    let d = c.cache_dir.join("epub-resources").join(format!(
        "{}-{}-{}",
        hash(id),
        s.len,
        s.modified_ns
    ));
    fs::create_dir_all(&d).map_err(io_error)?;
    let ext = Path::new(href)
        .extension()
        .and_then(|v| v.to_str())
        .unwrap_or_else(|| {
            mime_guess::get_mime_extensions_str(media)
                .and_then(|v| v.first().copied())
                .unwrap_or("bin")
        });
    Ok(d.join(format!("{}.{}", hash(href), ext)))
}
pub(super) fn cover(c: &ReaderConfig, id: &str, media: &str) -> PathBuf {
    let extension = mime_guess::get_mime_extensions_str(media)
        .and_then(|values| values.first().copied())
        .unwrap_or("img");
    c.cover_dir.join(format!("{}.{}", hash(id), extension))
}
pub(super) fn validated_cache_file(c: &ReaderConfig, path: &Path) -> Result<PathBuf, ReaderError> {
    let cache_root = fs::canonicalize(&c.cache_dir).map_err(io_error)?;
    let path = fs::canonicalize(path).map_err(io_error)?;
    if !path.starts_with(cache_root) || !path.is_file() {
        return Err(ReaderError::Io("cached resource escaped cache root".into()));
    }
    Ok(path)
}
pub(super) fn write_atomic(target: &Path, bytes: &[u8]) -> Result<(), ReaderError> {
    let temp = temporary_path(target);
    fs::write(&temp, bytes).map_err(io_error)?;
    crate::replace_file(&temp, target).map_err(io_error)
}
pub(super) fn temporary_path(target: &Path) -> PathBuf {
    let file_name = target
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("cache");
    target.with_file_name(format!(
        ".{file_name}.{}-{}.tmp",
        std::process::id(),
        TEMP_FILE_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    ))
}
pub(super) fn hash(v: &str) -> String {
    let mut h = Sha256::new();
    h.update(v.as_bytes());
    h.finalize()
        .iter()
        .take(16)
        .map(|b| format!("{b:02x}"))
        .collect()
}
pub(super) fn load_scan_metadata(c: &ReaderConfig, id: &str) -> Option<ScanEpubMetadata> {
    let mut metadata: ScanEpubMetadata = serde_json::from_slice(
        &fs::read(
            c.state_dir
                .join("book-metadata")
                .join(format!("{}.json", hash(id))),
        )
        .ok()?,
    )
    .ok()?;
    // Covers are derived cache files, while scan metadata deliberately lives in
    // persistent state. A cache clear must therefore not leave a dead path that
    // every library card tries to load. Keep the useful title/series metadata and
    // let the cover endpoint rebuild only the covers that actually enter view.
    if metadata
        .cover
        .as_deref()
        .is_some_and(|path| !Path::new(path).is_file())
    {
        metadata.cover = None;
    }
    Some(metadata)
}
pub(super) fn save_scan_metadata(c: &ReaderConfig, id: &str, m: &ScanEpubMetadata) {
    let d = c.state_dir.join("book-metadata");
    if fs::create_dir_all(&d).is_ok()
        && let Ok(v) = serde_json::to_vec(m)
    {
        let _ = write_atomic(&d.join(format!("{}.json", hash(id))), &v);
    }
}
pub(super) fn stats(c: &ReaderConfig) -> Result<ReaderCacheStats, ReaderError> {
    let mut bytes = 0;
    let mut files = 0;
    for e in WalkDir::new(&c.cache_dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
    {
        files += 1;
        bytes += e
            .metadata()
            .map_err(|e| ReaderError::Io(e.to_string()))?
            .len();
    }
    Ok(ReaderCacheStats {
        bytes,
        files,
        max_bytes: reader_disk_cache_max_bytes(),
    })
}
pub(super) fn clear(s: &ReaderService) -> Result<(), ReaderError> {
    if s.txt_books
        .lock()
        .map_err(|_| ReaderError::Busy)?
        .values()
        .any(|v| !v.active_sessions.is_empty())
        || s.epub_books
            .lock()
            .map_err(|_| ReaderError::Busy)?
            .values()
            .any(|v| !v.active_sessions.is_empty())
    {
        return Err(ReaderError::Busy);
    };
    if s.config.cache_dir.exists() {
        fs::remove_dir_all(&s.config.cache_dir).map_err(io_error)?
    }
    fs::create_dir_all(&s.config.cache_dir).map_err(io_error)?;
    fs::create_dir_all(&s.config.cover_dir).map_err(io_error)
}
pub(super) fn trim_disk(root: &Path, max: u64) -> Result<(), ReaderError> {
    let mut v = WalkDir::new(root)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
        .filter_map(|e| {
            let m = e.metadata().ok()?;
            Some((e.into_path(), m.len(), m.modified().unwrap_or(UNIX_EPOCH)))
        })
        .collect::<Vec<_>>();
    let mut total = v.iter().map(|x| x.1).sum::<u64>();
    v.sort_by_key(|x| x.2);
    for (p, n, _) in v {
        if total <= max {
            break;
        }
        if fs::remove_file(p).is_ok() {
            total = total.saturating_sub(n)
        }
    }
    Ok(())
}
