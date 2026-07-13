fn resolve_epub_path(opf_path: &str, href: &str) -> String {
    let decoded_href = percent_decode_str(href).decode_utf8_lossy();
    let parent = Path::new(opf_path)
        .parent()
        .map(|path| path.to_string_lossy().replace('\\', "/"));
    match parent {
        Some(parent) if !parent.is_empty() => format!("{parent}/{decoded_href}"),
        _ => decoded_href.to_string(),
    }
}

fn parse_filename_metadata(path: &Path) -> (String, String) {
    let stem = fallback_title(path);
    parse_filename_metadata_from_stem(&stem)
}

fn parse_filename_metadata_str(file_name: &str) -> (String, String) {
    let stem = Path::new(file_name)
        .file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or(file_name)
        .trim()
        .to_string();
    parse_filename_metadata_from_stem(&stem)
}

fn parse_filename_metadata_from_stem(stem: &str) -> (String, String) {
    if let Some((author, title)) = stem.split_once(" - ") {
        return (title.trim().to_string(), author.trim().to_string());
    }
    (stem.to_string(), "Unknown Author".to_string())
}

fn fallback_title(path: &Path) -> String {
    path.file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or("Unknown Title")
        .trim()
        .to_string()
}

fn stable_book_id(path: &Path) -> String {
    let mut hasher = Sha256::new();
    hasher.update(path.to_string_lossy().as_bytes());
    let digest = hasher.finalize();
    format!(
        "book-{:x}",
        &digest[..8]
            .iter()
            .fold(0u64, |acc, byte| (acc << 8) | u64::from(*byte))
    )
}

fn book_fingerprint(path: &Path) -> Result<String, String> {
    const SAMPLE_BYTES: u64 = 64 * 1024;
    let mut file = File::open(path).map_err(|error| format!("读取书籍指纹失败: {error}"))?;
    let length = file
        .metadata()
        .map_err(|error| format!("读取书籍信息失败: {error}"))?
        .len();
    let mut hasher = Sha256::new();
    hasher.update(b"zenith-book-v1\0");
    hasher.update(length.to_le_bytes());
    hasher.update(
        path.extension()
            .and_then(|extension| extension.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase()
            .as_bytes(),
    );
    let mut buffer = vec![0u8; SAMPLE_BYTES.min(length) as usize];
    file.read_exact(&mut buffer)
        .map_err(|error| format!("读取书籍指纹失败: {error}"))?;
    hasher.update(&buffer);
    if length > SAMPLE_BYTES {
        file.seek(SeekFrom::Start(length.saturating_sub(SAMPLE_BYTES)))
            .map_err(|error| format!("定位书籍指纹失败: {error}"))?;
        buffer.resize(SAMPLE_BYTES.min(length) as usize, 0);
        file.read_exact(&mut buffer)
            .map_err(|error| format!("读取书籍指纹失败: {error}"))?;
        hasher.update(&buffer);
    }
    Ok(format!("sha256:{}", hex_digest(&hasher.finalize())))
}

fn hex_digest(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn stable_remote_book_id(remote_path: &str) -> String {
    format!("webdav-{}", hash_string(remote_path))
}

fn now_millis() -> u64 {
    now_millis_u128() as u64
}

fn now_millis_u128() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}
