# @univerjs/sheets-sort-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-sort-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-sort-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-sort-ui?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-sort-ui)

`@univerjs/sheets-sort-ui` adds sorting menus and panels for Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-sort-ui` | `UniverSheetsSortUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/sheets-sort-ui
# or
npm install @univerjs/sheets-sort-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/sheets-sort-ui/lib/index.css';
import EnUS from '@univerjs/sheets-sort-ui/locale/en-US';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';

univer.registerPlugin(UniverSheetsSortUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-sort-ui)
- [GitHub repository](https://github.com/dream-num/univer)

