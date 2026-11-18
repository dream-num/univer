# @univerjs/sheets-data-validation-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-data-validation-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-data-validation-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation-ui)

`@univerjs/sheets-data-validation-ui` adds data validation menus, dialogs, dropdowns, and validation UI for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-data-validation-ui` | `UniverSheetsDataValidationUi` | Yes | Yes | No | No |

## Installation

```sh
pnpm add @univerjs/sheets-data-validation-ui
# or
npm install @univerjs/sheets-data-validation-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/sheets-data-validation-ui/lib/index.css';
import EnUS from '@univerjs/sheets-data-validation-ui/locale/en-US';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';

univer.registerPlugin(UniverSheetsDataValidationUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverSheetsDataValidationUIPlugin`
- `UniverSheetsDataValidationMobileUIPlugin`

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-data-validation-ui)
- [GitHub repository](https://github.com/dream-num/univer)
