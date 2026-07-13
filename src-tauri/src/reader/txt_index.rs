fn build_txt_index(path: &Path) -> Result<TxtIndex, TxtIndexError> {
    let mut file = File::open(path)
        .map_err(|error| TxtIndexError::Io(format!("打开 TXT 索引源失败: {error}")))?;
    let mut buffer = vec![0u8; STREAM_BUFFER_BYTES];
    let mut pending = Vec::<u8>::with_capacity(4);
    let mut total_read = 0usize;
    let mut char_index = 0usize;
    let mut line_start = 0usize;
    let mut line_chars = 0usize;
    let mut line_too_long = false;
    let mut line_title = String::with_capacity(128);
    let mut checkpoints = vec![(0, 0)];
    let mut chapters = Vec::new();

    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|error| TxtIndexError::Io(format!("读取 TXT 索引源失败: {error}")))?;
        if read == 0 {
            if !pending.is_empty() {
                return Err(TxtIndexError::InvalidUtf8);
            }
            break;
        }

        let chunk_start = total_read.saturating_sub(pending.len());
        total_read += read;
        let mut combined = Vec::with_capacity(pending.len() + read);
        combined.extend_from_slice(&pending);
        combined.extend_from_slice(&buffer[..read]);
        let valid_len = match std::str::from_utf8(&combined) {
            Ok(_) => combined.len(),
            Err(error) if error.error_len().is_none() => error.valid_up_to(),
            Err(_) => return Err(TxtIndexError::InvalidUtf8),
        };
        let text =
            std::str::from_utf8(&combined[..valid_len]).map_err(|_| TxtIndexError::InvalidUtf8)?;

        for (local_byte, ch) in text.char_indices() {
            if char_index > 0 && char_index.is_multiple_of(TXT_CHAR_CHECKPOINT_INTERVAL) {
                checkpoints.push((char_index, chunk_start + local_byte));
            }
            if ch == '\n' {
                push_txt_chapter(&mut chapters, &line_title, line_too_long, line_start);
                line_title.clear();
                line_chars = 0;
                line_too_long = false;
                line_start = char_index + 1;
            } else {
                line_chars += 1;
                if line_chars <= 90 {
                    line_title.push(ch);
                } else {
                    line_too_long = true;
                }
            }
            char_index += 1;
        }
        pending.clear();
        pending.extend_from_slice(&combined[valid_len..]);
    }

    if line_chars > 0 {
        push_txt_chapter(&mut chapters, &line_title, line_too_long, line_start);
    }
    checkpoints.push((char_index, total_read));
    Ok((char_index, checkpoints, finalize_txt_chapters(chapters)))
}

fn push_txt_chapter(
    chapters: &mut Vec<TxtChapterInfo>,
    line: &str,
    too_long: bool,
    start_index: usize,
) {
    if too_long {
        return;
    }
    let title = line.trim();
    if is_txt_chapter_heading(title) {
        chapters.push(TxtChapterInfo {
            id: format!("chapter-{}", chapters.len() + 1),
            title: title.to_string(),
            start_index,
        });
    }
}

fn finalize_txt_chapters(mut chapters: Vec<TxtChapterInfo>) -> Vec<TxtChapterInfo> {
    if chapters.is_empty() {
        return vec![TxtChapterInfo {
            id: "chapter-1".to_string(),
            title: "Beginning".to_string(),
            start_index: 0,
        }];
    }

    if chapters
        .first()
        .map(|chapter| chapter.start_index > 50)
        .unwrap_or(false)
    {
        chapters.insert(
            0,
            TxtChapterInfo {
                id: "chapter-0".to_string(),
                title: "Prologue".to_string(),
                start_index: 0,
            },
        );
    }

    chapters
}

