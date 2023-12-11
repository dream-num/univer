<!-- Logo here. -->

# Univer

![GitHub License](https://img.shields.io/github/license/dream-num/univer)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/dream-num/univer/build.yml)
[![codecov](https://codecov.io/gh/dream-num/univer/graph/badge.svg?token=aPfyW2pIMN)](https://codecov.io/gh/dream-num/univer)
[![CodeFactor](https://www.codefactor.io/repository/github/dream-num/univer/badge/dev)](https://www.codefactor.io/repository/github/dream-num/univer/overview/dev)
[![discord](https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2)](https://discord.gg/z3NKNT6D2f)

English | [简体中文](./README-zh.md)

<!-- A introduction photo here. -->

> ⚠️ This project is still in heavy development.

## Introduction

Univer is a set of enterprise document and data collaboration solutions, including spreadsheets, documents, and slides. The highly extensible design allows developers to customize personalized functions based on Univer.

-   📈 Univer supports spreadsheets. Documents and slides will be supported in the future
-   🌌 Highly extensible architecture design
    -   🔌 Plug-in architecture, the capabilities of documents can be combined on demand, support third-party plug-ins, and facilitate customization development
    -   💄 Provide component library and icons to help developers present a consistent user experience
-   ⚡ High performance
    -   ✏️ Unified and efficient rendering engine and formula engine, based on Canvas
    -   🧮 High-performance formula engine, supports Web Worker
-   🌍 Internationalization support

## Links

-   [Online Playground]()
-   [Documentation]()
-   [Official Website]()
-   [Legacy Univer Demo](https://dream-num.github.io/univer-demo/)

## Packages

| Name                                        | Description | Version                                                                                                                     |
| :------------------------------------------ | :---------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                     | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [design](./packages/design)                 | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                     | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)               | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula) | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)   | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)   | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [rpc](./packages/rpc)                       | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                 | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-formula](./packages/sheets-formula) | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)   | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-ui](./packages/sheets-ui)           | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                         | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript)           | -           | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## Contribution

Please refer to [Contribution Guide](./CONTRIBUTING.md).

## Community

Welcome to join our [Discord community](https://discord.gg/z3NKNT6D2f).

## Issues

Please file an issue at [Issues](http://github.com/dream-num/univer/issues).

## Architecture

Univer is written in typescript and designed according to the plugin architecture. The functions outside the core are developed in the form of plugins.

## Rendering engine

Univer sheet, document, and slide adopt the same rendering engine architecture, which abstracts the application into text flow, table, canvas, and core part triggers rendering, and object is the renderer.

## Formula engine

Univer formula engine, supports asynchronous calculation, lambda function and range naming

---

Copyright DreamNum Inc. 2023-present
