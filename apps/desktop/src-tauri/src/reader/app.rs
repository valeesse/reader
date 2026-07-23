#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let process_started_at = std::time::Instant::now();
    // The real WebView becomes visible only after index.html has parsed its
    // zero-dependency shell. A second native splash window would add a
    // distracting environment-window transition without accelerating cargo.
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
        let queued = queue_open_file_arguments(
            &app.state::<ReaderState>(),
            args.into_iter().map(PathBuf::from),
            Path::new(&cwd),
        );
        if queued == 0 {
            return;
        }
        if let Some(window) = app.get_webview_window("main") {
            let was_visible = window.is_visible().unwrap_or(false);
            let _ = window.unminimize();
            if was_visible {
                let _ = window.set_focus();
            }
        }
        let _ = app.emit(OPEN_FILES_AVAILABLE_EVENT, ());
    }));

    builder
        .manage(ReaderState::default())
        .setup(move |app| {
            let library_started_at = std::time::Instant::now();
            initialize_state(app.handle(), &app.state::<ReaderState>())?;
            initialize_library(app.handle(), &app.state::<ReaderState>())?;
            let startup_cwd = std::env::current_dir().unwrap_or_default();
            queue_open_file_arguments(
                &app.state::<ReaderState>(),
                std::env::args_os().skip(1).map(PathBuf::from),
                &startup_cwd,
            );
            eprintln!(
                "[startup] native library ready in {} ms; process elapsed {} ms",
                library_started_at.elapsed().as_millis(),
                process_started_at.elapsed().as_millis(),
            );

            // Cache trimming walks every cached file and can take seconds on a
            // large library. It is maintenance work, never a window-creation
            // prerequisite, so run it after the WebView has started loading.
            if let Ok(application) = reader_application(&app.state::<ReaderState>()) {
                tauri::async_runtime::spawn_blocking(move || {
                    let started_at = std::time::Instant::now();
                    match application.maintain_disk_cache() {
                        Ok(()) => eprintln!(
                            "[startup] background cache maintenance finished in {} ms",
                            started_at.elapsed().as_millis(),
                        ),
                        Err(error) => eprintln!("[startup] background cache maintenance failed: {error}"),
                    }
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            startup_shell_ready,
            drain_pending_open_files,
            file_association_status,
            open_file_association_settings,
            reader_font_packs,
            download_reader_font_pack,
            remove_reader_font_pack,
            scan_library,
            import_managed_books,
            open_external_books,
            reader_books,
            reader_cover,
            get_library_root,
            set_library_root,
            pick_library_directory_fast,
            open_txt_book,
            read_txt_preview,
            read_txt_window,
            close_txt_book,
            open_epub_book,
            read_epub_resource,
            prefetch_epub_resources,
            epub_position_counts,
            close_epub_book,
            reader_cache_stats,
            clear_reader_cache,
            state_get,
            state_get_progress,
            state_put_section,
            state_put_reading,
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
