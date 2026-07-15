FROM node:24-bookworm-slim AS web-builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
RUN pnpm build

FROM rust:1.96-bookworm AS server-builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY server ./server
COPY src-tauri ./src-tauri
RUN cargo build --release -p zenith-reader-server

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 zenith \
    && mkdir -p /app/dist /data/books /data/state /data/cache \
    && chown -R zenith:zenith /app /data/state /data/cache
WORKDIR /app
COPY --from=server-builder /app/target/release/zenith-reader-server /usr/local/bin/zenith-reader-server
COPY --from=web-builder /app/dist ./dist
ENV ZENITH_LIBRARY_DIR=/data/books \
    ZENITH_STATE_DIR=/data/state \
    ZENITH_CACHE_DIR=/data/cache \
    ZENITH_DIST_DIR=/app/dist \
    ZENITH_BIND=0.0.0.0:8080 \
    RUST_LOG=zenith_reader_server=info,tower_http=info
USER zenith
EXPOSE 8080
ENTRYPOINT ["zenith-reader-server"]
