# @univerjs/sheets-conditional-formatting

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting)](https://npmjs.org/packages/@univerjs/sheets-conditional-formatting)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting)](https://img.shields.io/npm/l/@univerjs/sheets-conditional-formatting)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets-conditional-formatting` 为 Univer Sheet 提供条件格式渲染计算的基本能力.

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-conditional-formatting

# 使用 pnpm
pnpm add @univerjs/sheets-conditional-formatting
```

### 注册插件

```typescript
import { SheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';

univer.registerPlugin(SheetsConditionalFormattingPlugin);
```
