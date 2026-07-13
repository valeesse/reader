#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ReaderState::default())
        .setup(|app| {
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                let state = handle.state::<ReaderState>();
                let Ok(_txt_guard) = state.txt_books.lock() else {
                    return;
                };
                let Ok(_epub_guard) = state.epub_books.lock() else {
                    return;
                };
                let _ = trim_reader_disk_cache(&handle, reader_disk_cache_max_bytes());
            });
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_library,
            import_managed_books,
            identify_local_books,
            pick_book_files_fast,
            pick_library_directory_fast,
            open_txt_book,
            read_txt_preview,
            read_txt_window,
            close_txt_book,
            open_epub_book,
            read_epub_resource,
            prefetch_epub_resources,
            close_epub_book,
            reader_cache_stats,
            clear_reader_cache,
            authorize_export_path,
            write_binary_file,
            webdav_upload_snapshot,
            webdav_download_snapshot,
            webdav_list_books,
            webdav_cache_book,
            webdav_download_book_to_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
