use serde::{Deserialize, Serialize};
use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FrontendLogEntry {
    pub timestamp: String,
    pub level: String,
    pub category: String,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn write_frontend_log(app: AppHandle, entry: FrontendLogEntry) -> Result<(), String> {
    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|error| format!("Failed to resolve app log directory: {error}"))?;

    create_dir_all(&log_dir)
        .map_err(|error| format!("Failed to create app log directory: {error}"))?;

    let date = entry.timestamp.get(0..10).unwrap_or("unknown-date");
    let log_file = log_dir.join(format!("frontend-{date}.log"));

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file)
        .map_err(|error| format!("Failed to open frontend log file: {error}"))?;

    let line = serde_json::to_string(&entry)
        .map_err(|error| format!("Failed to serialize frontend log entry: {error}"))?;

    writeln!(file, "{line}")
        .map_err(|error| format!("Failed to write frontend log entry: {error}"))?;

    Ok(())
}
