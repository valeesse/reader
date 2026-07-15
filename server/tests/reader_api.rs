use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use std::{fs, io::Write, path::Path};
use tempfile::TempDir;
use tower::ServiceExt;
use zenith_reader_server::{ServerConfig, build_router};
use zip::{ZipWriter, write::SimpleFileOptions};

fn app(temp: &TempDir) -> axum::Router {
    let books = temp.path().join("books");
    fs::create_dir_all(&books).unwrap();
    build_router(ServerConfig {
        library_dir: books,
        state_dir: temp.path().join("state"),
        cache_dir: temp.path().join("cache"),
        dist_dir: temp.path().join("dist"),
    })
    .unwrap()
}

async fn request(app: &axum::Router, method: &str, uri: &str, body: Value) -> (StatusCode, Value) {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method(method)
                .uri(uri)
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    let status = response.status();
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let value = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).unwrap()
    };
    (status, value)
}

async fn scan(app: &axum::Router) -> Vec<Value> {
    assert_eq!(
        request(app, "POST", "/api/rescan", Value::Null).await.0,
        StatusCode::ACCEPTED
    );
    for _ in 0..100 {
        let (_, status) = request(app, "GET", "/api/scan/status", Value::Null).await;
        if status["running"] == false {
            break;
        }
        tokio::time::sleep(std::time::Duration::from_millis(10)).await;
    }
    request(app, "GET", "/api/books", Value::Null)
        .await
        .1
        .as_array()
        .unwrap()
        .clone()
}

