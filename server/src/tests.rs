use super::{ServerConfig, build_router};
use axum::{
    body::Body,
    http::{Request, StatusCode, header},
    response::Response,
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use std::fs;
use tempfile::TempDir;
use tower::ServiceExt;

fn test_config(temp: &TempDir) -> ServerConfig {
    let library_dir = temp.path().join("library");
    let state_dir = temp.path().join("state");
    let cache_dir = temp.path().join("cache");
    let dist_dir = temp.path().join("dist");
    fs::create_dir_all(dist_dir.join("assets")).unwrap();
    fs::write(
        dist_dir.join("index.html"),
        "<!doctype html><title>Reader</title>",
    )
    .unwrap();
    fs::write(
        dist_dir.join("assets/app.js"),
        "const value = 'reader';\n".repeat(512),
    )
    .unwrap();
    ServerConfig {
        library_dir,
        state_dir,
        cache_dir,
        dist_dir,
        auth_token: None,
    }
}

async fn json_response(response: Response) -> Value {
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test]
async fn reading_state_update_is_atomic_and_rejects_stale_values() {
    let temp = tempfile::tempdir().unwrap();
    let app = build_router(test_config(&temp)).unwrap();
    let current = json!({
        "progress": {
            "bookId": "book-1",
            "location": "{\"href\":\"chapter-2\"}",
            "updatedAt": 200
        },
        "lastRead": { "bookId": "book-1", "updatedAt": 200 }
    });
    let response = app
        .clone()
        .oneshot(
            Request::put("/api/state/reading")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(current.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let stale = json!({
        "progress": {
            "bookId": "book-1",
            "location": "{\"href\":\"chapter-1\"}",
            "updatedAt": 100
        },
        "lastRead": { "bookId": "book-2", "updatedAt": 100 }
    });
    app.clone()
        .oneshot(
            Request::put("/api/state/reading")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(stale.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    let response = app
        .clone()
        .oneshot(
            Request::get("/api/state/progress/book-1")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let progress = json_response(response).await;
    assert_eq!(progress["updatedAt"], 200);
    assert_eq!(progress["location"], "{\"href\":\"chapter-2\"}");

    let response = app
        .oneshot(Request::get("/api/state").body(Body::empty()).unwrap())
        .await
        .unwrap();
    let state = json_response(response).await;
    assert_eq!(state["lastRead"]["bookId"], "book-1");
    assert_eq!(state["lastRead"]["updatedAt"], 200);
}

#[tokio::test]
async fn static_assets_are_immutable_and_compressed_while_html_revalidates() {
    let temp = tempfile::tempdir().unwrap();
    let app = build_router(test_config(&temp)).unwrap();
    let asset = app
        .clone()
        .oneshot(
            Request::get("/assets/app.js")
                .header(header::ACCEPT_ENCODING, "gzip")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(asset.status(), StatusCode::OK);
    assert_eq!(
        asset.headers().get(header::CACHE_CONTROL).unwrap(),
        "public, max-age=31536000, immutable"
    );
    assert_eq!(
        asset.headers().get(header::CONTENT_ENCODING).unwrap(),
        "gzip"
    );

    let html = app
        .oneshot(Request::get("/").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(html.status(), StatusCode::OK);
    assert_eq!(
        html.headers().get(header::CACHE_CONTROL).unwrap(),
        "no-cache"
    );
}

#[tokio::test]
async fn configured_api_token_protects_reader_routes() {
    let temp = tempfile::tempdir().unwrap();
    let mut config = test_config(&temp);
    config.auth_token = Some("test-token".into());
    let app = build_router(config).unwrap();

    let unauthorized = app
        .clone()
        .oneshot(Request::get("/api/books").body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(unauthorized.status(), StatusCode::UNAUTHORIZED);

    let authorized = app
        .oneshot(
            Request::get("/api/books")
                .header(header::AUTHORIZATION, "Bearer test-token")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(authorized.status(), StatusCode::OK);
}
