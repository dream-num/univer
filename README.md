<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/img/banner-light.png">
        <img src="./docs/img/banner-dark.png" alt="Univer" width="400" />
    </picture>
</p>

<p align="center">
  <a href="./LICENSE.txt">
    <img src="https://img.shields.io/github/license/dream-num/univer" alt="GitHub License" />
  </a>
  <a href="https://github.com/dream-num/univer/actions/workflows/build.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/dream-num/univer/build.yml" alt="GitHub Workflow Status" />
  </a>
  <a href="https://codecov.io/gh/dream-num/univer">
    <img src="https://codecov.io/gh/dream-num/univer/graph/badge.svg?token=aPfyW2pIMN" alt="codecov" />
  </a>
  <a href="https://www.codefactor.io/repository/github/dream-num/univer/overview/dev">
    <img src="https://www.codefactor.io/repository/github/dream-num/univer/badge/dev" alt="CodeFactor" />
  </a>
  <a href="https://discord.gg/z3NKNT6D2f">
    <img src="https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2" alt="Discord" />
  </a>
</p>

<p align="center">
  English
  |
  <a href="./README-zh.md">简体中文</a>
</p>

<!-- An introduction photo here. -->

> 🚧 This project is still in heavy development. Please note that there are likely to be major API changes. Please submit issues and suggestions to us.

## Introduction

Univer is a set of enterprise document and data collaboration solutions, including spreadsheets, documents, and slides. The highly extensible design allows developers to customize personalized functions based on Univer.

Highlights of Univer:

-   📈 Univer supports spreadsheets. Documents and slides will be supported in the future.
-   🌌 Highly extensible architecture design.
    -   🔌 Plug-in architecture, the capabilities of documents can be combined on demand, support third-party plug-ins, and facilitate customization development.
    -   💄 Provide component library and icons to help developers present a consistent user experience.
-   ⚡ High performance.
    -   ✏️ Unified and efficient rendering engine and formula engine, based on Canvas.
    -   🧮 High-performance formula engine, supports Web Worker.
-   🌍 Internationalization support.

## Usage

We recommend to import Univer as a npm package. Please checkout the [Quick Start]() section on the documentation website. We also have an [online playground]() which can help you preview Univer without setting up the development environment.

Univer bases on a plugin architecture. You can install the following packages to enhance the functionality of Univer.

### Packages

| Name                                             | Description                                                                                                                      | Version                                                                                                                     |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                          | Implements plugin system and architecture of Univer. It also provides basic services and models of different types of documents. | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [design](./packages/design)                      | Implements the design system on Univer. It provides CSS and a component kit based on React.                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                          | Implements basic logics of rich text editing features. It also facilitates text editing in other types of documents.             | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                    | Provides user interface of Univer Documents                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)      | It implements a rendering engine based on Canvas and is extensible for                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)        | It implements a number format engine.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)        | It implements a rendering engine based on canvas context2d.                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [rpc](./packages/rpc)                            | It implements a RPC mechanism and methods to sync data between different replicas of Univer documents.                           | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                      | Basic logics of spreadsheet features.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-formula](./packages/sheets-formula)      | It implements formula in spreadsheets.                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)        | It implements number format in spreadsheets.                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-ui](./packages/sheets-ui)                | Provides user interface of Univer Spreadsheets                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                              | Implements basic user interactions with Univer and workbench layout based on React.                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) (experimental) | Implements a DSL based on Typescript that empowers users to accomplish more sophisticated tasks                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## Contribution

We appreciate any kinds of contributing. You can submit [issues or feature requests](https://github.com/dream-num/univer/issues) to us. Please read our [contributing guide](./CONTRIBUTING.md) first.

If you would like to contribute code to Univer, please refer to the contributing guide as well. It would guide you through the process of setting up the development environment and submitting a pull request.

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## Links

-   [Documentation]()
-   [Online Playground]()
-   [Official Website]()
-   [Legacy Univer Demo](https://dream-num.github.io/univer-demo/)

### Community

-   [Discord community](https://discord.gg/z3NKNT6D2f)

## License

Univer is distributed under the terms of the Apache-2.0 license.

---

Copyright DreamNum Inc. 2023-present
