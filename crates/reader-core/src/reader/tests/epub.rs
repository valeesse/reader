#[test]
fn epub_zip_entry_over_budget_is_rejected() {
    let temp = tempdir().unwrap();
    let path = temp.path().join("large.epub");
    let mut zip = ZipWriter::new(File::create(&path).unwrap());
    let options = zip::write::SimpleFileOptions::default();
    zip.start_file("large.bin", options).unwrap();
    zip.write_all(&vec![0_u8; (EPUB_RESOURCE_MAX_BYTES + 1) as usize])
        .unwrap();
    zip.finish().unwrap();
    assert!(matches!(
        epub::load_book(&path, "Large"),
        Err(ReaderError::InvalidEpub(_))
    ));
}

#[test]
fn binary_payload_is_a_controlled_cache_file_and_prefetch_keeps_binary_out_of_lru() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    write_minimal_epub(&root.join("book.epub"));
    let state = temp.path().join("state");
    let cache_root = temp.path().join("cache");
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service = ReaderService::new(registry, &state, &cache_root).unwrap();
    let opened = service.open_epub(&id, "Fallback").unwrap();
    service
        .prefetch_epub_resources(
            &id,
            &opened.session_id,
            vec!["OEBPS/chapter.xhtml".into(), "OEBPS/image.png".into()],
        )
        .unwrap();
    {
        let books = service.epub_books.lock().unwrap();
        let book = books.get(&id).unwrap();
        assert!(book.resource_cache.contains_key("OEBPS/chapter.xhtml"));
        assert!(!book.resource_cache.contains_key("OEBPS/image.png"));
    }
    let payload = service
        .read_epub_resource(&id, &opened.session_id, "OEBPS/image.png")
        .unwrap();
    let path = PathBuf::from(payload.file_path.unwrap());
    assert!(path.is_file());
    assert!(
        fs::canonicalize(path)
            .unwrap()
            .starts_with(fs::canonicalize(cache_root).unwrap())
    );
}

#[test]
fn epub_position_counts_are_generated_lazily_and_reused_on_reopen() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    write_minimal_epub(&root.join("book.epub"));
    let state = temp.path().join("state");
    let cache_root = temp.path().join("cache");
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service = ReaderService::new(registry, &state, &cache_root).unwrap();

    let opened = service.open_epub(&id, "Fallback").unwrap();
    assert!(opened.position_counts.is_empty());
    let counts = service
        .epub_position_counts(&id, &opened.session_id)
        .unwrap();
    assert_eq!(counts.len(), 1);
    assert_eq!(counts[0].href, "OEBPS/chapter.xhtml");
    assert_eq!(counts[0].count, 1);
    service.close_epub(&id, &opened.session_id).unwrap();

    let reopened = service.open_epub(&id, "Fallback").unwrap();
    assert_eq!(reopened.position_counts, counts);
}

#[test]
fn cleared_cover_cache_is_sanitized_and_rebuilt_on_demand() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    let state = temp.path().join("state");
    let cache_root = temp.path().join("cache");
    fs::create_dir_all(&root).unwrap();
    write_minimal_epub(&root.join("book.epub"));
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service = ReaderService::new(registry, &state, &cache_root).unwrap();

    let scanned = service.scan(|_| {}).unwrap();
    let original_cover = PathBuf::from(scanned[0].cover.as_ref().unwrap());
    assert!(original_cover.is_file());
    service.clear_cache().unwrap();
    assert!(!original_cover.exists());
    assert!(service.books().unwrap()[0].cover.is_none());

    let rebuilt = service.cover(&id).unwrap();
    assert!(rebuilt.path.is_file());
    assert_eq!(rebuilt.path, original_cover);
    assert!(service.books().unwrap()[0].cover.is_some());
}

fn write_minimal_epub(path: &std::path::Path) {
    let mut zip = ZipWriter::new(File::create(path).unwrap());
    let options = zip::write::SimpleFileOptions::default();
    for (name, content) in [
        (
            "META-INF/container.xml",
            r#"<container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>"#,
        ),
        (
            "OEBPS/content.opf",
            r#"<package><metadata><title>Fixture</title></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="image" href="image.png" media-type="image/png" properties="cover-image"/></manifest><spine><itemref idref="chapter"/></spine></package>"#,
        ),
        ("OEBPS/chapter.xhtml", "<html><body>Chapter</body></html>"),
    ] {
        zip.start_file(name, options).unwrap();
        zip.write_all(content.as_bytes()).unwrap();
    }
    zip.start_file("OEBPS/image.png", options).unwrap();
    zip.write_all(&[0x89, b'P', b'N', b'G']).unwrap();
    zip.finish().unwrap();
}
