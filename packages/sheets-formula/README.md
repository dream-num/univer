# @univerjs/sheets-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)

`@univerjs/sheets-formula` connects the formula engine to Univer Sheets, including formula data services, dependency handling, and sheet-aware calculation.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-formula` | `UniverSheetsFormula` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-formula
# or
npm install @univerjs/sheets-formula
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import EnUS from '@univerjs/sheets-formula/locale/en-US';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';

univer.registerPlugin(UniverSheetsFormulaPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Exported plugin classes:

- `UniverSheetsFormulaPlugin`
- `UniverRemoteSheetsFormulaPlugin`

## Integration Notes

Register this package with `@univerjs/engine-formula` and `@univerjs/sheets` before adding formula UI packages.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-formula)
- [GitHub repository](https://github.com/dream-num/univer)

