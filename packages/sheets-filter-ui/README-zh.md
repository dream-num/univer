# @univerjs/sheets-filter-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-filter-ui)](https://npmjs.org/packages/@univerjs/sheets-filter-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-filter-ui)](https://img.shields.io/npm/l/@univerjs/sheets-filter-ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets-filter-ui` 为 sheets 提供了筛选功能的用户界面。

## 使用指南

你应该将此插件与 `@univerjs/sheets-filter` 包一起使用。

```ts
import '@univerjs/sheets-filter-ui/lib/index.css';

import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsFilterUIPlugin);
```

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-filter-ui

# 使用 pnpm
pnpm add @univerjs/sheets-filter-ui
```
