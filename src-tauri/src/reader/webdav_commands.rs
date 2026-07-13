#[tauri::command]
fn write_binary_file(path: String, base64_data: String) -> Result<(), String> {
    let bytes = general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|err| format!("图片数据解析失败: {err}"))?;
    fs::write(&path, bytes).map_err(|err| format!("保存图片失败: {err}"))
}

#[tauri::command]
async fn webdav_upload_snapshot(config: WebDavConfig, snapshot: String) -> Result<(), String> {
    let target = webdav_state_url(&config)?;
    let client = reqwest::Client::new();
    let response = client
        .put(target)
        .basic_auth(config.username, config.password)
        .header("content-type", "application/json; charset=utf-8")
        .body(snapshot)
        .send()
        .await
        .map_err(|err| format!("WebDAV 上传失败: {err}"))?;

    if response.status().is_success() {
        Ok(())
    } else {
        Err(format!("WebDAV 上传失败，服务器返回 {}", response.status()))
    }
}

#[tauri::command]
async fn webdav_download_snapshot(config: WebDavConfig) -> Result<Option<String>, String> {
    let target = webdav_state_url(&config)?;
    let client = reqwest::Client::new();
    let response = client
        .get(target)
        .basic_auth(config.username, config.password)
        .send()
        .await
        .map_err(|err| format!("WebDAV 下载失败: {err}"))?;

    if response.status() == StatusCode::NOT_FOUND {
        return Ok(None);
    }

    if !response.status().is_success() {
        return Err(format!("WebDAV 下载失败，服务器返回 {}", response.status()));
    }

    response
        .text()
        .await
        .map(Some)
        .map_err(|err| format!("WebDAV 响应解析失败: {err}"))
}

#[tauri::command]
async fn webdav_list_books(config: WebDavConfig) -> Result<Vec<WebDavBook>, String> {
    let client = reqwest::Client::new();
    let base_url = webdav_base_url(&config)?;
    let mut pending = VecDeque::from([base_url.clone()]);
    let mut visited = HashSet::new();
    let mut books = Vec::new();

    while let Some(current_url) = pending.pop_front() {
        let current_key = current_url.as_str().to_string();
        if !visited.insert(current_key) {
            continue;
        }

        let entries = webdav_list_directory(&client, &config, &base_url, &current_url).await?;
        for entry in entries {
            if entry.is_dir {
                if let Ok(child_url) = webdav_url_for_remote_path(&config, &entry.remote_path) {
                    pending.push_back(child_url);
                }
                continue;
            }

            let extension = Path::new(&entry.file_name)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or_default()
                .to_ascii_lowercase();
            if extension != "epub" && extension != "txt" {
                continue;
            }

            let (title, author) = parse_filename_metadata_str(&entry.file_name);
            books.push(WebDavBook {
                id: stable_remote_book_id(&entry.remote_path),
                title,
                author,
                book_type: extension,
                path: entry.remote_path.clone(),
                file_name: entry.file_name,
                added_at: entry.modified_at.unwrap_or_else(now_millis),
                source: "webdav".to_string(),
                remote_path: entry.remote_path,
                size: entry.size,
                modified_at: entry.modified_at,
            });
        }
    }

    books.sort_by(|a, b| a.remote_path.cmp(&b.remote_path));
    Ok(books)
}

#[tauri::command]
async fn webdav_cache_book(
    app: AppHandle,
    config: WebDavConfig,
    remote_path: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let bytes = webdav_download_file_bytes(&client, &config, &remote_path).await?;
    let target_path = webdav_cached_book_path(&app, &remote_path)?;
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("创建缓存目录失败: {err}"))?;
    }
    fs::write(&target_path, bytes).map_err(|err| format!("写入缓存文件失败: {err}"))?;
    Ok(target_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn webdav_download_book_to_path(
    config: WebDavConfig,
    remote_path: String,
    target_path: String,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let bytes = webdav_download_file_bytes(&client, &config, &remote_path).await?;
    fs::write(&target_path, bytes).map_err(|err| format!("保存下载文件失败: {err}"))?;
    Ok(())
}

