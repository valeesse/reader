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
}
