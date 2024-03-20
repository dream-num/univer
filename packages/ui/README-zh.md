# @univerjs/ui

[![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)
[![license](https://img.shields.io/npm/l/@univerjs/ui)](https://img.shields.io/npm/l/@univerjs/ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/ui` 定义了基本的 UI 服务，并基于 React 提供了一套桌面端的 Workbench 实现。

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/ui

# 使用 pnpm
pnpm add @univerjs/ui
```

本包含有 CSS 文件，且具有第二高优先级，请在 `@univerjs/design` 之后、其他 Univer 样式文件之前引入本包的样式。

### UI 服务

UI 服务定义了一些在客户端运行，但与特定的宿主无关（例如桌面端浏览器、移动端 webview 等）的 UI 服务。通过注入这些服务，业务功能可以在不同的宿主中调用相同的接口，而不用关心宿主的差异。

这些 UI 服务包括：

- 菜单服务，用于注册菜单项以及其对应的 command
- 快捷键服务，用于注册快捷键以及其对应的 command
- 剪贴板服务，从剪贴板读取或写入数据
- 弹窗服务，包括 confirm 和 dialog 等

### Workbench

除了 UI 服务之外，`@univerjs/ui` 还基于 React 实现了工作区，包括标题栏、工具栏、正文区域、右键菜单、侧边栏等等。业务可以通过 Workbench 提供的 API 来自定义渲染内容。
