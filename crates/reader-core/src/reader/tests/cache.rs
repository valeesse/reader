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
        position_counts: Vec::new(),
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
