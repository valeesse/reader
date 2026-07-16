#[test]
#[ignore = "set ZENITH_TXT_PROBE to exercise a real TXT"]
fn probe_real_txt() {
    let path = std::path::PathBuf::from(std::env::var("ZENITH_TXT_PROBE").unwrap());
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    let target = root.join(path.file_name().unwrap());
    fs::copy(path, &target).unwrap();
    let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
    let book = registry.scan(|_| {}).unwrap().remove(0);
    let original_id = book.resource_id.clone();
    let renamed = root.join("renamed-real-probe.txt");
    fs::rename(&target, &renamed).unwrap();
    let renamed_book = registry.scan(|_| {}).unwrap().remove(0);
    assert_eq!(renamed_book.resource_id, original_id);
    let service = ReaderService::new(
        registry,
        temp.path().join("state"),
        temp.path().join("cache"),
    )
    .unwrap();
    let opened = service.open_txt(&renamed_book.resource_id).unwrap();
    assert!(opened.total_chars > TXT_CHAR_CHECKPOINT_INTERVAL);
    assert!(!opened.chapters.is_empty());
    assert!(
        !service
            .read_txt_window(&renamed_book.resource_id, &opened.session_id, 0, 4096)
            .unwrap()
            .text
            .is_empty()
    );
}

#[test]
#[ignore = "set ZENITH_EPUB_PROBE to exercise a real EPUB"]
fn probe_real_epub() {
    let path = std::path::PathBuf::from(std::env::var("ZENITH_EPUB_PROBE").unwrap());
    let (manifest, info, _) = epub::load_book(&path, "Probe").unwrap();
    assert!(!manifest.is_empty());
    assert!(!info.reading_order.is_empty());
}
