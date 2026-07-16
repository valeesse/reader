use super::{archive::*, path::*, validate_session, *};
use crate::reader::cache;
use encoding_rs::UTF_8;
use std::{collections::HashSet, fs, sync::Arc};

pub(crate) fn read_resource(
    s: &ReaderService,
    id: &str,
    session: &str,
    href: &str,
) -> Result<EpubResourcePayload, ReaderError> {
    validate_session(s, id, session)?;
    let href = strip_fragment(&normalize(href));
    let item = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        book.manifest_items
            .iter()
            .find(|item| strip_fragment(&item.absolute_href) == href)
            .cloned()
    };
    let media_type = item
        .as_ref()
        .map(|item| item.media_type.clone())
        .unwrap_or_else(|| mime(&href));
    if is_text(&media_type) {
        let resource = read_cached(s, id, &href)?;
        let text = UTF_8.decode(resource.bytes.as_ref()).0.into_owned();
        Ok(EpubResourcePayload {
            href,
            media_type: resource.media_type,
            text: Some(text),
            file_path: None,
        })
    } else {
        let binary = ensure_binary(s, id, &href)?;
        Ok(EpubResourcePayload {
            href,
            media_type: binary.media_type,
            text: None,
            file_path: Some(binary.path.to_string_lossy().into_owned()),
        })
    }
}

pub(crate) fn binary_resource(
    s: &ReaderService,
    id: &str,
    session: &str,
    href: &str,
) -> Result<CachedBinaryResource, ReaderError> {
    validate_session(s, id, session)?;
    ensure_binary(s, id, &strip_fragment(&normalize(href)))
}

pub(crate) fn prefetch(
    s: &ReaderService,
    id: &str,
    session: &str,
    hrefs: Vec<String>,
) -> Result<(), ReaderError> {
    validate_session(s, id, session)?;
    let path = s.resolve(id, "epub")?;
    let (sig, manifest) = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        (book.signature, book.manifest_items.clone())
    };
    let mut archive = open_archive(&path)?;
    let mut seen = HashSet::new();
    let targets = hrefs
        .into_iter()
        .map(|v| strip_fragment(&normalize(&v)))
        .filter(|v| !v.is_empty() && seen.insert(v.clone()))
        .take(EPUB_PREFETCH_MAX_RESOURCES)
        .collect::<Vec<_>>();
    for href in targets {
        let item = manifest
            .iter()
            .find(|x| strip_fragment(&x.absolute_href) == href)
            .cloned();
        if let Some(item) = item {
            if is_text(&item.media_type) {
                let bytes = read_flexible(&mut archive, &item.absolute_href)?.1;
                let resource = EpubCachedResource {
                    bytes: Arc::from(bytes),
                    media_type: item.media_type,
                };
                let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
                if let Some(book) = books.get_mut(id)
                    && book.signature == sig
                {
                    cache_resource(book, href, resource);
                }
            } else {
                let path = cache::epub_resource(&s.config, id, sig, &href, &item.media_type)?;
                if !path.exists() {
                    let bytes = read_flexible(&mut archive, &item.absolute_href)?.1;
                    let tmp = cache::temporary_path(&path);
                    fs::write(&tmp, bytes).map_err(io_error)?;
                    crate::replace_file(&tmp, &path).map_err(io_error)?;
                }
            }
        }
    }
    Ok(())
}

fn read_cached(s: &ReaderService, id: &str, href: &str) -> Result<EpubCachedResource, ReaderError> {
    {
        let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get_mut(id).ok_or(ReaderError::InvalidSession)?;
        if let Some(v) = book.resource_cache.get(href).cloned() {
            touch(book, href);
            return Ok(v);
        }
    }
    let (item, archive) = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        (
            book.manifest_items
                .iter()
                .find(|x| strip_fragment(&x.absolute_href) == href)
                .cloned(),
            book.archive.clone(),
        )
    };
    let (path, media) = item
        .map(|x| (x.absolute_href, x.media_type))
        .unwrap_or_else(|| (href.into(), mime(href)));
    let bytes = {
        let mut archive = archive.lock().map_err(|_| ReaderError::Busy)?;
        read_flexible(&mut archive, &path)?.1
    };
    let resource = EpubCachedResource {
        bytes: Arc::from(bytes),
        media_type: media,
    };
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    let book = books.get_mut(id).ok_or(ReaderError::InvalidSession)?;
    cache_resource(book, href.into(), resource.clone());
    Ok(resource)
}

fn ensure_binary(
    s: &ReaderService,
    id: &str,
    href: &str,
) -> Result<CachedBinaryResource, ReaderError> {
    let (signature, absolute_href, media_type, archive) = {
        let books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
        let book = books.get(id).ok_or(ReaderError::InvalidSession)?;
        let item = book
            .manifest_items
            .iter()
            .find(|item| strip_fragment(&item.absolute_href) == href)
            .cloned();
        let (absolute_href, media_type) = item
            .map(|item| (item.absolute_href, item.media_type))
            .unwrap_or_else(|| (href.into(), mime(href)));
        if is_text(&media_type) {
            return Err(ReaderError::WrongType);
        }
        (
            book.signature,
            absolute_href,
            media_type,
            book.archive.clone(),
        )
    };
    // Some EPUBs reference fonts or images from CSS without listing them in the OPF manifest.
    let path = cache::epub_resource(&s.config, id, signature, href, &media_type)?;
    if !path.exists() {
        let bytes = {
            let mut archive = archive.lock().map_err(|_| ReaderError::Busy)?;
            read_flexible(&mut archive, &absolute_href)?.1
        };
        let temporary = cache::temporary_path(&path);
        fs::write(&temporary, bytes).map_err(io_error)?;
        crate::replace_file(&temporary, &path).map_err(io_error)?;
    }
    Ok(CachedBinaryResource {
        path: cache::validated_cache_file(&s.config, &path)?,
        media_type,
    })
}

pub(crate) fn touch(b: &mut EpubBookCache, href: &str) {
    if let Some(i) = b.resource_order.iter().position(|v| v == href) {
        b.resource_order.remove(i);
    }
    b.resource_order.push_back(href.into())
}

fn cache_resource(b: &mut EpubBookCache, href: String, v: EpubCachedResource) {
    let n = v.bytes.len();
    if n > epub_resource_cache_max_bytes() {
        return;
    }
    if let Some(old) = b.resource_cache.remove(&href) {
        b.resource_bytes = b.resource_bytes.saturating_sub(old.bytes.len())
    }
    if let Some(i) = b.resource_order.iter().position(|x| x == &href) {
        b.resource_order.remove(i);
    }
    b.resource_bytes += n;
    b.resource_cache.insert(href.clone(), v);
    b.resource_order.push_back(href);
    trim_resource_cache(
        b,
        EPUB_RESOURCE_CACHE_LIMIT,
        epub_resource_cache_max_bytes(),
    )
}

pub(crate) fn trim_resource_cache(b: &mut EpubBookCache, count: usize, bytes: usize) {
    while b.resource_cache.len() > count || b.resource_bytes > bytes {
        let Some(k) = b.resource_order.pop_front() else {
            break;
        };
        if let Some(v) = b.resource_cache.remove(&k) {
            b.resource_bytes = b.resource_bytes.saturating_sub(v.bytes.len())
        }
    }
}
