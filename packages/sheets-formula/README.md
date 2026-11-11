# @univerjs/sheets-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-formula?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula)

`@univerjs/sheets-formula` connects the formula engine to Univer Sheets, including formula data services, dependency handling, and sheet-aware calculation.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-formula` | `UniverSheetsFormula` | No | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-formula
# or
npm install @univerjs/sheets-formula
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import EnUS from '@univerjs/sheets-formula/locale/en-US';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';

univer.registerPlugin(UniverSheetsFormulaPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Main-thread plugin classes:

- `UniverSheetsFormulaPlugin`

### Worker usage

On the main thread, import `UniverSheetsFormulaPlugin` from `@univerjs/sheets-formula`. Set `notExecuteFormula: true` to delegate calculation to the worker.

In the worker entry, import `UniverRemoteSheetsFormulaPlugin` from `@univerjs/sheets-formula/worker`:

```ts
import { UniverRemoteSheetsFormulaPlugin } from '@univerjs/sheets-formula/worker';

univer.registerPlugin(UniverRemoteSheetsFormulaPlugin);
```

## Integration Notes

Register this package with `@univerjs/engine-formula` and `@univerjs/sheets` before adding formula UI packages.
- Import `@univerjs/sheets-formula/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-formula)
- [GitHub repository](https://github.com/dream-num/univer)
