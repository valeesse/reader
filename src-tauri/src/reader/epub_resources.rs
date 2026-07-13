fn read_cached_epub_resource(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<EpubCachedResource, String> {
    let signature = file_signature(path)?;
    let normalized_href = strip_fragment(&normalize_zip_path(href));
    {
        let mut books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        if let Some(book) = books.get_mut(path) {
            if book.signature != signature {
                return Err("EPUB 文件已变更，请重新打开".to_string());
            }
            book.last_used_at = now_millis_u128();
            if let Some(resource) = book.resource_cache.get(&normalized_href).cloned() {
                touch_epub_resource(book, &normalized_href);
                return Ok(resource);
            }
        }
    }

    let (media_type, bytes) = read_epub_resource_bytes(state, path, &normalized_href)?;
    let resource = EpubCachedResource {
        bytes: Arc::from(bytes),
        media_type,
    };
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let book = books
        .get_mut(path)
        .ok_or_else(|| "EPUB 尚未打开".to_string())?;
    if book.signature != signature {
        return Err("EPUB 文件已变更，请重新打开".to_string());
    }
    book.last_used_at = now_millis_u128();
    cache_epub_resource(book, normalized_href, resource.clone());
    Ok(resource)
}

fn read_epub_resource_bytes(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<(String, Vec<u8>), String> {
    let (manifest_item, archive) = {
        let books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        let book = books
            .get(path)
            .ok_or_else(|| "EPUB 尚未打开".to_string())?;
        (
            book.manifest_items
                .iter()
                .find(|item| strip_fragment(&item.absolute_href) == href)
                .cloned(),
            Arc::clone(&book.archive),
        )
    };
    let (archive_path, media_type) = manifest_item
        .map(|item| (item.absolute_href, item.media_type))
        .unwrap_or_else(|| (href.to_string(), mime_from_path(href)));
    let mut archive = archive
        .lock()
        .map_err(|_| "EPUB 归档正在被读取".to_string())?;
    let (_, bytes) = read_zip_bytes_flexible(&mut archive, &archive_path)
        .map_err(|err| format!("读取 EPUB 资源失败: {err}"))?;
    Ok((media_type, bytes))
}

fn open_epub_archive(path: &str) -> Result<ZipArchive<File>, String> {
    let file = File::open(path).map_err(|error| format!("打开 EPUB 失败: {error}"))?;
    ZipArchive::new(file).map_err(|error| format!("读取 EPUB 失败: {error}"))
}

fn validate_epub_session(state: &ReaderState, path: &str, session_id: &str) -> Result<(), String> {
    let signature = file_signature(path)?;
    let mut books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    let book = books
        .get_mut(path)
        .ok_or_else(|| "EPUB 尚未打开".to_string())?;
    validate_book_session(book, signature, session_id, "EPUB")
}

fn epub_manifest_item_for_href(
    state: &ReaderState,
    path: &str,
    href: &str,
) -> Result<Option<EpubManifestItem>, String> {
    let books = state
        .epub_books
        .lock()
        .map_err(|_| "EPUB 缓存被占用".to_string())?;
    Ok(books.get(path).and_then(|book| {
        book.manifest_items
            .iter()
            .find(|item| strip_fragment(&item.absolute_href) == href)
            .cloned()
    }))
}

fn existing_epub_binary_resource(
    app: &AppHandle,
    state: &ReaderState,
    path: &str,
    signature: FileSignature,
    href: &str,
) -> Option<(String, PathBuf)> {
    let item = epub_manifest_item_for_href(state, path, href).ok()??;
    if is_epub_text_resource(&item.media_type) {
        return None;
    }
    let file_path = epub_resource_file_path(app, path, signature, href, &item.media_type).ok()?;
    file_path.is_file().then_some((item.media_type, file_path))
}

fn prefetch_epub_resources_blocking(
    app: &AppHandle,
    state: &ReaderState,
    path: &str,
    session_id: &str,
    hrefs: Vec<String>,
) -> Result<(), String> {
    validate_epub_session(state, path, session_id)?;
    let signature = file_signature(path)?;
    let mut seen = HashSet::new();
    let normalized_hrefs = hrefs
        .into_iter()
        .map(|href| strip_fragment(&normalize_zip_path(&href)))
        .filter(|href| !href.is_empty() && seen.insert(href.clone()))
        .take(EPUB_PREFETCH_MAX_RESOURCES)
        .collect::<Vec<_>>();
    let manifest_items = {
        let mut books = state
            .epub_books
            .lock()
            .map_err(|_| "EPUB 缓存被占用".to_string())?;
        let book = books
            .get_mut(path)
            .ok_or_else(|| "EPUB 尚未打开".to_string())?;
        let mut missing = Vec::new();
        for href in normalized_hrefs {
            if let Some(resource) = book.resource_cache.get(&href).cloned() {
                touch_epub_resource(book, &href);
                drop(resource);
                continue;
            }
            let item = book
                .manifest_items
                .iter()
                .find(|item| strip_fragment(&item.absolute_href) == href)
                .cloned()
                .unwrap_or_else(|| EpubManifestItem {
                    id: href.clone(),
                    absolute_href: href.clone(),
                    media_type: mime_from_path(&href),
                    properties: vec![],
                });
            if !is_epub_text_resource(&item.media_type)
                && let Ok(file_path) =
                    epub_resource_file_path(app, path, signature, &href, &item.media_type)
                && file_path.is_file()
            {
                continue;
            }
            missing.push((href, item));
        }
        missing
    };
    if manifest_items.is_empty() {
        return Ok(());
    }

    let file = File::open(path).map_err(|error| format!("打开 EPUB 失败: {error}"))?;
    let mut archive = ZipArchive::new(file).map_err(|error| format!("读取 EPUB 失败: {error}"))?;
    for (href, item) in manifest_items {
        let Ok((_, bytes)) = read_zip_bytes_flexible(&mut archive, &item.absolute_href) else {
            continue;
        };
        let resource = EpubCachedResource {
            bytes: Arc::from(bytes),
            media_type: item.media_type,
        };
        if is_epub_text_resource(&resource.media_type) {
            let mut books = state
                .epub_books
                .lock()
                .map_err(|_| "EPUB 缓存被占用".to_string())?;
            if let Some(book) = books.get_mut(path)
                && book.signature == signature
            {
                cache_epub_resource(book, href, resource);
            }
        } else {
            let _ = save_epub_resource_file(app, path, signature, &href, &resource);
        }
    }
    Ok(())
}

fn touch_epub_resource(book: &mut EpubBookCache, href: &str) {
    if let Some(index) = book.resource_order.iter().position(|item| item == href) {
        book.resource_order.remove(index);
    }
    book.resource_order.push_back(href.to_string());
}

fn cache_epub_resource(book: &mut EpubBookCache, href: String, resource: EpubCachedResource) {
    let resource_size = resource.bytes.len();
    let max_bytes = epub_resource_cache_max_bytes();
    if resource_size > max_bytes {
        return;
    }
    if let Some(previous) = book.resource_cache.remove(&href) {
        book.resource_bytes = book.resource_bytes.saturating_sub(previous.bytes.len());
    }
    if let Some(index) = book.resource_order.iter().position(|item| item == &href) {
        book.resource_order.remove(index);
    }
    book.resource_bytes = book.resource_bytes.saturating_add(resource_size);
    book.resource_cache.insert(href.clone(), resource);
    book.resource_order.push_back(href);
    trim_epub_resource_cache(
        book,
        EPUB_RESOURCE_CACHE_LIMIT,
        max_bytes,
    );
}

fn trim_epub_resource_cache(book: &mut EpubBookCache, max_count: usize, max_bytes: usize) {
    while book.resource_cache.len() > max_count || book.resource_bytes > max_bytes {
        let Some(oldest) = book.resource_order.pop_front() else {
            break;
        };
        if let Some(removed) = book.resource_cache.remove(&oldest) {
            book.resource_bytes = book.resource_bytes.saturating_sub(removed.bytes.len());
        }
    }
}
