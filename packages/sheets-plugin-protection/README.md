# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Protection

### Installation

```bash
npm i @univer/sheets-plugin-protection
```

### Usage

```js
impport {Protection} from '@univer/sheets-plugin-protection'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Protection());
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
# Current directory ./packages/sheets-plugin-protection/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-protection dev
```

### Package

```
# Current directory ./packages/sheets-plugin-protection/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-protection build
```
