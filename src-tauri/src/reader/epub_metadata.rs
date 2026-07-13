fn find_epub_cover(
    app: &AppHandle,
    archive: &mut ZipArchive<File>,
    doc: &Document,
    opf_path: &str,
    book_id: &str,
) -> Result<String, String> {
    let cover_id = doc
        .descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node
                    .attribute("name")
                    .map(|value| value.eq_ignore_ascii_case("cover"))
                    .unwrap_or(false)
        })
        .and_then(|node| node.attribute("content"))
        .map(str::to_string);

    let cover_item = doc.descendants().find(|node| {
        if node.tag_name().name() != "item" {
            return false;
        }

        let id_matches = cover_id
            .as_deref()
            .and_then(|id| node.attribute("id").map(|item_id| item_id == id))
            .unwrap_or(false);
        let property_matches = node
            .attribute("properties")
            .map(|properties| {
                properties
                    .split_whitespace()
                    .any(|property| property == "cover-image")
            })
            .unwrap_or(false);

        id_matches || property_matches
    });

    let href = cover_item
        .and_then(|node| node.attribute("href"))
        .ok_or_else(|| "EPUB 未声明封面".to_string())?;
    let archive_path = resolve_epub_path(opf_path, href);
    let mut file = archive
        .by_name(&archive_path)
        .map_err(|err| err.to_string())?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|err| err.to_string())?;
    let mime = mime_guess::from_path(&archive_path).first_or_octet_stream();
    let extension = mime_guess::get_mime_extensions(&mime)
        .and_then(|extensions| extensions.first().copied())
        .or_else(|| {
            Path::new(&archive_path)
                .extension()
                .and_then(|ext| ext.to_str())
        })
        .unwrap_or("img");
    let covers_dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("covers");
    fs::create_dir_all(&covers_dir).map_err(|err| err.to_string())?;
    let target = covers_dir.join(format!("{book_id}.{extension}"));
    fs::write(&target, bytes).map_err(|err| err.to_string())?;

    Ok(target.to_string_lossy().to_string())
}

fn read_zip_text(archive: &mut ZipArchive<File>, path: &str) -> Result<String, String> {
    let mut file = archive.by_name(path).map_err(|err| err.to_string())?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|err| err.to_string())?;
    Ok(content)
}

fn normalize_zip_path(path: &str) -> String {
    path.replace('\\', "/")
        .split('/')
        .fold(Vec::<&str>::new(), |mut parts, part| {
            if part.is_empty() || part == "." {
                return parts;
            }
            if part == ".." {
                parts.pop();
            } else {
                parts.push(part);
            }
            parts
        })
        .join("/")
}

fn strip_fragment(path: &str) -> String {
    path.split(['#', '?']).next().unwrap_or(path).to_string()
}

fn zip_dirname(path: &str) -> String {
    let normalized = normalize_zip_path(path);
    normalized
        .rfind('/')
        .map(|index| normalized[..index].to_string())
        .unwrap_or_default()
}

fn resolve_zip_href(base_dir: &str, href: &str) -> String {
    if is_external_href(href) {
        return href.to_string();
    }
    let decoded_href = percent_decode_str(href).decode_utf8_lossy();
    normalize_zip_path(&format!(
        "{}{}{}",
        base_dir,
        if base_dir.is_empty() { "" } else { "/" },
        decoded_href
    ))
}

fn is_external_href(value: &str) -> bool {
    value.starts_with('#')
        || value.contains("://")
        || value.starts_with("data:")
        || value.starts_with("blob:")
}

fn mime_from_path(path: &str) -> String {
    let clean = strip_fragment(path);
    match clean
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
    .to_string()
}

