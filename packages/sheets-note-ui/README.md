# @univerjs/sheets-note-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-note-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-note-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-note-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note-ui)

`@univerjs/sheets-note-ui` adds the UI for viewing and editing cell notes in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-note-ui` | `UniverSheetsNoteUi` | Yes | Yes | No | No |

## Installation

```sh
pnpm add @univerjs/sheets-note-ui
# or
npm install @univerjs/sheets-note-ui
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import '@univerjs/sheets-note-ui/lib/index.css';
import EnUS from '@univerjs/sheets-note-ui/locale/en-US';
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui';

univer.registerPlugin(UniverSheetsNoteUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-note-ui)
- [GitHub repository](https://github.com/dream-num/univer)
