fn read_zip_bytes_flexible(
    archive: &mut ZipArchive<File>,
    path: &str,
) -> Result<(String, Vec<u8>), String> {
    if let Ok(bytes) = read_zip_bytes_exact(archive, path) {
        return Ok((path.to_string(), bytes));
    }

    let decoded = percent_decode_str(path).decode_utf8_lossy().to_string();
    if decoded != path
        && let Ok(bytes) = read_zip_bytes_exact(archive, &decoded)
    {
        return Ok((decoded, bytes));
    }

    let normalized = normalize_zip_path(&decoded);
    let normalized_lower = normalized.to_ascii_lowercase();
    let path_without_root_lower = strip_first_zip_segment(&normalized_lower);
    let file_name_lower = Path::new(&normalized)
        .file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.to_ascii_lowercase());
    let mut suffix_match: Option<String> = None;
    let mut basename_match: Option<String> = None;
    let mut basename_ambiguous = false;

    for index in 0..archive.len() {
        let Ok(file) = archive.by_index(index) else {
            continue;
        };
        let candidate = normalize_zip_path(file.name());
        let candidate_lower = candidate.to_ascii_lowercase();
        drop(file);

        if candidate_lower == normalized_lower {
            let bytes = read_zip_bytes_exact(archive, &candidate)?;
            return Ok((candidate, bytes));
        }

        if !path_without_root_lower.is_empty()
            && (candidate_lower == path_without_root_lower
                || candidate_lower.ends_with(&format!("/{path_without_root_lower}")))
        {
            let bytes = read_zip_bytes_exact(archive, &candidate)?;
            return Ok((candidate, bytes));
        }

        if candidate_lower.ends_with(&format!("/{normalized_lower}")) {
            suffix_match = Some(candidate);
            continue;
        }

        if let Some(file_name) = &file_name_lower {
            let candidate_file_name = Path::new(&candidate_lower)
                .file_name()
                .and_then(|name| name.to_str());
            if candidate_file_name == Some(file_name.as_str()) {
                if basename_match.is_some() {
                    basename_ambiguous = true;
                } else {
                    basename_match = Some(candidate);
                }
            }
        }
    }

    let fallback_match = suffix_match.or({
        if basename_ambiguous {
            None
        } else {
            basename_match
        }
    });
    if let Some(candidate) = fallback_match {
        let bytes = read_zip_bytes_exact(archive, &candidate)?;
        eprintln!("EPUB resource fallback matched: requested={path}, actual={candidate}");
        return Ok((candidate, bytes));
    }

    Err(format!("EPUB 缺少资源: {path}"))
}

fn read_zip_bytes_exact(archive: &mut ZipArchive<File>, path: &str) -> Result<Vec<u8>, String> {
    let mut file = archive.by_name(path).map_err(|err| err.to_string())?;
    let mut bytes = Vec::with_capacity(file.size() as usize);
    file.read_to_end(&mut bytes)
        .map_err(|err| err.to_string())?;
    Ok(bytes)
}

fn strip_first_zip_segment(path: &str) -> String {
    path.split_once('/')
        .map(|(_, rest)| rest.to_string())
        .unwrap_or_default()
}

fn is_epub_text_resource(media_type: &str) -> bool {
    media_type.starts_with("text/")
        || matches!(
            media_type,
            "application/xhtml+xml"
                | "application/xml"
                | "application/x-dtbncx+xml"
                | "application/javascript"
                | "application/json"
                | "image/svg+xml"
        )
}

fn parse_epub_metadata(
    app: &AppHandle,
    path: &Path,
    book_id: &str,
) -> Result<ParsedEpubMetadata, String> {
    let file = File::open(path).map_err(|err| err.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|err| err.to_string())?;
    let container = read_zip_text(&mut archive, "META-INF/container.xml")?;
    let doc = Document::parse(&container).map_err(|err| err.to_string())?;
    let opf_path = doc
        .descendants()
        .find(|node| node.tag_name().name() == "rootfile")
        .and_then(|node| node.attribute("full-path"))
        .ok_or_else(|| "EPUB 缺少 OPF 路径".to_string())?
        .to_string();

    let opf = read_zip_text(&mut archive, &opf_path)?;
    let opf_doc = Document::parse(&opf).map_err(|err| err.to_string())?;
    let title = first_text(&opf_doc, "title").unwrap_or_else(|| fallback_title(path));
    let author = first_text(&opf_doc, "creator").unwrap_or_else(|| "Unknown Author".to_string());
    let series_name = epub_meta_content(&opf_doc, "calibre:series")
        .or_else(|| epub_collection_metadata(&opf_doc));
    let series_index =
        epub_meta_content(&opf_doc, "calibre:series_index").and_then(|value| value.parse().ok());
    let cover = find_epub_cover(app, &mut archive, &opf_doc, &opf_path, book_id).ok();

    Ok((title, author, cover, series_name, series_index))
}

fn first_text(doc: &Document, tag_name: &str) -> Option<String> {
    doc.descendants()
        .find(|node| node.tag_name().name() == tag_name)
        .and_then(|node| node.text())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn epub_meta_content(doc: &Document, name: &str) -> Option<String> {
    doc.descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("name")
                    .map(|value| value.eq_ignore_ascii_case(name))
                    .unwrap_or(false)
        })
        .and_then(|node| node.attribute("content"))
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn epub_collection_metadata(doc: &Document) -> Option<String> {
    doc.descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("property")
                    .map(|value| value == "belongs-to-collection")
                    .unwrap_or(false)
        })
        .and_then(|node| node.text())
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

