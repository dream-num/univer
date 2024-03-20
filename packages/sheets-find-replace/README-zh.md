# @univerjs/sheets-find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-find-replace)](https://img.shields.io/npm/l/@univerjs/sheets-find-replace)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

该包提供了在电子表格中查找和替换文本的功能。

## 使用指南

你应该将此插件与 `@univerjs/find-replace` 包一起使用。

```ts
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';

univer.registerPlugin(UniverFindReplacePlugin);
univer.registerPlugin(UniverSheetsFindReplacePlugin);
```

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-find-replace

# 使用 pnpm
pnpm add @univerjs/sheets-find-replace
```
