use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use tokio::time::{Duration, sleep};

#[derive(Default)]
pub struct StartupState {
    pub native_ready: bool,
    pub frontend_ready: bool,
    pub main_shown: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupProgressPayload {
    pub step: String,
    pub message_key: String,
    pub progress: u8,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrontendBootstrapResult {
    pub auth_status: String,
}

pub fn emit_startup_failed(app: &AppHandle, error: &str) -> Result<(), String> {
    eprintln!("[Startup] Failed: {error}");
    emit_progress(app, "failed", "startup.failed", 100)
}

pub async fn run_native_startup_tasks(app: AppHandle) -> Result<(), String> {
    println!("[Startup] Native startup tasks started.");

    emit_progress(&app, "launcher", "startup.initializing", 5)?;
    sleep(Duration::from_millis(400)).await;

    check_launcher_updates(&app).await?;
    check_game_environment(&app).await?;
    connect_to_services(&app).await?;

    emit_progress(&app, "native", "startup.nativeReady", 70)?;

    mark_native_ready(&app)?;
    try_show_main_window(&app)?;

    println!("[Startup] Native startup tasks completed.");
    Ok(())
}

#[tauri::command]
pub async fn complete_frontend_bootstrap(
    app: AppHandle,
    webview_window: WebviewWindow,
    result: FrontendBootstrapResult,
) -> Result<(), String> {
    if webview_window.label() != "main" {
        println!(
            "[Startup] Ignored frontend bootstrap from window={}",
            webview_window.label()
        );

        return Ok(());
    }

    println!(
        "[Startup] Frontend bootstrap completed with auth_status={}",
        result.auth_status
    );

    mark_frontend_ready(&app)?;
    try_show_main_window(&app)?;

    Ok(())
}

async fn check_launcher_updates(app: &AppHandle) -> Result<(), String> {
    println!("[Startup] Checking launcher updates.");
    emit_progress(app, "updates", "startup.checkingUpdates", 20)?;
    sleep(Duration::from_millis(900)).await;

    println!("[Startup] No launcher update available.");
    emit_progress(app, "updates", "startup.noUpdateAvailable", 35)?;
    sleep(Duration::from_millis(250)).await;

    Ok(())
}

async fn check_game_environment(app: &AppHandle) -> Result<(), String> {
    println!("[Startup] Checking game environment.");
    emit_progress(app, "game", "startup.checkingGame", 50)?;
    sleep(Duration::from_millis(700)).await;

    Ok(())
}

async fn connect_to_services(app: &AppHandle) -> Result<(), String> {
    println!("[Startup] Connecting to native services.");
    emit_progress(app, "services", "startup.connectingServices", 62)?;
    sleep(Duration::from_millis(650)).await;

    Ok(())
}

fn emit_progress(
    app: &AppHandle,
    step: &str,
    message_key: &str,
    progress: u8,
) -> Result<(), String> {
    println!(
        "[Startup] Progress emitted: step={step}, message_key={message_key}, progress={progress}"
    );

    app.emit(
        "startup://progress",
        StartupProgressPayload {
            step: step.to_string(),
            message_key: message_key.to_string(),
            progress,
        },
    )
    .map_err(|error| format!("Failed to emit startup progress: {error}"))
}

fn mark_native_ready(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<StartupState>>();

    let mut startup_state = state
        .lock()
        .map_err(|_| "Failed to lock startup state.".to_string())?;

    startup_state.native_ready = true;

    println!(
        "[Startup] State changed: native_ready={}, frontend_ready={}, main_shown={}",
        startup_state.native_ready, startup_state.frontend_ready, startup_state.main_shown
    );

    Ok(())
}

fn mark_frontend_ready(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<StartupState>>();

    let mut startup_state = state
        .lock()
        .map_err(|_| "Failed to lock startup state.".to_string())?;

    startup_state.frontend_ready = true;

    println!(
        "[Startup] State changed: native_ready={}, frontend_ready={}, main_shown={}",
        startup_state.native_ready, startup_state.frontend_ready, startup_state.main_shown
    );

    Ok(())
}

fn try_show_main_window(app: &AppHandle) -> Result<(), String> {
    println!("[Startup] Trying to show main window.");

    if !should_show_main_window(app)? {
        println!("[Startup] Main window not ready to be shown yet.");
        return Ok(());
    }

    match show_main_window(app) {
        Ok(()) => Ok(()),
        Err(error) => {
            reset_main_shown_flag(app)?;
            Err(error)
        }
    }
}

fn should_show_main_window(app: &AppHandle) -> Result<bool, String> {
    let state = app.state::<Mutex<StartupState>>();

    let mut startup_state = state
        .lock()
        .map_err(|_| "Failed to lock startup state.".to_string())?;

    println!(
        "[Startup] Current state before show: native_ready={}, frontend_ready={}, main_shown={}",
        startup_state.native_ready, startup_state.frontend_ready, startup_state.main_shown
    );

    if startup_state.main_shown {
        return Ok(false);
    }

    if !startup_state.native_ready || !startup_state.frontend_ready {
        return Ok(false);
    }

    startup_state.main_shown = true;

    Ok(true)
}

fn reset_main_shown_flag(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<StartupState>>();

    let mut startup_state = state
        .lock()
        .map_err(|_| "Failed to lock startup state.".to_string())?;

    startup_state.main_shown = false;

    println!("[Startup] Main shown flag reset after show failure.");
    Ok(())
}

fn show_main_window(app: &AppHandle) -> Result<(), String> {
    println!("[Startup] Showing main window.");

    let main_window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window not found.".to_string())?;

    if let Some(splashscreen_window) = app.get_webview_window("splashscreen") {
        println!("[Startup] Closing splashscreen window.");
        splashscreen_window
            .close()
            .map_err(|error| format!("Failed to close splashscreen window: {error}"))?;
    } else {
        println!("[Startup] Splashscreen window already closed or not found.");
    }

    main_window
        .show()
        .map_err(|error| format!("Failed to show main window: {error}"))?;

    main_window
        .set_focus()
        .map_err(|error| format!("Failed to focus main window: {error}"))?;

    println!("[Startup] Main window is visible and focused.");
    Ok(())
}
