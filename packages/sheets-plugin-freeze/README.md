# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Frozen

### Installation

```bash
npm i @univer/sheets-plugin-freeze
```

### Usage

```js
impport {Frozen} from '@univer/sheets-plugin-freeze'

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
# Current directory ./packages/sheets-plugin-freeze/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-freeze dev
```

### Package

```
# Current directory ./packages/sheets-plugin-freeze/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-freeze build
```
