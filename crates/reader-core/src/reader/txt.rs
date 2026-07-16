use super::{ReaderService, cache, lifecycle, model::*};
use encoding_rs::{Encoding, GBK, UTF_8, UTF_16BE, UTF_16LE};
use encoding_rs_io::DecodeReaderBytesBuilder;
use std::{
    collections::HashSet,
    fs::{self, File},
    io::{BufWriter, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};

pub(super) fn preview(s: &ReaderService, id: &str, max: usize) -> Result<TxtPreview, ReaderError> {
    let path = s.resolve(id, "txt")?;
    let file = File::open(path).map_err(io_error)?;
    let max = max.clamp(1, 24000);
    // Four bytes per requested Unicode scalar covers UTF-8's worst case and
    // also leaves enough input for UTF-16/GBK previews. Avoid decoding a fixed
    // 256 KiB when the UI only asks for the first 12K characters.
    let preview_bytes = max.saturating_mul(4).saturating_add(3);
    let mut bytes = Vec::with_capacity(preview_bytes);
    file.take(preview_bytes as u64)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    let (text, encoding) = if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        (UTF_8.decode(&bytes[3..]).0.into_owned(), "utf-8")
    } else if bytes.starts_with(&[0xFF, 0xFE]) {
        (UTF_16LE.decode(&bytes[2..]).0.into_owned(), "utf-16le")
    } else if bytes.starts_with(&[0xFE, 0xFF]) {
        (UTF_16BE.decode(&bytes[2..]).0.into_owned(), "utf-16be")
    } else if std::str::from_utf8(&bytes).is_ok() {
        (UTF_8.decode(&bytes).0.into_owned(), "utf-8")
    } else {
        (GBK.decode(&bytes).0.into_owned(), "gbk")
    };
    Ok(TxtPreview {
        text: text.chars().take(max).collect(),
        encoding: encoding.into(),
    })
}

pub(super) fn open(s: &ReaderService, id: &str) -> Result<TxtBookInfo, ReaderError> {
    let path = s.resolve(id, "txt")?;
    let sig = file_signature(&path)?;
    let should_load = {
        let books = s.txt_books.lock().map_err(|_| ReaderError::Busy)?;
        lifecycle::requires_reload(&books, id, sig)
    };
    if should_load {
        let loaded = load(s, id, &path, sig)?;
        let mut books = s.txt_books.lock().map_err(|_| ReaderError::Busy)?;
        if lifecycle::requires_reload(&books, id, sig) {
            books.insert(id.into(), loaded);
        }
    }
    let mut books = s.txt_books.lock().map_err(|_| ReaderError::Busy)?;
    let session = s.session_id("txt");
    let cache = books.get_mut(id).ok_or(ReaderError::Busy)?;
    lifecycle::start(cache, session.clone());
    let result = TxtBookInfo {
        session_id: session,
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        chapters: cache.chapters.clone(),
    };
    lifecycle::trim(&mut books, TXT_BOOK_CACHE_LIMIT);
    Ok(result)
}
pub(super) fn read_window(
    s: &ReaderService,
    id: &str,
    session: &str,
    start: usize,
    end: usize,
) -> Result<TxtTextWindow, ReaderError> {
    let path = s.resolve(id, "txt")?;
    let sig = file_signature(&path)?;
    let mut books = s.txt_books.lock().map_err(|_| ReaderError::Busy)?;
    let cache = books.get_mut(id).ok_or(ReaderError::InvalidSession)?;
    lifecycle::validate(cache, sig, session)?;
    let start = start.min(cache.total_chars);
    let end = end.max(start).min(cache.total_chars);
    Ok(TxtTextWindow {
        start,
        end,
        text: read_range(cache, start, end)?,
    })
}
pub(super) fn close(s: &ReaderService, id: &str, session: &str) -> Result<(), ReaderError> {
    let mut books = s.txt_books.lock().map_err(|_| ReaderError::Busy)?;
    if let Some(v) = books.get_mut(id) {
        lifecycle::close(v, session)
    }
    lifecycle::trim(&mut books, TXT_BOOK_CACHE_LIMIT);
    Ok(())
}

