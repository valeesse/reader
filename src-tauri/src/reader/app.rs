pub fn run() {
    tauri::Builder::default()
        .manage(ReaderState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_library,
            open_txt_book,
            read_txt_window,
            close_txt_book,
            open_epub_book,
            read_epub_resource,
            prefetch_epub_resources,
            close_epub_book,
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

