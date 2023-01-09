# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Screenshot

### Installation

```bash
npm i @univer/sheets-plugin-screenshot
```

### Usage

```js
impport {Screenshot} from '@univer/sheets-plugin-screenshot'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Screenshot());
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
# Current directory ./packages/sheets-plugin-screenshot/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/sheets-plugin-screenshot dev
```

### Package

```
# Current directory ./packages/sheets-plugin-screenshot/
npm run build

# Or root directory ./
pnpm run --filter  @univer/sheets-plugin-screenshot build
```
