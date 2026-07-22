use rusqlite::{Connection, OptionalExtension, params};
use serde_json::{Map, Value};
use std::{path::Path, sync::Mutex};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StateError {
    #[error("state is busy")]
    Busy,
    #[error("invalid state: {0}")]
    Invalid(String),
    #[error(transparent)]
    Database(#[from] rusqlite::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
}

pub struct StateRepository {
    connection: Mutex<Connection>,
}

impl StateRepository {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, StateError> {
        if let Some(parent) = path.as_ref().parent() {
            std::fs::create_dir_all(parent)
                .map_err(|error| StateError::Invalid(error.to_string()))?;
        }
        let connection = Connection::open(path)?;
        connection.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA foreign_keys=ON;
             CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
             CREATE TABLE IF NOT EXISTS sections(name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL DEFAULT 0);
             CREATE TABLE IF NOT EXISTS progress(book_id TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
             INSERT OR REPLACE INTO metadata(key, value) VALUES('schema_version', '1');"
        )?;
        Ok(Self {
            connection: Mutex::new(connection),
        })
    }

    pub fn get(&self) -> Result<Value, StateError> {
        let connection = self.lock()?;
        let mut result = Map::new();
        {
            let mut statement = connection.prepare("SELECT name, value FROM sections")?;
            let rows = statement.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?;
            for row in rows {
                let (name, value) = row?;
                result.insert(name, serde_json::from_str(&value)?);
            }
        }
        let mut progress = Map::new();
        {
            let mut statement = connection.prepare("SELECT book_id, value FROM progress")?;
            let rows = statement.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?;
            for row in rows {
                let (book_id, value) = row?;
                progress.insert(book_id, serde_json::from_str(&value)?);
            }
        }
        result.insert("progress".into(), Value::Object(progress));
        Ok(Value::Object(result))
    }

    pub fn get_progress(&self, book_id: &str) -> Result<Value, StateError> {
        let connection = self.lock()?;
        let value = connection
            .query_row(
                "SELECT value FROM progress WHERE book_id=?1",
                [book_id],
                |row| row.get::<_, String>(0),
            )
            .optional()?;
        value
            .map(|value| serde_json::from_str(&value))
            .transpose()
            .map(|value| value.unwrap_or(Value::Null))
            .map_err(Into::into)
    }

    pub fn put_section(&self, name: &str, value: Value) -> Result<Value, StateError> {
        if !matches!(name, "settings" | "series" | "lastRead") {
            return Err(StateError::Invalid(format!("unsupported section: {name}")));
        }
        match name {
            "settings" if !value.is_object() => {
                return Err(StateError::Invalid("settings must be an object".into()));
            }
            "series" if !value.is_array() => {
                return Err(StateError::Invalid("series must be an array".into()));
            }
            "lastRead" if !value.is_object() && !value.is_string() => {
                return Err(StateError::Invalid(
                    "lastRead must be an object or string".into(),
                ));
            }
            _ => {}
        }
        let updated_at = timestamp(&value);
        let connection = self.lock()?;
        connection.execute(
            "INSERT INTO sections(name,value,updated_at) VALUES(?1,?2,?3)
             ON CONFLICT(name) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            params![name, serde_json::to_string(&value)?, updated_at],
        )?;
        drop(connection);
        self.get()
    }

    pub fn put_progress_map(&self, input: Value) -> Result<Value, StateError> {
        let values = input
            .as_object()
            .ok_or_else(|| StateError::Invalid("progress must be an object".into()))?;
        let mut connection = self.lock()?;
        let transaction = connection.transaction()?;
        for (book_id, value) in values {
            if !value.is_object() {
                return Err(StateError::Invalid(format!(
                    "progress for {book_id} must be an object"
                )));
            }
            upsert_progress(&transaction, book_id, value)?;
        }
        transaction.commit()?;
        drop(connection);
        self.get()
    }

    pub fn put_reading(&self, input: Value) -> Result<Value, StateError> {
        let object = input
            .as_object()
            .ok_or_else(|| StateError::Invalid("reading state must be an object".into()))?;
        let progress = object
            .get("progress")
            .ok_or_else(|| StateError::Invalid("reading progress is required".into()))?;
        let book_id = progress
            .get("bookId")
            .and_then(Value::as_str)
            .ok_or_else(|| StateError::Invalid("progress bookId is required".into()))?;
        let mut connection = self.lock()?;
        let transaction = connection.transaction()?;
        upsert_progress(&transaction, book_id, progress)?;
        if let Some(last_read) = object.get("lastRead").filter(|value| !value.is_null()) {
            upsert_section_if_newer(&transaction, "lastRead", last_read)?;
        }
        transaction.commit()?;
        drop(connection);
        self.get()
    }

    pub fn put_last_read(&self, value: Value) -> Result<Value, StateError> {
        let mut connection = self.lock()?;
        let transaction = connection.transaction()?;
        upsert_section_if_newer(&transaction, "lastRead", &value)?;
        transaction.commit()?;
        drop(connection);
        self.get()
    }

    fn lock(&self) -> Result<std::sync::MutexGuard<'_, Connection>, StateError> {
        self.connection.lock().map_err(|_| StateError::Busy)
    }
}

fn upsert_progress(
    connection: &Connection,
    book_id: &str,
    value: &Value,
) -> Result<(), StateError> {
    let incoming = timestamp(value);
    let current = connection
        .query_row(
            "SELECT updated_at FROM progress WHERE book_id=?1",
            [book_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()?
        .unwrap_or_default();
    if incoming >= current {
        connection.execute(
            "INSERT INTO progress(book_id,value,updated_at) VALUES(?1,?2,?3)
             ON CONFLICT(book_id) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            params![book_id, serde_json::to_string(value)?, incoming],
        )?;
    }
    Ok(())
}

fn upsert_section_if_newer(
    connection: &Connection,
    name: &str,
    value: &Value,
) -> Result<(), StateError> {
    let incoming = timestamp(value);
    let current = connection
        .query_row(
            "SELECT updated_at FROM sections WHERE name=?1",
            [name],
            |row| row.get::<_, i64>(0),
        )
        .optional()?
        .unwrap_or_default();
    if incoming >= current {
        connection.execute(
            "INSERT INTO sections(name,value,updated_at) VALUES(?1,?2,?3)
             ON CONFLICT(name) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            params![name, serde_json::to_string(value)?, incoming],
        )?;
    }
    Ok(())
}

fn timestamp(value: &Value) -> i64 {
    value
        .get("updatedAt")
        .and_then(Value::as_i64)
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reading_update_is_atomic_and_stale_safe() {
        let temp = tempfile::tempdir().unwrap();
        let state = StateRepository::open(temp.path().join("state.sqlite3")).unwrap();
        state.put_reading(serde_json::json!({"progress":{"bookId":"a","updatedAt":2},"lastRead":{"bookId":"a","updatedAt":2}})).unwrap();
        state.put_reading(serde_json::json!({"progress":{"bookId":"a","updatedAt":1},"lastRead":{"bookId":"b","updatedAt":1}})).unwrap();
        let value = state.get().unwrap();
        assert_eq!(value["progress"]["a"]["updatedAt"], 2);
        assert_eq!(value["lastRead"]["bookId"], "a");
    }
}
