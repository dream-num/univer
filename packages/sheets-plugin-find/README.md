# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Find

### Installation

```shell
npm i @univerjs/sheets-plugin-find
```

### Usage

```js
impport {Find} from '@univerjs/sheets-plugin-find'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Find());
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
# Current directory ./packages/sheets-plugin-find/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-find dev
```

### Package

```
# Current directory ./packages/sheets-plugin-find/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-find build
```
