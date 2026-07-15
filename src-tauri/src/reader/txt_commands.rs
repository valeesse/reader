fn reader_service(state: &ReaderState) -> Result<Arc<reader_core::ReaderService>, String> {
    state
        .reader
        .lock()
        .map_err(|_| "阅读服务被占用".to_string())?
        .clone()
        .ok_or_else(|| "尚未设置书库根目录".to_string())
}

#[tauri::command]
async fn open_txt_book(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
) -> Result<reader_core::TxtBookInfo, String> {
    let reader = reader_service(&state)?;
    tauri::async_runtime::spawn_blocking(move || reader.open_txt(&resource_id))
        .await
        .map_err(|error| format!("TXT 打开任务中断: {error}"))?
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn read_txt_preview(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    max_chars: usize,
) -> Result<reader_core::TxtPreview, String> {
    let reader = reader_service(&state)?;
    tauri::async_runtime::spawn_blocking(move || reader.txt_preview(&resource_id, max_chars))
        .await
        .map_err(|error| format!("TXT 预读任务中断: {error}"))?
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn read_txt_window(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
    start: usize,
    end: usize,
) -> Result<reader_core::TxtTextWindow, String> {
    let reader = reader_service(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        reader.read_txt_window(&resource_id, &session_id, start, end)
    })
    .await
    .map_err(|error| format!("TXT 窗口读取任务中断: {error}"))?
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn close_txt_book(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
) -> Result<(), String> {
    reader_service(&state)?
        .close_txt(&resource_id, &session_id)
        .map_err(|error| error.to_string())
}
