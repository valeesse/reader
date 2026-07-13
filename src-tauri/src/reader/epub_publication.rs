fn load_epub_book(
    path: &str,
    fallback_title: &str,
) -> Result<(Vec<EpubManifestItem>, EpubBookInfo), String> {
    let file = File::open(path).map_err(|err| format!("打开 EPUB 失败: {err}"))?;
    let mut archive = ZipArchive::new(file).map_err(|err| format!("读取 EPUB 失败: {err}"))?;
    let container = read_zip_text(&mut archive, "META-INF/container.xml")?;
    let container_doc = Document::parse(&container).map_err(|err| err.to_string())?;
    let opf_path = container_doc
        .descendants()
        .find(|node| node.tag_name().name() == "rootfile")
        .and_then(|node| node.attribute("full-path"))
        .ok_or_else(|| "EPUB 缺少 OPF 路径".to_string())?
        .to_string();
    let opf_path = normalize_zip_path(&opf_path);
    let opf_dir = zip_dirname(&opf_path);
    let opf = read_zip_text(&mut archive, &opf_path)?;
    let opf_doc = Document::parse(&opf).map_err(|err| err.to_string())?;
    let manifest_items = epub_manifest_items(&opf_doc, &opf_dir);
    let spine_items = epub_spine_items(&opf_doc, &manifest_items);
    let reading_order = spine_items
        .iter()
        .enumerate()
        .map(|(index, item)| {
            epub_link_from_manifest(
                item,
                Some(item.id.clone())
                    .filter(|id| !id.is_empty())
                    .or_else(|| Some(format!("Chapter {}", index + 1))),
                vec![],
            )
        })
        .collect::<Vec<_>>();
    let reading_hrefs = reading_order
        .iter()
        .map(|link| link.href.clone())
        .collect::<std::collections::HashSet<_>>();
    let resources = manifest_items
        .iter()
        .filter(|item| !reading_hrefs.contains(&item.absolute_href))
        .map(|item| {
            let rels = if item
                .properties
                .iter()
                .any(|property| property == "cover-image")
            {
                vec!["cover".to_string()]
            } else {
                vec![]
            };
            epub_link_from_manifest(item, Some(item.id.clone()), rels)
        })
        .collect::<Vec<_>>();
    let toc = epub_toc_links(&mut archive, &manifest_items, &opf_dir)?;
    let metadata = epub_metadata_info(&opf_doc, fallback_title);

    Ok((
        manifest_items,
        EpubBookInfo {
            metadata,
            reading_order,
            resources,
            toc,
        },
    ))
}

fn load_epub_book_from_persistent_cache(
    app: &AppHandle,
    path: &str,
    signature: FileSignature,
) -> Option<Result<(Vec<EpubManifestItem>, EpubBookInfo), String>> {
    let cache_path = epub_metadata_cache_path(app, path).ok()?;
    let bytes = fs::read(cache_path).ok()?;
    let cached = serde_json::from_slice::<PersistentEpubBookCache>(&bytes).ok()?;
    if cached.version != PERSISTENT_CACHE_VERSION
        || cached.path != path
        || cached.signature != signature
    {
        return None;
    }
    Some(Ok((cached.manifest_items, cached.info)))
}

fn save_epub_book_to_persistent_cache(app: &AppHandle, path: &str, cache: &EpubBookCache) {
    let Ok(cache_path) = epub_metadata_cache_path(app, path) else {
        return;
    };
    let payload = PersistentEpubBookCache {
        version: PERSISTENT_CACHE_VERSION,
        path: path.to_string(),
        signature: cache.signature,
        info: cache.info.clone(),
        manifest_items: cache.manifest_items.clone(),
    };
    if let Ok(bytes) = serde_json::to_vec(&payload) {
        let _ = write_atomic(&cache_path, &bytes);
    }
}

fn epub_manifest_items(doc: &Document, opf_dir: &str) -> Vec<EpubManifestItem> {
    doc.descendants()
        .filter(|node| node.tag_name().name() == "item")
        .map(|node| {
            let href = node.attribute("href").unwrap_or_default();
            EpubManifestItem {
                id: node.attribute("id").unwrap_or(href).to_string(),
                absolute_href: resolve_zip_href(opf_dir, href),
                media_type: node
                    .attribute("media-type")
                    .map(str::to_string)
                    .unwrap_or_else(|| mime_from_path(href)),
                properties: node
                    .attribute("properties")
                    .unwrap_or_default()
                    .split_whitespace()
                    .map(str::to_string)
                    .collect(),
            }
        })
        .collect()
}

