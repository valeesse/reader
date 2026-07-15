use super::model::*;
use std::collections::{HashMap, HashSet};
pub(super) trait BookCacheState {
    fn signature(&self) -> FileSignature;
    fn last_used_at(&self) -> u128;
    fn set_last_used_at(&mut self, v: u128);
    fn sessions(&self) -> &HashSet<String>;
    fn sessions_mut(&mut self) -> &mut HashSet<String>;
}
macro_rules! impl_state {
    ($t:ty) => {
        impl BookCacheState for $t {
            fn signature(&self) -> FileSignature {
                self.signature
            }
            fn last_used_at(&self) -> u128 {
                self.last_used_at
            }
            fn set_last_used_at(&mut self, v: u128) {
                self.last_used_at = v
            }
            fn sessions(&self) -> &HashSet<String> {
                &self.active_sessions
            }
            fn sessions_mut(&mut self) -> &mut HashSet<String> {
                &mut self.active_sessions
            }
        }
    };
}
impl_state!(TxtBookCache);
impl_state!(EpubBookCache);
pub(super) fn requires_reload<T: BookCacheState>(
    m: &HashMap<String, T>,
    id: &str,
    s: FileSignature,
) -> bool {
    m.get(id).is_none_or(|v| v.signature() != s)
}
pub(super) fn start<T: BookCacheState>(v: &mut T, id: String) {
    v.sessions_mut().insert(id);
    v.set_last_used_at(now_millis())
}
pub(super) fn close<T: BookCacheState>(v: &mut T, id: &str) {
    v.sessions_mut().remove(id);
    v.set_last_used_at(now_millis())
}
pub(super) fn validate<T: BookCacheState>(
    v: &mut T,
    s: FileSignature,
    id: &str,
) -> Result<(), ReaderError> {
    if v.signature() != s || !v.sessions().contains(id) {
        return Err(ReaderError::InvalidSession);
    }
    v.set_last_used_at(now_millis());
    Ok(())
}
pub(super) fn trim<T: BookCacheState>(m: &mut HashMap<String, T>, limit: usize) {
    while m.len() > limit {
        let Some(id) = m
            .iter()
            .filter(|(_, v)| v.sessions().is_empty())
            .min_by_key(|(_, v)| v.last_used_at())
            .map(|(k, _)| k.clone())
        else {
            break;
        };
        m.remove(&id);
    }
}
