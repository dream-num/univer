# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Slides

### Installation

```shell
npm i @univerjs/slides
```

### Usage

```js
import { Slides } from '@univerjs/slides';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Slides());
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
# Current directory ./packages/base-slides/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/slides dev
```

### Package

```
# Current directory ./packages/base-slides/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/slides build
```
