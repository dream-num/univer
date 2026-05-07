# @univerjs/sheets-note

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-note?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-note)

`@univerjs/sheets-note` adds the core note model and commands for cell notes in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-note` | `UniverSheetsNote` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-note
# or
npm install @univerjs/sheets-note
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';

univer.registerPlugin(UniverSheetsNotePlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-note-ui` when users need note editing UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-note)
- [GitHub repository](https://github.com/dream-num/univer)

