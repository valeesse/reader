use super::{path::*, *};
use roxmltree::Document;
use std::{fs::File, io::Read, path::Path};
use zip::ZipArchive;

pub(super) fn open_archive(path: &Path) -> Result<ZipArchive<File>, ReaderError> {
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

pub(super) fn read_opf(a: &mut ZipArchive<File>) -> Result<(String, String, String), ReaderError> {
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

pub(super) fn read_text(a: &mut ZipArchive<File>, path: &str) -> Result<String, ReaderError> {
    String::from_utf8(read_flexible(a, path)?.1)
        .map_err(|e| ReaderError::InvalidEpub(e.to_string()))
}

pub(super) fn read_flexible(
    a: &mut ZipArchive<File>,
    path: &str,
) -> Result<(String, Vec<u8>), ReaderError> {
    for p in [
        path.into(),
        percent_encoding::percent_decode_str(path)
            .decode_utf8_lossy()
            .into_owned(),
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
