# Univer

<p align="center">
  English
  |
  <a href="./docs/readme/zh-CN/README.md">简体中文</a>
  |
  <a href="./docs/readme/zh-HK/README.md">繁體中文</a>
  |
  <a href="./docs/readme/ja-JP/README.md">日本語</a>
</p>

## Introduction

Univer is an open source collabrative solution,  which aims to empower the collaboration capability into all systems. With Univer, users can synchronously edit the file content, making files flowing smoothly within different types of systems and avoid downloading and uploading Microsoft Office files anymore.

We provide javascript part of code in the repository, including a canvas-based framework for building documents, spreadsheets, slides.

> ⚠️ This project is still in development, only for testing and learning, not for production

## Demo

- [Univer Demo](https://dream-num.github.io/univer-demo/)

## Development

### Requirements

- [node.js](https://nodejs.org) version 16.20.0
- [pnpm](https://pnpm.io) version 8.6.2

### Installation

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
pnpm i
```

### Development

Start concurrently

```bash
npm run dev
```

Start sheets

```bash
npm run dev:sheet
```

Start docs

```bash
npm run dev:doc
```

Start slides

```bash
npm run dev:slide
```

For more development tutorials, please refer to [Contribution Guide](./.github/contributing.md).

## Community

Welcome to join our [Discord community](https://discord.gg/w2f6VUKw).


## Issues

Please file an issue at [Issues](http://github.com/dream-num/univer/issues).

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## Architecture

Univer is written in TypeScript and designed according to the plug-in architecture. The functions outside the core are developed in the form of plug-ins. In the future, a plug-in market will be built to meet more personalized needs
![image](./docs/source/overall.png)

## Rendering engine

Univer sheet, document, and slide adopt the same rendering engine architecture, which abstracts the application into text flow, table, canvas, and core part triggers rendering, and object is the renderer.
![image](./docs/source/Render%20Engine.png)

1. Achieve the nesting and operation between applications.
2. Sheet cells support embedding doc text
3. Support inserting sheet, doc, slide in slide

|     slide 10-layer embedding      |         Sheet in slide and doc in cell         |   wrap text around a picture    |
| :-------------------------------: | :--------------------------------------------: | :-----------------------------: |
| ![image](./docs/source/Slide.png) | ![image](./docs/source/Sheet%20in%20slide.png) | ![image](./docs/source/doc.png) |

## Formula engine

Univer formula engine, supports asynchronous calculation, lambda function and range naming

![image](./docs/source/Formula%20Engine.png)
