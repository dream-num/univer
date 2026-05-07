# @univerjs/sheets-thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)

`@univerjs/sheets-thread-comment` connects shared thread comments to Univer Sheets and provides sheet-specific comment services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-thread-comment` | `UniverSheetsThreadComment` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-thread-comment
# or
npm install @univerjs/sheets-thread-comment
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';

univer.registerPlugin(UniverSheetsThreadCommentPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-thread-comment-ui` when users need comment UI in sheets.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-thread-comment)
- [GitHub repository](https://github.com/dream-num/univer)

