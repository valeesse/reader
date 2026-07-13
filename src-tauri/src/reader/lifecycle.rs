trait BookCacheState {
    fn signature(&self) -> FileSignature;
    fn last_used_at(&self) -> u128;
    fn set_last_used_at(&mut self, value: u128);
    fn active_sessions(&self) -> &HashSet<String>;
    fn active_sessions_mut(&mut self) -> &mut HashSet<String>;
}

macro_rules! impl_book_cache_state {
    ($cache:ty) => {
        impl BookCacheState for $cache {
            fn signature(&self) -> FileSignature {
                self.signature
            }

            fn last_used_at(&self) -> u128 {
                self.last_used_at
            }

            fn set_last_used_at(&mut self, value: u128) {
                self.last_used_at = value;
            }

            fn active_sessions(&self) -> &HashSet<String> {
                &self.active_sessions
            }

            fn active_sessions_mut(&mut self) -> &mut HashSet<String> {
                &mut self.active_sessions
            }
        }
    };
}

impl_book_cache_state!(TxtBookCache);
impl_book_cache_state!(EpubBookCache);

fn cache_requires_reload<T: BookCacheState>(
    books: &HashMap<String, T>,
    path: &str,
    signature: FileSignature,
) -> bool {
    books
        .get(path)
        .map(|cache| cache.signature() != signature)
        .unwrap_or(true)
}

fn start_book_session<T: BookCacheState>(cache: &mut T, session_id: String) {
    cache.active_sessions_mut().insert(session_id);
    cache.set_last_used_at(now_millis_u128());
}

fn close_book_session<T: BookCacheState>(cache: &mut T, session_id: &str) {
    cache.active_sessions_mut().remove(session_id);
    cache.set_last_used_at(now_millis_u128());
}

fn validate_book_session<T: BookCacheState>(
    cache: &mut T,
    signature: FileSignature,
    session_id: &str,
    format: &str,
) -> Result<(), String> {
    if cache.signature() != signature {
        return Err(format!("{format} 文件已变更，请重新打开"));
    }
    if !cache.active_sessions().contains(session_id) {
        return Err(format!("{format} 阅读会话已失效"));
    }
    cache.set_last_used_at(now_millis_u128());
    Ok(())
}

fn trim_book_cache<T: BookCacheState>(books: &mut HashMap<String, T>, limit: usize) {
    while books.len() > limit {
        let Some(path) = books
            .iter()
            .filter(|(_, cache)| cache.active_sessions().is_empty())
            .min_by_key(|(_, cache)| cache.last_used_at())
            .map(|(path, _)| path.clone())
        else {
            break;
        };
        books.remove(&path);
    }
}

