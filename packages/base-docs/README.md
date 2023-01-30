# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Docs

### Installation

```shell
npm i @univerjs/base-docs
```

### Usage

```js
impport {Docs} from '@univerjs/base-docs'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Docs());
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
# Current directory ./packages/base-docs/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/base-docs dev
```

### Package

```
# Current directory ./packages/base-docs/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/base-docs build
```
