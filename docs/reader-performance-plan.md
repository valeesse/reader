# Reader performance and stability plan

## Scope

This plan covers the local TXT and EPUB reading paths from native file access through parsing, caching, IPC, and browser rendering. Library features and WebDAV behavior are only changed when they share the same persistence or concurrency primitives.

## Baseline findings

### TXT

- The React viewer renders a bounded text window, but Rust still reads and decodes the complete file into a `String`.
- The recent-book cache clones that complete string and serializes it as JSON. Cold-open peak memory can therefore contain the source bytes, decoded UTF-8, the cloned payload, and serialized JSON at the same time.
- Runtime caching is limited by book count rather than bytes, so several large TXT files can remain resident.
- Opening and closing are tracked only by path. A component that unmounts while `open_txt_book` is still running can close too early and leave the later open operation permanently leased.
- Concurrent prefetches are not deduplicated and a late response can populate the next book's frontend cache.

### EPUB

- Prefetching opens and parses the ZIP central directory once per resource.
- Native resources are evicted by count only. A small number of large images can exceed a reasonable memory budget.
- Binary files extracted to the persistent cache are fetched back into a browser `Blob`, duplicating their bytes and retaining the Blob URL until the book closes.
- Only the last EPUB metadata record has a persistent warm cache.
- Repeated page-position events issue identical prefetch requests.
- TOC fragments are stripped before navigation, so links to headings within a spine item can land at the chapter start.

### Shared stability issues

- Heavy synchronous native commands can occupy the command thread during first-open parsing.
- Reader-local state is reused across book changes, allowing stale seek/TOC commands and timers to affect the next book.
- Load failures are logged but can leave an empty reader without an actionable error.

## Target architecture

### TXT data path

1. Identify the source by canonical path, size, and nanosecond modification time.
2. Reuse a per-book persistent character/chapter index when the signature matches.
3. Use a valid UTF-8 source directly. Stream non-UTF-8 input through a GBK-to-UTF-8 cache file without constructing the whole decoded book in memory.
4. Build character checkpoints and chapter headings with a bounded streaming scanner.
5. Read only the byte range that covers the requested character window.
6. Give each open reader a session ID; reads and closes must present that session.

### EPUB data path

1. Persist manifest, spine, metadata, and TOC per book signature.
2. Deduplicate a bounded prefetch set and read all misses from one `ZipArchive` instance.
3. Keep text resources in a byte-bounded LRU. Store binary resources on disk and return local asset URLs on warm reads.
4. Keep request/session identity through the publication adapter and preserve TOC fragments as locator fragments.

## Delivery milestones

1. **Audit and plan**: document bottlenecks, correctness risks, target design, and acceptance checks.
2. **Native data layer**: implement streaming TXT indexing/window reads, per-book caches, session leases, batch EPUB prefetch, byte-bounded LRU, and blocking-task isolation.
3. **Frontend rendering and lifecycle**: deduplicate requests, use direct asset URLs, fix stale reader state and fragment navigation, and surface failures.
4. **Hardening**: add regression tests, update public architecture documentation, format, lint, build, and run the full Rust test suite.

## Acceptance checks

- `pnpm lint` and `pnpm build` pass.
- `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, and `cargo test` pass.
- TXT window reads allocate in proportion to the requested window, not the complete source file.
- GBK conversion is streamed to a reusable UTF-8 cache.
- Reopening any previously indexed book can reuse its own cache rather than a single global “recent book” entry.
- EPUB prefetch opens one archive per batch and native resource residency is constrained by both count and bytes.
- Binary EPUB resources already on disk do not require a browser Blob copy.
- A stale session cannot close or read through a newer reader session for the same path.
- TOC links containing `#fragment` retain that fragment in the navigator locator.

## Deferred work

- True page-map generation for reflowable EPUB would require layout-dependent position generation and invalidation. The current plan keeps chapter-weighted progress but labels it accurately.
- Library scanning can be made incremental in a separate change; it is independent of the active-reader hot path.
