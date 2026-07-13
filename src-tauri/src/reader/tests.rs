#[cfg(test)]
mod tests {
    use super::*;
    use zip::ZipWriter;

    fn test_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "zenith-reader-{name}-{}-{}",
            std::process::id(),
            now_millis_u128()
        ))
    }

    #[test]
    fn txt_index_and_window_reads_are_character_accurate() {
        let path = test_path("utf8-window.txt");
        let text = format!(
            "第一章 序\n{}第二章 开始\n尾声🙂\n",
            "正文🙂alpha\n".repeat(900)
        );
        fs::write(&path, text.as_bytes()).unwrap();

        let (total_chars, checkpoints, chapters) = build_txt_index(&path).unwrap();
        assert_eq!(total_chars, text.chars().count());
        assert!(checkpoints.len() >= 3);
        assert_eq!(
            chapters.first().map(|chapter| chapter.title.as_str()),
            Some("第一章 序")
        );
        assert!(
            chapters
                .iter()
                .any(|chapter| chapter.title == "第二章 开始")
        );

        let cache = TxtBookCache {
            signature: file_signature(path.to_str().unwrap()).unwrap(),
            last_used_at: 0,
            active_sessions: HashSet::new(),
            data_path: path.clone(),
            total_chars,
            total_bytes: text.len() as u64,
            checkpoints,
            chapters,
        };
        let start = TXT_CHAR_CHECKPOINT_INTERVAL - 17;
        let end = TXT_CHAR_CHECKPOINT_INTERVAL + 31;
        let expected = text
            .chars()
            .skip(start)
            .take(end - start)
            .collect::<String>();
        assert_eq!(read_txt_char_range(&cache, start, end).unwrap(), expected);

        fs::remove_file(path).unwrap();
    }

    #[test]
    fn txt_index_rejects_non_utf8_input_without_retaining_the_book() {
        let path = test_path("invalid-utf8.txt");
        fs::write(&path, [0xD6, 0xD0, 0xCE, 0xC4, b'\n']).unwrap();
        assert!(matches!(
            build_txt_index(&path),
            Err(TxtIndexError::InvalidUtf8)
        ));
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn gbk_txt_cache_is_streamed_to_utf8() {
        let source_path = test_path("gbk-source.txt");
        let target_path = test_path("gbk-target.txt");
        let expected = "第一章 中文测试\n正文\n";
        let (encoded, _, _) = GBK.encode(expected);
        fs::write(&source_path, encoded.as_ref()).unwrap();

        write_utf8_txt_cache(File::open(&source_path).unwrap(), &target_path, Some(GBK)).unwrap();
        let decoded = fs::read_to_string(&target_path).unwrap();
        assert_eq!(decoded, expected);

        fs::remove_file(source_path).unwrap();
        fs::remove_file(target_path).unwrap();
    }

    #[test]
    fn utf16_bom_is_detected_and_streamed_to_utf8() {
        let source_path = test_path("utf16-source.txt");
        let target_path = test_path("utf16-target.txt");
        let expected = "第一章 UTF-16\n正文\n";
        let mut bytes = vec![0xFF, 0xFE];
        bytes.extend(expected.encode_utf16().flat_map(|unit| unit.to_le_bytes()));
        fs::write(&source_path, bytes).unwrap();
        assert!(matches!(
            detect_txt_bom(source_path.to_str().unwrap()).unwrap(),
            Some(TxtBom::Utf16Le)
        ));

        let mut source = File::open(&source_path).unwrap();
        source.seek(SeekFrom::Start(2)).unwrap();
        write_utf8_txt_cache(source, &target_path, Some(UTF_16LE)).unwrap();
        assert_eq!(fs::read_to_string(&target_path).unwrap(), expected);

        fs::remove_file(source_path).unwrap();
        fs::remove_file(target_path).unwrap();
    }

    #[test]
    fn stale_txt_session_cannot_read_a_newer_session() {
        let path = test_path("session.txt");
        let text = "第一章\n会话隔离\n";
        fs::write(&path, text).unwrap();
        let (total_chars, checkpoints, chapters) = build_txt_index(&path).unwrap();
        let path_string = path.to_string_lossy().to_string();
        let mut sessions = HashSet::new();
        sessions.insert("current".to_string());
        let state = ReaderState::default();
        state.txt_books.lock().unwrap().insert(
            path_string.clone(),
            TxtBookCache {
                signature: file_signature(&path_string).unwrap(),
                last_used_at: 0,
                active_sessions: sessions,
                data_path: path.clone(),
                total_chars,
                total_bytes: text.len() as u64,
                checkpoints,
                chapters,
            },
        );

        assert!(read_txt_window_blocking(&state, &path_string, "stale", 0, 3).is_err());
        assert_eq!(
            read_txt_window_blocking(&state, &path_string, "current", 0, 3)
                .unwrap()
                .text,
            "第一章"
        );

        drop(state);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn epub_resource_cache_honors_lru_count_and_byte_limits() {
        let path = test_path("empty.epub");
        ZipWriter::new(File::create(&path).unwrap())
            .finish()
            .unwrap();
        let mut cache = EpubBookCache {
            signature: file_signature(path.to_str().unwrap()).unwrap(),
            last_used_at: 0,
            active_sessions: HashSet::new(),
            info: EpubBookInfo {
                metadata: EpubMetadataInfo {
                    title: "Test".to_string(),
                    author: None,
                    language: "en".to_string(),
                    layout: "reflowable".to_string(),
                    reading_progression: "ltr".to_string(),
                },
                reading_order: vec![],
                resources: vec![],
                toc: vec![],
            },
            manifest_items: vec![],
            resource_cache: HashMap::new(),
            resource_order: VecDeque::new(),
            resource_bytes: 0,
            archive: open_epub_archive(path.to_str().unwrap()).unwrap(),
        };

        for (href, size) in [("a", 3usize), ("b", 4), ("c", 5)] {
            let resource = EpubCachedResource {
                bytes: Arc::from(vec![0u8; size]),
                media_type: "text/plain".to_string(),
            };
            cache.resource_bytes += size;
            cache.resource_order.push_back(href.to_string());
            cache.resource_cache.insert(href.to_string(), resource);
        }
        touch_epub_resource(&mut cache, "a");
        trim_epub_resource_cache(&mut cache, 2, 8);
        assert!(cache.resource_cache.contains_key("a"));
        assert!(cache.resource_cache.contains_key("c"));
        assert!(!cache.resource_cache.contains_key("b"));
        assert_eq!(cache.resource_bytes, 8);

        drop(cache);
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn webdav_paths_must_stay_on_a_segment_boundary() {
        let base = Url::parse("https://example.com/dav/books/").unwrap();
        let valid = Url::parse("https://example.com/dav/books/series/book.epub").unwrap();
        let sibling = Url::parse("https://example.com/dav/books-private/book.epub").unwrap();

        assert_eq!(
            webdav_remote_path_from_url(&base, &valid).unwrap(),
            "series/book.epub"
        );
        assert!(webdav_remote_path_from_url(&base, &sibling).is_err());
    }

    #[test]
    #[ignore = "set ZENITH_EPUB_PROBE to exercise a real EPUB"]
    fn probe_real_epub_from_environment() {
        let path = std::env::var("ZENITH_EPUB_PROBE").expect("ZENITH_EPUB_PROBE is required");
        let started = std::time::Instant::now();
        let (manifest, info) = load_epub_book(&path, "Probe").unwrap();
        let first_href = info
            .reading_order
            .first()
            .map(|link| link.href.as_str())
            .expect("EPUB reading order must not be empty");
        let mut archive = open_epub_archive(&path).unwrap();
        let (_, first_resource) = read_zip_bytes_flexible(&mut archive, first_href).unwrap();
        eprintln!(
            "EPUB probe: {} ms, {} manifest items, {} spine items, first resource {} bytes",
            started.elapsed().as_millis(),
            manifest.len(),
            info.reading_order.len(),
            first_resource.len()
        );
    }
}
