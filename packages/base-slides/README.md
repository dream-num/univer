# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Slides

### Installation

```shell
npm i @univerjs/base-slides
```

### Usage

```js
impport {Slides} from '@univerjs/base-slides'

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
pnpm run --filter  @univerjs/base-slides dev
```

### Package

```
# Current directory ./packages/base-slides/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/base-slides build
```
