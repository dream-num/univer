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
    |
    <a href="./README-ja.md">日本語</a>
</p>

<!-- An introduction photo here. -->

> 🚧 This project is still in heavy development. Please note that there are likely to be major API changes. Please submit issues and suggestions to us.

## Introduction

Univer is a set of enterprise document and data collaboration solutions, including spreadsheets, documents, and slides. The highly extensible design allows developers to customize personalized functions based on Univer.

Highlights of Univer:

- 📈 Univer supports spreadsheets. Documents and slides will be supported in the future.
- 🌌 Highly extensible architecture design.
  - 🔌 Plug-in architecture, the capabilities of documents can be combined on demand, support third-party plug-ins, and facilitate customization development.
  - 💄 Provide component library and icons to help developers present a consistent user experience.
- ⚡ High performance.
  - ✏️ Unified and efficient rendering engine and formula engine, based on Canvas.
  - 🧮 High-performance formula engine, supports Web Worker.
- 🌍 Internationalization support.

## Examples

| <h3>📊 Univer Sheets</h3>                    |                   |
|:---------------------------------------|--------------------------------|
| [Sheets](https://www.univer.ai/examples/sheets/)<br>Opened: cell styles, formulas. First quarter: conditional formatting, data validation, search and replace. Second quarter (tentative): floating pictures, filtering, sorting, annotations, charts, pivot tables, super tables (tables), shapes                |                [![](./docs/img/examples-sheets.gif)](https://www.univer.ai/examples/sheets/)            |
| [Sheets Multi](https://www.univer.ai/examples/sheets-multi/)<br>Multiple Univer instances can be created on a page to allow interoperability between tables    | [![](./docs/img/examples-sheets-multi.gif)](https://www.univer.ai/examples/sheets-multi/)                           |
| [Sheets Uniscript](https://www.univer.ai/examples/sheets-uniscript/)<br>In Univer Sheets, you can directly use JavaScript syntax to operate the data in the table to achieve automation. | [![](./docs/img/examples-sheets-uniscript.gif)](https://www.univer.ai/examples/sheets-uniscript/)                       |
| [Sheets Big Data](https://www.univer.ai/examples/sheets-big-data/)<br>Loading 10 million cells of data, completed within 500ms | [![](./docs/img/examples-sheets-big-data.gif)](https://www.univer.ai/examples/sheets-big-data/)                       |
| [Sheets Collaboration](https://univer.ai/pro-examples/sheets-collaboration/)<br>Please open two windows or invite friends to experience Univer Sheets collaboration together            | [![](./docs/img/pro-examples-sheets-collaboration.gif)](https://univer.ai/pro-examples/sheets-collaboration/)                           |
| [Sheets Collaboration Playground](https://univer.ai/pro-examples/sheets-collaboration-playground/)<br>Demonstrate the process of collaboration. After A edits the form, how does B process it? Here is an interesting experiment  | [![](./docs/img/pro-examples-sheets-collaboration-playground.gif)](https://univer.ai/pro-examples/sheets-collaboration-playground/)                           |
| [Sheets Import/Export](https://univer.ai/pro-examples/sheets-exchange/)<br>Supports xlsx file import and export                | [![](./docs/img/pro-examples-sheets-exchange.gif)](https://univer.ai/pro-examples/sheets-exchange/)                           |
| [Sheets Print](https://univer.ai/pro-examples/sheets-print/)<br>Experience the HD printing capabilities of Univer Sheets                     | [![](./docs/img/pro-examples-sheets-print.gif)](https://univer.ai/pro-examples/sheets-print/)                           |
| [Sheets Data Validation / Conditional Formatting](https://univer-qqqkeqnw5-univer.vercel.app/sheets/)<br>Development preview of Univer Sheets data formats and conditional formatting                     | [![](./docs/img/examples-sheets-data-validation-conditional-format.png)](https://univer-qqqkeqnw5-univer.vercel.app/sheets/)                           |
| <h3>📝 Univer Docs</h3>                    |                   |
| [Docs](https://www.univer.ai/examples/docs/)<br>Already open: ordered and unordered lists, paragraph settings, mixed graphics and text, multi-column/single column display in sections (tentative): hyperlinks, comments, tables, charts                                  | [![](./docs/img/examples-docs.gif)](https://www.univer.ai/examples/docs/)                           |
| [Docs Multi](https://www.univer.ai/examples/docs-multi/)<br>Multiple Univer instances can be created in a page so that doc can interoperate. | [![](./docs/img/examples-docs-multi.gif)](https://www.univer.ai/examples/docs-multi/)                          |
| [Docs Uniscript](https://www.univer.ai/examples/docs-uniscript/)<br>You can directly use JavaScript syntax to manipulate content in Univer Docs | [![](./docs/img/examples-docs-uniscript.gif)](https://www.univer.ai/examples/docs-uniscript/)                          |
| [Docs Big Data](https://www.univer.ai/examples/docs-big-data/)<br>1 million word Docs loading demo | [![](./docs/img/examples-docs-big-data.gif)](https://www.univer.ai/examples/docs-big-data/)                          |
| [Docs Collaboration](https://univer.ai/pro-examples/docs-collaboration/)<br>Please open two windows or invite friends to experience Univer Docs collaboration together               | [![](./docs/img/pro-examples-docs-collaboration.gif)](https://univer.ai/pro-examples/docs-collaboration/)                           |
| [Docs Collaboration Playground](https://univer.ai/pro-examples/docs-collaboration-playground/)<br>Demonstrate the process of collaboration. After A edits the document, how does B process it? Here is an interesting experiment    | [![](./docs/img/pro-examples-docs-collaboration-playground.gif)](https://univer.ai/pro-examples/docs-collaboration-playground/)    |
| <h3>🎨 Univer Slides</h3>                    |                   |
| [Slides](https://www.univer.ai/examples/slides/)<br>A canvas presentation containing graphic text, floating pictures, tables and other elements                                  | [![](./docs/img/examples-slides.gif)](https://www.univer.ai/examples/slides/)                           |
| <h3>🧩 Univer Innovation</h3>                    |                   |
| [Zen Mode](https://univer.ai/guides/tutorials/zen-editor/#live-demo)<br>The cell of Sheet is a Doc?                                 | [![](./docs/img/zen-mode.gif)](https://univer.ai/guides/tutorials/zen-editor/#live-demo)                           |
| [Univer(SaaS version)](https://univer.ai/)<br>With Univer, we enable users to create 3 forms of page as they wish. By merging sheet, doc and slide's capabilities together, Univer empowers individuals and teams to create, organize and streamline workflows effortlessly.                                   | [![](./docs/img/univer-workspace-drag-chart.gif)](https://youtu.be/kpV0MvQuFZA)                           |

## Usage

We recommend to import Univer as a npm package. Please checkout the [Quick Start](https://univer.ai/guides/quick-start/) section on the documentation website. We also have an [online playground](https://univer.ai/playground/) which can help you preview Univer without setting up the development environment.

Univer bases on a plugin architecture. You can install the following packages to enhance the functionality of Univer.

### Packages

| Name                                                                        | Description                                                                                                                      | Version                                                                                                                                                       |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [core](./packages/core)                                                     | Implements plugin system and architecture of Univer. It also provides basic services and models of different types of documents. | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                                                       |
| [design](./packages/design)                                                 | Implements the design system on Univer. It provides CSS and a component kit based on React.                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                                                   |
| [docs](./packages/docs)                                                     | Implements basic logics of rich text editing features. It also facilitates text editing in other types of documents.             | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                                                       |
| [docs-ui](./packages/docs-ui)                                               | Provides user interface of Univer Documents                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)                                                 |
| [engine-formula](./packages/engine-formula)                                 | It implements a rendering engine based on Canvas and is extensible for                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula)                                   |
| [engine-numfmt](./packages/engine-numfmt)                                   | It implements a number format engine.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)                                     |
| [engine-render](./packages/engine-render)                                   | It implements a rendering engine based on canvas context2d.                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)                                     |
| [facade](./packages/facade)                                                 | It serves as an API layer to make it easier to use Univer                                                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                                                   |
| [find-replace](./packages/find-replace)                                     | It implements find and replace features in Univer.                                                                               | [![npm version](https://img.shields.io/npm/v/@univerjs/find-replace)](https://npmjs.org/package/@univerjs/find-replace)                                       |
| [network](./packages/network)                                               | It implements network services based on WebSocket and HTTP.                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)                                                 |
| [rpc](./packages/rpc)                                                       | It implements a RPC mechanism and methods to sync data between different replicas of Univer documents.                           | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                                                         |
| [sheets](./packages/sheets)                                                 | Basic logics of spreadsheet features.                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                                                   |
| [sheets-conditional-formatting](./packages/sheets-conditional-formatting)   | It implements conditional formatting in Univer Spreadsheets.                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting)](https://npmjs.org/package/@univerjs/sheets-conditional-formatting)     |
| [sheets-find-replace](./packages/sheets-find-replace)                       | It implements find and replace features in Univer Spreadsheets.                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace)                         |
| [sheets-formula](./packages/sheets-formula)                                 | It implements formula in spreadsheets.                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula)                                   |
| [sheets-numfmt](./packages/sheets-numfmt)                                   | It implements number format in spreadsheets.                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)                                     |
| [sheets-zen-editor](./packages/sheets-zen-editor)                           | It implements Zen editing mode in spreadsheets.                                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)                             |
| [sheets-ui](./packages/sheets-ui)                                           | Provides user interface of Univer Spreadsheets                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)                                             |
| [ui](./packages/ui)                                                         | Implements basic user interactions with Univer and workbench layout based on React.                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                                                           |
| [uniscript](./packages/uniscript) (experimental)                            | Implements a DSL based on Typescript that empowers users to accomplish more sophisticated tasks                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)                                             |

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

- [Documentation](https://univer.ai/guides/introduction/)
- [Online Playground](https://univer.ai/playground/)
- [Official Website](https://univer.ai)

### Community

- [Discord community](https://discord.gg/z3NKNT6D2f)

## License

Univer is distributed under the terms of the Apache-2.0 license.

---

Copyright © 2019-2024 Shanghai DreamNum Technology Co., Ltd. All rights reserved
