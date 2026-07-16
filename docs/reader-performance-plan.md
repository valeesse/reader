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
3. Keep text resources in a byte-bounded LRU. Store binary resources on disk; return validated Tauri asset paths on desktop and session-bound same-origin streaming URLs on Web. Binary bytes never cross JSON/IPC as base64.
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
- Binary EPUB resources already on disk do not require base64, JSON byte copies, or a browser Blob copy.
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
- EPUB demand ZIP reads use a per-book archive mutex after releasing the global book-state lock. Batch prefetch uses its own archive handle, so speculative decompression cannot hold the demand archive lock. Binary prefetch writes only to disk; text prefetch alone populates the bounded runtime LRU.
- Persisted binary assets are referenced through Tauri asset URLs on desktop. Web responses contain an opaque-to-the-filesystem same-origin URL; its GET handler revalidates the active session/resource/href and streams the cached file with `ReaderStream`.
- Cover bytes use the same controlled-file model: Tauri receives a cache path and Web receives a same-origin cover URL. Book JSON contains neither absolute server paths nor data URLs.
- Runtime disk-budget trimming remains startup-based. A safe throttled runtime trim must become active-session-aware before it can be enabled; prefetch currently avoids a whole-cache `WalkDir` scan on every batch.

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

### Web/backend refactor verification (2026-07-14)

After clearing both the shared `reader-core` cache and the legacy desktop cache
directories, the packaged x64 build was exercised again with the same real
books. The final warm-path run completed every requested keyboard and wheel
navigation and every sampled resource boundary was a physical L1 hit:

- EPUB: 36/36 forward, 24/24 backward, and 24/24 wheel turns; callback P95
  7.4 ms, 7.7 ms, and 9.3 ms respectively; boundary hit rate 100%.
- TXT: 48/48 forward, 24/24 backward, and 24/24 wheel turns; callback P95
  3.8 ms, 7.4 ms, and 3.4 ms respectively; boundary hit rate 100%.
- The tested EPUB illustration still decoded successfully at 755 × 1200.
- Bounded presentable time was 213.1 ms for EPUB and 134.3 ms for TXT. These
  refactored cold/warm load numbers are slower than the 2026-07-13 measurements,
  so the historical load baseline remains intentionally visible as a regression
  rather than being silently replaced.

The final cache clear returned zero bytes and zero files. The next real open is
therefore expected to exercise the source/L3 cold path again.

### Stability-first verification (2026-07-14)

Experiments that combined frame activation/focus/progression messages or kept
two forward layout reservations reduced some isolated timings, but produced
repeatable 70-150 ms boundary stalls. Those experiments were removed. The
verified implementation keeps the original Readium frame lifecycle and one
directional L1 reservation in a hard three-frame pool. Generation checks,
physical frame readiness tokens, bounded construction, Blob URL reclamation,
and direct same-origin in-frame page turns remain enabled.

Two consecutive runs against the packaged x64 Tauri release produced the
following functional results:

- EPUB: 36/36 forward and 24/24 backward turns completed and visibly moved in
  both runs, with no failed attempts or retries. Callback P95 was 4.6-5.5 ms
  forward and 5.1-6.4 ms backward; input-to-next-frame P95 was 6.7-8.5 ms and
  11.9-14.3 ms respectively. Tested boundary samples were physical L1 hits.
- TXT: 48/48 forward and 24/24 backward turns completed and visibly moved in
  both runs, with no failed attempts or retries. Callback P95 was 5.2-5.8 ms
  forward and 3.0 ms backward; input-to-next-frame P95 was 7.6-9.4 ms and
  6.3-9.9 ms respectively. Tested paginated boundary samples were physical L1
  hits.
- Continuous-wheel tests moved across multiple resources in both formats. A
  deliberate immediate direction reversal can make the first TXT boundary a
  cold path (80-89.1 ms) while the single reservation changes direction; it
  still completes without a retry, and following boundaries return to the warm
  path. This bounded cold transition is preferred over speculative concurrent
  reservations that caused widespread lifecycle stalls.
- Presentable time remained variable at 136.4-165.6 ms for EPUB and
  118.2-138.1 ms for TXT. These do not meet the historical 91 ms and 67.8 ms
  measurements and remain optimization work, not a reason to weaken lifecycle
  correctness.

