use std::{env, net::SocketAddr, path::PathBuf};
use zenith_reader_server::{ServerConfig, build_router};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();
    let config = ServerConfig {
        library_dir: env_path("ZENITH_LIBRARY_DIR", "/data/books"),
        state_dir: env_path("ZENITH_STATE_DIR", "/data/state"),
        cache_dir: env_path("ZENITH_CACHE_DIR", "/data/cache"),
        dist_dir: env_path("ZENITH_DIST_DIR", "target/dist"),
        auth_token: env::var("ZENITH_AUTH_TOKEN")
            .ok()
            .filter(|value| !value.is_empty()),
    };
    let app = build_router(config)?;
    let address: SocketAddr = env::var("ZENITH_BIND")
        .unwrap_or_else(|_| "127.0.0.1:8080".into())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(address).await?;
    tracing::info!(%address, "server listening");
    axum::serve(listener, app).await?;
    Ok(())
}

fn env_path(name: &str, default: &str) -> PathBuf {
    PathBuf::from(env::var(name).unwrap_or_else(|_| default.into()))
}
