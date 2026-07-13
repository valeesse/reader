fn load_txt_book(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Result<TxtBookCache, String> {
    if let Some(index) = load_txt_index_from_persistent_cache(app, path, signature) {
        return Ok(TxtBookCache {
            signature,
            last_used_at: now_millis_u128(),
            active_sessions: HashSet::new(),
            data_path: PathBuf::from(index.data_path),
            total_chars: index.total_chars,
            total_bytes: index.total_bytes,
            checkpoints: index.checkpoints,
            chapters: index.chapters,
        });
    }

    let bom = detect_txt_bom(path)?;
    let (data_path, total_chars, checkpoints, chapters) = if let Some(bom) = bom {
        let (skip, source_encoding) = match bom {
            TxtBom::Utf8 => (3, None),
            TxtBom::Utf16Le => (2, Some(UTF_16LE)),
            TxtBom::Utf16Be => (2, Some(UTF_16BE)),
        };
        let data_path = create_utf8_txt_cache(app, path, signature, Some(skip), source_encoding)?;
        let (total_chars, checkpoints, chapters) =
            build_txt_index(&data_path).map_err(|error| format!("TXT 转码索引失败: {error}"))?;
        (data_path, total_chars, checkpoints, chapters)
    } else {
        match build_txt_index(Path::new(path)) {
            Ok((total_chars, checkpoints, chapters)) => {
                (PathBuf::from(path), total_chars, checkpoints, chapters)
            }
            Err(TxtIndexError::InvalidUtf8) => {
                let data_path = create_utf8_txt_cache(app, path, signature, None, Some(GBK))?;
                let (total_chars, checkpoints, chapters) = build_txt_index(&data_path)
                    .map_err(|error| format!("GBK 转码后的 TXT 索引失败: {error}"))?;
                (data_path, total_chars, checkpoints, chapters)
            }
            Err(TxtIndexError::Io(error)) => return Err(error),
        }
    };
    let cache = TxtBookCache {
        signature,
        last_used_at: now_millis_u128(),
        active_sessions: HashSet::new(),
        data_path,
        total_chars,
        total_bytes: signature.len,
        checkpoints,
        chapters,
    };
    save_txt_index_to_persistent_cache(app, path, &cache);
    Ok(cache)
}

fn load_txt_index_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Option<PersistentTxtIndexCache> {
    let cache_path = txt_index_cache_path(app, path).ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentTxtIndexCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
        || cached.checkpoints.first() != Some(&(0, 0))
    {
        return None;
    }
    let metadata = fs::metadata(&cached.data_path).ok()?;
    if metadata.len() != cached.data_bytes {
        return None;
    }
    Some(cached)
}

fn save_txt_index_to_persistent_cache(app: &AppHandle, path: &str, cache: &TxtBookCache) {
    let Ok(cache_path) = txt_index_cache_path(app, path) else {
        return;
    };
    let payload = PersistentTxtIndexCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        data_path: cache.data_path.to_string_lossy().to_string(),
        data_bytes: fs::metadata(&cache.data_path)
            .map(|metadata| metadata.len())
            .unwrap_or_default(),
        total_chars: cache.total_chars,
        total_bytes: cache.total_bytes,
        checkpoints: cache.checkpoints.clone(),
        chapters: cache.chapters.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = write_atomic(&cache_path, &bytes);
    }
}

#[derive(Debug)]
enum TxtIndexError {
    InvalidUtf8,
    Io(String),
}

#[derive(Debug, Clone, Copy)]
enum TxtBom {
    Utf8,
    Utf16Le,
    Utf16Be,
}

impl std::fmt::Display for TxtIndexError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidUtf8 => formatter.write_str("TXT 不是有效的 UTF-8"),
            Self::Io(error) => formatter.write_str(error),
        }
    }
}
