# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Sort

### Installation

```bash
npm i @univerjs/sheets-plugin-sort
```

### Usage

```js
impport {Sort} from '@univerjs/sheets-plugin-sort'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Sort());
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
# Current directory ./packages/sheets-plugin-sort/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-sort dev
```

### Package

```
# Current directory ./packages/sheets-plugin-sort/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-sort build
```
