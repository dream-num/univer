# @univerjs/sheets-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-formula)](https://img.shields.io/npm/l/@univerjs/sheets-formula)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets-formula` 提供了在电子表格中编辑公式的能力，例如自动补全、公式提示、公式的下拉填充以及复制粘贴等等。

:::note
公式计算是电子表格的核心功能之一，因此公式计算调度是在 `@univerjs/sheets` 中进行的。
:::

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets-formula

# 使用 pnpm
pnpm add @univerjs/sheets-formula
```

### 如何自定义公式

如果官方提供的公式不满足您的需求，可以自己扩展公式。根据不同的需求，我们提供了多种方式来支持注册一个或多个自定义公式。

- [使用 Facade API 注册公式](https://univer.ai/zh-CN/guides/sheet/facade/general#%E6%B3%A8%E5%86%8C%E5%85%AC%E5%BC%8F)
- [自定义公式](https://univer.ai/zh-CN/guides/sheet/customization/formula/)

