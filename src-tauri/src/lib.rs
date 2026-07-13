use base64::{Engine as _, engine::general_purpose};
use encoding_rs::{GBK, UTF_8, UTF_16BE, UTF_16LE};
use encoding_rs_io::DecodeReaderBytesBuilder;
use percent_encoding::percent_decode_str;
use reqwest::{Method, StatusCode, Url};
use roxmltree::Document;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::{BufWriter, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicU64, Ordering},
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Manager};
use walkdir::WalkDir;
use zip::ZipArchive;

include!("reader/model.rs");
include!("reader/lifecycle.rs");
include!("reader/library.rs");
include!("reader/windows_dialog.rs");
include!("reader/txt_commands.rs");
include!("reader/epub_commands.rs");
include!("reader/webdav_commands.rs");
include!("reader/txt_cache.rs");
include!("reader/txt_index.rs");
include!("reader/epub_publication.rs");
include!("reader/epub_resources.rs");
include!("reader/epub_archive.rs");
include!("reader/epub_metadata.rs");
include!("reader/book_metadata.rs");
include!("reader/cache_files.rs");
include!("reader/webdav.rs");
include!("reader/app.rs");
include!("reader/tests.rs");
