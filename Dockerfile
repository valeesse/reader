# =========================
# Web frontend builder
# =========================
FROM node:24-bookworm-slim AS web-builder

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@11.9.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY index.html tsconfig.json vite.config.ts ./
COPY packages/reader-ui ./packages/reader-ui

RUN pnpm build


# =========================
# Rust server builder
# =========================
FROM rust:1.96-bookworm AS server-builder

WORKDIR /app

# 使用国内 crates.io sparse 镜像，加快依赖索引和下载。
# 如果你的服务器访问 crates.io 本身很快，可以删除这一段。
RUN mkdir -p /usr/local/cargo \
    && printf '%s\n' \
        '[source.crates-io]' \
        'replace-with = "rsproxy-sparse"' \
        '' \
        '[source.rsproxy-sparse]' \
        'registry = "sparse+https://rsproxy.cn/index/"' \
        > /usr/local/cargo/config.toml

COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY apps/server ./apps/server
COPY apps/desktop/src-tauri ./apps/desktop/src-tauri

# 缓存：
# 1. Cargo registry / crate 下载
# 2. Cargo git 依赖
# 3. Rust target 编译中间产物
#
# 最终 binary 单独复制到 /app，
# 避免后续阶段无法直接访问 cache mount 中的 target。
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/cargo-target \
    CARGO_TARGET_DIR=/cargo-target \
    cargo build \
        --locked \
        --release \
        -p zenith-reader-server \
    && cp /cargo-target/release/zenith-reader-server \
        /app/zenith-reader-server


# =========================
# Runtime
# =========================
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 zenith \
    && mkdir -p \
        /app/target/dist \
        /data/books \
        /data/state \
        /data/cache \
    && chown -R zenith:zenith \
        /app \
        /data/state \
        /data/cache

WORKDIR /app

COPY --from=server-builder \
    /app/zenith-reader-server \
    /usr/local/bin/zenith-reader-server

COPY --from=web-builder \
    /app/target/dist \
    ./target/dist

COPY tools/scripts/docker-entrypoint.sh \
    /usr/local/bin/zenith-reader-entrypoint

RUN sed -i 's/\r$//' /usr/local/bin/zenith-reader-entrypoint \
    && chmod 755 /usr/local/bin/zenith-reader-entrypoint

ENV ZENITH_LIBRARY_DIR=/data/books \
    ZENITH_STATE_DIR=/data/state \
    ZENITH_CACHE_DIR=/data/cache \
    ZENITH_DIST_DIR=/app/target/dist \
    ZENITH_BIND=0.0.0.0:8080 \
    RUST_LOG=zenith_reader_server=info,tower_http=info

USER zenith

EXPOSE 8080

ENTRYPOINT ["zenith-reader-entrypoint"]
CMD ["zenith-reader-server"]