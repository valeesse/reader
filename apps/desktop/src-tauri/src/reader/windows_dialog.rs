#[cfg(windows)]
fn wide_null(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

#[cfg(windows)]
fn pick_library_directory_fast_blocking() -> Result<Option<String>, String> {
    use windows_sys::Win32::{
        System::Com::CoTaskMemFree,
        UI::Shell::{
            BIF_NEWDIALOGSTYLE, BIF_RETURNONLYFSDIRS, BROWSEINFOW, SHBrowseForFolderW,
            SHGetPathFromIDListW,
        },
    };

    let title = wide_null("选择本地书库文件夹");
    let mut display_name = vec![0u16; 32_768];
    let info = BROWSEINFOW {
        pszDisplayName: display_name.as_mut_ptr(),
        lpszTitle: title.as_ptr(),
        ulFlags: BIF_NEWDIALOGSTYLE | BIF_RETURNONLYFSDIRS,
        ..Default::default()
    };
    let item = unsafe { SHBrowseForFolderW(&info) };
    if item.is_null() {
        return Ok(None);
    }
    let mut path = vec![0u16; 32_768];
    let resolved = unsafe { SHGetPathFromIDListW(item, path.as_mut_ptr()) } != 0;
    unsafe { CoTaskMemFree(item.cast()) };
    if !resolved {
        return Err("Windows 文件夹选择器无法解析所选路径".to_string());
    }
    let length = path.iter().position(|unit| *unit == 0).unwrap_or(path.len());
    Ok(Some(String::from_utf16_lossy(&path[..length])))
}

#[tauri::command]
async fn pick_library_directory_fast() -> Result<Option<String>, String> {
    #[cfg(windows)]
    {
        tauri::async_runtime::spawn_blocking(pick_library_directory_fast_blocking)
            .await
            .map_err(|error| format!("Windows 文件夹选择任务中断: {error}"))?
    }
    #[cfg(not(windows))]
    {
        Err("fast-dialog-unavailable".to_string())
    }
}
