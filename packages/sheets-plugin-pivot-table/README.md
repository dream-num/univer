# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin PivotTable

### Installation

```bash
npm i @univer/sheets-plugin-pivot-table
```

### Usage

```js
import {PivotTable} from '@univer/sheets-plugin-pivot-table'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new PivotTable());
```

## Local development

### Requirements

-   [Node.js](https://nodejs.org/en/) Version >= 10
-   [npm](https://www.npmjs.com/) Version >= 6

### Installation

```
pnpm install
```

### Development

```
# Current directory ./packages/sheets-plugin-pivot-table/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-pivot-table dev
```

### Package

```
# Current directory ./packages/sheets-plugin-pivot-table/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-pivot-table build
```
