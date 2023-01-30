# style-univer

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet official UI component library

## Features

-   Pure tsx components, which can be easily integrated into vue/react
-   Import on demand, don’t worry about affecting the package size

## Usage

### Install

```shell
npm i @univerjs/style-univer
```

### Import

```js
import baseUI from '@univerjs/style-univer';
universheet.install(baseUI);
universheet.create({
    plugins: ['style-univer'],
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
# Current directory ./packages/style-univer/
npm run dev

# Or project root directory ./
npm run dev -w @univerjs/style-univer
```

### Package

```
# Current directory ./packages/style-univer/
npm run build

# Or root directory ./
npm run build -w @univerjs/style-univer
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
# style-univer folder
npm run start

# or root folder
npm run start -w @univerjs/style-univer
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```console
# style-univer folder
npm run build:doc

# or root folder
npm run build:doc -w @univerjs/style-univer
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
