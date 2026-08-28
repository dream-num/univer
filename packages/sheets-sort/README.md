# @univerjs/sheets-sort

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-sort?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-sort?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-sort?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort)

`@univerjs/sheets-sort` adds the core sorting model, commands, and services for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-sort` | `UniverSheetsSort` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-sort
# or
npm install @univerjs/sheets-sort
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';

univer.registerPlugin(UniverSheetsSortPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-sort-ui` when users need sorting menus and panels.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-sort)
- [GitHub repository](https://github.com/dream-num/univer)
