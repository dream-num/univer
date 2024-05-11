# @univerjs/sheets-numfmt

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-numfmt)](https://img.shields.io/npm/l/@univerjs/sheets-numfmt)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

提供数字格式的编辑/渲染能力，例如编辑面板、工具栏按钮、实时预览、行列变化等等。

:::note
数字格式是电子表格的核心功能之一，因此数字格式的解析处理是在 `@univerjs/sheets` 中进行的。
:::

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-numfmt

# 使用 pnpm
pnpm add @univerjs/sheets-numfmt
```

### 使用介绍
在你的入口文件处，引用 `@univerjs/sheets-numfmt`.
```ts
import { LocaleType, LogLevel, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';

// univer
const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales,
    logLevel: LogLevel.VERBOSE,
});

// ... 其他插件注册

univer.registerPlugin(UniverSheetsNumfmtPlugin);
```
:::note
如果你需要导出快照支持导出数字格式,需要额外新增[一部分代码](https://univer.ai/guides/sheet/customization/model)
:::
