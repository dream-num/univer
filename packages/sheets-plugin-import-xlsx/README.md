# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin ImportXlsx

### Installation

```bash
npm i @univer/sheets-plugin-import-xlsx
```

### Usage

```js
impport {ImportXlsx} from '@univer/sheets-plugin-import-xlsx'

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
pnpm run --filter  @univer/sheets-plugin-import-xlsx dev
```

### Package

```
# Current directory ./packages/sheets-plugin-import-xlsx/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-import-xlsx build
```
