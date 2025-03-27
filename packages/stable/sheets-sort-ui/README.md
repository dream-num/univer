# @univerjs/sheets-sort-ui

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-sort-ui` | `UniverSheetsSortUi` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ⭕️ | ⭕️ |

## Introduction

`@univerjs/sheets-sort-ui` provides a user interface for sorting in sheets.

## Usage

You should use this plugin with the `@univerjs/sheets-sort` package.

```ts
import '@univerjs/sheets-sort-ui/lib/index.css';

import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';

univer.registerPlugin(UniverSheetsSortPlugin);
univer.registerPlugin(UniverSheetsSortUIPlugin);
```

### Installation

```shell
# Using npm
npm install @univerjs/sheets-sort-ui

# Using pnpm
pnpm add @univerjs/sheets-sort-ui
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-sort-ui?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-sort-ui
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-sort-ui?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-sort-ui?style=flat-square
