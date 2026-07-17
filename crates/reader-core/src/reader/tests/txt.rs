#[test]
fn txt_index_and_window_reads_are_character_accurate() {
    let t = tempdir().unwrap();
    let p = t.path().join("book.txt");
    let text = format!(
        "第一章 序\n{}第二章 开始\n尾声🙂\n",
        "正文🙂alpha\n".repeat(900)
    );
    fs::write(&p, &text).unwrap();
    let (total, points, chapters, line_breaks) = txt::build_index(&p).unwrap();
    assert_eq!(total, text.chars().count());
    assert!(points.len() >= 3);
    assert!(chapters.iter().any(|v| v.title == "第二章 开始"));
    assert!(line_breaks.windows(2).all(|pair| pair[0] < pair[1]));
    assert_eq!(line_breaks.last().copied(), Some(total));
    let c = TxtBookCache {
        signature: file_signature(&p).unwrap(),
        last_used_at: 0,
        active_sessions: HashSet::new(),
        data_path: p,
        total_chars: total,
        total_bytes: text.len() as u64,
        checkpoints: points,
        chapters,
        line_breaks,
    };
    let start = TXT_CHAR_CHECKPOINT_INTERVAL - 17;
    let end = TXT_CHAR_CHECKPOINT_INTERVAL + 31;
    assert_eq!(
        txt::read_range(&c, start, end).unwrap(),
        text.chars()
            .skip(start)
            .take(end - start)
            .collect::<String>()
    );
}

#[test]
fn invalid_utf8_is_rejected_by_streaming_index() {
    let t = tempdir().unwrap();
    let p = t.path().join("bad.txt");
    fs::write(&p, [0xD6, 0xD0, 0xCE, 0xC4, b'\n']).unwrap();
    assert!(matches!(
        txt::build_index(&p),
        Err(txt::TxtIndexError::InvalidUtf8)
    ));
}

#[test]
fn gbk_txt_cache_is_streamed_to_utf8() {
    let t = tempdir().unwrap();
    let source = t.path().join("source");
    let target = t.path().join("target");
    let expected = "第一章 中文测试\n正文\n";
    let (encoded, _, _) = GBK.encode(expected);
    fs::write(&source, encoded.as_ref()).unwrap();
    txt::write_utf8_cache(File::open(source).unwrap(), &target, Some(GBK)).unwrap();
    assert_eq!(fs::read_to_string(target).unwrap(), expected);
}

#[test]
fn utf16_bom_is_detected_and_streamed() {
    let t = tempdir().unwrap();
    let source = t.path().join("source");
    let target = t.path().join("target");
    let expected = "第一章 UTF-16\n正文\n";
    let mut bytes = vec![0xFF, 0xFE];
    bytes.extend(expected.encode_utf16().flat_map(|v| v.to_le_bytes()));
    fs::write(&source, bytes).unwrap();
    assert!(matches!(
        txt::detect_bom(&source).unwrap(),
        Some(txt::TxtBom::Utf16Le)
    ));
    let mut f = File::open(source).unwrap();
    f.seek(SeekFrom::Start(2)).unwrap();
    txt::write_utf8_cache(f, &target, Some(UTF_16LE)).unwrap();
    assert_eq!(fs::read_to_string(target).unwrap(), expected);
}

#[test]
fn stale_txt_session_cannot_read() {
    let t = tempdir().unwrap();
    let root = t.path().join("books");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("book.txt"), "第一章\n会话隔离\n").unwrap();
    let mut registry = LibraryRegistry::open(&root, t.path().join("state")).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service =
        ReaderService::new(registry, t.path().join("state"), t.path().join("cache")).unwrap();
    let opened = service.open_txt(&id).unwrap();
    assert!(service.read_txt_window(&id, "stale", 0, 3).is_err());
    assert_eq!(
        service
            .read_txt_window(&id, &opened.session_id, 0, 3)
            .unwrap()
            .text,
        "第一章"
    );
}

#[test]
fn clear_cache_cannot_remove_active_txt_data_during_open() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    let expected = "第一章 并发\n".repeat(20_000);
    let (encoded, _, _) = GBK.encode(&expected);
    fs::write(root.join("book.txt"), encoded.as_ref()).unwrap();
    let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service = Arc::new(
        ReaderService::new(
            registry,
            temp.path().join("state"),
            temp.path().join("cache"),
        )
        .unwrap(),
    );
    let open_service = service.clone();
    let open_id = id.clone();
    let opener = std::thread::spawn(move || open_service.open_txt(&open_id).unwrap());
    let clear_service = service.clone();
    let clearer = std::thread::spawn(move || clear_service.clear_cache());
    let opened = opener.join().unwrap();
    let clear_result = clearer.join().unwrap();
    if clear_result.is_err() {
        assert!(matches!(clear_result, Err(ReaderError::Busy)));
    }
    let window = service
        .read_txt_window(&id, &opened.session_id, 0, 6)
        .unwrap();
    assert_eq!(window.text, "第一章 并发");
}

#[test]
fn cleared_transcoded_txt_cache_is_rebuilt_on_reopen() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    let expected = "第一章 缓存重建\n中文正文\n";
    let (encoded, _, _) = GBK.encode(expected);
    fs::write(root.join("book.txt"), encoded.as_ref()).unwrap();
    let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();
    let service = ReaderService::new(
        registry,
        temp.path().join("state"),
        temp.path().join("cache"),
    )
    .unwrap();

    let first = service.open_txt(&id).unwrap();
    service.close_txt(&id, &first.session_id).unwrap();
    service.clear_cache().unwrap();

    let reopened = service.open_txt(&id).unwrap();
    assert_eq!(
        service
            .read_txt_window(&id, &reopened.session_id, 0, expected.chars().count())
            .unwrap()
            .text,
        expected
    );
}
