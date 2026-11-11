# @univerjs/sheets

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)
[![license](https://img.shields.io/npm/l/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets?style=flat-square)](https://npmjs.com/package/@univerjs/sheets)

`@univerjs/sheets` provides the core spreadsheet data model and business logic for Univer Sheets, independent of the UI layer.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets` | `UniverSheets` | No | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets
# or
npm install @univerjs/sheets
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import EnUS from '@univerjs/sheets/locale/en-US';
import { UniverSheetsPlugin } from '@univerjs/sheets';

univer.registerPlugin(UniverSheetsPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

### Worker usage

On the main thread, import `UniverSheetsPlugin` from `@univerjs/sheets`. Set `notExecuteFormula: true` to delegate calculation to the worker.

In the worker entry, import `UniverSheetsPlugin` from `@univerjs/sheets/worker`:

```ts
import { UniverSheetsPlugin } from '@univerjs/sheets/worker';

univer.registerPlugin(UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true });
```

## Integration Notes

- Import `@univerjs/sheets/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets)
- [GitHub repository](https://github.com/dream-num/univer)
