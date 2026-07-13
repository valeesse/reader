#[cfg(windows)]
fn wide_null(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

#[cfg(windows)]
fn parse_legacy_file_selection(buffer: &[u16]) -> Vec<String> {
    let parts = buffer
        .split(|unit| *unit == 0)
        .take_while(|part| !part.is_empty())
        .map(String::from_utf16_lossy)
        .collect::<Vec<_>>();
    if parts.len() <= 1 {
        return parts;
    }
    let directory = PathBuf::from(&parts[0]);
    parts[1..]
        .iter()
        .map(|file_name| directory.join(file_name).to_string_lossy().to_string())
        .collect()
}

#[cfg(windows)]
fn pick_book_files_fast_blocking(initial_directory: Option<String>) -> Result<Vec<String>, String> {
    use windows_sys::Win32::UI::Controls::Dialogs::{
        CommDlgExtendedError, GetOpenFileNameW, OFN_ALLOWMULTISELECT, OFN_DONTADDTORECENT,
        OFN_EXPLORER, OFN_FILEMUSTEXIST, OFN_HIDEREADONLY, OFN_NOCHANGEDIR,
        OFN_NONETWORKBUTTON, OFN_PATHMUSTEXIST, OPENFILENAMEW,
    };

    let title = wide_null("导入 EPUB / TXT");
    let filter = wide_null("EPUB / TXT\0*.epub;*.txt\0所有文件\0*.*");
    let initial_directory = initial_directory.filter(|path| Path::new(path).is_dir());
    let initial_directory_wide = initial_directory.as_deref().map(wide_null);
    let mut selection = vec![0u16; 1024 * 1024];
    let mut dialog = OPENFILENAMEW {
        lStructSize: std::mem::size_of::<OPENFILENAMEW>() as u32,
        lpstrFilter: filter.as_ptr(),
        lpstrFile: selection.as_mut_ptr(),
        nMaxFile: selection.len() as u32,
        lpstrInitialDir: initial_directory_wide
            .as_ref()
            .map_or(std::ptr::null(), |value| value.as_ptr()),
        lpstrTitle: title.as_ptr(),
        Flags: OFN_ALLOWMULTISELECT
            | OFN_DONTADDTORECENT
            | OFN_EXPLORER
            | OFN_FILEMUSTEXIST
            | OFN_HIDEREADONLY
            | OFN_NOCHANGEDIR
            | OFN_NONETWORKBUTTON
            | OFN_PATHMUSTEXIST,
        ..Default::default()
    };
    let accepted = unsafe { GetOpenFileNameW(&mut dialog) } != 0;
    if accepted {
        return Ok(parse_legacy_file_selection(&selection));
    }
    let error = unsafe { CommDlgExtendedError() };
    if error == 0 {
        Ok(Vec::new())
    } else {
        Err(format!("Windows 文件选择器错误: {error}"))
    }
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
async fn pick_book_files_fast(initial_directory: Option<String>) -> Result<Vec<String>, String> {
    #[cfg(windows)]
    {
        tauri::async_runtime::spawn_blocking(move || {
            pick_book_files_fast_blocking(initial_directory)
        })
        .await
        .map_err(|error| format!("Windows 文件选择任务中断: {error}"))?
    }
    #[cfg(not(windows))]
    {
        let _ = initial_directory;
        Err("fast-dialog-unavailable".to_string())
    }
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
