# @univerjs/sheets-formula-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-formula-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-formula-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-formula-ui)

`@univerjs/sheets-formula-ui` adds formula editing UI for Univer Sheets, including formula input, suggestions, highlighting, and range selection.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-formula-ui` | `UniverSheetsFormulaUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-formula-ui
# or
npm install @univerjs/sheets-formula-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-formula-ui/lib/index.css';
import EnUS from '@univerjs/sheets-formula-ui/locale/en-US';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';

univer.registerPlugin(UniverSheetsFormulaUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-formula-ui)
- [GitHub repository](https://github.com/dream-num/univer)