The raw reports are `zenith-epub-single-{1,2}.json` and
`zenith-txt-single-{1,2}.json` in the test machine's temporary directory.

## Unified navigation and progress pipeline (2026-07-16)

The reader now keeps resource boundaries as an internal loading concern while
presenting one publication-wide navigation space in every layout:

1. Paginated single/double-page and animated modes continue to use the bounded
   Readium frame pool. Continuous scrolling uses a seven-resource virtual strip
   while retaining the navigator as a warm backing surface.
2. Publication progress spans the complete `[0, 1]` interval. Zero resolves to
   the true beginning of the first resource and one resolves to progression one
   in the final resource, rather than the beginning of the final sampled range.
3. EPUB text-position refinement updates the publication range cache, Readium's
   href index, and the continuous strip atomically without rebuilding visible
   frames. The current locator is then mapped back to the refined progress.
4. Progress input has separate draft and live values. The thumb reacts on every
   input event while absolute navigation is serialized with latest-request-wins
   semantics. A pointer/key release commits the final target; live locator
   callbacks resume control after the handoff.
5. TOC jumps and progress seeks share the same absolute-navigation channel.
   Continuous-strip jumps reject stale generations, and Readium can recover its
   absolute-navigation lock after a lost callback without reopening the book.
6. The current TOC item follows the live locator. Multiple TOC fragments in one
   XHTML resource are resolved against their laid-out element progression; the
   directory highlights the result with `aria-current` and scrolls it into view.
7. Startup render snapshots remain the immediate visual surface. TXT preview no
   longer dismisses a valid snapshot early, and continuous mode synchronizes the
   replayed locator to its active strip before the two-frame live handoff.

### Verification

The implementation was delivered as reviewable commits:

- `9a44ddd`: bounded continuous resource strip and warm backing navigator.
- `42e63b9`: synchronized refined positions and strict publication endpoints.
- `af5ddae`: latest-wins absolute navigation and seek feedback separation.
- `4242d1b`: live current-chapter tracking and directory reveal.
- `6c33d7a`: active-surface startup handoff and bounded background preparation.
- `23c444d`: fragment-aware chapter resolution within shared resources.

`pnpm lint`, `pnpm build`, `cargo fmt --check`, strict Clippy, and the complete
Rust test suite pass. Packaged CDP latency measurements still require a running
instrumented Tauri release and are intentionally not inferred from build times.

## Persistent resume and startup pipeline (2026-07-15)

Startup no longer waits for the application module graph before presenting a
useful frame. The order is now:

1. The Tauri main window remains hidden until the inline, dependency-free HTML
   shell calls `startup_shell_ready`; an unpainted WebView surface is never
   exposed.
2. The shell synchronously restores the small catalog/settings resume marker
   and a layout-keyed **L0S/L1S render snapshot** from local storage. L0S is the
   exact visible serialized reading document and scroll offset. L1S contains
   the immediately previous/next page when it fits the 3.6 MiB budget. Arrow
   turns operate on L1S while the live reader is loading.
3. The minimal React state coordinator and native publication prewarm start in
   parallel. The reader opens the last book directly; the library, settings,
   WebDAV, covers, full TOC construction, progress reconciliation, position
   refinement, stable prefetch, and cache maintenance are deferred.
4. Readium restores the real locator, replays any turns made against L1S, then
   atomically removes the startup overlay. A debounced idle capture refreshes
   L0S/L1S, with a final synchronous capture on `pagehide`.

Snapshots are rejected when the book, viewport, device pixel ratio, layout
fingerprint, version, or freshness window does not match. They contain no
scripts, forms, embedded frames, event attributes, or external stylesheets.
This layer accelerates presentation only; locator progress remains the source
of truth and the live L0/L1/L2/L3/L4 hierarchy is unchanged.

Development serves the 13.9 KiB shell through a pre-transform middleware. The
application module request starts after DOMContentLoaded. React, JSX runtime,
and ReactDOM are maintained as a checked-in split ESM development runtime, so
an empty `node_modules/.vite` cache performs no first-run dependency prebundle.
Production builds keep the normal Vite dependency graph and use Tauri's
`custom-protocol` feature; a packaged executable must never point at port 3000.

