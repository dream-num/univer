# @univerjs/sheets-drawing

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-drawing?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing)

`@univerjs/sheets-drawing` connects the shared drawing model to Univer Sheets so worksheets can host drawing objects.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-drawing` | `UniverSheetsDrawing` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-drawing
# or
npm install @univerjs/sheets-drawing
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';

univer.registerPlugin(UniverSheetsDrawingPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-drawing-ui` when users need drawing interactions in the sheet UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-drawing)
- [GitHub repository](https://github.com/dream-num/univer)

