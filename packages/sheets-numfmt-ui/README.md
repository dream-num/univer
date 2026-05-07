# @univerjs/sheets-numfmt-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-numfmt-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-numfmt-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt-ui)

`@univerjs/sheets-numfmt-ui` adds number-format UI for Univer Sheets, including menus, editors, previews, and locale-aware formatting controls.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-numfmt-ui` | `UniverSheetsNumfmtUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-numfmt-ui
# or
npm install @univerjs/sheets-numfmt-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-numfmt-ui/lib/index.css';
import EnUS from '@univerjs/sheets-numfmt-ui/locale/en-US';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';

univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-numfmt-ui)
- [GitHub repository](https://github.com/dream-num/univer)

