use super::*;
use tempfile::tempdir;

#[test]
fn rename_and_move_keep_identity_and_duplicates_are_deterministic() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    let state = temp.path().join("state");
    fs::create_dir_all(root.join("z")).unwrap();
    fs::write(root.join("z/old.txt"), b"complete bytes").unwrap();
    fs::write(root.join("duplicate.txt"), b"complete bytes").unwrap();
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    let first = registry.scan(|_| {}).unwrap();
    assert_eq!(first.len(), 1);
    let id = first[0].resource_id.clone();
    assert!(registry.resolve(&id).unwrap().ends_with("duplicate.txt"));
    fs::remove_file(root.join("duplicate.txt")).unwrap();
    fs::create_dir_all(root.join("moved")).unwrap();
    fs::rename(root.join("z/old.txt"), root.join("moved/new.txt")).unwrap();
    let second = registry.scan(|_| {}).unwrap();
    assert_eq!(second[0].resource_id, id);
    assert!(registry.resolve(&id).unwrap().ends_with("new.txt"));
}

#[test]
fn resolve_rejects_bad_ids_and_tampered_traversal() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    let state = temp.path().join("state");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("book.txt"), b"book").unwrap();
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    registry.scan(|_| {}).unwrap();
    assert!(matches!(
        registry.resolve("../book.txt"),
        Err(CoreError::InvalidResourceId)
    ));
    let id = registry.books()[0].resource_id.clone();
    registry
        .index
        .resources
        .insert(id.clone(), "../outside.txt".into());
    assert!(matches!(registry.resolve(&id), Err(CoreError::UnsafePath)));
}

#[test]
fn scan_real_files_can_be_verified_without_fixture_books() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("verify.txt"), b"known full file").unwrap();
    let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
    let books = registry.scan(|_| {}).unwrap();
    assert_eq!(
        books[0].fingerprint,
        fingerprint_file(root.join("verify.txt")).unwrap()
    );
}
