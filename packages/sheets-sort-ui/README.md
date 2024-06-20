# @univerjs/sheets-sort-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-sort-ui)](https://npmjs.org/packages/@univerjs/sheets-sort-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-sort-ui)](https://img.shields.io/npm/l/@univerjs/sheets-sort-ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

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
