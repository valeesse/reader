mod atomic;
mod fingerprint;
mod model;
mod reader;
mod registry;

pub(crate) use atomic::replace_file;
pub use fingerprint::{BOOK_ID_VERSION, FINGERPRINT_VERSION, fingerprint_file};
pub use model::{Book, CoreError, ScanProgress};
pub use reader::*;
pub use registry::LibraryRegistry;
