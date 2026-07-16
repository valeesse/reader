fn push_chapter(v: &mut Vec<TxtChapterInfo>, line: &str, long: bool, start: usize) {
    if !long && is_heading(line.trim()) {
        v.push(TxtChapterInfo {
            id: format!("chapter-{}", v.len() + 1),
            title: line.trim().into(),
            start_index: start,
        })
    }
}

fn finalize_chapters(mut v: Vec<TxtChapterInfo>) -> Vec<TxtChapterInfo> {
    if v.is_empty() {
        return vec![TxtChapterInfo {
            id: "chapter-1".into(),
            title: "Beginning".into(),
            start_index: 0,
        }];
    }
    if v.first().is_some_and(|x| x.start_index > 50) {
        v.insert(
            0,
            TxtChapterInfo {
                id: "chapter-0".into(),
                title: "Prologue".into(),
                start_index: 0,
            },
        )
    }
    v
}

pub(super) fn read_range(
    c: &TxtBookCache,
    start: usize,
    end: usize,
) -> Result<String, ReaderError> {
    let a = c
        .checkpoints
        .partition_point(|(i, _)| *i <= start)
        .saturating_sub(1);
    let b = c
        .checkpoints
        .partition_point(|(i, _)| *i <= end)
        .min(c.checkpoints.len() - 1);
    let (base, byte) = c.checkpoints[a];
    let (_, bound) = c.checkpoints[b];
    let mut file = File::open(&c.data_path).map_err(io_error)?;
    file.seek(SeekFrom::Start(byte as u64)).map_err(io_error)?;
    let mut bytes = Vec::with_capacity(bound - byte);
    file.take((bound - byte) as u64)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    let text = std::str::from_utf8(&bytes).map_err(|e| ReaderError::Io(e.to_string()))?;
    let x = byte_for_char(text, start - base);
    let y = byte_for_char(text, end - base);
    Ok(text[x..y].into())
}

fn byte_for_char(s: &str, n: usize) -> usize {
    if n == 0 {
        0
    } else {
        s.char_indices().nth(n).map(|x| x.0).unwrap_or(s.len())
    }
}

pub(super) fn detect_bom(path: &Path) -> Result<Option<TxtBom>, ReaderError> {
    let mut f = File::open(path).map_err(io_error)?;
    let mut p = [0; 3];
    let n = f.read(&mut p).map_err(io_error)?;
    Ok(if n >= 3 && p == [0xEF, 0xBB, 0xBF] {
        Some(TxtBom::Utf8)
    } else if n >= 2 && p[..2] == [0xFF, 0xFE] {
        Some(TxtBom::Utf16Le)
    } else if n >= 2 && p[..2] == [0xFE, 0xFF] {
        Some(TxtBom::Utf16Be)
    } else {
        None
    })
}

fn create_utf8_cache(
    c: &ReaderConfig,
    id: &str,
    path: &Path,
    sig: FileSignature,
    skip: u64,
    enc: Option<&'static Encoding>,
) -> Result<PathBuf, ReaderError> {
    let target = cache::txt_data(c, id, sig)?;
    if target.exists() {
        return Ok(target);
    }
    let temp = cache::temporary_path(&target);
    let mut source = File::open(path).map_err(io_error)?;
    if skip > 0 {
        source.seek(SeekFrom::Start(skip)).map_err(io_error)?;
    }
    write_utf8_cache(source, &temp, enc)?;
    crate::replace_file(&temp, &target).map_err(io_error)?;
    Ok(target)
}

pub(super) fn write_utf8_cache(
    mut source: File,
    target: &Path,
    enc: Option<&'static Encoding>,
) -> Result<(), ReaderError> {
    let mut out =
        BufWriter::with_capacity(STREAM_BUFFER_BYTES, File::create(target).map_err(io_error)?);
    if let Some(enc) = enc {
        let mut decoder = DecodeReaderBytesBuilder::new()
            .encoding(Some(enc))
            .strip_bom(true)
            .build(source);
        std::io::copy(&mut decoder, &mut out).map_err(io_error)?;
    } else {
        std::io::copy(&mut source, &mut out).map_err(io_error)?;
    }
    out.flush().map_err(io_error)
}

fn is_heading(v: &str) -> bool {
    let len = v.chars().count();
    if v.is_empty() || len > 90 {
        return false;
    }
    let lower = v.to_ascii_lowercase();
    lower.starts_with("chapter ")
        || lower.starts_with("volume ")
        || lower.starts_with("vol.")
        || (v.starts_with('卷') && v.chars().take(8).any(number))
        || (v.starts_with('第')
            && v.chars()
                .take(24)
                .any(|c| matches!(c, '部' | '卷' | '集' | '篇' | '章' | '节' | '回')))
}

fn number(c: char) -> bool {
    c.is_ascii_digit() || "一二三四五六七八九十百千万零〇两".contains(c)
}
