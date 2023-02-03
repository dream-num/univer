# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Sheets

### Installation

```shell
npm i @univerjs/ui-plugin-sheets
```

### Usage

```js
import { Sheets } from '@univerjs/ui-plugin-sheets';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Sheets());
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
# Current directory ./packages/ui-plugin-sheets/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/ui-plugin-sheets dev
```

### Package

```
# Current directory ./packages/ui-plugin-sheets/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/ui-plugin-sheets build
```
