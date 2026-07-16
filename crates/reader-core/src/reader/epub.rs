mod archive;
mod metadata;
mod package;
mod path;
mod persistence;
mod resources;

use self::{
    archive::{open_archive, read_flexible},
    package::count_position_units,
    persistence::{load_persistent, save_persistent},
};
use super::{ReaderService, lifecycle, model::*};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    sync::{Arc, Mutex},
};

pub(super) use metadata::{cover, scan_epub_metadata};
pub(super) use package::load_book;
pub(super) use resources::{binary_resource, prefetch, read_resource};
#[cfg(test)]
pub(super) use resources::{touch, trim_resource_cache};

pub(super) fn open(
    s: &ReaderService,
    id: &str,
    fallback: &str,
) -> Result<EpubOpenResult, ReaderError> {
    let path = s.resolve(id, "epub")?;
    let sig = file_signature(&path)?;
    let should_load = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        lifecycle::requires_reload(&books, id, sig)
    };
    if should_load {
        let (manifest, info, position_counts) =
            load_persistent(&s.config, id, sig).unwrap_or_else(|| load_book(&path, fallback))?;
        let archive = open_archive(&path)?;
        let loaded = EpubBookCache {
            signature: sig,
            last_used_at: now_millis(),
            active_sessions: HashSet::new(),
            info,
            manifest_items: manifest,
            resource_cache: HashMap::new(),
            resource_order: VecDeque::new(),
            resource_bytes: 0,
            archive: Arc::new(Mutex::new(archive)),
            position_counts,
        };
        save_persistent(&s.config, id, &loaded);
        let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        if lifecycle::requires_reload(&books, id, sig) {
            books.insert(id.into(), loaded);
        }
    }
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    let session = s.session_id("epub");
    let cache = books.get_mut(id).ok_or(ReaderError::Busy)?;
    lifecycle::start(cache, session.clone());
    let result = EpubOpenResult {
        session_id: session,
        cache_key: format!("{}-{}", sig.len, sig.modified_ns),
        book: cache.info.clone(),
        position_counts: cache.position_counts.clone(),
    };
    lifecycle::trim(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(result)
}

pub(super) fn position_counts(
    s: &ReaderService,
    id: &str,
    session: &str,
) -> Result<Vec<EpubPositionCount>, ReaderError> {
    validate_session(s, id, session)?;
    {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        if !book.position_counts.is_empty() {
            return Ok(book.position_counts.clone());
        }
    }
    let path = s.resolve(id, "epub")?;
    let (signature, reading_order) = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        (book.signature, book.info.reading_order.clone())
    };
    let mut archive = open_archive(&path)?;
    let counts = reading_order
        .into_iter()
        .map(|link| {
            let count = read_flexible(&mut archive, &link.href)
                .map(|(_, bytes)| count_position_units(&bytes))
                .unwrap_or(1);
            EpubPositionCount {
                href: link.href,
                count,
            }
        })
        .collect::<Vec<_>>();
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    let book = books.get_mut(id).ok_or(ReaderError::InvalidSession)?;
    if book.signature != signature || !book.active_sessions.contains(session) {
        return Err(ReaderError::InvalidSession);
    }
    book.position_counts = counts.clone();
    save_persistent(&s.config, id, book);
    Ok(counts)
}

pub(super) fn close(s: &ReaderService, id: &str, session: &str) -> Result<(), ReaderError> {
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    if let Some(v) = books.get_mut(id) {
        lifecycle::close(v, session)
    }
    lifecycle::trim(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(())
}

pub(super) fn validate_session(
    s: &ReaderService,
    id: &str,
    session: &str,
) -> Result<(), ReaderError> {
    let path = s.resolve(id, "epub")?;
    let sig = file_signature(&path)?;
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    lifecycle::validate(
        books.get_mut(id).ok_or(ReaderError::InvalidSession)?,
        sig,
        session,
    )
}
