# Zenith Reader 1.1 architecture

## Boundaries

- `reader-core` owns EPUB/TXT parsing, indexing, path validation and derived caches.
- `reader-contracts` is the transport-neutral wire contract used by Axum and Tauri.
- `reader-application` owns reader use cases and managed-library imports.
- `reader-state` owns versioned SQLite state and conflict-safe reading updates.
- `apps/server` and `apps/desktop/src-tauri` are adapters. They must not duplicate reader semantics.
- React code talks through `ReaderGateway`; feature and reader modules must not call `fetch` or Tauri `invoke` directly.

## Platform model

Desktop and mobile hosts use the Tauri adapter. Browser clients use the HTTP adapter. Features are selected through capabilities rather than OS checks. Platform-only services are limited to file selection, export, window management, sharing and secret storage.

Mobile imports copy picker-provided files into the managed library before releasing platform URI permissions. Desktop/server folder libraries remain supported where the host advertises that capability.

## Identity

`BookId` is the stable logical identity stored in the library index. `ContentId` is the complete-file SHA-256 identity used for matching and deduplication. Moving a file keeps `BookId`; changing content keeps the logical book when it remains at the indexed path.

## Security

Publication documents are stripped of active content, receive their own restrictive CSP and use sandboxed frames. Tauri limits asset access to the reader cache. Network deployments require an explicit bind address and Docker deployments require `ZENITH_AUTH_TOKEN`.

## State

SQLite is authoritative for Tauri and Web hosts. IndexedDB and localStorage are client caches only. WebDAV credentials are excluded from durable application state; until a native credential-store adapter is installed they remain session-scoped.

## Extension rule

Adding a feature should normally require one application use case and thin mappings in the Tauri/HTTP gateways. A new platform should implement host services and transport only; it must not fork the UI, reader or state model.