fn read_txt_char_range(cache: &TxtBookCache, start: usize, end: usize) -> Result<String, String> {
    let start_checkpoint = cache
        .checkpoints
        .partition_point(|(char_index, _)| *char_index <= start)
        .saturating_sub(1);
    let end_checkpoint = cache
        .checkpoints
        .partition_point(|(char_index, _)| *char_index <= end)
        .min(cache.checkpoints.len().saturating_sub(1));
    let (base_char, base_byte) = cache.checkpoints[start_checkpoint];
    let (_, bound_byte) = cache.checkpoints[end_checkpoint];
    let mut file =
        File::open(&cache.data_path).map_err(|error| format!("打开 TXT 数据缓存失败: {error}"))?;
    file.seek(SeekFrom::Start(base_byte as u64))
        .map_err(|error| format!("定位 TXT 窗口失败: {error}"))?;
    let mut bytes = Vec::with_capacity(bound_byte.saturating_sub(base_byte));
    file.take(bound_byte.saturating_sub(base_byte) as u64)
        .read_to_end(&mut bytes)
        .map_err(|error| format!("读取 TXT 窗口失败: {error}"))?;
    let text = std::str::from_utf8(&bytes).map_err(|error| format!("TXT 数据缓存损坏: {error}"))?;
    let start_byte = byte_offset_for_char(text, start.saturating_sub(base_char));
    let end_byte = byte_offset_for_char(text, end.saturating_sub(base_char));
    Ok(text[start_byte..end_byte].to_string())
}

fn byte_offset_for_char(text: &str, target: usize) -> usize {
    if target == 0 {
        return 0;
    }
    text.char_indices()
        .nth(target)
        .map(|(byte, _)| byte)
        .unwrap_or(text.len())
}

fn detect_txt_bom(path: &str) -> Result<Option<TxtBom>, String> {
    let mut file = File::open(path).map_err(|error| format!("打开 TXT 失败: {error}"))?;
    let mut prefix = [0u8; 3];
    let read = file
        .read(&mut prefix)
        .map_err(|error| format!("读取 TXT 编码标记失败: {error}"))?;
    if read >= 3 && prefix == [0xEF, 0xBB, 0xBF] {
        return Ok(Some(TxtBom::Utf8));
    }
    if read >= 2 && prefix[..2] == [0xFF, 0xFE] {
        return Ok(Some(TxtBom::Utf16Le));
    }
    if read >= 2 && prefix[..2] == [0xFE, 0xFF] {
        return Ok(Some(TxtBom::Utf16Be));
    }
    Ok(None)
}

fn create_utf8_txt_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
    skip_bytes: Option<u64>,
    encoding: Option<&'static encoding_rs::Encoding>,
) -> Result<PathBuf, String> {
    let target = txt_data_cache_path(app, path, signature)?;
    if target.exists() {
        return Ok(target);
    }
    let temp = temporary_sibling_path(&target);
    let mut source = File::open(path).map_err(|error| format!("打开 TXT 失败: {error}"))?;
    if let Some(skip) = skip_bytes {
        source
            .seek(SeekFrom::Start(skip))
            .map_err(|error| format!("跳过 TXT 编码标记失败: {error}"))?;
    }
    write_utf8_txt_cache(source, &temp, encoding)?;
    replace_file_atomically(&temp, &target)?;
    clean_old_txt_data_cache_files(app, path, signature);
    Ok(target)
}

fn write_utf8_txt_cache(
    mut source: File,
    target: &Path,
    encoding: Option<&'static encoding_rs::Encoding>,
) -> Result<(), String> {
    let temp_file = File::create(target).map_err(|error| format!("创建 TXT 缓存失败: {error}"))?;
    let mut writer = BufWriter::with_capacity(STREAM_BUFFER_BYTES, temp_file);
    if let Some(encoding) = encoding {
        let mut decoder = DecodeReaderBytesBuilder::new()
            .encoding(Some(encoding))
            .strip_bom(true)
            .build(source);
        std::io::copy(&mut decoder, &mut writer)
            .map_err(|error| format!("流式转码 TXT 失败: {error}"))?;
    } else {
        std::io::copy(&mut source, &mut writer)
            .map_err(|error| format!("复制 TXT 缓存失败: {error}"))?;
    }
    writer
        .flush()
        .map_err(|error| format!("写入 TXT 缓存失败: {error}"))?;
    Ok(())
}

fn is_txt_chapter_heading(title: &str) -> bool {
    let len = title.chars().count();
    if title.is_empty() || len > 90 {
        return false;
    }
    let lower = title.to_ascii_lowercase();
    if lower.starts_with("chapter ") || lower.starts_with("volume ") || lower.starts_with("vol.") {
        return true;
    }
    if title.starts_with('卷') && title.chars().take(8).any(is_cjk_or_ascii_number) {
        return true;
    }
    title.starts_with('第')
        && title
            .chars()
            .take(24)
            .any(|ch| matches!(ch, '部' | '卷' | '集' | '篇' | '章' | '节' | '回'))
}

fn is_cjk_or_ascii_number(ch: char) -> bool {
    ch.is_ascii_digit() || "一二三四五六七八九十百千万零〇两".contains(ch)
}

