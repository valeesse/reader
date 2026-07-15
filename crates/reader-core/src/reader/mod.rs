mod cache;
mod epub;
mod lifecycle;
mod model;
mod txt;

pub use model::*;

use crate::{Book, LibraryRegistry, ScanProgress};
use std::{
    path::Path,
    sync::{
        Mutex, RwLock,
        atomic::{AtomicU64, Ordering},
    },
};

pub struct ReaderService {
    registry: Mutex<LibraryRegistry>,
    config: ReaderConfig,
    txt_books: Mutex<std::collections::HashMap<String, model::TxtBookCache>>,
    epub_books: Mutex<std::collections::HashMap<String, model::EpubBookCache>>,
    maintenance: RwLock<()>,
    next_session: AtomicU64,
}

impl ReaderService {
    pub fn new(
        registry: LibraryRegistry,
        state_dir: impl AsRef<Path>,
        cache_dir: impl AsRef<Path>,
    ) -> Result<Self, ReaderError> {
        let config = ReaderConfig::new(state_dir, cache_dir)?;
        Ok(Self {
            registry: Mutex::new(registry),
            config,
            txt_books: Mutex::new(Default::default()),
            epub_books: Mutex::new(Default::default()),
            maintenance: RwLock::new(()),
            next_session: AtomicU64::new(1),
        })
    }

    /// Runs potentially expensive disk-cache housekeeping outside the startup
    /// path. The write guard keeps maintenance from deleting a cache entry while
    /// an active reader command is opening or reading it.
    pub fn maintain_disk_cache(&self) -> Result<(), ReaderError> {
        let _maintenance = self.maintenance.write().map_err(|_| ReaderError::Busy)?;
        cache::trim_disk(&self.config.cache_dir, model::reader_disk_cache_max_bytes())
    }

    pub fn scan<F>(&self, progress: F) -> Result<Vec<Book>, ReaderError>
    where
        F: FnMut(ScanProgress),
    {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        self.scan_inner(progress)
    }

    fn scan_inner<F>(&self, progress: F) -> Result<Vec<Book>, ReaderError>
    where
        F: FnMut(ScanProgress),
    {
        let mut books = self
            .registry
            .lock()
            .map_err(|_| ReaderError::Busy)?
            .scan(progress)?;
        for book in &mut books {
            if book.book_type == "epub"
                && let Ok(metadata) = epub::scan_epub_metadata(self, &book.resource_id, &book.title)
            {
                book.title = metadata.title;
                book.author = metadata.author.unwrap_or_else(|| "Unknown Author".into());
                book.cover = metadata.cover;
                book.series_name = metadata.series_name;
                book.series_index = metadata.series_index;
            }
        }
        Ok(books)
    }

    pub fn books(&self) -> Result<Vec<Book>, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        let mut books = self.registry.lock().map_err(|_| ReaderError::Busy)?.books();
        for book in &mut books {
            if let Some(metadata) = cache::load_scan_metadata(&self.config, &book.resource_id) {
                book.title = metadata.title;
                book.author = metadata.author.unwrap_or_else(|| "Unknown Author".into());
                book.cover = metadata.cover;
                book.series_name = metadata.series_name;
                book.series_index = metadata.series_index;
            }
        }
        Ok(books)
    }

    pub fn txt_preview(
        &self,
        resource_id: &str,
        max_chars: usize,
    ) -> Result<TxtPreview, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        txt::preview(self, resource_id, max_chars)
    }
    pub fn open_txt(&self, resource_id: &str) -> Result<TxtBookInfo, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        txt::open(self, resource_id)
    }
    pub fn read_txt_window(
        &self,
        resource_id: &str,
        session_id: &str,
        start: usize,
        end: usize,
    ) -> Result<TxtTextWindow, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        txt::read_window(self, resource_id, session_id, start, end)
    }
    pub fn close_txt(&self, resource_id: &str, session_id: &str) -> Result<(), ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        txt::close(self, resource_id, session_id)
    }
    pub fn open_epub(
        &self,
        resource_id: &str,
        fallback_title: &str,
    ) -> Result<EpubOpenResult, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::open(self, resource_id, fallback_title)
    }
    pub fn read_epub_resource(
        &self,
        resource_id: &str,
        session_id: &str,
        href: &str,
    ) -> Result<EpubResourcePayload, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::read_resource(self, resource_id, session_id, href)
    }
    pub fn epub_binary_resource(
        &self,
        resource_id: &str,
        session_id: &str,
        href: &str,
    ) -> Result<CachedBinaryResource, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::binary_resource(self, resource_id, session_id, href)
    }
    pub fn cover(&self, resource_id: &str) -> Result<CachedCover, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::cover(self, resource_id)
    }
    pub fn prefetch_epub_resources(
        &self,
        resource_id: &str,
        session_id: &str,
        hrefs: Vec<String>,
    ) -> Result<(), ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::prefetch(self, resource_id, session_id, hrefs)
    }
    pub fn close_epub(&self, resource_id: &str, session_id: &str) -> Result<(), ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        epub::close(self, resource_id, session_id)
    }
    pub fn cache_stats(&self) -> Result<ReaderCacheStats, ReaderError> {
        let _maintenance = self.maintenance.read().map_err(|_| ReaderError::Busy)?;
        cache::stats(&self.config)
    }
    pub fn clear_cache(&self) -> Result<(), ReaderError> {
        let _maintenance = self.maintenance.write().map_err(|_| ReaderError::Busy)?;
        cache::clear(self)
    }

    fn resolve(
        &self,
        resource_id: &str,
        extension: &str,
    ) -> Result<std::path::PathBuf, ReaderError> {
        let path = self
            .registry
            .lock()
            .map_err(|_| ReaderError::Busy)?
            .resolve(resource_id)?;
        if path
            .extension()
            .and_then(|v| v.to_str())
            .is_none_or(|v| !v.eq_ignore_ascii_case(extension))
        {
            return Err(ReaderError::WrongType);
        }
        Ok(path)
    }

    fn session_id(&self, prefix: &str) -> String {
        format!(
            "{prefix}-{}-{}",
            model::now_millis(),
            self.next_session.fetch_add(1, Ordering::Relaxed)
        )
    }
}

#[cfg(test)]
mod tests;
