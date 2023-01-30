# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin SplitColumn

### Installation

```shell
npm i @univerjs/sheets-plugin-split-column
```

### Usage

```js
impport {SplitColumn} from '@univerjs/sheets-plugin-split-column'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new SplitColumn());
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
# Current directory ./packages/sheets-plugin-split-column/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-split-column dev
```

### Package

```
# Current directory ./packages/sheets-plugin-split-column/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-split-column build
```
