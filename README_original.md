<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/img/banner-light.png">
        <img src="./docs/img/banner-dark.png" alt="Univer" width="400" />
    </picture>
</p>

<p align="center">
    <a href="./LICENSE">
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
    |
    <a href="./README-ja.md">日本語</a>
</p>

<!-- An introduction photo here. -->

> 🚧 This project is still in heavy development. Please note that there are likely to be major API changes. Please submit issues and suggestions to us.

## Introduction

Univer is an open-source alternative to Google Sheets, Slides, and Docs.

Highlights:

- 📈 Univer is designed to support both **spreadsheets** and **documents**. **Slides** will be supported as well in the future.
- ⚙️ Univer is easily **embeddable**, allowing seamless integration into your applications.
- 🎇 Univer is **powerful**, offering a wide range of features including **formulas**, **conditional formatting**, **data validation**, **filtering**, **collaborative editing**, **printing**, **import & export** and more features on the horizon.
- 🔌 Univer is **highly extensible**, thanks to its *plug-in architecture* and *Facade API* that makes it a delight for developers to implement their unique requirements on the top of Univer.
- 💄 Univer is **highly customizable**, allowing you to personalize its appearance using *themes*. It also provides support for internationalization (i18n).
- ⚡ Univer in **performant**.
  - ✏️ Univer boasts an efficient *rendering engine* based on canvas, capable of rendering various document types flawlessly. The rendering engines supports advanced typesetting features such as *punctuation squeezing*, *text and image layout* and *scroll buffering*.
  - 🧮 Univer incorporates a lightning-fast *formula engine* that can operate in Web Workers or even on the server side.
- 🌌 Univer is a **highly integrated** system. Documents, spreadsheets and slides can interoperate with each others and even rendered on the same canvas, allowing information and data flow within Univer.

## Examples

| &nbsp; | &nbsp; | &nbsp; |
| :---: | :---: | :---: |
| 📊 Sheets | 📊 Sheets Multi | 📊 Sheets Uniscript |
| [![](./docs/img/examples-sheets.gif)](https://univer.ai/examples/sheets/) | [![](./docs/img/examples-sheets-multi.gif)](https://univer.ai/examples/sheets-multi/) | [![](./docs/img/examples-sheets-uniscript.gif)](https://univer.ai/examples/sheets-uniscript/) |
| 📊 Sheets Big Data | 📊 Sheets Collaboration (Pro) | 📊 Sheets Collaboration Playground (Pro) |
| [![](./docs/img/examples-sheets-big-data.gif)](https://univer.ai/examples/sheets-big-data/) | [![](./docs/img/pro-examples-sheets-collaboration.gif)](https://univer.ai/pro/examples/sheets-collaboration/) | [![](./docs/img/pro-examples-sheets-collaboration-playground.gif)](https://univer.ai/pro/examples/sheets-collaboration-playground/) |
| 📊 Sheets Import/Export (Pro) | 📊 Sheets Print (Pro) | 📝 Docs |
| [![](./docs/img/pro-examples-sheets-exchange.gif)](https://univer.ai/pro/examples/sheets-exchange/) | [![](./docs/img/pro-examples-sheets-print.gif)](https://univer.ai/pro/examples/sheets-print/) | [![](./docs/img/examples-docs.gif)](https://univer.ai/examples/docs/) |
| 📝 Docs Multi | 📝 Docs Uniscript | 📝 Docs Big Data |
| [![](./docs/img/examples-docs-multi.gif)](https://univer.ai/examples/docs-multi/) | [![](./docs/img/examples-docs-uniscript.gif)](https://univer.ai/examples/docs-uniscript/) | [![](./docs/img/examples-docs-big-data.gif)](https://univer.ai/examples/docs-big-data/) |
| 📝 Docs Collaboration (Pro) | 📝 Docs Collaboration Playground (Pro) | 📽️ Slides |
| [![](./docs/img/pro-examples-docs-collaboration.gif)](https://univer.ai/pro/examples/docs-collaboration/) | [![](./docs/img/pro-examples-docs-collaboration-playground.gif)](https://univer.ai/pro/examples/docs-collaboration-playground/) | [![](./docs/img/examples-slides.gif)](https://univer.ai/examples/slides/) |
| 📊 Zen Mode | Univer Workspace (SaaS version) | &nbsp; |
| [![](./docs/img/zen-mode.gif)](https://univer.ai/zh-CN/guides/sheet/tutorials/zen-editor/#%E6%BC%94%E7%A4%BA) | [![](./docs/img/univer-workspace-drag-chart.gif)](https://youtu.be/kpV0MvQuFZA) | &nbsp; |

## Usage

We recommend to import Univer as a npm package. Please checkout the [Quick Start](https://univer.ai/guides/sheet/getting-started/quickstart) section on the documentation website. We also have an [online playground](https://univer.ai/playground/) which can help you preview Univer without setting up the development environment.

Univer bases on a plugin architecture. You can install the following packages to enhance the functionality of Univer.

### Packages

| Name                                                                              | Description                                                                                                                      | Version                                                                                                                                                             |
| :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [core](./packages/core)                                                           | Implements plugin system and architecture of Univer. It also provides basic services and models of different types of documents. | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                                                             |
| [data-validation](./packages/data-validation)                                     | Implements data validation features in Univer.                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/data-validation)](https://npmjs.org/package/@univerjs/data-validation)                                       |
| [design](./packages/design)                                                       | Implements the design system on Univer. It provides CSS and a component kit based on React.                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                                                         |
| [docs](./packages/docs)                                                           | Implements basic logics of rich text editing features. It also facilitates text editing in other types of documents.             | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                                                             |
| [docs-ui](./packages/docs-ui)                                                     | Provides user interface of Univer Documents                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)                                                       |
| [engine-formula](./packages/engine-formula)                                       | It implements a rendering engine based on Canvas and is extensible for                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula)                                         |
| [engine-numfmt](./packages/engine-numfmt)                                         | It implements a number format engine.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)                                           |
| [engine-render](./packages/engine-render)                                         | It implements a rendering engine based on canvas context2d.                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)                                           |
| [facade](./packages/facade)                                                       | It serves as an API layer to make it easier to use Univer                                                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                                                         |
| [find-replace](./packages/find-replace)                                           | It implements find and replace features in Univer.                                                                               | [![npm version](https://img.shields.io/npm/v/@univerjs/find-replace)](https://npmjs.org/package/@univerjs/find-replace)                                             |
| [network](./packages/network)                                                     | It implements network services based on WebSocket and HTTP.                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)                                                       |
| [rpc](./packages/rpc)                                                             | It implements a RPC mechanism and methods to sync data between different replicas of Univer documents.                           | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                                                               |
| [sheets](./packages/sheets)                                                       | Basic logics of spreadsheet features.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                                                         |
| [sheets-conditional-formatting](./packages/sheets-conditional-formatting)         | It implements conditional formatting in Univer Spreadsheets.                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting)](https://npmjs.org/package/@univerjs/sheets-conditional-formatting)           |
| [sheets-conditional-formatting-ui](./packages/sheets-conditional-formatting-ui)   | It implements conditional formatting in Univer Spreadsheets.                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting-ui)](https://npmjs.org/package/@univerjs/sheets-conditional-formatting-ui)     |
| [sheets-data-validation](./packages/data-validation)                              | It implements data validation in Univer Spreadsheets.                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation)](https://npmjs.org/package/@univerjs/sheets-data-validation)                         |
| [sheets-find-replace](./packages/sheets-find-replace)                             | It implements find and replace features in Univer Spreadsheets.                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace)                               |
| [sheets-formula](./packages/sheets-formula)                                       | It implements formula in spreadsheets.                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula)                                         |
| [sheets-numfmt](./packages/sheets-numfmt)                                         | It implements number format in spreadsheets.                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)                                           |
| [sheets-zen-editor](./packages/sheets-zen-editor)                                 | It implements Zen editing mode in spreadsheets.                                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)                                   |
| [sheets-ui](./packages/sheets-ui)                                                 | Provides user interface of Univer Spreadsheets                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)                                                   |
| [ui](./packages/ui)                                                               | Implements basic user interactions with Univer and workbench layout based on React.                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                                                                 |
| [uniscript](./packages/uniscript) (experimental)                                  | Implements a DSL based on Typescript that empowers users to accomplish more sophisticated tasks                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)                                                   |