#[tokio::test]
async fn txt_open_window_and_stale_session_are_enforced() {
    let temp = TempDir::new().unwrap();
    fs::create_dir_all(temp.path().join("books")).unwrap();
    fs::write(
        temp.path().join("books/story.txt"),
        "第一章 开始\n正文🙂alpha\n第二章 继续\n结尾",
    )
    .unwrap();
    let app = app(&temp);
    let books = scan(&app).await;
    let id = books[0]["resourceId"].as_str().unwrap();
    let (status, opened) = request(&app, "POST", "/api/txt/open", json!({"resourceId": id})).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(opened["chapters"][0]["title"], "第一章 开始");
    let session = opened["sessionId"].as_str().unwrap();
    let (status, window) = request(
        &app,
        "POST",
        "/api/txt/read",
        json!({"resourceId": id, "sessionId": session, "start": 0, "end": 6}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(window["text"], "第一章 开始");
    assert_eq!(
        request(
            &app,
            "POST",
            "/api/txt/read",
            json!({"resourceId": id, "sessionId": "stale", "start": 0, "end": 2})
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
}

#[tokio::test]
async fn epub_open_toc_and_resources_use_the_shared_reader() {
    let temp = TempDir::new().unwrap();
    let books_dir = temp.path().join("books");
    fs::create_dir_all(&books_dir).unwrap();
    write_epub(&books_dir.join("minimal.epub"));
    let app = app(&temp);
    let books = scan(&app).await;
    assert_eq!(books[0]["title"], "Fixture Book");
    assert_eq!(books[0]["author"], "Tester");
    assert_eq!(books[0]["seriesName"], "Fixture Series");
    assert!(
        books[0]["cover"]
            .as_str()
            .unwrap()
            .starts_with("/api/covers?resourceId=")
    );
    let cover_response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri(books[0]["cover"].as_str().unwrap())
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(cover_response.status(), StatusCode::OK);
    assert_eq!(cover_response.headers()["content-type"], "image/png");
    assert_eq!(
        cover_response
            .into_body()
            .collect()
            .await
            .unwrap()
            .to_bytes(),
        &[0x89, b'P', b'N', b'G', 13, 10, 26, 10][..]
    );
    let id = books[0]["resourceId"].as_str().unwrap();
    let (status, opened) = request(
        &app,
        "POST",
        "/api/epub/open",
        json!({"resourceId": id, "fallbackTitle": "Fallback"}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(opened["book"]["metadata"]["title"], "Fixture Book");
    assert_eq!(opened["book"]["toc"][0]["title"], "Chapter One");
    let session = opened["sessionId"].as_str().unwrap();
    let (status, resource) = request(
        &app,
        "POST",
        "/api/epub/read",
        json!({"resourceId": id, "sessionId": session, "href": "OEBPS/chapter.xhtml"}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(resource["text"].as_str().unwrap().contains("Hello EPUB"));
    let (status, binary) = request(
        &app,
        "POST",
        "/api/epub/read",
        json!({"resourceId": id, "sessionId": session, "href": "OEBPS/image.png"}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(binary.get("base64").is_none());
    assert!(binary.get("filePath").is_none());
    let binary_url = binary["binaryUrl"].as_str().unwrap();
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri(binary_url)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(response.headers()["content-type"], "image/png");
    assert_eq!(
        response.into_body().collect().await.unwrap().to_bytes(),
        &[0x89, b'P', b'N', b'G', 13, 10, 26, 10][..]
    );
    let stale_url = binary_url.replace(session, "stale-session");
    assert_eq!(
        app.clone()
            .oneshot(
                Request::builder()
                    .uri(stale_url)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap()
            .status(),
        StatusCode::BAD_REQUEST
    );
}

#[tokio::test]
async fn older_last_read_cannot_overwrite_newer_value() {
    let temp = TempDir::new().unwrap();
    let app = app(&temp);
    let (status, state) = request(
        &app,
        "PUT",
        "/api/state/lastRead",
        json!({"resourceId": "new", "updatedAt": 200}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(state["lastRead"]["resourceId"], "new");

    let (status, state) = request(
        &app,
        "PUT",
        "/api/state/lastRead",
        json!({"resourceId": "old", "updatedAt": 100}),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(state["lastRead"]["resourceId"], "new");
    assert_eq!(state["lastRead"]["updatedAt"], 200);
}

#[tokio::test]
async fn non_object_persisted_state_returns_error_without_panicking() {
    let temp = TempDir::new().unwrap();
    let state_dir = temp.path().join("state");
    fs::create_dir_all(&state_dir).unwrap();
    fs::write(state_dir.join("web-state-v1.json"), "[]").unwrap();
    let app = app(&temp);

    assert_eq!(
        request(&app, "GET", "/api/state", Value::Null).await.0,
        StatusCode::INTERNAL_SERVER_ERROR
    );
    assert_eq!(
        request(
            &app,
            "PUT",
            "/api/state/progress",
            json!({"book": {"updatedAt": 1}}),
        )
        .await
        .0,
        StatusCode::INTERNAL_SERVER_ERROR
    );
}

fn write_epub(path: &Path) {
    let mut zip = ZipWriter::new(fs::File::create(path).unwrap());
    let options = SimpleFileOptions::default();
    let files = [
        (
            "META-INF/container.xml",
            r#"<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>"#,
        ),
        (
            "OEBPS/content.opf",
            r#"<?xml version="1.0"?><package><metadata><title>Fixture Book</title><creator>Tester</creator><language>en</language><meta name="calibre:series" content="Fixture Series"/><meta name="calibre:series_index" content="2"/></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="image" href="image.png" media-type="image/png" properties="cover-image"/></manifest><spine><itemref idref="chapter"/></spine></package>"#,
        ),
        (
            "OEBPS/nav.xhtml",
            r#"<html xmlns="http://www.w3.org/1999/xhtml"><body><nav type="toc"><a href="chapter.xhtml">Chapter One</a></nav></body></html>"#,
        ),
        (
            "OEBPS/chapter.xhtml",
            "<html><body>Hello EPUB</body></html>",
        ),
    ];
    for (name, content) in files {
        zip.start_file(name, options).unwrap();
        zip.write_all(content.as_bytes()).unwrap();
    }
    zip.start_file("OEBPS/image.png", options).unwrap();
    zip.write_all(&[0x89, b'P', b'N', b'G', 13, 10, 26, 10])
        .unwrap();
    zip.finish().unwrap();
}
