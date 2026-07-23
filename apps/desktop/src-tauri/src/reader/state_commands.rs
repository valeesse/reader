fn state_repository(state: &ReaderState) -> Result<Arc<reader_state::StateRepository>, String> {
    state.state.lock().map_err(|_| "状态仓库被占用".to_string())?
        .clone().ok_or_else(|| "状态仓库尚未初始化".to_string())
}

fn initialize_state(app: &AppHandle, state: &ReaderState) -> Result<(), String> {
    let path = app.path().app_data_dir().map_err(|error| error.to_string())?.join("reader-state-v1.sqlite3");
    let repository = Arc::new(reader_state::StateRepository::open(path).map_err(|error| error.to_string())?);
    *state.state.lock().map_err(|_| "状态仓库被占用".to_string())? = Some(repository);
    Ok(())
}

#[tauri::command]
async fn state_get(state: tauri::State<'_, ReaderState>) -> Result<serde_json::Value, String> {
    let repository = state_repository(&state)?;
    tauri::async_runtime::spawn_blocking(move || repository.get()).await
        .map_err(|error| error.to_string())?.map_err(|error| error.to_string())
}

#[tauri::command]
async fn state_get_progress(state: tauri::State<'_, ReaderState>, book_id: String) -> Result<serde_json::Value, String> {
    let repository = state_repository(&state)?;
    tauri::async_runtime::spawn_blocking(move || repository.get_progress(&book_id)).await
        .map_err(|error| error.to_string())?.map_err(|error| error.to_string())
}

#[tauri::command]
async fn state_put_section(
    state: tauri::State<'_, ReaderState>,
    section: String,
    value: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let repository = state_repository(&state)?;
    tauri::async_runtime::spawn_blocking(move || match section.as_str() {
        "lastRead" => repository.put_last_read(value),
        "progress" => repository.put_progress_map(value),
        _ => repository.put_section(&section, value),
    }).await.map_err(|error| error.to_string())?.map_err(|error| error.to_string())
}

#[tauri::command]
async fn state_put_reading(
    state: tauri::State<'_, ReaderState>,
    value: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let repository = state_repository(&state)?;
    tauri::async_runtime::spawn_blocking(move || repository.put_reading(value)).await
        .map_err(|error| error.to_string())?.map_err(|error| error.to_string())
}