fn load(
    s: &ReaderService,
    id: &str,
    path: &Path,
    sig: FileSignature,
) -> Result<TxtBookCache, ReaderError> {
    if let Some(v) = load_persistent(&s.config, id, sig) {
        return Ok(TxtBookCache {
            signature: sig,
            last_used_at: now_millis(),
            active_sessions: HashSet::new(),
            data_path: PathBuf::from(v.data_path),
            total_chars: v.total_chars,
            total_bytes: v.total_bytes,
            checkpoints: v.checkpoints,
            chapters: v.chapters,
        });
    }
    let bom = detect_bom(path)?;
    let (data_path, total_chars, checkpoints, chapters) = if let Some(bom) = bom {
        let (skip, enc) = match bom {
            TxtBom::Utf8 => (3, None),
            TxtBom::Utf16Le => (2, Some(UTF_16LE)),
            TxtBom::Utf16Be => (2, Some(UTF_16BE)),
        };
        let data = create_utf8_cache(&s.config, id, path, sig, skip, enc)?;
        let (i, c, h) = build_index(&data)?;
        (data, i, c, h)
    } else {
        match build_index(path) {
            Ok((i, c, h)) => (path.to_path_buf(), i, c, h),
            Err(TxtIndexError::InvalidUtf8) => {
                let data = create_utf8_cache(&s.config, id, path, sig, 0, Some(GBK))?;
                let (i, c, h) = build_index(&data)?;
                (data, i, c, h)
            }
            Err(e) => return Err(e.into()),
        }
    };
    let value = TxtBookCache {
        signature: sig,
        last_used_at: now_millis(),
        active_sessions: HashSet::new(),
        data_path,
        total_chars,
        total_bytes: sig.len,
        checkpoints,
        chapters,
    };
    save_persistent(&s.config, id, &value);
    Ok(value)
}
fn load_persistent(
    c: &ReaderConfig,
    id: &str,
    sig: FileSignature,
) -> Option<PersistentTxtIndexCache> {
    let v = serde_json::from_slice::<PersistentTxtIndexCache>(
        &fs::read(cache::txt_index(c, id).ok()?).ok()?,
    )
    .ok()?;
    if v.version != PERSISTENT_CACHE_VERSION
        || v.resource_id != id
        || v.signature != sig
        || v.checkpoints.first() != Some(&(0, 0))
        || fs::metadata(&v.data_path).ok()?.len() != v.data_bytes
    {
        return None;
    }
    Some(v)
}
fn save_persistent(c: &ReaderConfig, id: &str, v: &TxtBookCache) {
    let p = PersistentTxtIndexCache {
        version: PERSISTENT_CACHE_VERSION,
        resource_id: id.into(),
        signature: v.signature,
        data_path: v.data_path.to_string_lossy().into(),
        data_bytes: fs::metadata(&v.data_path).map(|m| m.len()).unwrap_or(0),
        total_chars: v.total_chars,
        total_bytes: v.total_bytes,
        checkpoints: v.checkpoints.clone(),
        chapters: v.chapters.clone(),
    };
    if let (Ok(path), Ok(bytes)) = (cache::txt_index(c, id), serde_json::to_vec(&p)) {
        let _ = cache::write_atomic(&path, &bytes);
    }
}

#[derive(Debug)]
pub(super) enum TxtIndexError {
    InvalidUtf8,
    Io(String),
}
impl From<TxtIndexError> for ReaderError {
    fn from(v: TxtIndexError) -> Self {
        match v {
            TxtIndexError::InvalidUtf8 => ReaderError::Io("TXT is not valid UTF-8".into()),
            TxtIndexError::Io(e) => ReaderError::Io(e),
        }
    }
}
#[derive(Clone, Copy)]
pub(super) enum TxtBom {
    Utf8,
    Utf16Le,
    Utf16Be,
}
pub(super) fn build_index(path: &Path) -> Result<TxtIndex, TxtIndexError> {
    let mut file = File::open(path).map_err(|e| TxtIndexError::Io(e.to_string()))?;
    let mut buffer = vec![0; STREAM_BUFFER_BYTES];
    let mut pending = Vec::with_capacity(4);
    let (mut total, mut chars, mut line_start, mut line_chars) = (0usize, 0usize, 0usize, 0usize);
    let mut too_long = false;
    let mut title = String::with_capacity(128);
    let mut points = vec![(0, 0)];
    let mut chapters = Vec::new();
    loop {
        let n = file
            .read(&mut buffer)
            .map_err(|e| TxtIndexError::Io(e.to_string()))?;
        if n == 0 {
            if !pending.is_empty() {
                return Err(TxtIndexError::InvalidUtf8);
            }
            break;
        }
        let chunk_start = total.saturating_sub(pending.len());
        total += n;
        let mut combined = Vec::with_capacity(pending.len() + n);
        combined.extend_from_slice(&pending);
        combined.extend_from_slice(&buffer[..n]);
        let valid = match std::str::from_utf8(&combined) {
            Ok(_) => combined.len(),
            Err(e) if e.error_len().is_none() => e.valid_up_to(),
            Err(_) => return Err(TxtIndexError::InvalidUtf8),
        };
        let text =
            std::str::from_utf8(&combined[..valid]).map_err(|_| TxtIndexError::InvalidUtf8)?;
        for (byte, ch) in text.char_indices() {
            if chars > 0 && chars.is_multiple_of(TXT_CHAR_CHECKPOINT_INTERVAL) {
                points.push((chars, chunk_start + byte))
            }
            if ch == '\n' {
                push_chapter(&mut chapters, &title, too_long, line_start);
                title.clear();
                line_chars = 0;
                too_long = false;
                line_start = chars + 1
            } else {
                line_chars += 1;
                if line_chars <= 90 {
                    title.push(ch)
                } else {
                    too_long = true
                }
            }
            chars += 1
        }
        pending.clear();
        pending.extend_from_slice(&combined[valid..]);
    }
    if line_chars > 0 {
        push_chapter(&mut chapters, &title, too_long, line_start)
    }
    points.push((chars, total));
    Ok((chars, points, finalize_chapters(chapters)))
}

include!("txt/support.rs");
