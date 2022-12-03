# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin Register

### Installation

```bash
npm i @univer/common-plugin-register
```

### Usage

```js
impport {Register} from '@univer/common-plugin-register'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Register());
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
# Current directory ./packages/common-plugin-register/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/common-plugin-register dev
```

### Package

```
# Current directory ./packages/common-plugin-register/
npm run build

# Or root directory ./
pnpm run --filter  @univer/common-plugin-register build
```
