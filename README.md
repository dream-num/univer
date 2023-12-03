# Univer

[![codecov](https://codecov.io/gh/dream-num/univer/graph/badge.svg?token=aPfyW2pIMN)](https://codecov.io/gh/dream-num/univer)

English | [简体中文](./README-zh.md)

## Introduction

Univer is an open source collaborative solution that aims to empower the collaboration capability into all systems. With Univer, users can synchronously edit the file content, making files flowing smoothly within different types of systems and avoid downloading and uploading Microsoft Office files anymore.

We provide JavaScript part of code in the repository, including a canvas-based framework for building documents, spreadsheets, slides.

> ⚠️ This project is still in heavy development.

## Demo

-   [Univer Demo](https://dream-num.github.io/univer-demo/)

## Packages

| Name                                        | Description | Version                                                                                                                        |
| :------------------------------------------ | :---------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                     | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fcore.svg)](https://badge.fury.io/js/@univerjs%2Fcore)                     |
| [design](./packages/design)                 | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fdesign.svg)](https://badge.fury.io/js/@univerjs%2Fdesign)                 |
| [docs](./packages/docs)                     | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fdocs.svg)](https://badge.fury.io/js/@univerjs%2Fdocs)                     |
| [docs-ui](./packages/docs-ui)               | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fdocs-ui.svg)](https://badge.fury.io/js/@univerjs%2Fdocs-ui)               |
| [engine-formula](./packages/engine-formula) | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fengine-formula.svg)](https://badge.fury.io/js/@univerjs%2Fengine-formula) |
| [engine-numfmt](./packages/engine-numfmt)   | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fengine-numfmt.svg)](https://badge.fury.io/js/@univerjs%2Fengine-numfmt)   |
| [engine-render](./packages/engine-render)   | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fengine-render.svg)](https://badge.fury.io/js/@univerjs%2Fengine-render)   |
| [formula](./packages/formula)               | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fformula.svg)](https://badge.fury.io/js/@univerjs%2Fformula)               |
| [rpc](./packages/rpc)                       | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fsvg.svg)](https://badge.fury.io/js/@univerjs%2Frpc)                       |
| [sheets-formula](./packages/sheets-formula) | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fsheets-formula.svg)](https://badge.fury.io/js/@univerjs%2Fsheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)   | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fsheets-numfmt.svg)](https://badge.fury.io/js/@univerjs%2Fsheets-numfmt)   |
| [sheets](./packages/sheets)                 | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fsheets.svg)](https://badge.fury.io/js/@univerjs%2Fsheets)                 |
| [slides](./packages/slides)                 | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fslides.svg)](https://badge.fury.io/js/@univerjs%2Fslides)                 |
| [ui](./packages/ui)                         | -           | [![npm version](https://badge.fury.io/js/@univerjs%2Fui.svg)](https://badge.fury.io/js/@univerjs%2Fui)                         |

## Contribution

Please refer to [Contribution Guide](./CONTRIBUTING.md).

## Community

Welcome to join our [Discord community](https://discord.gg/z3NKNT6D2f).

## Issues

Please file an issue at [Issues](http://github.com/dream-num/univer/issues).

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## Architecture

Univer is written in typescript and designed according to the plugin architecture. The functions outside the core are developed in the form of plugins.

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

---

Copyright DreamNum Inc. 2023-present
