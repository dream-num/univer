# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin ImportDoc

### Installation

```bash
npm i @univer/docs-plugin-import-doc
```

### Usage

```js
impport {ImportDoc} from '@univer/docs-plugin-import-doc'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ImportDoc());
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
# Current directory ./packages/docs-plugin-import-doc/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/docs-plugin-import-doc dev
```

### Package

```
# Current directory ./packages/docs-plugin-import-doc/
npm run build

# Or root directory ./
pnpm run --filter  @univer/docs-plugin-import-doc build
```
