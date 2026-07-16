use std::{
    fs, io,
    path::Path,
    sync::{
        Mutex,
        atomic::{AtomicU64, Ordering},
    },
};

static REPLACE_COUNTER: AtomicU64 = AtomicU64::new(1);
static REPLACE_LOCK: Mutex<()> = Mutex::new(());

pub(crate) fn replace_file(temp: &Path, target: &Path) -> io::Result<()> {
    let _guard = REPLACE_LOCK
        .lock()
        .map_err(|_| io::Error::other("file replacement lock poisoned"))?;
    if !target.exists() {
        return fs::rename(temp, target);
    }
    let backup = target.with_extension(format!(
        "backup-{}-{}",
        std::process::id(),
        REPLACE_COUNTER.fetch_add(1, Ordering::Relaxed)
    ));
    let _ = fs::remove_file(&backup);
    fs::rename(target, &backup)?;
    match fs::rename(temp, target) {
        Ok(()) => {
            let _ = fs::remove_file(backup);
            Ok(())
        }
        Err(error) => {
            let _ = fs::rename(backup, target);
            Err(error)
        }
    }
}
