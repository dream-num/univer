# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin ConditionalFormat

### Installation

```bash
npm i @univer/sheets-plugin-conditional-format
```

### Usage

```js
import {ConditionalFormat} from '@univer/sheets-plugin-conditional-format'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ConditionalFormat());
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
# Current directory ./packages/sheets-plugin-conditional-format/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-conditional-format dev
```

### Package

```
# Current directory ./packages/sheets-plugin-conditional-format/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-conditional-format build
```
