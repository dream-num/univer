# @univerjs/sheets-find-replace

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/sheets-find-replace` | `UniverSheetsFindReplace` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ❌ | ⭕️ |

## Introduction

This package provides the feature to find and replace text in spreadsheets.

## Usage

You should use this plugin with the `@univerjs/find-replace` package.

```typescript
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';

univer.registerPlugin(UniverFindReplacePlugin);
univer.registerPlugin(UniverSheetsFindReplacePlugin);
```

### Installation

```shell
# Using npm
npm install @univerjs/sheets-find-replace

# Using pnpm
pnpm add @univerjs/sheets-find-replace
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/sheets-find-replace?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/sheets-find-replace
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/sheets-find-replace?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/sheets-find-replace?style=flat-square
