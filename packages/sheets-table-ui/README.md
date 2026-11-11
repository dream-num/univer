# @univerjs/sheets-table-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-table-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-table-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-table-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table-ui)

`@univerjs/sheets-table-ui` adds table UI interactions for Univer Sheets, including menus and controls for table-related workflows.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-table-ui` | `UniverSheetsTableUi` | Yes | Yes | No | No |

## Installation

```sh
pnpm add @univerjs/sheets-table-ui
# or
npm install @univerjs/sheets-table-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/sheets-table-ui/lib/index.css';
import EnUS from '@univerjs/sheets-table-ui/locale/en-US';
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui';

univer.registerPlugin(UniverSheetsTableUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-table-ui)
- [GitHub repository](https://github.com/dream-num/univer)
