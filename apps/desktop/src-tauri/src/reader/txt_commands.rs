fn reader_application(state: &ReaderState) -> Result<Arc<reader_application::ReaderApplication>, String> {
    state
        .application
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
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.open_txt(&reader_contracts::ResourceRequest { resource_id }))
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
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.txt_preview(&reader_contracts::TxtPreviewRequest { resource_id, max_chars }))
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
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        application.read_txt(&reader_contracts::TxtWindowRequest { resource_id, session_id, start, end })
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
    reader_application(&state)?
        .close_txt(&reader_contracts::SessionRequest { resource_id, session_id })
        .map_err(|error| error.to_string())
}
