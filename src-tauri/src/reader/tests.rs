#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn webdav_paths_must_stay_on_a_segment_boundary() {
        let base = Url::parse("https://example.com/dav/books/").unwrap();
        let valid = Url::parse("https://example.com/dav/books/series/book.epub").unwrap();
        let sibling = Url::parse("https://example.com/dav/books-private/book.epub").unwrap();
        assert_eq!(webdav_remote_path_from_url(&base, &valid).unwrap(), "series/book.epub");
        assert!(webdav_remote_path_from_url(&base, &sibling).is_err());
    }

    #[test]
    fn full_fingerprint_is_path_independent() {
        let root = std::env::temp_dir().join(format!("zenith-fingerprint-{}", now_millis_u128()));
        fs::create_dir_all(&root).unwrap();
        let first = root.join("first.txt"); let second = root.join("second.txt");
        fs::write(&first, b"same complete content").unwrap(); fs::write(&second, b"same complete content").unwrap();
        assert_eq!(book_fingerprint(&first).unwrap(), book_fingerprint(&second).unwrap());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn repeated_external_open_reuses_the_imported_book() {
        let temp = std::env::temp_dir().join(format!("zenith-external-open-{}", now_millis_u128()));
        let root = temp.join("library");
        let state_dir = temp.join("state");
        let cache_dir = temp.join("cache");
        let source = temp.join("source.txt");
        fs::create_dir_all(&root).unwrap();
        fs::write(&source, "第一章\n不会重复导入\n").unwrap();
        let registry = reader_core::LibraryRegistry::open(&root, &state_dir).unwrap();
        let reader = Arc::new(reader_core::ReaderService::new(registry, &state_dir, &cache_dir).unwrap());
        let application = Arc::new(reader_application::ReaderApplication::new(reader));

        let first = import_external_books_into_library(&application, &root, std::slice::from_ref(&source)).unwrap();
        let second = import_external_books_into_library(&application, &root, std::slice::from_ref(&source)).unwrap();
        let books = application.scan(|_| {}).unwrap();

        assert_eq!(first.len(), 1);
        assert_eq!(second.len(), 1);
        assert_eq!(first[0].id, second[0].id);
        assert_eq!(books.len(), 1);
        fs::remove_dir_all(temp).unwrap();
    }

    #[test]
    fn pending_file_queue_deduplicates_the_same_path() {
        let temp = std::env::temp_dir().join(format!("zenith-open-queue-{}", now_millis_u128()));
        fs::create_dir_all(&temp).unwrap();
        let source = temp.join("queued.epub");
        fs::write(&source, b"not parsed while queueing").unwrap();
        let state = ReaderState::default();

        let queued = queue_open_file_arguments(
            &state,
            [source.clone(), source.clone()],
            &temp,
        );

        assert_eq!(queued, 1);
        assert_eq!(state.pending_open_files.lock().unwrap().len(), 1);
        fs::remove_dir_all(temp).unwrap();
    }
}
