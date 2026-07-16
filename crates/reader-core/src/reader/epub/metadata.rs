use super::{archive::*, package::first_text, path::*, *};
use crate::reader::cache;
use roxmltree::Document;
use std::path::Path;
use zip::ZipArchive;

pub(crate) fn cover(s: &ReaderService, id: &str) -> Result<CachedCover, ReaderError> {
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

pub(crate) fn scan_epub_metadata(
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

fn extract_cover(
    config: &ReaderConfig,
    resource_id: &str,
    a: &mut ZipArchive<std::fs::File>,
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
