# @univerjs/sheets-table

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)

`@univerjs/sheets-table` adds the core table model and commands for binding structured table data in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-table` | `UniverSheetsTable` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-table
# or
npm install @univerjs/sheets-table
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import EnUS from '@univerjs/sheets-table/locale/en-US';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(EnUS),
    },
});

univer.registerPlugin(UniverSheetsTablePlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-table-ui` when users need table controls in the sheet UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-table)
- [GitHub repository](https://github.com/dream-num/univer)
