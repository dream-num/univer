---
sidebar_position: 2
---

# @univerjs/ui

[![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)

@univerjs/ui 定义了基本的 UI 服务，并基于 React 提供了一套桌面端的 Workbench 实现。

## UI 服务

UI 服务定义了一些在客户端运行，但与特定的宿主无关（例如桌面端浏览器、移动端 webview 等）的 UI 服务。通过注入这些服务，业务功能可以在不同的宿主中调用相同的接口，而不用关心宿主的差异。

这些 UI 服务包括：

-   菜单服务，用于注册菜单项以及其对应的 command
-   快捷键服务，用于注册快捷键以及其对应的 command
-   剪贴板服务，从剪贴板读取或写入数据
-   弹窗服务，包括 confirm 和 dialog 等

等等。

## Workbench

除了 UI 服务之外，@univerjs/ui 还基于 React 实现了工作区，包括标题栏、工具栏、正文区域、右键菜单、侧边栏等等。业务可以通过 Workbench 提供的 API 来自定义渲染内容。

---

@univerjs/ui 的 API 请参考 API 文档。
