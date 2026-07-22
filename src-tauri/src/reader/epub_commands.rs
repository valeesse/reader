#[tauri::command]
async fn open_epub_book(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    fallback_title: String,
) -> Result<reader_core::EpubOpenResult, String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || application.open_epub(&reader_contracts::EpubOpenRequest { resource_id, fallback_title }))
        .await
        .map_err(|error| format!("EPUB 打开任务中断: {error}"))?
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn read_epub_resource(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
    href: String,
) -> Result<reader_core::EpubResourcePayload, String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        application.read_epub(&reader_contracts::EpubReadRequest { resource_id, session_id, href })
    })
    .await
    .map_err(|error| format!("EPUB 资源读取任务中断: {error}"))?
    .map_err(|error| error.to_string())
}

#[tauri::command]
async fn prefetch_epub_resources(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
    hrefs: Vec<String>,
) -> Result<(), String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        application.prefetch_epub(reader_contracts::EpubPrefetchRequest { resource_id, session_id, hrefs })
    })
    .await
    .map_err(|error| format!("EPUB 预取任务中断: {error}"))?
    .map_err(|error| error.to_string())
}

#[tauri::command]
async fn epub_position_counts(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
) -> Result<Vec<reader_core::EpubPositionCount>, String> {
    let application = reader_application(&state)?;
    tauri::async_runtime::spawn_blocking(move || {
        application.epub_positions(&reader_contracts::SessionRequest { resource_id, session_id })
    })
    .await
    .map_err(|error| format!("EPUB 位置生成任务中断: {error}"))?
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn close_epub_book(
    state: tauri::State<'_, ReaderState>,
    resource_id: String,
    session_id: String,
) -> Result<(), String> {
    reader_application(&state)?
        .close_epub(&reader_contracts::SessionRequest { resource_id, session_id })
        .map_err(|error| error.to_string())
}
