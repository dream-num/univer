# @univerjs/sheets-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-ui)

`@univerjs/sheets-ui` provides the main spreadsheet UI layer for Univer Sheets, including selection, menus, clipboard, formula bar integration, and rendering interaction services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-ui` | `UniverSheetsUi` | Yes | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-ui
# or
npm install @univerjs/sheets-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

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

## Integration Notes

- Import `@univerjs/sheets-ui/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-ui)
- [GitHub repository](https://github.com/dream-num/univer)
