#[tauri::command]
fn startup_shell_ready(window: tauri::WebviewWindow) -> Result<(), String> {
    // The configured main window stays hidden until the zero-dependency HTML
    // shell has parsed. This handshake guarantees that Windows never exposes
    // WebView2's unpainted gray surface.
    window.show().map_err(|error| error.to_string())
}
