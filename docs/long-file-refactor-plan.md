# 超长文件拆分审计

## 范围与约束

- 统计 `src`、`server`、`crates`、`src-tauri` 下的 TypeScript、TSX 和 Rust。
- 排除 `src/vendor`、构建产物和依赖代码。
- 目标是业务文件通常不超过 300 行。
- 入口编排器允许短期超过 300 行，但必须只保留状态组装和生命周期协调。
- 不以制造循环依赖、跨模块共享可变状态或降低性能为代价机械切行。

## 已完成拆分

| 原文件 | 拆分结果 |
| --- | --- |
| `src/lib/native.ts` | 保留阅读器和桌面桥接；图片导出迁至 `nativeImage.ts`；WebDAV 迁至 `nativeWebDav.ts` |
| `src/components/library/Library.tsx` | 保留筛选、排序和列表状态；书籍卡片、系列卡片和系列详情迁至 `LibraryTiles.tsx` |
| `src/store/AppStore.tsx` | 保留 Context 和持久化编排；元数据系列识别迁至 `metadataSeries.ts` |
| `src/components/reader/ReaderLayout.tsx` | 保留阅读器壳、目录、进度和面板开关；设置面板及控件迁至两个独立组件 |

上述入口均已降到 300 行以内，并保留原有公开 import。

## 剩余超长文件

### `src/components/reader/ReadiumReaderViewer.tsx`

当前职责混合了 publication 生命周期、Readium navigator 生命周期、布局事务、翻页队列、绝对导航、连续模式、进度保存、图片交互、页面计数和 DOM 几何。

建议按以下顺序拆分：

1. `reader/readiumGeometry.ts`：页面几何、列宽、页码、offset snapping。
2. `reader/readiumAnchors.ts`：可见文本锚点捕获、文本 range、锚点恢复。
3. `reader/readiumFrameInteractions.ts`：wheel、图片预览、frame 样式和布局监听。
4. `reader/useReaderProgress.ts`：进度节流、pagehide flush、页码刷新。
5. `reader/useReaderNavigation.ts`：有界翻页队列、absolute latest-wins、seek preview。
6. `reader/useReaderLayout.ts`：设置变更、resize、语义锚点恢复。
7. `reader/useReadiumSession.ts`：打开、关闭、重试和 publication/navigator 生命周期。

最终组件仅负责创建这些 hooks、组合 refs 和渲染加载/错误/图片预览 UI。每个 hook 必须拥有自己的取消令牌，禁止重新引入跨 hook 的隐式 timer/ref 写入。

### `src/reader/readiumPublication.ts`

建议拆为：

- `readium/model.ts`：Locator、Link、LinkCollection、Metadata。
- `readium/resource.ts`：ReadiumResource 和资源接口。
- `readium/epubResourceManager.ts`：前端 LRU、URL rewrite、Blob 生命周期。
- `readium/positions.ts`：位置权重、locator/progress 映射和 worker fallback。
- `readium/path.ts`：ZIP 路径、MIME、fragment 与 URL 工具。
- `readium/createEpubPublication.ts`：唯一入口和生命周期组装。

兼容文件 `readiumPublication.ts` 最终只做 re-export，避免一次性修改所有调用方。

### `src/reader/continuousResourceStrip.ts`

建议拆为：

- `continuous/recordWindow.ts`：虚拟窗口、并发创建和淘汰。
- `continuous/frameDocument.ts`：iframe 加载、样式、图片和链接交互。
- `continuous/locator.ts`：滚动位置、语义锚点和 locator 映射。
- `continuous/dom.ts`：selector、路径解析和 scroll completion。
- `ContinuousResourceStrip.ts`：持有状态并协调上述对象。

窗口管理器需要继续保证“插入视口上方时补偿 scrollTop”的原子性，不能改成无状态工具函数。

### `src/components/settings/SettingsView.tsx`

建议拆为：

- `settings/LibrarySettingsSection.tsx`
- `settings/CacheSettingsSection.tsx`
- `settings/AppearanceSettingsSection.tsx`
- `settings/ReadingDefaultsSection.tsx`
- `settings/WebDavSettingsSection.tsx`
- `settings/useSettingsMaintenance.ts`

主组件只保留异步状态 hook 和 section 组合。

### `server/src/lib.rs`

建议拆为：

- `app.rs`：`ServerConfig`、`AppState` 和 Router 组装。
- `api/library.rs`
- `api/txt.rs`
- `api/epub.rs`
- `api/cache.rs`
- `api/state.rs`
- `state_repository.rs`
- `response.rs`：`ApiError`、文件 streaming 和 query 编码。
- `tests.rs`

Axum handler 应只负责反序列化、调用 service 和序列化；状态文件的锁、单调时间戳和原子替换全部留在 repository。

### `crates/reader-core/src/reader/epub.rs`

建议拆为：

- `epub/session.rs`：open/close/read/prefetch 和 session 校验。
- `epub/cache.rs`：资源 LRU、binary materialization、持久元数据。
- `epub/parser.rs`：OPF、manifest、spine、metadata、TOC 和 cover。
- `epub/archive.rs`：ZIP budget、flexible lookup、路径规范化和 MIME。
- `epub/positions.rs`：惰性位置权重。

Parser 和 archive 不应依赖 `ReaderService`，以便独立测试。

### `crates/reader-core/src/reader/txt.rs`

建议拆为：

- `txt/session.rs`
- `txt/index.rs`
- `txt/encoding.rs`
- `txt/range.rs`
- `txt/heading.rs`

必须保持流式转换和按窗口读取，禁止为了模块边界重新读取完整文本。

### `crates/reader-core/src/lib.rs`

建议拆为：

- `library/model.rs`
- `library/registry.rs`
- `library/identity.rs`
- `library/scan.rs`
- `library/storage.rs`

crate 根只保留 module 声明与 public re-export。

### `crates/reader-core/src/reader/tests.rs`

按领域拆为 `tests/txt.rs`、`tests/epub.rs`、`tests/cache.rs`、`tests/probes.rs`。测试辅助 EPUB 构造器放入 `tests/fixtures.rs`。

## 执行顺序

1. 先拆纯类型、纯函数和独立 UI。
2. 再拆无 React 状态的资源/解析模块。
3. 为导航、布局、session 建立显式控制器接口。
4. 最后缩减巨型编排组件。
5. 每完成一个领域执行 TypeScript/Rust 对应测试；每一阶段执行完整生产构建。

## 验收规则

- 新业务文件默认不超过 300 行。
- 公开 API 通过 re-export 保持兼容。
- 不增加新的 Readium 私有字段访问点。
- 桌面预取半径、动画时间和 frame pool 行为不变。
- Web 请求取消、并发限制和状态 keepalive 行为不变。
- `pnpm lint`、`pnpm build`、Rust workspace tests、Tauri check 和严格 Clippy 全部通过。
