use flate2::read::GzDecoder;
use std::io::Read;

struct ReaderFontPackDefinition {
    id: &'static str,
    label: &'static str,
    family: &'static str,
    upstream_family: &'static str,
    version: &'static str,
    url: &'static str,
    sha256: &'static str,
    css_entry: &'static str,
    font_entry_prefix: &'static str,
    font_output_directory: &'static str,
    license_entry: &'static str,
    source: &'static str,
    keep_weight_400_only: bool,
}

const READER_FONT_PACKS: [ReaderFontPackDefinition; 2] = [
    ReaderFontPackDefinition {
        id: "wenkai",
        label: "霞鹜文楷 Screen",
        family: "Zenith LXGW WenKai",
        upstream_family: "LXGW WenKai Screen R",
        version: "1.7.0",
        url: "https://registry.npmjs.org/lxgw-wenkai-screen-webfont/-/lxgw-wenkai-screen-webfont-1.7.0.tgz",
        sha256: "89640826257035cd9529bb308726c366d85343b71537279a616ba5f2d15e9f85",
        css_entry: "package/lxgwwenkaigbscreenr.css",
        font_entry_prefix: "package/files/lxgwwenkaigbscreenr-subset-",
        font_output_directory: "files",
        license_entry: "package/OFL.txt",
        source: "lxgw-wenkai-screen-webfont",
        keep_weight_400_only: false,
    },
    ReaderFontPackDefinition {
        id: "yuan",
        label: "霞鹜 975 圆体",
        family: "Zenith LXGW 975 Yuan",
        upstream_family: "LXGW 975 Yuan SC",
        version: "1.0.0",
        url: "https://registry.npmjs.org/@free-fonts/lxgw-975-yuan/-/lxgw-975-yuan-1.0.0.tgz",
        sha256: "0ebbac8bb3758b619a233e4279d6f2d0888146b627e9038bf8070f499ae60c7d",
        css_entry: "package/lxgw-975-yuan.css",
        font_entry_prefix: "package/fonts/LXGW975YuanSC-400-",
        font_output_directory: "fonts",
        license_entry: "package/LICENSE",
        source: "@free-fonts/lxgw-975-yuan",
        keep_weight_400_only: true,
    },
];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReaderFontPackStatus {
    id: &'static str,
    label: &'static str,
    family: &'static str,
    version: &'static str,
    source: &'static str,
    installed: bool,
    bytes: u64,
    css: Option<String>,
    root_path: Option<String>,
}

fn reader_font_pack_definition(id: &str) -> Result<&'static ReaderFontPackDefinition, String> {
    READER_FONT_PACKS.iter().find(|pack| pack.id == id).ok_or_else(|| "未知字体包".to_string())
}

fn reader_font_pack_root(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app.path().app_cache_dir().map_err(|error| error.to_string())?.join("reader-fonts"))
}

fn reader_font_pack_status(
    root: &Path,
    definition: &'static ReaderFontPackDefinition,
) -> ReaderFontPackStatus {
    let pack_root = root.join(definition.id);
    let css_path = pack_root.join("style.css");
    let css = fs::read_to_string(&css_path).ok();
    let installed = css.is_some();
    ReaderFontPackStatus {
        id: definition.id,
        label: definition.label,
        family: definition.family,
        version: definition.version,
        source: definition.source,
        installed,
        bytes: if installed { directory_bytes(&pack_root) } else { 0 },
        css,
        root_path: installed.then(|| pack_root.to_string_lossy().into_owned()),
    }
}

#[tauri::command]
fn reader_font_packs(app: AppHandle) -> Result<Vec<ReaderFontPackStatus>, String> {
    let root = reader_font_pack_root(&app)?;
    Ok(READER_FONT_PACKS.iter().map(|pack| reader_font_pack_status(&root, pack)).collect())
}

#[tauri::command]
async fn download_reader_font_pack(app: AppHandle, id: String) -> Result<ReaderFontPackStatus, String> {
    let definition = reader_font_pack_definition(&id)?;
    let root = reader_font_pack_root(&app)?;
    if root.join(definition.id).join("style.css").is_file() {
        return Ok(reader_font_pack_status(&root, definition));
    }
    let response = reqwest::Client::new()
        .get(definition.url)
        .send()
        .await
        .map_err(|error| format!("下载字体包失败: {error}"))?
        .error_for_status()
        .map_err(|error| format!("下载字体包失败: {error}"))?;
    let archive = response.bytes().await.map_err(|error| format!("读取字体包失败: {error}"))?.to_vec();
    let digest = Sha256::digest(&archive).iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    if digest != definition.sha256 {
        return Err("字体包完整性校验失败".into());
    }
    let root_for_task = root.clone();
    tauri::async_runtime::spawn_blocking(move || install_reader_font_pack(&root_for_task, definition, &archive))
        .await
        .map_err(|error| format!("安装字体包任务中断: {error}"))??;
    Ok(reader_font_pack_status(&root, definition))
}

