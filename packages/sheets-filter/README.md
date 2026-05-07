# @univerjs/sheets-filter

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-filter?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-filter)

`@univerjs/sheets-filter` adds the core filtering model, commands, and services for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-filter` | `UniverSheetsFilter` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-filter
# or
npm install @univerjs/sheets-filter
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';

univer.registerPlugin(UniverSheetsFilterPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-filter-ui` when users need filter menus and panels.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-filter)
- [GitHub repository](https://github.com/dream-num/univer)

