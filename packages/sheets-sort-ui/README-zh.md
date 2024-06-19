# @univerjs/sheets-sort-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-sort-ui)](https://npmjs.org/packages/@univerjs/sheets-sort-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-sort-ui)](https://img.shields.io/npm/l/@univerjs/sheets-sort-ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets-sort-ui` 为 sheets 提供了排序功能的用户界面。

## 使用指南

你应该将此插件与 `@univerjs/sheets-sort` 包一起使用。

```ts
import '@univerjs/sheets-sort-ui/lib/index.css';

import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';

univer.registerPlugin(UniverSheetsSortPlugin);
univer.registerPlugin(UniverSheetsSortUIPlugin);
```

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-sort-ui

# 使用 pnpm
pnpm add @univerjs/sheets-sort-ui
```
