# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Comment

### Installation

```bash
npm i @univer/sheets-plugin-comment
```

### Usage

```js
impport {Comment} from '@univer/sheets-plugin-comment'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Comment());
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
# Current directory ./packages/sheets-plugin-comment/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-comment dev
```

### Package

```
# Current directory ./packages/sheets-plugin-comment/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-comment build
```
