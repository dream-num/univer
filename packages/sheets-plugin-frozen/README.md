# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Frozen

### Installation

```bash
npm i @univer/sheets-plugin-frozen
```

### Usage

```js
impport {Frozen} from '@univer/sheets-plugin-frozen'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Frozen());
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
# Current directory ./packages/sheets-plugin-frozen/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-frozen dev
```

### Package

```
# Current directory ./packages/sheets-plugin-frozen/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-frozen build
```
