# style-universheet

English| [简体中文](./README-zh.md)

## Introduction

UniverSheet official UI component library

## Features

-   Pure tsx components, which can be easily integrated into vue/react
-   Import on demand, don’t worry about affecting the package size

## Usage

### Install

```bash
npm i @univer/style-universheet
```

### Import

```js
impport baseUI from'@univer/style-universheet'
universheet.install(baseUI)
universheet.create({
     plugins:['style-universheet']
})
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
# Current directory ./packages/style-universheet/
npm run dev

# Or project root directory ./
npm run dev -w @univer/style-universheet
```

### Package

```
# Current directory ./packages/style-universheet/
npm run build

# Or root directory ./
npm run build -w @univer/style-universheet
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
# style-universheet folder
npm run start

# or root folder
npm run start -w @univer/style-universheet
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```console
# style-universheet folder
npm run build:doc

# or root folder
npm run build:doc -w @univer/style-universheet
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
