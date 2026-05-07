# @univerjs/sheets-data-validation

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-data-validation?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-data-validation)

`@univerjs/sheets-data-validation` connects shared data validation rules to Univer Sheets and provides sheet-specific commands, services, and Facade APIs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-data-validation` | `UniverSheetsDataValidation` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-data-validation
# or
npm install @univerjs/sheets-data-validation
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';

univer.registerPlugin(UniverSheetsDataValidationPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-data-validation-ui` when users need validation dialogs, dropdowns, and error UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-data-validation)
- [GitHub repository](https://github.com/dream-num/univer)