## Contribution

We appreciate any kinds of contributing. You can submit [issues or feature requests](https://github.com/dream-num/univer/issues) to us. Please read our [contributing guide](./CONTRIBUTING.md) first.

If you would like to contribute code to Univer, please refer to the contributing guide as well. It would guide you through the process of setting up the development environment and submitting a pull request.

## Sponsors

The growth and development of the Univer project rely on the support of its backers and sponsors. If you are interested in supporting our project, we kindly invite you to consider becoming a sponsor. You can sponsor us through [Open Collective](https://opencollective.com/univer).

Thanks to our sponsors, just part of them are listed here because of the space limit, ranking is no particular order:

<a href="https://opencollective.com/univer/sponsor/0/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/1/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/2/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/3/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/4/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/5/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/6/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/6/avatar.svg"></a>

<a href="https://opencollective.com/univer/backer/0/website" target="_blank"><img src="https://opencollective.com/univer/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/1/website" target="_blank"><img src="https://opencollective.com/univer/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/2/website" target="_blank"><img src="https://opencollective.com/univer/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/3/website" target="_blank"><img src="https://opencollective.com/univer/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/4/website" target="_blank"><img src="https://opencollective.com/univer/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/5/website" target="_blank"><img src="https://opencollective.com/univer/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/6/website" target="_blank"><img src="https://opencollective.com/univer/backer/6/avatar.svg"></a>

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## Links

- [Documentation](https://univer.ai/guides/sheet/introduction)
- [Online Playground](https://univer.ai/playground/)
- [Official Website](https://univer.ai)

### Community

- [Discord community](https://discord.gg/z3NKNT6D2f)

## License

Univer is distributed under the terms of the Apache-2.0 license.

---

Copyright © 2019-2024 Shanghai DreamNum Technology Co., Ltd. All rights reserved
