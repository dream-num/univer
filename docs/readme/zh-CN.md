<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="../img/banner-light.png">
    <img src="../img/banner-dark.png" alt="Univer" width="420" />
</picture>

**用于构建电子表格、文档和演示文稿的全栈、同构办公 SDK。**

Univer 以插件化架构、Canvas 渲染引擎、公式引擎和统一的 Facade API，
帮助你在浏览器和 Node.js 中构建可嵌入的生产力体验。

[English](../../README.md) | 简体中文 | [繁體中文](./zh-TW.md) | [日本語](./ja-JP.md) | [한국어](./ko-KR.md) | [Español](./es-ES.md)

[📖 文档](https://docs.univer.ai) | [✨ 示例](https://docs.univer.ai/showcase) | [📘 API 参考](https://docs.univer.ai/reference/classes/univer) | [📝 博客](https://docs.univer.ai/blog)

[![Release](https://img.shields.io/github/v/release/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/releases)
[![License](https://img.shields.io/github/license/dream-num/univer?style=flat-square)](../../LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/dream-num/univer/build-packages.yml?style=flat-square)](https://github.com/dream-num/univer/actions/workflows/build-packages.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/dream-num/univer/badge/dev?style=flat-square)](https://www.codefactor.io/repository/github/dream-num/univer/overview/dev)
[![Codecov](https://img.shields.io/codecov/c/gh/dream-num/univer?token=aPfyW2pIMN&style=flat-square)](https://codecov.io/gh/dream-num/univer)

[![Stars](https://img.shields.io/github/stars/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/stargazers)
[![Contributors](https://img.shields.io/github/contributors/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/issues)
[![Last Commit](https://img.shields.io/github/last-commit/dream-num/univer?style=flat-square)](https://github.com/dream-num/univer/commits/main/)

[![Discord](https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2&style=flat-square)](https://discord.gg/z3NKNT6D2f)
[![Twitter](https://img.shields.io/twitter/follow/univerhq?style=flat-square&logo=x)](https://twitter.com/univerhq)
[![Open Collective](https://img.shields.io/opencollective/all/univer?logo=opencollective&style=flat-square)](https://opencollective.com/univer)

[![Trendshift](https://trendshift.io/api/badge/repositories/4376)](https://trendshift.io/repositories/4376)

</div>

## ✨ Univer 是什么？

Univer 是一个开源 SDK，用于在你的产品中创建办公应用。它提供电子表格、文档和演示文稿体验所需的基础能力，同时不强制你使用托管应用或固定 UI。

当你需要以下能力时，可以使用 Univer：

- 将电子表格或文档编辑能力嵌入 SaaS 产品、内部工具、BI 流程或 AI 应用。
- 在服务端运行工作簿/文档处理逻辑，并与浏览器端使用同一套架构。
- 通过插件按需组合功能，或通过预设快速启动。
- 通过自定义插件、命令、服务、UI 组件和 Facade API 扩展行为。

Univer 不只是一个电子表格文件查看器。它是用于构建你自己的生产力界面的框架。

## 🌟 Highlights

<table>
  <tr>
    <td align="center" width="33%">
      ⚡<br />
      <strong>大型场景也流畅</strong><br />
      <sub>Canvas 渲染与独立公式引擎，让复杂工作簿保持响应。</sub>
    </td>
    <td align="center" width="33%">
      🧩<br />
      <strong>插件化扩展</strong><br />
      <sub>按需组合、替换、延迟加载或扩展能力，无需引入整套功能。</sub>
    </td>
    <td align="center" width="33%">
      🤖<br />
      <strong>Headless AI 基建</strong><br />
      <sub>在 Node.js 中运行工作簿和文档逻辑，为 Agent、自动化和服务端流程提供底层能力。</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      🛠️<br />
      <strong>面向产品集成</strong><br />
      <sub>框架适配器、Facade API、预设和无头运行时，覆盖真实集成路径。</sub>
    </td>
    <td align="center" width="33%">
      🌗<br />
      <strong>Dark mode 就绪</strong><br />
      <sub>UI 组件和渲染引擎都支持浅色与深色主题。</sub>
    </td>
    <td align="center" width="33%">
      🔌<br />
      <strong>统一的 Facade API</strong><br />
      <sub>共享一致的 API，在浏览器和 Node.js 中操作工作簿、区域、公式和文档。</sub>
    </td>
  </tr>
</table>

## 🚀 为什么选择 Univer？

- **同构设计**：既可以在浏览器中运行 UI 应用，也可以在 Node.js 中运行无头处理逻辑。
- **插件优先架构**：每个能力都以可组合插件的形式提供，功能可以添加、移除、替换或延迟加载。
- **Preset Mode 便于快速集成**：当你希望快速获得可运行应用时，可以使用 [`univer-presets`](https://github.com/dream-num/univer-presets) 提供的预设插件组合。
- **Plugin Mode 提供完整控制**：当你需要自定义加载、更小包体或深度集成时，可以手动组合包和插件。
- **Facade API**：通过更高层 API 操作工作簿、工作表、区域、文档、公式、命令和事件。
- **Canvas 渲染引擎**：支持大型可编辑文档界面，并在多种文档类型之间复用渲染层。
- **可扩展 UI**：支持 React、Vue、Web Components 和不同框架下的应用外壳集成。

## ⚡ 快速开始

大多数应用应该从 **Preset Mode** 开始。当你需要手动组合包并控制插件注册时，可以使用 **Plugin Mode**。

<details open>
<summary><strong>Preset Mode（推荐）</strong></summary>

Preset 是一组经过整理的 Univer 插件集合，包含所需的 Facade API 注册和样式。

```bash
pnpm add @univerjs/presets @univerjs/preset-sheets-core
```

```ts
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

univerAPI.createWorkbook({})
```

</details>

<details>
<summary><strong>Plugin Mode</strong></summary>

Plugin Mode 让你更底层地控制包、样式导入、locale 合并、Facade API 注册和插件顺序。

```bash
pnpm add @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt @univerjs/sheets-numfmt-ui @univerjs/sheets-ui @univerjs/ui
```

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'

import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      UIEnUS,
      DocsUIEnUS,
      SheetsEnUS,
      SheetsUIEnUS,
      SheetsFormulaEnUS,
      SheetsFormulaUIEnUS,
      SheetsNumfmtUIEnUS,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverUIPlugin, { container: 'app' })
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)
univer.registerPlugin(UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)

const univerAPI = FUniver.newAPI(univer)
univerAPI.createWorkbook({})
```

</details>

页面需要一个容器：

```html
<div id="app" style="height: 100vh"></div>
```

更多内容请阅读 [安装与基础使用指南](https://docs.univer.ai/guides/sheets/getting-started/installation)、[`createUniver` 参考](https://docs.univer.ai/reference/methods/create-univer) 和 [Facade API 参考](https://docs.univer.ai/reference/classes/univer)。

## 🧩 Preset Mode 与 Plugin Mode

| 选择 | 适用场景 | 从这里开始 |
| --- | --- | --- |
| **Preset Mode** | 你希望用最少配置获得可运行的 Sheets、Docs 或 Node 设置。 | [`univer-presets`](https://github.com/dream-num/univer-presets) 和 [快速入门指南](https://docs.univer.ai/guides/sheets/getting-started/installation) |
| **Plugin Mode** | 你需要严格控制包、插件注册顺序、延迟加载或自定义运行时组合。 | 本仓库的 [`examples/`](../../examples) 和 [架构指南](https://docs.univer.ai/guides/recipes/architecture/univer) |
| **Headless Mode** | 你需要在没有 UI 的情况下进行服务端工作簿/文档处理、公式计算或自动化。 | [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) |

请保持所有 `@univerjs/*` 包版本一致。如果使用 Univer Pro 包，也请保持 `@univerjs-pro/*` 版本一致。

关于 API 兼容性预期、实验性 API、内部 API 和废弃规则，请阅读 [API 稳定性政策](../API_STABILITY.md)。

## 🧭 兼容性

- **浏览器运行时**：Univer 的编译目标是 Chrome 70，并尽力支持 Edge `>=70`、Firefox `>=63`、Chrome `>=70`、Safari `>=12.0` 和 Electron `>=5`。
- **Polyfills**：Univer 依赖 `Intl.Segmenter`。如果目标浏览器或运行时不支持，请添加 `@formatjs/intl-segmenter` 等 polyfill。
- **构建工具**：推荐使用 Vite、esbuild 或 Webpack 5。如果构建工具不支持 `package.json` 中的 `exports` 字段（Webpack 4 中较常见），可能需要额外配置路径映射。
- **React**：Univer 的视图层基于 React 18 构建，支持 React 18 和 19，并对 React 16.9+ 与 17 提供最低限度的兼容支持。
- **Node.js 运行时**：Headless Univer 支持 Node.js `>=18.17.0`。开发本 monorepo 需要 Node.js `>=22.18`。

## 🛠️ 你可以构建什么

| 领域 | 开源能力 | Univer Pro 扩展 |
| --- | --- | --- |
| **Sheets** | 工作簿、工作表、区域、选择、公式、数字格式、筛选、排序、数据验证、条件格式、超链接、评论、查找替换、批注、表格、绘图集成和可扩展 UI 插件。 | 实时协同、编辑历史、导入导出、打印、图表、数据透视表、迷你图、分级显示、形状、单元格内图形、数据连接器、服务端计算和增强公式能力。 |
| **Docs** | 富文本文档模型、编辑 UI、列表、超链接、绘图集成、评论、快捷插入和共享文档架构。 | 协同、导入导出、打印、增强表格和列表、分栏、提示块、代码块、引用块、形状和远程评论资源。 |
| **Slides** | 演示文稿数据模型和 UI 包，目前仍在积极开发中。 | Pro 演示文稿模型和 UI、幻灯片导入导出、图表和表格模型/UI 插件，以及共享形状编辑基础设施。 |
| **Bases** | 基于 Univer 的插件、命令和模型架构构建自定义结构化数据体验。 | Base 数据库模型、命令、公式集成、工作台 UI、字段编辑器和渲染引擎视图。 |
| **Runtime** | 浏览器应用、Node.js 无头使用、Web Worker/RPC 模式、多实例使用和服务端自动化。 | 协同客户端/服务端包、Node.js 协同客户端、Pro 服务端服务、SSR、计算委托、服务端计算和 changeset 回放工具。 |
| **Integrations** | React、Vue、Web Components、框架模板、主题、本地化和自定义插件。 | Pro 预设和企业部署包。 |

Sheets 是目前最成熟的产品界面。Docs 和 Slides 共享 Univer 的架构，并在同一 SDK 中持续演进。

## 🔓 开源与 Pro

本仓库包含 Univer 的开源核心和第一方 OSS 插件。Univer Pro 作为商业扩展层单独开发，面向高级产品界面、协同、服务端能力和企业集成。

| 类别 | 开源 | Univer Pro / 商业版 |
| --- | --- | --- |
| **基础能力** | 核心 SDK、插件系统、渲染引擎、公式引擎、Facade API、主题、i18n 和框架适配器。 | Pro 预设和企业部署包。 |
| **Sheets** | 核心电子表格编辑、公式、数字格式、筛选/排序、数据验证、条件格式、批注、表格、超链接、评论、绘图、查找替换。 | 协同、编辑历史、导入导出、打印、图表、数据透视表、迷你图、分级显示、形状、单元格内图形、数据连接器、区域预处理和增强公式引擎能力。 |
| **Docs** | 文档模型和编辑 UI、列表、超链接、评论、快捷插入和绘图集成。 | 协同、导入导出、打印、增强表格/列表、分栏、提示块、代码块、引用块、形状和远程线程评论资源。 |
| **Slides** | OSS 演示文稿模型和 UI 包。 | Pro 演示文稿模型/UI 包、幻灯片导入导出、图表、表格和可复用形状编辑器 UI。 |
| **Bases** | 用于自定义数据类产品的可扩展插件架构。 | Base 数据库核心模型、命令、变更、公式集成、工作台 UI、字段编辑器和渲染引擎集成。 |
| **服务端与运行时** | Node.js 无头运行时、RPC/Web Worker 模式和面向服务端自动化的基础能力。 | 协同服务端、Node.js 协同客户端、SSR 服务、计算委托、服务端计算和协同 changeset 回放工具。 |

Pro 功能请参考 [Univer Pro 指南](https://docs.univer.ai/guides/pro)。这里将其单独列出，是为了清晰区分 OSS 包的能力边界。

边界原则：

- 本仓库中的 OSS 包应能在 Apache-2.0 许可证下独立使用。Univer Pro 是可选的，使用公开 OSS SDK API 不需要依赖 Pro。
- OSS 包中的 bug、回归和安全问题应在 OSS 仓库中报告和修复，即使存在相关的 Pro 功能。
- OSS 文档不应暗示 Pro-only 能力已经包含在公开的 `@univerjs/*` 包中。Pro-only API、包和部署路径应被明确命名。
- 当某个 OSS 功能存在 Pro 增强时，OSS 行为仍应被独立记录，便于用户在不先阅读商业文档的情况下评估开源能力。

## 🌐 生态

- **核心 SDK**：[`dream-num/univer`](https://github.com/dream-num/univer)，也就是当前 monorepo。
- **Presets**：[`dream-num/univer-presets`](https://github.com/dream-num/univer-presets)，面向浏览器和 Node.js 应用的预设插件组合。
- **AI agent skills**：[`dream-num/univer-sdk-skills`](https://github.com/dream-num/univer-sdk-skills)，供 AI agent 使用的可复用说明，覆盖 Univer 集成、Pro 功能、插件开发和 Node 后端。参见 [AI Skills 指南](https://docs.univer.ai/guides/skills)。
- **文档**：[docs.univer.ai](https://docs.univer.ai)，包含 Sheets、Docs、Slides、recipes 和 Pro 指南。
- **API 参考**：[docs.univer.ai/reference](https://docs.univer.ai/reference/classes/univer)，包含 Facade API 和生成的 API 参考。
- **示例与展示**：[Univer Showcase](https://docs.univer.ai/showcase) 和本仓库的 [`examples/`](../../examples)。
- **AI-native spreadsheets**：[`dream-num/univer-mcp`](https://github.com/dream-num/univer-mcp)，用于通过自然语言驱动 Univer Sheets 的 Univer Platform / MCP 集成。

## 📦 仓库结构

```text
.
├── packages/      核心包、引擎、文档类型、UI 插件和功能插件
├── examples/      用于开发的本地浏览器和 Node.js 示例
├── common/        共享内部工具、mock 数据、storybook 和工具函数
├── e2e/           Playwright 和视觉对比测试
├── tests/         其他集成测试项目
└── docs/          架构说明、图片和仓库内文档
```

包级 README 位于 [`packages/`](../../packages) 下各包目录中。

## 🧑‍💻 开发

要求：

- Node.js `>=22.18`
- pnpm `>=10`

```bash
git clone https://github.com/dream-num/univer.git
cd univer
pnpm install
pnpm dev
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地 examples 应用。 |
| `pnpm build` | 构建 workspace 包，不包含内部 common 包。 |
| `pnpm test` | 通过 Turbo 运行单元测试。 |
| `pnpm typecheck` | 通过 Turbo 运行 TypeScript 检查。 |
| `pnpm lint` | 运行 ESLint。 |
| `pnpm test:e2e` | 运行 Playwright 测试。 |
| `pnpm storybook:dev` | 启动用于 UI 组件开发的 Storybook。 |

提交 pull request 前请阅读 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 📝 贡献者笔记

深入修改前，建议阅读这些仓库内说明：

- [Building Isomorphic Univer](../ISOMORPHIC.md)：如何拆分浏览器、Node.js、UI 与共享插件逻辑。
- [API 稳定性政策](../API_STABILITY.md)：stable、experimental、internal、deprecated 和破坏性变更预期。
- [Contributing to Facade API](../CONTRIBUTING-FACADE.md)：`FUniver`、`FWorkbook`、`FRange` 等 Facade API 的设计约定。
- [Naming Convention](../NAMING_CONVENTION.md)：文件、目录、接口、插件、命令和依赖注入 token 的命名规则。
- [Fixing Memory Leaks](../FIX_MEMORY_LEAK.md)：Univer 实例常见内存泄漏模式和调试流程。
- [Architecture TLDRs](../tldr)：公式引擎、Web Worker、权限、选择区和 ref-range 行为的简明说明。

## 💬 社区

- 在 [GitHub Discussions](https://github.com/dream-num/univer/discussions) 提问。
- 加入 [Discord](https://discord.gg/z3NKNT6D2f) 与社区交流。
- 关注 [Twitter / X](https://twitter.com/univerhq) 和 [YouTube](https://www.youtube.com/@dreamNum)。

参与社区前，请阅读 [行为准则](../../CODE_OF_CONDUCT.md)。

## 🔒 安全

如果你认为发现了安全问题，请遵循 [安全政策](../../SECURITY.md)。

## ❤️ 赞助

Univer 由社区和赞助者共同支持。你可以通过 [Open Collective](https://opencollective.com/univer) 支持这个项目。

<a href="https://opencollective.com/univer/sponsor/0/website"><img src="https://opencollective.com/univer/sponsor/0/avatar.svg" alt="Sponsor 0" /></a>
<a href="https://opencollective.com/univer/sponsor/1/website"><img src="https://opencollective.com/univer/sponsor/1/avatar.svg" alt="Sponsor 1" /></a>
<a href="https://opencollective.com/univer/sponsor/2/website"><img src="https://opencollective.com/univer/sponsor/2/avatar.svg" alt="Sponsor 2" /></a>
<a href="https://opencollective.com/univer/sponsor/3/website"><img src="https://opencollective.com/univer/sponsor/3/avatar.svg" alt="Sponsor 3" /></a>
<a href="https://opencollective.com/univer/sponsor/4/website"><img src="https://opencollective.com/univer/sponsor/4/avatar.svg" alt="Sponsor 4" /></a>
<a href="https://opencollective.com/univer/sponsor/5/website"><img src="https://opencollective.com/univer/sponsor/5/avatar.svg" alt="Sponsor 5" /></a>
<a href="https://opencollective.com/univer/sponsor/6/website"><img src="https://opencollective.com/univer/sponsor/6/avatar.svg" alt="Sponsor 6" /></a>

<a href="https://opencollective.com/univer/backer/0/website"><img src="https://opencollective.com/univer/backer/0/avatar.svg" alt="Backer 0" /></a>
<a href="https://opencollective.com/univer/backer/1/website"><img src="https://opencollective.com/univer/backer/1/avatar.svg" alt="Backer 1" /></a>
<a href="https://opencollective.com/univer/backer/2/website"><img src="https://opencollective.com/univer/backer/2/avatar.svg" alt="Backer 2" /></a>
<a href="https://opencollective.com/univer/backer/3/website"><img src="https://opencollective.com/univer/backer/3/avatar.svg" alt="Backer 3" /></a>
<a href="https://opencollective.com/univer/backer/4/website"><img src="https://opencollective.com/univer/backer/4/avatar.svg" alt="Backer 4" /></a>
<a href="https://opencollective.com/univer/backer/5/website"><img src="https://opencollective.com/univer/backer/5/avatar.svg" alt="Backer 5" /></a>
<a href="https://opencollective.com/univer/backer/6/website"><img src="https://opencollective.com/univer/backer/6/avatar.svg" alt="Backer 6" /></a>

## 📄 许可证

版权所有 (c) 2021-present DreamNum Co., Ltd.

基于 [Apache-2.0](../../LICENSE) 许可证开源。
