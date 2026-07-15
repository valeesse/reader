use super::*;
use encoding_rs::{GBK, UTF_16LE};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::{Seek, SeekFrom, Write},
    path::PathBuf,
    sync::{Arc, Barrier, Mutex},
};
use tempfile::tempdir;
use zip::ZipWriter;

#[test]
fn txt_index_and_window_reads_are_character_accurate() {
    let t = tempdir().unwrap();
    let p = t.path().join("book.txt");
    let text = format!(
        "第一章 序\n{}第二章 开始\n尾声🙂\n",
        "正文🙂alpha\n".repeat(900)
    );
    fs::write(&p, &text).unwrap();
    let (total, points, chapters) = txt::build_index(&p).unwrap();
    assert_eq!(total, text.chars().count());
    assert!(points.len() >= 3);
    assert!(chapters.iter().any(|v| v.title == "第二章 开始"));
    let c = TxtBookCache {
        signature: file_signature(&p).unwrap(),
        last_used_at: 0,
        active_sessions: HashSet::new(),
        data_path: p,
        total_chars: total,
        total_bytes: text.len() as u64,
        checkpoints: points,
        chapters,
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
fn epub_resource_cache_honors_lru_limits() {
    let t = tempdir().unwrap();
    let p = t.path().join("empty.epub");
    ZipWriter::new(File::create(&p).unwrap()).finish().unwrap();
    let mut c = EpubBookCache {
        signature: file_signature(&p).unwrap(),
        last_used_at: 0,
        active_sessions: HashSet::new(),
        info: EpubBookInfo {
            metadata: EpubMetadataInfo {
                title: "Test".into(),
                author: None,
                language: "en".into(),
                layout: "reflowable".into(),
                reading_progression: "ltr".into(),
            },
            reading_order: vec![],
            resources: vec![],
            toc: vec![],
        },
        manifest_items: vec![],
        resource_cache: HashMap::new(),
        resource_order: VecDeque::new(),
        resource_bytes: 0,
        archive: Arc::new(Mutex::new(
            zip::ZipArchive::new(File::open(p).unwrap()).unwrap(),
        )),
    };
    for (h, n) in [("a", 3), ("b", 4), ("c", 5)] {
        c.resource_bytes += n;
        c.resource_order.push_back(h.into());
        c.resource_cache.insert(
            h.into(),
            EpubCachedResource {
                bytes: Arc::from(vec![0; n]),
                media_type: "text/plain".into(),
            },
        );
    }
    epub::touch(&mut c, "a");
    epub::trim_resource_cache(&mut c, 2, 8);
    assert!(c.resource_cache.contains_key("a"));
    assert!(!c.resource_cache.contains_key("b"));
    assert!(c.resource_cache.contains_key("c"));
    assert_eq!(c.resource_bytes, 8);
}

#[test]
fn persistent_disk_cache_honors_budget() {
    let t = tempdir().unwrap();
    fs::write(t.path().join("a"), [1; 8]).unwrap();
    fs::write(t.path().join("b"), [2; 8]).unwrap();
    cache::trim_disk(t.path(), 8).unwrap();
    let n = fs::read_dir(t.path())
        .unwrap()
        .filter_map(Result::ok)
        .map(|e| e.metadata().unwrap().len())
        .sum::<u64>();
    assert!(n <= 8);
}

#[test]
fn concurrent_atomic_cache_writes_do_not_collide() {
    let temp = tempdir().unwrap();
    let target = temp.path().join("shared.cache");
    let barrier = Arc::new(Barrier::new(8));
    let threads = (0_u8..8)
        .map(|value| {
            let target = target.clone();
            let barrier = barrier.clone();
            std::thread::spawn(move || {
                barrier.wait();
                cache::write_atomic(&target, &[value; 128]).unwrap();
            })
        })
        .collect::<Vec<_>>();
    for thread in threads {
        thread.join().unwrap();
    }
    let bytes = fs::read(target).unwrap();
    assert_eq!(bytes.len(), 128);
    assert!(bytes.iter().all(|byte| *byte == bytes[0]));
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
    let (manifest, info) = epub::load_book(&path, "Probe").unwrap();
    assert!(!manifest.is_empty());
    assert!(!info.reading_order.is_empty());
}
