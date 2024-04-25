# @univerjs/umd

[![npm version](https://img.shields.io/npm/v/@univerjs/umd)](https://npmjs.org/package/@univerjs/umd)
[![license](https://img.shields.io/npm/l/@univerjs/umd)](https://img.shields.io/npm/l/@univerjs/umd)

## 简介

`@univerjs/umd` 是 Univer 的 UMD 包。它是一个独立的库版本，可以在任何 web 项目中使用，无需模块打包工具。

## 使用指南

您可以使用以下脚本标签在 HTML 文件中包含 UMD 包：

```html
<script src="https://unpkg.com/@univerjs/umd/lib/univer.full.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@univerjs/umd/lib/univer.css">
```

如果您的项目中已经使用了 React、ReactDOM 和 RxJS，您可以选择 UMD 包的精简版本，该版本不包含这些依赖项。

```diff
+ <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
+ <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
+ <script src="https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js"></script>

- <script src="https://unpkg.com/@univerjs/umd/lib/univer.full.umd.js"></script>
+ <script src="https://unpkg.com/@univerjs/umd/lib/univer.slim.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@univerjs/umd/lib/univer.css">
```
