# @univerjs/sheets-find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)

`@univerjs/sheets-find-replace` extends shared find and replace capabilities to worksheets in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/sheets-find-replace` | `UniverSheetsFindReplace` | No | No | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-find-replace
# or
npm install @univerjs/sheets-find-replace
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';

univer.registerPlugin(UniverSheetsFindReplacePlugin);
```

## Integration Notes

Use this package with `@univerjs/find-replace` to share find and replace infrastructure across Univer surfaces.
- Import `@univerjs/sheets-find-replace/facade` when using this package through Univer Facade APIs.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-find-replace)
- [GitHub repository](https://github.com/dream-num/univer)
