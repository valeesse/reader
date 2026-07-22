use crate::CoreError;
use sha2::{Digest, Sha256};
use std::{fs::File, io::Read, path::Path};

pub const FINGERPRINT_VERSION: &str = "sha256-full-v1";
pub const BOOK_ID_VERSION: &str = "book-v1";

pub fn fingerprint_file(path: impl AsRef<Path>) -> Result<String, CoreError> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }
    Ok(format!("{FINGERPRINT_VERSION}:{}", hex(&hasher.finalize())))
}

pub(crate) fn valid_resource_id(value: &str) -> bool {
    value
        .strip_prefix(&format!("{FINGERPRINT_VERSION}:"))
        .or_else(|| value.strip_prefix(&format!("{BOOK_ID_VERSION}:")))
        .is_some_and(|hex| {
            hex.len() == 64
                && hex
                    .bytes()
                    .all(|value| value.is_ascii_hexdigit() && !value.is_ascii_uppercase())
        })
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
