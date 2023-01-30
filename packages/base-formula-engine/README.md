# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin FormulaEngine

### Installation

```shell
npm i @univerjs/base-formula-engine
```

### Usage

```js
import { FormulaEngine } from '@univerjs/base-formula-engine';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new FormulaEngine());
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
# Current directory ./packages/base-formula-engine/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/base-formula-engine dev
```

### Package

```
# Current directory ./packages/base-formula-engine/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/base-formula-engine build
```
