use super::model::*;
use std::collections::{HashMap, HashSet};
const SESSION_TTL_MS: u128 = 6 * 60 * 60 * 1000;
const MAX_SESSIONS_PER_BOOK: usize = 16;
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
    prune_book_sessions(v, now_millis());
    while v.sessions().len() >= MAX_SESSIONS_PER_BOOK {
        let Some(oldest) = v
            .sessions()
            .iter()
            .min_by_key(|session| session_started_at(session))
            .cloned()
        else {
            break;
        };
        v.sessions_mut().remove(&oldest);
    }
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
    prune_book_sessions(v, now_millis());
    if v.signature() != s || !v.sessions().contains(id) {
        return Err(ReaderError::InvalidSession);
    }
    v.set_last_used_at(now_millis());
    Ok(())
}
pub(super) fn trim<T: BookCacheState>(m: &mut HashMap<String, T>, limit: usize) {
    prune_sessions(m, now_millis());
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

pub(super) fn prune_sessions<T: BookCacheState>(m: &mut HashMap<String, T>, now: u128) {
    for value in m.values_mut() {
        prune_book_sessions(value, now);
    }
}

fn prune_book_sessions<T: BookCacheState>(value: &mut T, now: u128) {
    value
        .sessions_mut()
        .retain(|session| now.saturating_sub(session_started_at(session)) <= SESSION_TTL_MS);
}

fn session_started_at(session: &str) -> u128 {
    session
        .split('-')
        .nth(1)
        .and_then(|value| value.parse().ok())
        .unwrap_or_default()
}

#[cfg(test)]
mod session_tests {
    use super::*;

    #[test]
    fn session_timestamp_is_parsed_from_wire_id() {
        assert_eq!(session_started_at("epub-12345-7"), 12345);
        assert_eq!(session_started_at("invalid"), 0);
    }
}
