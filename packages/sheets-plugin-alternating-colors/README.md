# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin AlternatingColors

### Installation

```shell
npm i @univerjs/sheets-plugin-alternating-colors
```

### Usage

```js
impport {AlternatingColors} from '@univerjs/sheets-plugin-alternating-colors'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new AlternatingColors());
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
# Current directory ./packages/sheets-plugin-alternating-colors/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-alternating-colors dev
```

### Package

```
# Current directory ./packages/sheets-plugin-alternating-colors/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-alternating-colors build
```
