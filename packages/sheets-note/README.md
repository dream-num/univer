# @univerjs/sheets-note

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)

`@univerjs/sheets-note` adds the core note model and commands for cell notes in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-note` | `UniverSheetsNote` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-note
# or
npm install @univerjs/sheets-note
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';

univer.registerPlugin(UniverSheetsNotePlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-note-ui` when users need note editing UI.
- Import `@univerjs/sheets-note/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-note)
- [GitHub repository](https://github.com/dream-num/univer)
