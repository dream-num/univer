# base-ui

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet official UI component library

## Features

-   Pure tsx components, which can be easily integrated into vue/react
-   Import on demand, don’t worry about affecting the package size

## Usage

### Install

```shell
npm i @univerjs/base-ui
```

### Import

```js
import baseUI from '@univerjs/base-ui';
universheet.install(baseUI);
universheet.create({
    plugins: ['base-ui'],
});
```

## Local development

### Requirements

-   [Node.js](https://nodejs.org/en/) Version >= 10
-   [npm](https://www.npmjs.com/) Version >= 7

### Installation

```
npm i
```

### Development

```
# Current directory ./packages/base-ui/
npm run dev

# Or project root directory ./
npm run dev -w @univerjs/base-ui
```

### Package

```
# Current directory ./packages/base-ui/
npm run build

# Or root directory ./
npm run build -w @univerjs/base-ui
```

## Doc Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```console
# root folder
npm i
```

### Development

```console
# base-ui folder
npm run start

# or root folder
npm run start -w @univerjs/base-ui
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```console
# base-ui folder
npm run build:doc

# or root folder
npm run build:doc -w @univerjs/base-ui
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
