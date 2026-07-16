use crate::CoreError;
use std::{
    fs,
    path::{Component, Path},
    time::{SystemTime, UNIX_EPOCH},
};

pub(super) fn normalized_relative_path(root: &Path, path: &Path) -> Result<String, CoreError> {
    let relative = path.strip_prefix(root).map_err(|_| CoreError::UnsafePath)?;
    if relative
        .components()
        .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err(CoreError::UnsafePath);
    }
    let parts = relative
        .components()
        .map(|part| match part {
            Component::Normal(value) => value.to_str().ok_or(CoreError::UnsafePath),
            _ => Err(CoreError::UnsafePath),
        })
        .collect::<Result<Vec<_>, _>>()?;
    if parts.is_empty() {
        return Err(CoreError::UnsafePath);
    }
    Ok(parts.join("/"))
}

pub(super) fn supported_extension(path: &Path) -> Option<&'static str> {
    match path.extension()?.to_str()?.to_ascii_lowercase().as_str() {
        "epub" => Some("epub"),
        "txt" => Some("txt"),
        _ => None,
    }
}

pub(super) fn modified_ns(metadata: &fs::Metadata) -> u64 {
    metadata
        .modified()
        .unwrap_or(SystemTime::UNIX_EPOCH)
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos()
        .min(u128::from(u64::MAX)) as u64
}
