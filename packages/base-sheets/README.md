# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Spreadsheet

### Installation

```bash
npm i @univer/base-sheets
```

### Usage

```js
import {Spreadsheet} from '@univer/base-sheets'

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
# Current directory ./packages/base-sheets/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/base-sheets dev
```

### Package

```
# Current directory ./packages/base-sheets/
npm run build

# Or root directory ./
pnpm run --filter  @univer/base-sheets build
```
