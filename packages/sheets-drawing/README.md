# @univerjs/sheets-drawing

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)

`@univerjs/sheets-drawing` connects the shared drawing model to Univer Sheets so worksheets can host drawing objects.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-drawing` | `UniverSheetsDrawing` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-drawing
# or
npm install @univerjs/sheets-drawing
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';

univer.registerPlugin(UniverSheetsDrawingPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-drawing-ui` when users need drawing interactions in the sheet UI.
- Import `@univerjs/sheets-drawing/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-drawing)
- [GitHub repository](https://github.com/dream-num/univer)
