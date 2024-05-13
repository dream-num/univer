# @univerjs/design

[![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)
[![license](https://img.shields.io/npm/l/@univerjs/design)](https://img.shields.io/npm/l/@univerjs/design)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

为了让 Univer 的插件 UI 能够有更好的一致性，也为了降低用户自定义开发时的工作量，我们提供了一些基础的设计规范和组件。

组件基于 React 和 less 开发，可以访问[组件库网站](https://univer-design.vercel.app)了解更多信息。

![](./assets/design.jpeg)

:::note
如果你只需要扩展工具栏、右键菜单等，可以直接使用 @univerjs/ui 提供的扩展接口，无需自行实现 UI。请参考[扩展 UI](https://univer.ai/zh-CN/guides/sheet/customization/ui)。
:::

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/design

# 使用 pnpm
pnpm add @univerjs/design
```

本包含有 CSS 文件，且具有最高优先级，请在引入其他 Univer 样式文件之前引入本包的样式。

### 内置主题

本包提供了两个内置主题：`defaultTheme` 和 `greenTheme`。你可以直接引入并在你的应用中使用。

```typescript
import { defaultTheme } from '@univerjs/design';
// import { greenTheme } from '@univerjs/design';

// Use the default theme
new Univer({
    theme: defaultTheme,
    // theme: greenTheme,
});
```