#[tauri::command]
fn remove_reader_font_pack(app: AppHandle, id: String) -> Result<Vec<ReaderFontPackStatus>, String> {
    let definition = reader_font_pack_definition(&id)?;
    let root = reader_font_pack_root(&app)?;
    let target = root.join(definition.id);
    if target.exists() {
        fs::remove_dir_all(&target).map_err(|error| format!("删除字体包失败: {error}"))?;
    }
    reader_font_packs(app)
}

fn install_reader_font_pack(
    root: &Path,
    definition: &ReaderFontPackDefinition,
    archive: &[u8],
) -> Result<(), String> {
    fs::create_dir_all(root).map_err(|error| format!("创建字体缓存目录失败: {error}"))?;
    let target = root.join(definition.id);
    let temporary = root.join(format!(
        ".{}-{}-{}.downloading",
        definition.id,
        std::process::id(),
        TEMP_FILE_COUNTER.fetch_add(1, Ordering::Relaxed),
    ));
    fs::create_dir_all(temporary.join(definition.font_output_directory))
        .map_err(|error| format!("创建字体包临时目录失败: {error}"))?;
    let result = extract_reader_font_pack(&temporary, definition, archive);
    if let Err(error) = result {
        let _ = fs::remove_dir_all(&temporary);
        return Err(error);
    }
    if target.exists() {
        fs::remove_dir_all(&target).map_err(|error| format!("替换字体包失败: {error}"))?;
    }
    fs::rename(&temporary, &target).map_err(|error| format!("提交字体包失败: {error}"))
}

fn extract_reader_font_pack(
    output: &Path,
    definition: &ReaderFontPackDefinition,
    archive: &[u8],
) -> Result<(), String> {
    let decoder = GzDecoder::new(archive);
    let mut archive = tar::Archive::new(decoder);
    let mut css = None;
    let mut font_count = 0usize;
    let mut license_written = false;
    for entry in archive.entries().map_err(|error| format!("读取字体包目录失败: {error}"))? {
        let mut entry = entry.map_err(|error| format!("读取字体包条目失败: {error}"))?;
        let path = entry.path().map_err(|error| format!("字体包路径无效: {error}"))?;
        let path = path.to_string_lossy().replace('\\', "/");
        if path == definition.css_entry {
            let mut value = String::new();
            entry.read_to_string(&mut value).map_err(|error| format!("读取字体样式失败: {error}"))?;
            css = Some(value);
        } else if path == definition.license_entry {
            let mut file = File::create(output.join("LICENSE.txt"))
                .map_err(|error| format!("创建字体许可证失败: {error}"))?;
            std::io::copy(&mut entry, &mut file).map_err(|error| format!("写入字体许可证失败: {error}"))?;
            license_written = true;
        } else if path.starts_with(definition.font_entry_prefix) && path.ends_with(".woff2") {
            let name = Path::new(&path).file_name().and_then(|value| value.to_str())
                .ok_or_else(|| "字体包文件名无效".to_string())?;
            let mut file = File::create(output.join(definition.font_output_directory).join(name))
                .map_err(|error| format!("创建 WOFF2 字体失败: {error}"))?;
            std::io::copy(&mut entry, &mut file).map_err(|error| format!("写入 WOFF2 字体失败: {error}"))?;
            font_count += 1;
        }
    }
    let mut css = css.ok_or_else(|| "字体包缺少样式表".to_string())?;
    if definition.keep_weight_400_only {
        css = keep_font_weight_400(&css);
    }
    css = css.replace(definition.upstream_family, definition.family);
    if font_count == 0 || !license_written {
        return Err("字体包内容不完整".into());
    }
    fs::write(output.join("style.css"), css).map_err(|error| format!("写入字体样式失败: {error}"))
}

fn keep_font_weight_400(css: &str) -> String {
    let header = css.split("@font-face").next().unwrap_or_default();
    let mut output = String::from(header);
    for block in css.split("@font-face").skip(1) {
        let Some(end) = block.find('}') else { continue };
        let body = &block[..=end];
        if body.contains("font-weight: 400;") {
            output.push_str("@font-face");
            output.push_str(body);
            output.push('\n');
        }
    }
    output
}

fn directory_bytes(root: &Path) -> u64 {
    let Ok(entries) = fs::read_dir(root) else { return 0 };
    entries.flatten().map(|entry| {
        let path = entry.path();
        if path.is_dir() { directory_bytes(&path) } else { entry.metadata().map(|value| value.len()).unwrap_or(0) }
    }).sum()
}
