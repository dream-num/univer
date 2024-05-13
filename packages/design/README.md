# @univerjs/design

[![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)
[![license](https://img.shields.io/npm/l/@univerjs/design)](https://img.shields.io/npm/l/@univerjs/design)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## Introduction

To ensure better consistency in the UI of Univer plugins and to reduce the effort required for custom development, we provide some fundamental design guidelines and components.

The components are developed using React and less, and you can find out more information by visiting the [component library website](https://univer-design.vercel.app).

![](./assets/design.jpeg)

:::note
If you only need to extend the toolbar, context menu, and so on, you can directly use the extension interfaces provided by `@univerjs/ui` without implementing the UI yourself. For more information, please refer to [Extending UI](https://univer.ai/guides/sheet/customization/ui).
:::

## Usage

### Installation

```shell
# Using npm
npm install @univerjs/design

# Using pnpm
pnpm add @univerjs/design
```

This package contains CSS and has the highest priority. Please import it before importing any other Univer style files.

### Built-in themes

The package provides two built-in themes: `defaultTheme` and `greenTheme`. You can import them directly and use them in your application.

```typescript
import { defaultTheme } from '@univerjs/design';
// import { greenTheme } from '@univerjs/design';

// Use the default theme
new Univer({
    theme: defaultTheme,
    // theme: greenTheme,
});
```
