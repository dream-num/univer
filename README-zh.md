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
  <a href="./README.md">English</a>
  |
  简体中文
</p>

<!-- An introduction photo here. -->

> 🚧 该项目仍在开发中，请注意可能会有较大的 API 变更。欢迎向我们提交问题以及建议。

## 介绍

Univer 是一套企业文档与数据协同解决方案，包括电子表格、文档和幻灯片三大文档类型，高可扩展性设计使得开发者可以在 Univer 的基础上定制个性化功能。

Univer 的功能特性包括：

-   📈 支持电子表格，后续还会支持文档和幻灯片
-   🌌 高度可扩展的架构设计
    -   🔌 插件化架构，文档的能力可按需组合，支持自定义插件，方便二次开发
    -   💄 提供组件库和图标以帮助开发者呈现一致的用户体验
-   ⚡ 高性能
    -   ✏️ 统一高效的渲染引擎和公式引擎，基于 Canvas
    -   🧮 高性能的公式引擎，支持 Web Worker
-   🌍 国际化支持

## 使用

我们建议通过将 Univer 作为 npm 包使用，请参考文档上的[快速开始]()小节。我们还准备了一个[在线 playground]()，你无需在本地安装 Univer 就可以体验使用 Univer 开发。

Univer 基于插件化架构设计，你可以安装以下包来增强 Univer 的功能。

### Packages

| 包名                                         | 描述                                                                                    | 版本                                                                                                                        |
| :------------------------------------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                      | Univer 核心包，实现 Univer 架构和插件机制、基础服务，以及各个文档类型的基本模型         | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [design](./packages/design)                  | 实现 Univer 设计语言，提供了一套 CSS 以及一套基于 React 的组件                          | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                      | 实现了富文本文档的基本业务，同时支持其他业务的文本编辑                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                | 实现了富文本文档的用户交互                                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)  | 实现公式引擎                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)    | 实现数字格式引擎                                                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)    | 实现渲染引擎                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [rpc](./packages/rpc)                        | 实现 RPC 机制，以及在主从文档副本之间同步数据的方法，方便 web worker 等跨线程场景的开发 | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                  | 实现电子表格的基本业务                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-formula](./packages/sheets-formula)  | 实现电子表格的公式编辑                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)    | 实现电子表格中的数字格式编辑                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-ui](./packages/sheets-ui)            | 实现电子表格的用户交互                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                          | 实现基本的用户交互服务，并基于 React 提供了一套桌面端的交互布局                         | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) （实验性） | 一套基于 TypeScript 的 DSL，让用户可以通过脚本语言操纵 Univer 完成更复杂的任务          | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## 贡献

我们欢迎各种形式的贡献，你可以向我们提交[问题或功能请求](https://github.com/dream-num/univer/issues)。请先阅读我们的[贡献指南](./CONTRIBUTING.md)。

如果你想要提交代码，也请先阅读贡献指南，它会指导你如何在本地搭建开发环境以及提交 pull request。

## 关注者

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## 链接

-   [文档]()
-   [在线 Playground]()
-   [官方网站]()
-   [Legacy Univer Demo](https://dream-num.github.io/univer-demo/)

### 社区

-   [Discord 社区](https://discord.gg/XPGnMBmpd6)
-   [Github Discussions](https://github.com/dream-num/univer/discussions)
-   加入 Univer 中文社群

## 授权

Univer 基于 Apache-2.0 协议分发。

---

上海梦数科技有限公司 2023 版权所有
