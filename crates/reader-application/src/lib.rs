use reader_contracts::*;
use reader_core::{
    Book, CachedBinaryResource, CachedCover, ReaderCacheStats, ReaderError, ReaderService,
    ScanProgress,
};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

/// Transport-neutral application facade. Axum and Tauri adapt their request
/// mechanisms to this service and do not duplicate reader use-case semantics.
pub struct ReaderApplication {
    reader: Arc<ReaderService>,
}

/// Imports platform-selected files into an application-controlled folder.
/// Mobile hosts can hand over temporary picker paths, then release their URI
/// permissions after this copy completes.
pub fn import_books(
    managed_root: impl AsRef<Path>,
    sources: &[PathBuf],
) -> Result<Vec<PathBuf>, ReaderError> {
    let managed_root = managed_root.as_ref();
    fs::create_dir_all(managed_root).map_err(|error| ReaderError::Io(error.to_string()))?;
    let mut imported = Vec::new();
    for source in sources {
        let extension = source
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase();
        if extension != "epub" && extension != "txt" {
            continue;
        }
        let name = source
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("book");
        let mut target = managed_root.join(name);
        let stem = Path::new(name)
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("book");
        let mut suffix = 2;
        while target.exists() {
            target = managed_root.join(format!("{stem} ({suffix}).{extension}"));
            suffix += 1;
        }
        let temporary = target.with_extension(format!("{extension}.importing"));
        fs::copy(source, &temporary).map_err(|error| ReaderError::Io(error.to_string()))?;
        fs::rename(&temporary, &target).map_err(|error| ReaderError::Io(error.to_string()))?;
        imported.push(target);
    }
    Ok(imported)
}

impl ReaderApplication {
    pub fn new(reader: Arc<ReaderService>) -> Self {
        Self { reader }
    }
    pub fn reader(&self) -> &Arc<ReaderService> {
        &self.reader
    }

    pub fn books(&self) -> Result<Vec<Book>, ReaderError> {
        self.reader.books()
    }
    pub fn scan<F>(&self, progress: F) -> Result<Vec<Book>, ReaderError>
    where
        F: FnMut(ScanProgress),
    {
        self.reader.scan(progress)
    }
    pub fn cover(&self, resource_id: &str) -> Result<CachedCover, ReaderError> {
        self.reader.cover(resource_id)
    }
    pub fn maintain_disk_cache(&self) -> Result<(), ReaderError> {
        self.reader.maintain_disk_cache()
    }
    pub fn cache_stats(&self) -> Result<ReaderCacheStats, ReaderError> {
        self.reader.cache_stats()
    }
    pub fn clear_cache(&self) -> Result<(), ReaderError> {
        self.reader.clear_cache()
    }

    pub fn open_txt(
        &self,
        request: &ResourceRequest,
    ) -> Result<reader_core::TxtBookInfo, ReaderError> {
        self.reader.open_txt(&request.resource_id)
    }
    pub fn txt_preview(
        &self,
        request: &TxtPreviewRequest,
    ) -> Result<reader_core::TxtPreview, ReaderError> {
        self.reader
            .txt_preview(&request.resource_id, request.max_chars)
    }
    pub fn read_txt(
        &self,
        request: &TxtWindowRequest,
    ) -> Result<reader_core::TxtTextWindow, ReaderError> {
        self.reader.read_txt_window(
            &request.resource_id,
            &request.session_id,
            request.start,
            request.end,
        )
    }
    pub fn close_txt(&self, request: &SessionRequest) -> Result<(), ReaderError> {
        self.reader
            .close_txt(&request.resource_id, &request.session_id)
    }
    pub fn open_epub(
        &self,
        request: &EpubOpenRequest,
    ) -> Result<reader_core::EpubOpenResult, ReaderError> {
        self.reader
            .open_epub(&request.resource_id, &request.fallback_title)
    }
    pub fn read_epub(
        &self,
        request: &EpubReadRequest,
    ) -> Result<reader_core::EpubResourcePayload, ReaderError> {
        self.reader
            .read_epub_resource(&request.resource_id, &request.session_id, &request.href)
    }
    pub fn epub_binary(
        &self,
        request: &EpubReadRequest,
    ) -> Result<CachedBinaryResource, ReaderError> {
        self.reader
            .epub_binary_resource(&request.resource_id, &request.session_id, &request.href)
    }
    pub fn prefetch_epub(&self, request: EpubPrefetchRequest) -> Result<(), ReaderError> {
        self.reader.prefetch_epub_resources(
            &request.resource_id,
            &request.session_id,
            request.hrefs,
        )
    }
    pub fn epub_positions(
        &self,
        request: &SessionRequest,
    ) -> Result<Vec<reader_core::EpubPositionCount>, ReaderError> {
        self.reader
            .epub_position_counts(&request.resource_id, &request.session_id)
    }
    pub fn close_epub(&self, request: &SessionRequest) -> Result<(), ReaderError> {
        self.reader
            .close_epub(&request.resource_id, &request.session_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn application_facade_is_transport_neutral() {
        fn assert_send_sync<T: Send + Sync>() {}
        assert_send_sync::<ReaderApplication>();
    }

    #[test]
    fn managed_import_accepts_only_reader_formats() {
        let temp = tempfile::tempdir().unwrap();
        let source = temp.path().join("source");
        std::fs::create_dir_all(&source).unwrap();
        std::fs::write(source.join("book.txt"), "reader").unwrap();
        std::fs::write(source.join("ignore.pdf"), "pdf").unwrap();
        let imported = import_books(
            temp.path().join("managed"),
            &[source.join("book.txt"), source.join("ignore.pdf")],
        )
        .unwrap();
        assert_eq!(imported.len(), 1);
        assert!(imported[0].ends_with("book.txt"));
    }
}
