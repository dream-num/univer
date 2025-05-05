# @univerjs/design

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/design` | `UniverDesign` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

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

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/design?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/design
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/design?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/design?style=flat-square
