use super::*;
use encoding_rs::{GBK, UTF_16LE};
use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::{Seek, SeekFrom, Write},
    path::PathBuf,
    sync::{Arc, Barrier, Mutex},
};
use tempfile::tempdir;
use zip::ZipWriter;

include!("tests/txt.rs");
include!("tests/cache.rs");
include!("tests/epub.rs");
include!("tests/probes.rs");
