use base64::{Engine as _, engine::general_purpose};
use percent_encoding::percent_decode_str;
use reqwest::{Method, StatusCode, Url};
use roxmltree::Document;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicU64, Ordering},
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Manager};

include!("reader/startup_splash.rs");
include!("reader/model.rs");
include!("reader/library.rs");
include!("reader/windows_dialog.rs");
include!("reader/txt_commands.rs");
include!("reader/epub_commands.rs");
include!("reader/webdav_commands.rs");
include!("reader/book_metadata.rs");
include!("reader/cache_files.rs");
include!("reader/webdav.rs");
include!("reader/app.rs");
include!("reader/tests.rs");
