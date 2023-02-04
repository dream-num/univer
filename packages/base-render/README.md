# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Spreadsheet

### Installation

```shell
npm i @univerjs/base-render
```

### Usage

```js
import { Spreadsheet } from '@univerjs/base-render';

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
# Current directory ./packages/base-render/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/base-render dev
```

### Package

```
# Current directory ./packages/base-render/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/base-render build
```
