# @univerjs/sheets-thread-comment

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-thread-comment?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-thread-comment)

`@univerjs/sheets-thread-comment` connects shared thread comments to Univer Sheets and provides sheet-specific comment services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-thread-comment` | `UniverSheetsThreadComment` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-thread-comment
# or
npm install @univerjs/sheets-thread-comment
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';

univer.registerPlugin(UniverSheetsThreadCommentPlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-thread-comment-ui` when users need comment UI in sheets.
- Import `@univerjs/sheets-thread-comment/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-thread-comment)
- [GitHub repository](https://github.com/dream-num/univer)
