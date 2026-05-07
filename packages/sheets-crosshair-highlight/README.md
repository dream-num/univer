# @univerjs/sheets-crosshair-highlight

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-crosshair-highlight?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-crosshair-highlight)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-crosshair-highlight?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-crosshair-highlight)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-crosshair-highlight?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-crosshair-highlight)

`@univerjs/sheets-crosshair-highlight` adds crosshair highlighting for the active row and column in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-crosshair-highlight` | `UniverSheetsCrosshairHighlight` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-crosshair-highlight
# or
npm install @univerjs/sheets-crosshair-highlight
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-crosshair-highlight/lib/index.css';
import EnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US';
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight';

univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-crosshair-highlight)
- [GitHub repository](https://github.com/dream-num/univer)

