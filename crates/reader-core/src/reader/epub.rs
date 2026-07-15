use super::{ReaderService, cache, lifecycle, model::*};
use encoding_rs::UTF_8;
use percent_encoding::percent_decode_str;
use roxmltree::Document;
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::Read,
    path::Path,
    sync::{Arc, Mutex},
};
use zip::ZipArchive;

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
        let (manifest, info) =
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
    };
    lifecycle::trim(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(result)
}

pub(super) fn read_resource(
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

pub(super) fn binary_resource(
    s: &ReaderService,
    id: &str,
    session: &str,
    href: &str,
) -> Result<CachedBinaryResource, ReaderError> {
    validate_session(s, id, session)?;
    ensure_binary(s, id, &strip_fragment(&normalize(href)))
}

pub(super) fn cover(s: &ReaderService, id: &str) -> Result<CachedCover, ReaderError> {
    s.resolve(id, "epub")?;
    let metadata = match cache::load_scan_metadata(&s.config, id) {
        Some(metadata) if metadata.cover.is_some() => metadata,
        _ => rebuild_scan_epub_metadata(s, id, "Unknown Title")?,
    };
    let path = metadata
        .cover
        .ok_or_else(|| ReaderError::Io("cover is unavailable".into()))?;
    let path = cache::validated_cache_file(&s.config, Path::new(&path))?;
    let media_type = mime_guess::from_path(&path)
        .first_or_octet_stream()
        .to_string();
    Ok(CachedCover { path, media_type })
}

pub(super) fn prefetch(
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
pub(super) fn close(s: &ReaderService, id: &str, session: &str) -> Result<(), ReaderError> {
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    if let Some(v) = books.get_mut(id) {
        lifecycle::close(v, session)
    }
    lifecycle::trim(&mut books, EPUB_BOOK_CACHE_LIMIT);
    Ok(())
}

pub(super) fn scan_epub_metadata(
    s: &ReaderService,
    id: &str,
    fallback: &str,
) -> Result<ScanEpubMetadata, ReaderError> {
    if let Some(v) = cache::load_scan_metadata(&s.config, id) {
        return Ok(v);
    }
    rebuild_scan_epub_metadata(s, id, fallback)
}

fn rebuild_scan_epub_metadata(
    s: &ReaderService,
    id: &str,
    fallback: &str,
) -> Result<ScanEpubMetadata, ReaderError> {
    let path = s.resolve(id, "epub")?;
    let mut archive = open_archive(&path)?;
    let (_, opf_text, opf) = read_opf(&mut archive)?;
    let doc = Document::parse(&opf_text).map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    let title = first_text(&doc, "title").unwrap_or_else(|| fallback.into());
    let author = first_text(&doc, "creator");
    let series_name = meta_content(&doc, "calibre:series").or_else(|| {
        doc.descendants()
            .find(|n| {
                n.tag_name().name() == "meta"
                    && n.attribute("property") == Some("belongs-to-collection")
            })
            .and_then(|n| n.text())
            .map(|v| v.trim().into())
    });
    let series_index = meta_content(&doc, "calibre:series_index").and_then(|v| v.parse().ok());
    let cover = extract_cover(&s.config, id, &mut archive, &doc, &opf).ok();
    let value = ScanEpubMetadata {
        title,
        author,
        cover,
        series_name,
        series_index,
    };
    cache::save_scan_metadata(&s.config, id, &value);
    Ok(value)
}

fn validate_session(s: &ReaderService, id: &str, session: &str) -> Result<(), ReaderError> {
    let path = s.resolve(id, "epub")?;
    let sig = file_signature(&path)?;
    let mut books = s.epub_books.lock().map_err(|_| ReaderError::Busy)?;
    lifecycle::validate(
        books.get_mut(id).ok_or(ReaderError::InvalidSession)?,
        sig,
        session,
    )
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
    // Some real-world EPUBs reference fonts or images from CSS without listing
    // them in the OPF manifest. The archive path is still normalized and read
    // through the same bounded ZIP reader, so supporting those resources fixes
    // rendering without weakening path or decompression limits.
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
pub(super) fn touch(b: &mut EpubBookCache, href: &str) {
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
pub(super) fn trim_resource_cache(b: &mut EpubBookCache, count: usize, bytes: usize) {
    while b.resource_cache.len() > count || b.resource_bytes > bytes {
        let Some(k) = b.resource_order.pop_front() else {
            break;
        };
        if let Some(v) = b.resource_cache.remove(&k) {
            b.resource_bytes = b.resource_bytes.saturating_sub(v.bytes.len())
        }
    }
}

fn load_persistent(
    c: &ReaderConfig,
    id: &str,
    sig: FileSignature,
) -> Option<Result<(Vec<EpubManifestItem>, EpubBookInfo), ReaderError>> {
    let v = serde_json::from_slice::<PersistentEpubBookCache>(
        &fs::read(cache::epub_metadata(c, id).ok()?).ok()?,
    )
    .ok()?;
    if v.version != PERSISTENT_CACHE_VERSION || v.resource_id != id || v.signature != sig {
        return None;
    }
    Some(Ok((v.manifest_items, v.info)))
}
fn save_persistent(c: &ReaderConfig, id: &str, v: &EpubBookCache) {
    let p = PersistentEpubBookCache {
        version: PERSISTENT_CACHE_VERSION,
        resource_id: id.into(),
        signature: v.signature,
        info: v.info.clone(),
        manifest_items: v.manifest_items.clone(),
    };
    if let (Ok(path), Ok(bytes)) = (cache::epub_metadata(c, id), serde_json::to_vec(&p)) {
        let _ = cache::write_atomic(&path, &bytes);
    }
}

pub(super) fn load_book(
    path: &Path,
    fallback: &str,
) -> Result<(Vec<EpubManifestItem>, EpubBookInfo), ReaderError> {
    let mut archive = open_archive(path)?;
    let (opf_dir, opf_text, _) = read_opf(&mut archive)?;
    let doc = Document::parse(&opf_text).map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    let manifest = manifest_items(&doc, &opf_dir);
    let by_id: HashMap<_, _> = manifest.iter().map(|x| (x.id.as_str(), x)).collect();
    let spine = doc
        .descendants()
        .filter(|n| n.tag_name().name() == "itemref")
        .filter_map(|n| n.attribute("idref").and_then(|id| by_id.get(id)).copied())
        .cloned()
        .collect::<Vec<_>>();
    let reading_order = spine
        .iter()
        .enumerate()
        .map(|(i, x)| {
            link(
                x,
                Some(if x.id.is_empty() {
                    format!("Chapter {}", i + 1)
                } else {
                    x.id.clone()
                }),
                vec![],
            )
        })
        .collect::<Vec<_>>();
    let reading: HashSet<_> = reading_order.iter().map(|x| x.href.clone()).collect();
    let resources = manifest
        .iter()
        .filter(|x| !reading.contains(&x.absolute_href))
        .map(|x| {
            link(
                x,
                Some(x.id.clone()),
                if x.properties.iter().any(|v| v == "cover-image") {
                    vec!["cover".into()]
                } else {
                    vec![]
                },
            )
        })
        .collect();
    let toc = toc_links(&mut archive, &manifest, &opf_dir)?;
    let metadata = EpubMetadataInfo {
        title: first_text(&doc, "title").unwrap_or_else(|| fallback.into()),
        author: first_text(&doc, "creator"),
        language: first_text(&doc, "language").unwrap_or_else(|| "zh".into()),
        layout: if doc.descendants().any(|n| {
            n.tag_name().name() == "meta"
                && n.attribute("property") == Some("rendition:layout")
                && n.text().is_some_and(|v| v.trim() == "pre-paginated")
        }) {
            "fixed".into()
        } else {
            "reflowable".into()
        },
        reading_progression: if doc.descendants().any(|n| {
            n.tag_name().name() == "spine"
                && n.attribute("page-progression-direction") == Some("rtl")
        }) {
            "rtl".into()
        } else {
            "ltr".into()
        },
    };
    Ok((
        manifest,
        EpubBookInfo {
            metadata,
            reading_order,
            resources,
            toc,
        },
    ))
}
fn open_archive(path: &Path) -> Result<ZipArchive<File>, ReaderError> {
    let mut archive = ZipArchive::new(File::open(path).map_err(io_error)?)
        .map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    if archive.len() > 100_000 {
        return Err(ReaderError::InvalidEpub("too many ZIP entries".into()));
    }
    validate_archive_budget(&mut archive)?;
    Ok(archive)
}
fn validate_archive_budget(a: &mut ZipArchive<File>) -> Result<(), ReaderError> {
    let mut total = 0u64;
    for i in 0..a.len() {
        let f = a
            .by_index(i)
            .map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
        if f.size() > EPUB_RESOURCE_MAX_BYTES {
            return Err(ReaderError::InvalidEpub(
                "ZIP entry exceeds size budget".into(),
            ));
        }
        total = total.saturating_add(f.size());
        if total > EPUB_ARCHIVE_MAX_UNCOMPRESSED_BYTES {
            return Err(ReaderError::InvalidEpub(
                "EPUB exceeds decompression budget".into(),
            ));
        }
    }
    Ok(())
}
fn read_opf(a: &mut ZipArchive<File>) -> Result<(String, String, String), ReaderError> {
    let container = read_text(a, "META-INF/container.xml")?;
    let c = Document::parse(&container).map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    let opf = normalize(
        c.descendants()
            .find(|n| n.tag_name().name() == "rootfile")
            .and_then(|n| n.attribute("full-path"))
            .ok_or_else(|| ReaderError::InvalidEpub("missing OPF path".into()))?,
    );
    let text = read_text(a, &opf)?;
    Ok((dirname(&opf), text, opf))
}
fn manifest_items(d: &Document, base: &str) -> Vec<EpubManifestItem> {
    d.descendants()
        .filter(|n| n.tag_name().name() == "item")
        .map(|n| {
            let href = n.attribute("href").unwrap_or_default();
            EpubManifestItem {
                id: n.attribute("id").unwrap_or(href).into(),
                absolute_href: resolve(base, href),
                media_type: n
                    .attribute("media-type")
                    .map(str::to_string)
                    .unwrap_or_else(|| mime(href)),
                properties: n
                    .attribute("properties")
                    .unwrap_or_default()
                    .split_whitespace()
                    .map(str::to_string)
                    .collect(),
            }
        })
        .collect()
}
fn link(x: &EpubManifestItem, title: Option<String>, rels: Vec<String>) -> EpubLinkInfo {
    EpubLinkInfo {
        href: x.absolute_href.clone(),
        media_type: x.media_type.clone(),
        title,
        rels,
        properties: x.properties.clone(),
    }
}
fn toc_links(
    a: &mut ZipArchive<File>,
    m: &[EpubManifestItem],
    base: &str,
) -> Result<Vec<EpubLinkInfo>, ReaderError> {
    if let Some(nav) = m.iter().find(|x| x.properties.iter().any(|v| v == "nav"))
        && let Ok(text) = read_text(a, &nav.absolute_href)
        && let Ok(doc) = Document::parse(&text)
        && let Some(node) = doc.descendants().find(|n| {
            n.tag_name().name() == "nav"
                && (n.attribute("type") == Some("toc")
                    || n.attribute(("http://www.idpf.org/2007/ops", "type")) == Some("toc"))
        })
    {
        return Ok(node
            .descendants()
            .filter(|n| n.tag_name().name() == "a")
            .filter_map(|n| {
                let href = n.attribute("href")?;
                Some(EpubLinkInfo {
                    href: resolve(&dirname(&nav.absolute_href), href),
                    media_type: mime(href),
                    title: n.text().map(|v| v.trim().into()),
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }
    if let Some(ncx) = m
        .iter()
        .find(|x| x.media_type == "application/x-dtbncx+xml")
        && let Ok(text) = read_text(a, &ncx.absolute_href)
        && let Ok(doc) = Document::parse(&text)
    {
        return Ok(doc
            .descendants()
            .filter(|n| n.tag_name().name() == "navPoint")
            .filter_map(|p| {
                let href = p
                    .descendants()
                    .find(|n| n.tag_name().name() == "content")?
                    .attribute("src")?;
                Some(EpubLinkInfo {
                    href: resolve(base, href),
                    media_type: mime(href),
                    title: p
                        .descendants()
                        .find(|n| n.tag_name().name() == "text")
                        .and_then(|n| n.text())
                        .map(|v| v.trim().into()),
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }
    Ok(vec![])
}
fn extract_cover(
    config: &ReaderConfig,
    resource_id: &str,
    a: &mut ZipArchive<File>,
    d: &Document,
    opf: &str,
) -> Result<String, ReaderError> {
    let id = d
        .descendants()
        .find(|n| {
            n.tag_name().name() == "meta"
                && n.attribute("name")
                    .is_some_and(|v| v.eq_ignore_ascii_case("cover"))
        })
        .and_then(|n| n.attribute("content"));
    let item = d
        .descendants()
        .find(|n| {
            n.tag_name().name() == "item"
                && (id.is_some_and(|id| n.attribute("id") == Some(id))
                    || n.attribute("properties")
                        .is_some_and(|v| v.split_whitespace().any(|p| p == "cover-image")))
        })
        .ok_or_else(|| ReaderError::InvalidEpub("missing cover".into()))?;
    let href = item
        .attribute("href")
        .ok_or_else(|| ReaderError::InvalidEpub("missing cover href".into()))?;
    let path = resolve(&dirname(opf), href);
    let bytes = read_flexible(a, &path)?.1;
    let media = item
        .attribute("media-type")
        .map(str::to_string)
        .unwrap_or_else(|| mime(&path));
    let target = cache::cover(config, resource_id, &media);
    if !target.exists() {
        cache::write_atomic(&target, &bytes)?;
    }
    Ok(cache::validated_cache_file(config, &target)?
        .to_string_lossy()
        .into_owned())
}
fn meta_content(d: &Document, name: &str) -> Option<String> {
    d.descendants()
        .find(|n| {
            n.tag_name().name() == "meta"
                && n.attribute("name")
                    .is_some_and(|v| v.eq_ignore_ascii_case(name))
        })
        .and_then(|n| n.attribute("content"))
        .map(|v| v.trim().into())
}
fn first_text(d: &Document, tag: &str) -> Option<String> {
    d.descendants()
        .find(|n| n.tag_name().name() == tag)
        .and_then(|n| n.text())
        .map(|v| v.trim().into())
        .filter(|v: &String| !v.is_empty())
}
fn read_text(a: &mut ZipArchive<File>, path: &str) -> Result<String, ReaderError> {
    String::from_utf8(read_flexible(a, path)?.1)
        .map_err(|e| ReaderError::InvalidEpub(e.to_string()))
}
fn read_flexible(a: &mut ZipArchive<File>, path: &str) -> Result<(String, Vec<u8>), ReaderError> {
    for p in [
        path.into(),
        percent_decode_str(path).decode_utf8_lossy().into_owned(),
        normalize(path),
    ] {
        if let Ok(v) = read_exact(a, &p) {
            return Ok((p, v));
        }
    }
    let wanted = normalize(path).to_ascii_lowercase();
    let basename = Path::new(&wanted)
        .file_name()
        .and_then(|v| v.to_str())
        .map(str::to_string);
    let mut matched = None;
    let mut ambiguous = false;
    for i in 0..a.len() {
        let candidate = normalize(
            a.by_index(i)
                .map_err(|e| ReaderError::InvalidEpub(e.to_string()))?
                .name(),
        );
        let lower = candidate.to_ascii_lowercase();
        if lower == wanted || lower.ends_with(&format!("/{wanted}")) {
            matched = Some(candidate);
            ambiguous = false;
            break;
        }
        if basename.as_deref() == Path::new(&lower).file_name().and_then(|v| v.to_str()) {
            if matched.is_some() {
                ambiguous = true
            } else {
                matched = Some(candidate)
            }
        }
    }
    if ambiguous {
        matched = None
    }
    let p = matched.ok_or_else(|| ReaderError::InvalidEpub(format!("missing resource: {path}")))?;
    Ok((p.clone(), read_exact(a, &p)?))
}
fn read_exact(a: &mut ZipArchive<File>, path: &str) -> Result<Vec<u8>, ReaderError> {
    let f = a
        .by_name(path)
        .map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    if f.size() > EPUB_RESOURCE_MAX_BYTES {
        return Err(ReaderError::InvalidEpub(
            "ZIP entry exceeds size budget".into(),
        ));
    }
    let mut out = Vec::with_capacity(f.size() as usize);
    f.take(EPUB_RESOURCE_MAX_BYTES + 1)
        .read_to_end(&mut out)
        .map_err(io_error)?;
    if out.len() as u64 > EPUB_RESOURCE_MAX_BYTES {
        return Err(ReaderError::InvalidEpub(
            "ZIP entry exceeds decompression budget".into(),
        ));
    }
    Ok(out)
}
fn normalize(v: &str) -> String {
    v.replace('\\', "/")
        .split('/')
        .fold(Vec::new(), |mut p, v| {
            if v == ".." {
                p.pop();
            } else if !v.is_empty() && v != "." {
                p.push(v)
            }
            p
        })
        .join("/")
}
fn strip_fragment(v: &str) -> String {
    v.split(['#', '?']).next().unwrap_or(v).into()
}
fn dirname(v: &str) -> String {
    let v = normalize(v);
    v.rfind('/').map(|i| v[..i].into()).unwrap_or_default()
}
fn resolve(base: &str, href: &str) -> String {
    if href.starts_with('#')
        || href.contains("://")
        || href.starts_with("data:")
        || href.starts_with("blob:")
    {
        href.into()
    } else {
        let href = percent_decode_str(href).decode_utf8_lossy();
        normalize(&if base.is_empty() {
            href.into_owned()
        } else {
            format!("{base}/{href}")
        })
    }
}
fn mime(v: &str) -> String {
    match strip_fragment(v)
        .rsplit('.')
        .next()
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "xhtml" | "xml" => "application/xhtml+xml",
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "otf" => "font/otf",
        "ttf" => "font/ttf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ncx" => "application/x-dtbncx+xml",
        "js" => "application/javascript",
        "json" => "application/json",
        _ => "application/octet-stream",
    }
    .into()
}
fn is_text(v: &str) -> bool {
    v.starts_with("text/")
        || matches!(
            v,
            "application/xhtml+xml"
                | "application/xml"
                | "application/x-dtbncx+xml"
                | "application/javascript"
                | "application/json"
                | "image/svg+xml"
        )
}
