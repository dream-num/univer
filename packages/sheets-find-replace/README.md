# @univerjs/sheets-find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-find-replace?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-find-replace)

`@univerjs/sheets-find-replace` extends shared find and replace capabilities to worksheets in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-find-replace` | `UniverSheetsFindReplace` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-find-replace
# or
npm install @univerjs/sheets-find-replace
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import EnUS from '@univerjs/sheets-find-replace/locale/en-US';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';

univer.registerPlugin(UniverSheetsFindReplacePlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

Use this package with `@univerjs/find-replace` to share find and replace infrastructure across Univer surfaces.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-find-replace)
- [GitHub repository](https://github.com/dream-num/univer)

