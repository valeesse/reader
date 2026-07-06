# Zenith Reader

Zenith Reader 是一个基于 Tauri 2、Rust、React 19 和 Readium 的本地桌面阅读器，面向以 EPUB 和 TXT 为主的个人书库场景。

它的重点不是“在线内容平台”，而是把本地文件访问、较大的文本体积、连续阅读体验和可调排版放在第一位。

## 当前能力

- 扫描本地文件夹，递归发现 `.epub` 和 `.txt`
- 构建本地书库，支持搜索、筛选、排序和最近阅读入口
- EPUB 阅读基于 Readium navigator，支持目录、资源读取和章节切换
- TXT 阅读支持中文常见章节名识别，也兼容 `Chapter 1` 这类英文格式
- TXT 支持分页和滚动两种阅读流
- 支持单页 / 双页、主题、字体、字号、行距、段距、字距、页边距等阅读设置
- 保存阅读进度、最近阅读书籍、书库状态和用户偏好
- 支持系列书籍组织与续读下一卷
- 支持通过 WebDAV 同步阅读进度、系列信息和偏好设置
- 提供最近书籍的原生侧暖缓存，提升应用重启后的恢复速度

## 为什么做这个项目

很多桌面阅读器在本地文件访问、超大 TXT、跨格式统一体验和可控同步上都不够理想。Zenith Reader 的目标是做一个更偏“本地优先”的阅读器：

- 文件在本地，扫描和打开路径直接来自桌面应用
- 大体积 TXT 不走整本一次性渲染
- EPUB 和 TXT 尽量共享一套阅读体验与进度管理
- 同步只同步状态，不强绑定云端内容源

## 技术栈

- 桌面壳：Tauri 2
- 原生层：Rust
- 前端：React 19 + TypeScript + Vite
- 样式：Tailwind CSS 4
- EPUB 渲染：Readium navigator
- 前端存储：IndexedDB + localStorage 启动快照

## 架构概览

### 前端

前端负责书库界面、阅读器交互、阅读设置、系列管理和本地状态持久化。

关键模块：

- `src/App.tsx`：应用入口与主视图切换
- `src/components/Library.tsx`：书库列表、搜索、筛选、排序
- `src/ReaderLayoutNext.tsx`：阅读器外层布局与阅读设置面板
- `src/TxtViewerNext.tsx`：TXT 阅读流程
- `src/ReadiumEpubViewerNext.tsx`：EPUB 阅读流程
- `src/store/AppStore.tsx`：全局状态、进度和设置管理

### 原生层

Rust 侧负责更适合放在原生环境里的工作：

- 文件系统扫描
- EPUB 解析与资源读取
- TXT 打开、解码和索引辅助
- WebDAV 上传 / 下载
- 最近书籍暖缓存和运行期缓存

对应目录：

- `src-tauri/src/lib.rs`

## 性能设计

### TXT：按窗口读取与渲染

TXT 阅读不会默认把整本书一次性挂进 DOM，而是围绕当前阅读位置加载一个有限文本窗口，并在接近边界时预取下一段内容。这种做法更适合长篇网文或大体积纯文本文件。

目前实现关注点包括：

- 统一文本解码后再进入渲染链路
- 基于字符锚点记录和恢复阅读进度
- 章节切分与目录导航
- 控制单次渲染体积，降低首屏和翻页成本

### EPUB：原生解析，前端渲染

EPUB 的 manifest、spine、toc 和资源读取放在 Rust 侧完成，前端主要负责把解析结果适配给 Readium 并组织阅读交互。图片、字体等二进制资源会优先走原生缓存路径，减少重复开销。

### 最近书籍暖缓存

应用重启后，运行期缓存天然会丢失。为减少再次打开最近书籍时的等待，项目会为最近阅读的 TXT / EPUB 保留一份可复用的磁盘暖缓存，用来加快恢复速度。

## WebDAV 同步

WebDAV 同步当前聚焦“状态同步”，而不是书籍文件同步。同步快照包含：

- 书库元数据
- 系列信息
- 阅读进度
- 用户偏好设置
- 最近阅读书籍信息

密码不会写入同步快照本身，下载远端数据时会尽量保留本地配置。

## 本地开发

### 依赖

- Node.js
- pnpm
- Rust
- Tauri 开发环境

### 安装

```bash
pnpm install
```

### 启动桌面开发环境

```bash
pnpm tauri:dev
```

### 仅启动前端

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
  App.tsx
  ReaderLayoutNext.tsx
  TxtViewerNext.tsx
  ReadiumEpubViewerNext.tsx
  components/
  store/
  lib/

src-tauri/
  src/
  Cargo.toml
  tauri.conf.json
```

## 适合继续演进的方向

- 为大书库扫描增加更细粒度的增量更新
- 继续优化超大 TXT 的首次打开成本
- 暴露更完整的缓存管理和清理入口
- 增强书库管理能力，例如标签、收藏或阅读统计
- 补充安装包分发、截图和使用说明

## 项目状态

这个项目目前已经具备可用的本地阅读器骨架，并且核心路径已经围绕“本地优先、长文阅读、状态持久化”打通。接下来更值得投入的是稳定性、产品细节和分发体验，而不是继续堆叠表层功能。
