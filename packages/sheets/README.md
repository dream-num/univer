# @univerjs/sheets

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)
[![license](https://img.shields.io/npm/l/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)

`@univerjs/sheets` provides the core spreadsheet data model and business logic for Univer Sheets, independent of the UI layer.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets` | `UniverSheets` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets
# or
npm install @univerjs/sheets
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import EnUS from '@univerjs/sheets/locale/en-US';
import { UniverSheetsPlugin } from '@univerjs/sheets';

univer.registerPlugin(UniverSheetsPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets)
- [GitHub repository](https://github.com/dream-num/univer)

