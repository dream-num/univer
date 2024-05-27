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
    <a href="./README.md">English</a>
    |
    简体中文
    |
    <a href="./README-ja.md">日本語</a>
</p>

<!-- An introduction photo here. -->

> 🚧 该项目仍在开发中，请注意可能会有较大的 API 变更。欢迎向我们提交问题以及建议。

## 介绍

Univer 是一套企业文档与数据协同解决方案，融合了电子表格、文档和幻灯片。

Univer 的亮点包括：

- 📈 **支持多种类文档** Univer 目前支持**电子表格**和**富文本文档**，未来还会增加对**幻灯片**的支持。
- ⚙️ **易于集成** Univer 能够无缝集成到你的应用当中。
- 🎇 **功能强大** Univer 支持非常多的功能，包括但不限于**公式计算**、**条件格式**、**数据验证**、**筛选**、**协同编辑**、**打印**、**导入导出**等等，更多的功能即将陆续发布。
- 🔌 **高度可扩展**Univer 的 *插件化架构* 和 *Facade API* 使得扩展 Univer 的功能变得轻松容易，你可以在 Univer 之上实现自己的业务需求。
- 💄 **高度可定制** 你可以通过*主题*来自定义 Univer 的外观，另外还支持国际化。
- ⚡ **性能优越**
  - ✏️ Univer 实现了基于 canvas 的 *渲染引擎*，能够高效地渲染不同类型的文档。渲染引擎支持 *标点挤压* *盘古之白* *图文混排* *滚动贴图* 等高级特性。
  - 🧮 自研的 *公式引擎* 拥有超快的计算速度，还能在 Web Worker 中运行，未来将会支持服务端计算。
- 🌌 **高度集成** 文档、电子表格和幻灯片能够互操作，甚至是渲染在同一个画布上，使得信息和数据能够在 Univer 当中自由地流动。

## 例子

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

## 使用

我们建议通过将 Univer 作为 npm 包使用，请参考文档上的[快速开始](https://univer.ai/zh-CN/guides/sheet/getting-started/quickstart)小节。我们还准备了一个[在线 playground](https://univer.ai/playground/)，你无需在本地安装 Univer 就可以体验使用 Univer 开发。

Univer 基于插件化架构设计，你可以安装以下包来增强 Univer 的功能。

### Packages

| 包名                                                    | 描述                                                                                    | 版本                                                                                                                        |
| :-------------------------------------------            | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                                 | Univer 核心包，实现 Univer 架构和插件机制、基础服务，以及各个文档类型的基本模型         | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [data-validation](./packages/data-validation)           | 实现了 Univer 的数据验证功能                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/data-validation)](https://npmjs.org/package/@univerjs/data-validation) |
| [design](./packages/design)                             | 实现 Univer 设计语言，提供了一套 CSS 以及一套基于 React 的组件                          | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                                 | 实现了富文本文档的基本业务，同时支持其他业务的文本编辑                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                           | 实现了富文本文档的用户交互                                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)             | 实现公式引擎                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)               | 实现数字格式引擎                                                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)               | 实现渲染引擎                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [facade](./packages/facade/)                            | 提供了一个让 Univer 更加易用的 API 层                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                       |
| [find-replace](./packages/find-replace)                 | 实现 Univer 的查找替换                                                                             | [![npm version](https://img.shields.io/npm/v/@univerjs/find-replace)](https://npmjs.org/package/@univerjs/find-replace)         |
| [network](./packages/network)                           | 实现了 Univer 的网络服务，包括 WebSocket 和 HTTP。                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)               |
| [rpc](./packages/rpc)                                   | 实现 RPC 机制，以及在主从文档副本之间同步数据的方法，方便 web worker 等跨线程场景的开发 | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                             | 实现电子表格的基本业务                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-conditional-formatting](./packages/sheets-conditional-formatting)   | 实现电子表格的条件格式功能                                               | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting)](https://npmjs.org/package/@univerjs/sheets-sheets-conditional-formatting) |
| [sheets-conditional-formatting-ui](./packages/sheets-conditional-formatting-ui)   | 实现电子表格的条件格式功能                                               | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting-ui)](https://npmjs.org/package/@univerjs/sheets-sheets-conditional-formatting-ui) |
| [sheets-data-validation](./packages/sheets-data-validation) | 实现电子表格的数据验证功能                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation)](https://npmjs.org/package/@univerjs/sheets-data-validation) |
| [sheets-find-replace](./packages/sheets-find-replace)   | 实现电子表格的查找替换                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace) |
| [sheets-formula](./packages/sheets-formula)             | 实现电子表格的公式编辑                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)               | 实现电子表格中的数字格式编辑                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-zen-editor](./packages/sheets-zen-editor)       | 实现电子表格中的禅编辑模式                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)   |
| [sheets-ui](./packages/sheets-ui)                       | 实现电子表格的用户交互                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                                     | 实现基本的用户交互服务，并基于 React 提供了一套桌面端的交互布局                         | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) （实验性）              | 一套基于 TypeScript 的 DSL，让用户可以通过脚本语言操纵 Univer 完成更复杂的任务          | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## 贡献

我们欢迎各种形式的贡献，你可以向我们提交[问题或功能请求](https://github.com/dream-num/univer/issues)。请先阅读我们的[贡献指南](./CONTRIBUTING.md)。

如果你想要提交代码，也请先阅读贡献指南，它会指导你如何在本地搭建开发环境以及提交 pull request。

## 赞助

Univer 持续稳定发展离不开它的支持者和赞助者，如果你想要支持我们的项目，请考虑成为我们的赞助者。你可以通过 [Open Collective](https://opencollective.com/univer) 赞助我们。

感谢支持我们的赞助者，受篇幅限制，仅列举部分，排名不分先后：

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

## 关注者

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## 链接

- [文档](https://univer.ai/zh-CN/guides/sheet/introduction)
- [在线 Playground](https://univer.ai/playground/)
- [官方网站](https://univer.ai)

### 社区

- [Discord 社区](https://discord.gg/XPGnMBmpd6)
- [Github Discussions](https://github.com/dream-num/univer/discussions)
- 微信扫描下方二维码，加入 Univer 中文社群

![wecom-qr-code](https://univer.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fqrcode.45c72be6.png&w=828&q=75)

## 授权

Univer 基于 Apache-2.0 协议分发。

---

Copyright © 2019-2024 Shanghai DreamNum Technology Co., Ltd. All rights reserved
