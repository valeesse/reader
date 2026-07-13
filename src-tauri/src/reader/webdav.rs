async fn webdav_list_directory(
    client: &reqwest::Client,
    config: &WebDavConfig,
    base_url: &Url,
    directory_url: &Url,
) -> Result<Vec<WebDavEntry>, String> {
    let response = client
        .request(
            Method::from_bytes(b"PROPFIND").map_err(|err| err.to_string())?,
            directory_url.clone(),
        )
        .basic_auth(&config.username, config.password.clone())
        .header("depth", "1")
        .header("content-type", "application/xml; charset=utf-8")
        .body(
            r#"<?xml version="1.0" encoding="utf-8" ?>
<propfind xmlns="DAV:">
  <prop>
    <displayname />
    <getcontentlength />
    <getlastmodified />
    <resourcetype />
  </prop>
</propfind>"#,
        )
        .send()
        .await
        .map_err(|err| format!("WebDAV 目录读取失败: {err}"))?;

    if !response.status().is_success() && response.status().as_u16() != 207 {
        return Err(format!(
            "WebDAV 目录读取失败，服务器返回 {}",
            response.status()
        ));
    }

    let body = response
        .text()
        .await
        .map_err(|err| format!("WebDAV 目录响应解析失败: {err}"))?;
    parse_webdav_multistatus(base_url, directory_url, &body)
}

fn parse_webdav_multistatus(
    base_url: &Url,
    directory_url: &Url,
    xml: &str,
) -> Result<Vec<WebDavEntry>, String> {
    let doc = Document::parse(xml).map_err(|err| format!("WebDAV XML 解析失败: {err}"))?;
    let directory_href = directory_url.path().trim_end_matches('/').to_string();
    let mut entries = Vec::new();

    for response in doc
        .descendants()
        .filter(|node| node.tag_name().name() == "response")
    {
        let href_value = response
            .children()
            .find(|node| node.tag_name().name() == "href")
            .and_then(|node| node.text())
            .map(str::trim)
            .unwrap_or_default();
        if href_value.is_empty() {
            continue;
        }

        let Ok(absolute_url) = base_url.join(href_value) else {
            continue;
        };
        let absolute_path = absolute_url.path().trim_end_matches('/').to_string();
        if absolute_path == directory_href {
            continue;
        }

        let prop = response
            .descendants()
            .find(|node| node.tag_name().name() == "prop");
        let is_dir = prop
            .and_then(|node| {
                node.children()
                    .find(|child| child.tag_name().name() == "resourcetype")
            })
            .map(|node| {
                node.children()
                    .any(|child| child.tag_name().name() == "collection")
            })
            .unwrap_or(false);
        let remote_path = webdav_remote_path_from_url(base_url, &absolute_url)?;
        let file_name = remote_path
            .rsplit('/')
            .next()
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| {
                href_value
                    .trim_end_matches('/')
                    .rsplit('/')
                    .next()
                    .unwrap_or("untitled")
            })
            .to_string();
        let size = prop
            .and_then(|node| {
                node.children()
                    .find(|child| child.tag_name().name() == "getcontentlength")
            })
            .and_then(|node| node.text())
            .and_then(|value| value.trim().parse::<u64>().ok());

        entries.push(WebDavEntry {
            remote_path,
            file_name,
            is_dir,
            size,
            modified_at: None,
        });
    }

    Ok(entries)
}

async fn webdav_download_file_bytes(
    client: &reqwest::Client,
    config: &WebDavConfig,
    remote_path: &str,
) -> Result<Vec<u8>, String> {
    let target = webdav_url_for_remote_path(config, remote_path)?;
    let response = client
        .get(target)
        .basic_auth(&config.username, config.password.clone())
        .send()
        .await
        .map_err(|err| format!("WebDAV 文件下载失败: {err}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "WebDAV 文件下载失败，服务器返回 {}",
            response.status()
        ));
    }

    response
        .bytes()
        .await
        .map(|bytes| bytes.to_vec())
        .map_err(|err| format!("WebDAV 文件读取失败: {err}"))
}

fn webdav_base_url(config: &WebDavConfig) -> Result<Url, String> {
    let base = config.url.trim();
    if base.is_empty() {
        return Err("请填写 WebDAV 地址".into());
    }
    let with_trailing_slash = if base.ends_with('/') {
        base.to_string()
    } else {
        format!("{base}/")
    };
    Url::parse(&with_trailing_slash).map_err(|err| format!("WebDAV 地址无效: {err}"))
}

fn webdav_url_for_remote_path(config: &WebDavConfig, remote_path: &str) -> Result<Url, String> {
    let mut url = webdav_base_url(config)?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "WebDAV 地址不支持路径拼接".to_string())?;
        segments.pop_if_empty();
        for segment in remote_path.split('/').filter(|segment| !segment.is_empty()) {
            segments.push(segment);
        }
    }
    Ok(url)
}

fn webdav_remote_path_from_url(base_url: &Url, absolute_url: &Url) -> Result<String, String> {
    let base_path = base_url.path().trim_end_matches('/');
    let absolute_path = absolute_url.path();
    let is_within_base = absolute_path == base_path
        || absolute_path
            .strip_prefix(base_path)
            .is_some_and(|suffix| suffix.starts_with('/'));
    if !is_within_base {
        return Err("WebDAV 返回了不在当前目录下的路径".into());
    }
    let relative = absolute_path
        .trim_start_matches(base_path)
        .trim_start_matches('/');
    Ok(percent_decode_str(relative).decode_utf8_lossy().to_string())
}

fn webdav_cached_book_path(app: &AppHandle, remote_path: &str) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_cache_dir()
        .map_err(|err| err.to_string())?
        .join("webdav-books");
    fs::create_dir_all(&dir).map_err(|err| format!("创建 WebDAV 图书缓存失败: {err}"))?;
    let extension = Path::new(remote_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .filter(|ext| !ext.is_empty())
        .unwrap_or("book");
    Ok(dir.join(format!("{}.{}", hash_string(remote_path), extension)))
}

fn trim_txt_cache(books: &mut HashMap<String, TxtBookCache>) {
    while books.len() > TXT_BOOK_CACHE_LIMIT {
        let Some(path) = books
            .iter()
            .filter(|(_, cache)| cache.active_sessions.is_empty())
            .min_by_key(|(_, cache)| cache.last_used_at)
            .map(|(path, _)| path.clone())
        else {
            break;
        };
        books.remove(&path);
    }
}

fn trim_epub_cache(books: &mut HashMap<String, EpubBookCache>) {
    while books.len() > EPUB_BOOK_CACHE_LIMIT {
        let Some(path) = books
            .iter()
            .filter(|(_, cache)| cache.active_sessions.is_empty())
            .min_by_key(|(_, cache)| cache.last_used_at)
            .map(|(path, _)| path.clone())
        else {
            break;
        };
        books.remove(&path);
    }
}

fn webdav_state_url(config: &WebDavConfig) -> Result<String, String> {
    let mut url = webdav_base_url(config)?;
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|_| "WebDAV 地址不支持状态文件路径".to_string())?;
        segments.pop_if_empty();
        segments.push("zenith-reader-state.json");
    }
    Ok(url.to_string())
}