### Measured result

- With the Vite cache removed, Vite became ready in 267 ms with no dependency
  optimization/bundling phase. In the WebView, the raw shell reached DCL about
  30 ms after its response and the persisted reading frame painted about 28 ms
  later. Development transforms continued behind that frame.
- In two packaged x64 runs, the custom-protocol shell was ready at 72.4-93.2
  ms, DCL at 98.6-114.8 ms, and the persisted TXT page painted at 108.6-121.8
  ms. Native state initialization took 1-2 ms and the live TXT reader reported
  presentable in 79.3-95.4 ms before replacing the snapshot.
- The real EPUB illustration decoded at 755 x 1200. EPUB completed 36/36
  forward and 24/24 backward turns; TXT completed 48/48 and 24/24. The final
  isolated TXT run had 100% keyboard boundary hits, callback P95 of 1.4/4.6 ms,
  and 24/24 wheel turns with 3.9 ms callback P95. A cross-book run exposed a
  2.5-second boundary stall caused by simultaneously preparing both TXT
  directions; removing that second speculative reservation eliminated the
  stall. One subsequent cross-book wheel run coalesced 24 events into 23 turns,
  while all keyboard requests remained one-for-one. Wheel coalescing remains a
  variability signal, not a relaxed keyboard/L1 acceptance target.

## Desktop/Web convergence and Web performance hardening (2026-07-16)

The desktop and Web readers now share the same publication, locator, layout,
navigation, animation, progress, and cache-coordination path. Runtime-specific
code is limited to the transport and resource URL boundary:

- Desktop commands dynamically load Tauri APIs and use `invoke`/asset URLs.
- Web commands use abortable same-origin HTTP requests and session-bound binary
  URLs. Tauri modules are no longer part of the Web startup execution path.
- Readium private frame-pool access is isolated in one navigator adapter.
  Animation, idle/background scheduling, and serialized layout transactions
  are shared helpers rather than viewer-local duplicates.

Desktop performance policy remains unchanged: the existing three-resource
content/continuous warm radius and concurrent frame creation behavior are
preserved. Web applies an adaptive policy derived from save-data, connection
latency, and reported device memory:

- constrained Web clients keep one adjacent resource and prepare one frame at a
  time;
- normal Web clients keep two adjacent resources and prepare at most two frames
  at a time;
- direction changes and page hiding abort obsolete speculative requests.

The interaction pipeline is bounded for high-frequency input:

- rapid page turns retain the three-turn queue but suppress redundant entry and
  exit animations while work remains queued;
- progress dragging updates the thumb immediately, prefetches the target, and
  submits at most one preview navigation every 80 ms; release commits the final
  locator immediately;
- layout-affecting settings and viewport resize operations share a serialized
  transaction queue and restore a semantic locator after relayout;
- pointer-down/focus on a Web book tile begins a single-publication warm open,
  with previous speculative sessions closed.

Web persistence and delivery remove avoidable round trips:

- startup reads per-book progress from IndexedDB immediately and reconciles the
  dedicated server endpoint in the background;
- progress and last-read state are written atomically in one request, guarded
  by monotonic `updatedAt` checks; page hiding also starts a `keepalive` write;
- EPUB position weights are generated lazily in `reader-core`, persisted with
  the metadata cache, and returned through both Tauri and Web APIs. Browser
  worker generation remains a compatibility fallback;
- hashed assets and fonts are immutable for one year, HTML revalidates, and
  static responses support Brotli/Gzip compression.

### Verification

- `pnpm build` passes; Tauri-only APIs appear as separate dynamic chunks.
- `cargo test --workspace` passes (24 executed tests, 2 real-book probes
  intentionally ignored).
- `cargo check --manifest-path src-tauri/Cargo.toml` passes.
- `cargo clippy --workspace --all-targets -- -D warnings` passes.
- Server regression tests verify atomic/stale reading-state behavior,
  per-book progress, immutable static caching, Gzip delivery, and the Web EPUB
  positions endpoint.

Packaged desktop latency was not re-benchmarked in this change because the
desktop scheduling radii, animation timings for non-queued turns, and frame
creation behavior were deliberately retained. The existing packaged desktop
measurements above remain the performance baseline.
