# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin ImportXlsx

### Installation

```shell
npm i @univerjs/sheets-import-xlsx
```

### Usage

```js
import { ImportXlsx } from '@univerjs/sheets-import-xlsx';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ImportXlsx());
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
# Current directory ./packages/sheets-plugin-import-xlsx/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-import-xlsx dev
```

### Package

```
# Current directory ./packages/sheets-plugin-import-xlsx/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-import-xlsx build
```
