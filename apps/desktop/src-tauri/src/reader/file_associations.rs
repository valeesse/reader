#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileAssociationFormatStatus {
    extension: &'static str,
    registered: bool,
    is_default: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileAssociationStatus {
    platform: &'static str,
    supported: bool,
    can_manage: bool,
    formats: Vec<FileAssociationFormatStatus>,
}

#[tauri::command]
fn file_association_status() -> FileAssociationStatus {
    #[cfg(windows)]
    {
        let executable = std::env::current_exe().ok().and_then(|path| fs::canonicalize(path).ok());
        FileAssociationStatus {
            platform: "windows",
            supported: true,
            can_manage: true,
            formats: vec![
                windows_file_association(
                    "epub",
                    &["Zenith Reader EPUB", "Zenith Reader.epub"],
                    executable.as_deref(),
                ),
                windows_file_association(
                    "txt",
                    &["Zenith Reader TXT", "Zenith Reader.txt"],
                    executable.as_deref(),
                ),
            ],
        }
    }
    #[cfg(not(windows))]
    FileAssociationStatus {
        platform: if cfg!(target_os = "macos") { "macos" } else if cfg!(target_os = "linux") { "linux" } else { "unknown" },
        supported: false,
        can_manage: false,
        formats: vec![
            FileAssociationFormatStatus { extension: "epub", registered: false, is_default: false },
            FileAssociationFormatStatus { extension: "txt", registered: false, is_default: false },
        ],
    }
}

#[cfg(windows)]
fn windows_file_association(
    extension: &'static str,
    prog_ids: &[&str],
    current_executable: Option<&Path>,
) -> FileAssociationFormatStatus {
    let associated = windows_associated_executable(&format!(".{extension}"));
    FileAssociationFormatStatus {
        extension,
        registered: prog_ids.iter().any(|prog_id| windows_prog_id_registered(prog_id)),
        is_default: associated.as_deref().zip(current_executable)
            .map(|(left, right)| left.to_string_lossy().eq_ignore_ascii_case(&right.to_string_lossy()))
            .unwrap_or(false),
    }
}

#[cfg(windows)]
fn windows_associated_executable(extension: &str) -> Option<PathBuf> {
    use windows_sys::Win32::UI::Shell::{ASSOCF_NOTRUNCATE, ASSOCSTR_EXECUTABLE, AssocQueryStringW};
    let extension = wide_null(extension);
    let mut output = vec![0u16; 32_768];
    let mut length = output.len() as u32;
    let result = unsafe {
        AssocQueryStringW(
            ASSOCF_NOTRUNCATE,
            ASSOCSTR_EXECUTABLE,
            extension.as_ptr(),
            std::ptr::null(),
            output.as_mut_ptr(),
            &mut length,
        )
    };
    if result < 0 {
        return None;
    }
    let length = output.iter().position(|unit| *unit == 0).unwrap_or(output.len());
    fs::canonicalize(PathBuf::from(String::from_utf16_lossy(&output[..length]))).ok()
}

#[cfg(windows)]
fn windows_prog_id_registered(prog_id: &str) -> bool {
    use windows_sys::Win32::System::Registry::{
        HKEY_CLASSES_ROOT, HKEY, KEY_READ, RegCloseKey, RegOpenKeyExW,
    };
    let key_path = wide_null(&format!(r"{prog_id}\shell\open\command"));
    let mut key: HKEY = std::ptr::null_mut();
    let result = unsafe { RegOpenKeyExW(HKEY_CLASSES_ROOT, key_path.as_ptr(), 0, KEY_READ, &mut key) };
    if result == 0 && !key.is_null() {
        unsafe { RegCloseKey(key) };
        true
    } else {
        false
    }
}

#[tauri::command]
fn open_file_association_settings() -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::{
            Shell::ShellExecuteW,
            WindowsAndMessaging::SW_SHOWNORMAL,
        };
        let operation = wide_null("open");
        let uri = wide_null("ms-settings:defaultapps");
        let result = unsafe {
            ShellExecuteW(
                std::ptr::null_mut(),
                operation.as_ptr(),
                uri.as_ptr(),
                std::ptr::null(),
                std::ptr::null(),
                SW_SHOWNORMAL,
            )
        };
        if result as isize > 32 {
            Ok(())
        } else {
            Err("无法打开 Windows 默认应用设置".into())
        }
    }
    #[cfg(not(windows))]
    {
        Err("当前平台暂未实现文件关联设置".into())
    }
}
