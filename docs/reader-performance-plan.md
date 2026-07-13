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
3. Use a valid UTF-8 source directly. Stream BOM-marked UTF-16 or GBK input through a UTF-8 cache file without constructing the whole decoded book in memory.
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

## Execution result

Implemented in three reviewable milestones:

- `831b188`: streaming TXT data/index pipeline, per-session native leases, per-book caches, reusable EPUB archives, batch prefetch, and byte-bounded resource LRU.
- `2ae6d09`: deduplicated TXT windows, bounded frontend EPUB resources, direct asset URLs, fragment navigation, isolated reader lifecycle, delegated image events, and retryable errors.
- Final hardening: monotonic progress persistence/sync merge, WebDAV path-boundary validation, seven native regression tests, strict Clippy, production frontend build, and Tauri bundle verification.

The optional real-book probe was also run against a 302.06 MB EPUB in the workspace. In this environment it parsed 46 manifest items and 21 spine items and read the first resource in 7 ms. This is a smoke measurement rather than a portable benchmark, but it verifies that metadata loading does not inflate the complete archive.

## V2 layout-hot pipeline

The reader now treats data readiness and layout readiness as separate states:

1. **Visible viewport (L0)**: the current Readium frame. Page turns only enqueue navigator movement and defer counters, persistence, and prefetch work.
2. **Layout cache (L1)**: adjacent reading-order resources are loaded into hidden, non-interactive Readium frames. A frame is marked ready only after reader CSS, fonts, critical image decoding, and two layout frames have completed.
3. **Content cache (L2)**: EPUB XHTML/CSS is decoded and URL-rewritten before L1 asks for it; TXT chunks are converted to XHTML. Promise deduplication, byte-bounded LRU eviction, direction-aware scheduling, and stale-generation cancellation are shared by both formats.
4. **Persistent derived cache (L3)**: metadata, indexes, transcoded TXT data, and extracted EPUB binary assets survive restarts. The combined cache has a 1 GiB disk budget and can be inspected or cleared from Settings.
5. **Source file (L4)**: the original TXT or EPUB is used on a cold miss or signature/version invalidation.

### Cache identity and invalidation

- Content identity includes the source signature and content processor version.
- Layout identity additionally includes viewport size, pixel ratio, reading flow, column mode, typography, spacing, and margins.
- Theme-only changes repaint live frames without invalidating content or layout caches.
- Typography, viewport, flow, and margin changes invalidate L1 while preserving L2/L3.
- Source signature or processor-version changes invalidate all derived entries for that content.
- Reading progress remains locator/TXT-offset based and is never persisted as a layout-dependent page number.

### Scheduling and budgets

- Visible demand bypasses the background queue.
- Adjacent content/layout work is yielded to the browser background/idle scheduler.
- Direction changes advance the prefetch generation and cancel stale queued work.
- EPUB payload, transformed XHTML/CSS, fallback Blob URLs, and TXT XHTML use count and byte limits. Frontend byte limits are reduced on devices reporting 4 GiB or less memory.
- EPUB demand ZIP reads use a per-book archive mutex after releasing the global book-state lock. Batch prefetch uses its own archive handle, so speculative decompression cannot hold the demand archive lock.
- Persisted binary assets are referenced through Tauri asset URLs instead of being fetched and copied into browser Blobs.

### Instrumentation and acceptance targets

Runtime metrics are available through `window.__ZENITH_READER_PERF__.snapshot()` and include content/layout hit events, preparation latency, and navigation input-to-next-frame latency.

- Warm in-frame page-turn CPU work: P95 at or below 5 ms.
- Warm reading-order boundary switch CPU work: P95 at or below 10 ms.
- Input to visible result: no more than one display refresh when L1 is ready.
- Sequential-reading L1 hit rate: at least 99% after the initial resource.
- L2-to-L1 preparation is background work and should normally complete within 50 ms; cold L3/source paths are measured separately and do not share the 10 ms SLA.

These are product acceptance thresholds, not assumptions. They must be measured on packaged Tauri builds with representative TXT, ordinary EPUB, image-heavy EPUB, embedded-font EPUB, and rapid direction-change workloads.

### Packaged-build verification (2026-07-13)

The CDP scenario in `scripts/reader-real-scenario.mjs` opens the catalog entries,
navigates through the real Readium frames, validates decoded images, and drives
rapid forward/backward keyboard turns at 20 ms intervals. On the packaged x64
Tauri build used for this verification:

- `魔女之旅 01.epub`: warm open 91 ms; the tested illustration decoded at
  755 × 1200; 36/36 forward and 24/24 backward turns completed. Navigator
  callback P95 was 2.2/1.5 ms and input-to-next-frame P95 was 4.5/5.6 ms.
- `《傲世九重天》（精校版全本）作者：风凌天下.txt`: presentable in
  67.8 ms; 48/48 forward and 24/24 backward turns completed. Navigator callback
  P95 was 5.7/5.1 ms and input-to-next-frame P95 was 9.6/8.6 ms.
- The same TXT native probe indexed 9,164,837 characters and 2,728 chapters;
  the EPUB probe parsed 46 manifest and 28 spine items. Both real-file probes
  passed together with the unit and cache-budget tests.

The frame metric records the first browser animation frame following input. It
is therefore display-refresh dependent; the navigator callback metric isolates
the cache/layout/navigation work governed by the 10 ms L1 SLA.
