# @univerjs/sheets-numfmt

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-numfmt?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-numfmt?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-numfmt)

`@univerjs/sheets-numfmt` adds core number-format services and commands for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-numfmt` | `UniverSheetsNumfmt` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-numfmt
# or
npm install @univerjs/sheets-numfmt
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';

univer.registerPlugin(UniverSheetsNumfmtPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-numfmt-ui` when users need number-format menus and editors.
- Import `@univerjs/sheets-numfmt/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-numfmt)
- [GitHub repository](https://github.com/dream-num/univer)
