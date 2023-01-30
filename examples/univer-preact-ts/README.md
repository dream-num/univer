# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Spreadsheet

### Installation

```shell
npm i univer-preact-ts
```

### Usage

```js
import {Spreadsheet} from 'univer-preact-ts'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Spreadsheet());
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
# Current directory ./packages/preact-ts/
npm run dev

# Or project root directory ./
pnpm run --filter  univer-preact-ts dev
```

### Package

```
# Current directory ./packages/preact-ts/
npm run build

# Or root directory ./
pnpm run --filter  univer-preact-ts build
```
