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

fn book_fingerprint(path: &Path) -> Result<String, String> {
    reader_core::fingerprint_file(path).map_err(|error| format!("读取书籍指纹失败: {error}"))
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
