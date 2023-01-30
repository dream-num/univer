# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Formula

### Installation

```shell
npm i @univerjs/sheets-plugin-formula
```

### Usage

```js
impport {Formula} from '@univerjs/sheets-plugin-formula'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Formula());
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
# Current directory ./packages/sheets-plugin-formula/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-formula dev
```

### Package

```
# Current directory ./packages/sheets-plugin-formula/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-formula build
```
