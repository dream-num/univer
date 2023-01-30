# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin InsertLink

### Installation

```bash
npm i @univerjs/sheets-plugin-insert-link
```

### Usage

```js
impport {InsertLink} from '@univerjs/sheets-plugin-insert-link'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new InsertLink());
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
# Current directory ./packages/plugin-insert-link/
npm run dev

# Or project root directory ./
pnpm run --filter  @univerjs/sheets-plugin-insert-link dev
```

### Package

```
# Current directory ./packages/plugin-insert-link/
npm run build

# Or root directory ./
pnpm run --filter  @univerjs/sheets-plugin-insert-link build
```