fn epub_spine_items(doc: &Document, manifest_items: &[EpubManifestItem]) -> Vec<EpubManifestItem> {
    let by_id = manifest_items
        .iter()
        .map(|item| (item.id.as_str(), item))
        .collect::<HashMap<_, _>>();
    doc.descendants()
        .filter(|node| node.tag_name().name() == "itemref")
        .filter_map(|node| {
            node.attribute("idref")
                .and_then(|id| by_id.get(id))
                .copied()
        })
        .cloned()
        .collect()
}

fn epub_metadata_info(doc: &Document, fallback_title: &str) -> EpubMetadataInfo {
    let title = first_text(doc, "title").unwrap_or_else(|| fallback_title.to_string());
    let author = first_text(doc, "creator");
    let language = first_text(doc, "language").unwrap_or_else(|| "zh".to_string());
    let layout = doc
        .descendants()
        .find(|node| {
            node.tag_name().name() == "meta"
                && node.attribute("property") == Some("rendition:layout")
        })
        .and_then(|node| node.text())
        .map(str::trim)
        .filter(|value| *value == "pre-paginated")
        .map(|_| "fixed".to_string())
        .unwrap_or_else(|| "reflowable".to_string());
    let reading_progression = doc
        .descendants()
        .find(|node| node.tag_name().name() == "spine")
        .and_then(|node| node.attribute("page-progression-direction"))
        .filter(|value| *value == "rtl")
        .map(str::to_string)
        .unwrap_or_else(|| "ltr".to_string());

    EpubMetadataInfo {
        title,
        author,
        language,
        layout,
        reading_progression,
    }
}

fn epub_toc_links(
    archive: &mut ZipArchive<File>,
    manifest_items: &[EpubManifestItem],
    opf_dir: &str,
) -> Result<Vec<EpubLinkInfo>, String> {
    if let Some(nav_item) = manifest_items
        .iter()
        .find(|item| item.properties.iter().any(|property| property == "nav"))
        && let Ok(nav) = read_zip_text(archive, &nav_item.absolute_href)
        && let Ok(doc) = Document::parse(&nav)
    {
        let nav_node = doc.descendants().find(|node| {
            node.tag_name().name() == "nav"
                && (node.attribute("type") == Some("toc")
                    || node.attribute(("http://www.idpf.org/2007/ops", "type")) == Some("toc"))
        });
        if let Some(nav_node) = nav_node {
            return Ok(nav_node
                .descendants()
                .filter(|node| node.tag_name().name() == "a")
                .filter_map(|anchor| {
                    let href = anchor.attribute("href")?;
                    Some(EpubLinkInfo {
                        href: resolve_zip_href(&zip_dirname(&nav_item.absolute_href), href),
                        media_type: mime_from_path(href),
                        title: anchor.text().map(|value| value.trim().to_string()),
                        rels: vec![],
                        properties: vec![],
                    })
                })
                .collect());
        }
    }

    if let Some(ncx_item) = manifest_items
        .iter()
        .find(|item| item.media_type == "application/x-dtbncx+xml")
        && let Ok(ncx) = read_zip_text(archive, &ncx_item.absolute_href)
        && let Ok(doc) = Document::parse(&ncx)
    {
        return Ok(doc
            .descendants()
            .filter(|node| node.tag_name().name() == "navPoint")
            .filter_map(|point| {
                let content = point
                    .descendants()
                    .find(|node| node.tag_name().name() == "content")?;
                let href = content.attribute("src")?;
                let title = point
                    .descendants()
                    .find(|node| node.tag_name().name() == "text")
                    .and_then(|node| node.text())
                    .map(|value| value.trim().to_string());
                Some(EpubLinkInfo {
                    href: resolve_zip_href(opf_dir, href),
                    media_type: mime_from_path(href),
                    title,
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }

    Ok(vec![])
}

fn epub_link_from_manifest(
    item: &EpubManifestItem,
    title: Option<String>,
    rels: Vec<String>,
) -> EpubLinkInfo {
    EpubLinkInfo {
        href: item.absolute_href.clone(),
        media_type: item.media_type.clone(),
        title,
        rels,
        properties: item.properties.clone(),
    }
}

