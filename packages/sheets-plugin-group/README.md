# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Group

### Installation

```bash
npm i @univer/sheets-plugin-group
```

### Usage

```js
impport {Group} from '@univer/sheets-plugin-group'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Group());
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
# Current directory ./packages/sheets-plugin-group/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-group dev
```

### Package

```
# Current directory ./packages/sheets-plugin-group/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-group build
```
