# @univerjs/sheets-drawing-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-drawing-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-drawing-ui)

`@univerjs/sheets-drawing-ui` adds the UI for creating, selecting, editing, and exporting drawing objects in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-drawing-ui` | `UniverSheetsDrawingUi` | Yes | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-drawing-ui
# or
npm install @univerjs/sheets-drawing-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/sheets-drawing-ui/lib/index.css';
import EnUS from '@univerjs/sheets-drawing-ui/locale/en-US';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';

univer.registerPlugin(UniverSheetsDrawingUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

- Import `@univerjs/sheets-drawing-ui/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-drawing-ui)
- [GitHub repository](https://github.com/dream-num/univer)
