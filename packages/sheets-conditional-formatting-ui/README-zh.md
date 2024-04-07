# @univerjs/sheets-conditional-formatting-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting-ui)](https://npmjs.org/packages/@univerjs/sheets-conditional-formatting-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting-ui)](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting-ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets-conditional-formatting-ui` 为 Univer Sheet 的每个 cell 提供了条件格式化的功能。

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-conditional-formatting-ui

# 使用 pnpm
pnpm add @univerjs/sheets-conditional-formatting-ui
```

### 注册插件

```typescript
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';

univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);
```
