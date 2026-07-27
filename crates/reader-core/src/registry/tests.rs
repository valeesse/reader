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
    assert_eq!(first.len(), 2);
    let previous_ids = first
        .iter()
        .map(|book| book.resource_id.clone())
        .collect::<std::collections::HashSet<_>>();
    fs::remove_file(root.join("duplicate.txt")).unwrap();
    fs::create_dir_all(root.join("moved")).unwrap();
    fs::rename(root.join("z/old.txt"), root.join("moved/new.txt")).unwrap();
    let second = registry.scan(|_| {}).unwrap();
    let id = second[0].resource_id.clone();
    assert!(previous_ids.contains(&id));
    assert!(registry.resolve(&id).unwrap().ends_with("new.txt"));
}

#[test]
fn replacing_content_keeps_book_identity_but_changes_content_identity() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    let state = temp.path().join("state");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("book.txt"), b"first complete edition").unwrap();
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();

    let first = registry.scan(|_| {}).unwrap().remove(0);
    fs::write(
        root.join("book.txt"),
        b"second complete edition with changes",
    )
    .unwrap();
    let second = registry.scan(|_| {}).unwrap().remove(0);

    assert_eq!(first.resource_id, second.resource_id);
    assert_ne!(first.content_id, second.content_id);
    assert_eq!(second.content_id, second.fingerprint);
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
    assert_eq!(books[0].relative_path, "verify.txt");
    assert_eq!(
        books[0].fingerprint,
        fingerprint_file(root.join("verify.txt")).unwrap()
    );
}

#[test]
fn batch_delete_removes_files_and_persisted_index_entries() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    let state = temp.path().join("state");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("one.txt"), b"one").unwrap();
    fs::write(root.join("two.txt"), b"two").unwrap();
    let mut registry = LibraryRegistry::open(&root, &state).unwrap();
    let books = registry.scan(|_| {}).unwrap();
    let deleted = books
        .iter()
        .find(|book| book.relative_path == "one.txt")
        .unwrap()
        .resource_id
        .clone();

    registry
        .delete_books(std::slice::from_ref(&deleted))
        .unwrap();

    assert!(!root.join("one.txt").exists());
    assert!(root.join("two.txt").exists());
    assert!(matches!(
        registry.resolve(&deleted),
        Err(CoreError::InvalidResourceId)
    ));
    let reopened = LibraryRegistry::open(&root, &state).unwrap();
    assert_eq!(reopened.books().len(), 1);
    assert_eq!(reopened.books()[0].relative_path, "two.txt");
}

#[test]
fn batch_delete_validates_every_id_before_removing_files() {
    let temp = tempdir().unwrap();
    let root = temp.path().join("books");
    fs::create_dir_all(&root).unwrap();
    fs::write(root.join("one.txt"), b"one").unwrap();
    let mut registry = LibraryRegistry::open(&root, temp.path().join("state")).unwrap();
    let id = registry.scan(|_| {}).unwrap()[0].resource_id.clone();

    assert!(registry.delete_books(&[id, "invalid".into()]).is_err());
    assert!(root.join("one.txt").exists());
}
