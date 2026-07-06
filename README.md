# Zenith Reader

Zenith Reader 是一个基于 Rust、Tauri 2、React 19 和 Readium 的跨平台 EPUB / TXT 阅读器。目标是用原生文件访问能力处理大体积书籍，用前端提供轻量、沉浸、可连续阅读的界面。

## 功能特性

- 本地书库目录扫描，支持递归发现 `.epub` 和 `.txt`
- EPUB 元数据、封面、目录、图片资源读取
- TXT 自动章节切分，支持中文网文常见章节名和 `Chapter 1` 格式
- TXT 分窗口加载和渲染，避免把整本书一次性挂到 DOM
- EPUB 基于 Readium navigator 渲染，支持章节资源预取
- 单页 / 双页、分页 / 滚动 TXT 阅读流
- 字体、字号、行距、段距、字距、页边距和主题设置
- 阅读进度、最近阅读、书库状态和设置本地保存
- 系列管理，多卷小说可连续阅读
- WebDAV 同步书库元数据、系列、阅读进度和偏好设置
- 最近打开书籍的原生侧磁盘暖缓存，应用重启后可更快恢复上一本文本或 EPUB

## 技术栈

- 桌面外壳：Tauri 2
- 原生能力：Rust
- 前端：React 19、TypeScript、Vite、Tailwind CSS
- EPUB 渲染：Readium navigator
- 本地前端存储：IndexedDB (`idb-keyval`) 与 localStorage 启动快照
- 压缩 / EPUB 读取：Rust `zip`，前端资源桥接由 Tauri command 提供

## 性能设计

### TXT 加载与渲染

TXT 在 Rust 侧打开和解码，优先 UTF-8，失败后回退 GBK。无论源文件编码如何，进入阅读缓存和渲染链路后都会统一成 UTF-8 字符串。解码后会建立字符索引 checkpoint，用于把“字符进度”快速换算成 UTF-8 字节范围。

前端不会渲染整本 TXT，而是按当前阅读锚点读取一个文本窗口：

- 最小窗口约 24k 字符，最大窗口约 140k 字符
- 根据当前版式估算每页字符数，保留前后 overscan
- 前端维护少量窗口缓存，并在接近窗口边界时预取下一窗口
- 翻页、滚动和进度保存都以字符锚点为核心，减少布局变化导致的进度漂移
- 最近 TXT 会持久化 UTF-8 文本、编码信息、checkpoint 和章节索引
- 超过 80 MB 的 TXT 不缓存全文，但仍缓存编码信息、checkpoint 和章节索引

### EPUB 加载与渲染

EPUB 的 container、OPF、manifest、spine、toc 解析在 Rust 侧完成，前端将解析结果适配成 Readium publication。资源按需通过 Tauri command 读取：

- 文本类资源返回字符串
- 图片、字体等二进制资源优先写入系统 app cache；前端再转成 Readium iframe CSP 允许的 `blob:` URL
- 仅当磁盘资源缓存不可用时，二进制资源才回退为 base64
- Rust 侧维护 EPUB 资源 LRU 缓存
- 前端根据当前 href 预取相邻章节资源

### 最近书籍暖缓存

应用退出后，Rust 进程内缓存会消失。为提升重启后打开最近一本书的速度，原生侧会把最近打开的书籍解析结果写入系统 app cache 目录：

- TXT：缓存统一 UTF-8 后的文本、源编码、字符 checkpoint、章节索引和文件签名
- EPUB：缓存 manifest、reading order、toc、metadata 和文件签名
- EPUB 资源：缓存最近 EPUB 的图片、字体等二进制资源，重启后可复用
- 文件签名由文件大小和修改时间组成，原文件变更后缓存自动失效
- TXT 超过 80 MB 时不会写入磁盘暖缓存，避免缓存文件过大
- 暖缓存只保存最近一本 TXT 和最近一本 EPUB，不替代运行期 LRU 缓存

EPUB 当前会在预取相邻章节时同步落盘二进制资源；HTML/CSS 等文本资源仍以字符串形式进入 Readium，便于继续做链接重写和样式注入。

## 开发环境

需要安装：

- Rust 1.96+
- Node.js
- pnpm

安装依赖：

```bash
pnpm install
```

启动开发版：

```bash
pnpm tauri:dev
```

仅启动前端 Vite：

```bash
pnpm dev
```

## 常用命令

```bash
pnpm lint
pnpm build
pnpm tauri:build
pnpm clean
```

## 项目结构

```text
src/
  App.tsx                         应用入口和路由状态
  ReaderLayoutNext.tsx            阅读器布局
  TxtViewerNext.tsx               TXT 阅读器
  ReadiumEpubViewerNext.tsx       EPUB 阅读器
  store/AppStore.tsx              书库、系列、设置、进度状态
  lib/storage.ts                  IndexedDB/localStorage 存储
  lib/native.ts                   Tauri command 封装
  lib/readiumPublication.ts       Readium publication 适配层
src-tauri/
  src/lib.rs                      原生扫描、解析、缓存、WebDAV
```

## 数据与缓存

前端持久数据主要在 IndexedDB 中：

- 书库列表
- 系列信息
- 阅读进度
- 用户设置
- 封面路径

localStorage 保存轻量启动快照，用于在 IndexedDB 异步加载前快速恢复界面。

原生侧使用两类缓存：

- 进程内 LRU：用于当前运行期间的 TXT 书籍、EPUB 书籍和 EPUB 资源缓存
- 磁盘暖缓存：用于应用重启后快速恢复最近打开的 TXT / EPUB 解析结果和 EPUB 二进制资源

## WebDAV 同步

WebDAV 同步会上传一个 `zenith-reader-state.json` 快照，包含书库元数据、系列、阅读进度和设置。密码不会写入同步快照，下载远端快照时会保留本地密码配置。

## 后续优化方向

- TXT 后端改为 mmap 或分块解码索引，进一步降低超大 TXT 首次打开内存峰值
- 章节索引后台增量构建，先打开正文，再补全目录
- 资源缓存增加体积上限和统计信息，便于在设置页暴露清理入口
- 大书库扫描结果增量更新，减少重复解析未变化 EPUB 元数据
