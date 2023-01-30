# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Print

### Installation

```shell
npm i @univerjs/sheets-plugin-print
```

### Usage

```js
impport {Print} from '@univerjs/sheets-plugin-print'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Print());
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
# Current directory ./packages/sheets-plugin-print/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-print dev
```

### Package

```
# Current directory ./packages/sheets-plugin-print/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-print build
```
