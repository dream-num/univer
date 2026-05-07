# @univerjs/sheets-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)

`@univerjs/sheets-ui` provides the main spreadsheet UI layer for Univer Sheets, including selection, menus, clipboard, formula bar integration, and rendering interaction services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-ui` | `UniverSheetsUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-ui
# or
npm install @univerjs/sheets-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-ui/lib/index.css';
import EnUS from '@univerjs/sheets-ui/locale/en-US';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';

univer.registerPlugin(UniverSheetsUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverSheetsUIPlugin`
- `UniverSheetsMobileUIPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-ui)
- [GitHub repository](https://github.com/dream-num/univer)

