# @univerjs/sheets-filter-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-filter-ui)](https://npmjs.org/packages/@univerjs/sheets-filter-ui)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-filter-ui)](https://img.shields.io/npm/l/@univerjs/sheets-filter-ui)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## Introduction

`@univerjs/sheets-filter-ui` provides a user interface for filtering in sheets.

## Usage

You should use this plugin with the `@univerjs/sheets-filter` package.

```ts
import '@univerjs/sheets-filter-ui/lib/index.css';

import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsFilterUIPlugin);
```

### Installation

```shell
# Using npm
npm install @univerjs/sheets-filter-ui

# Using pnpm
pnpm add @univerjs/sheets-filter-ui
```
