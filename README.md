# Zenith Reader

高性能跨平台 EPUB / TXT 阅读器，基于 Rust + Tauri 2 + React 19 构建。界面参考 macOS / iOS 的圆角、毛玻璃和轻量微交互风格。

## 功能

- 添加本地路径并递归扫描 EPUB、TXT 文件
- EPUB 元数据和封面解析
- TXT 自动章节切分，支持常见中文网文和 `Chapter 1` 格式
- 自定义字体、字号、行距、段距和主题
- 沉浸式阅读模式，自动恢复上次阅读书籍和进度
- 系列管理，多卷小说可连续阅读
- WebDAV 同步阅读进度、系列、书籍元数据和偏好设置

## 开发

需要 Rust 1.96+、Node.js 和 pnpm。

```bash
pnpm install
pnpm tauri:dev
```

## 构建

```bash
pnpm tauri:build
```
