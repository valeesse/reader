use super::{package::LoadedEpubBook, *};
use crate::reader::cache;
use std::fs;

pub(super) fn load_persistent(
    c: &ReaderConfig,
    id: &str,
    sig: FileSignature,
) -> Option<Result<LoadedEpubBook, ReaderError>> {
    let v = serde_json::from_slice::<PersistentEpubBookCache>(
        &fs::read(cache::epub_metadata(c, id).ok()?).ok()?,
    )
    .ok()?;
    if v.version != PERSISTENT_CACHE_VERSION || v.resource_id != id || v.signature != sig {
        return None;
    }
    Some(Ok((v.manifest_items, v.info, v.position_counts)))
}

pub(super) fn save_persistent(c: &ReaderConfig, id: &str, v: &EpubBookCache) {
    let p = PersistentEpubBookCache {
        version: PERSISTENT_CACHE_VERSION,
        resource_id: id.into(),
        signature: v.signature,
        info: v.info.clone(),
        manifest_items: v.manifest_items.clone(),
        position_counts: v.position_counts.clone(),
    };
    if let (Ok(path), Ok(bytes)) = (cache::epub_metadata(c, id), serde_json::to_vec(&p)) {
        let _ = cache::write_atomic(&path, &bytes);
    }
}
