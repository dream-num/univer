# @univerjs/sheets-find-replace

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-find-replace)](https://img.shields.io/npm/l/@univerjs/sheets-find-replace)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## Introduction

This package provides the feature to find and replace text in spreadsheets.

## Usage

You should use this plugin with the `@univerjs/find-replace` package.

```ts
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
