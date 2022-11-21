# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet Plugin <%= projectUpperValue %>

### Installation

```bash
npm i @univer/<%= projectName %>
```

### Usage

```js
impport {<%= projectUpperValue %>} from '@univer/<%= projectName %>'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new <%= projectUpperValue %>());
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
# Current directory ./packages/<%= projectName %>/
npm run dev

# Or project root directory ./
pnpm run --filter  @univer/<%= projectName %> dev
```

### Package

```
# Current directory ./packages/<%= projectName %>/
npm run build

# Or root directory ./
pnpm run --filter  @univer/<%= projectName %> build
```
