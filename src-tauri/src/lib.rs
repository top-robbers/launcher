#[cfg(not(target_os = "windows"))]
compile_error!("Top Robbers Launcher only supports Windows.");

mod logger;
mod startup;

use std::sync::Mutex;
use tauri::{Manager, async_runtime::spawn};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(startup::StartupState::default()))
        .setup(|app| {
            println!("[Launcher] Tauri setup started.");

            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path")
                .join("stronghold-salt.txt");

            println!("[Launcher] Stronghold salt path: {}", salt_path.display());

            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            let app_handle = app.handle().clone();

            spawn(async move {
                if let Err(error) = startup::run_native_startup_tasks(app_handle.clone()).await {
                    let _ = startup::emit_startup_failed(&app_handle, &error);
                }
            });

            println!("[Launcher] Tauri setup completed.");
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            startup::complete_frontend_bootstrap,
            logger::write_frontend_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
