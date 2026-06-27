<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="../img/banner-light.png">
    <img src="../img/banner-dark.png" alt="Univer" width="420" />
</picture>

**用於構建試算表、文件和簡報的全端、同構辦公 SDK。**

Univer 以外掛化架構、Canvas 渲染引擎、公式引擎和統一的 Facade API，
協助你在瀏覽器和 Node.js 中構建可嵌入的生產力體驗。

[English](../../README.md) | [简体中文](./zh-CN.md) | 繁體中文 | [日本語](./ja-JP.md) | [한국어](./ko-KR.md) | [Español](./es-ES.md)

[📖 文件](https://docs.univer.ai) | [✨ 示例](https://docs.univer.ai/showcase) | [📘 API 參考](https://docs.univer.ai/reference/classes/univer) | [📝 部落格](https://docs.univer.ai/blog)

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

## ✨ Univer 是什麼？

Univer 是一個開源 SDK，用於在你的產品中建立辦公應用。它提供試算表、文件和簡報體驗所需的基礎能力，同時不強制你使用託管應用或固定 UI。

當你需要以下能力時，可以使用 Univer：

- 將試算表或文件編輯能力嵌入 SaaS 產品、內部工具、BI 流程或 AI 應用。
- 在伺服器端執行活頁簿/文件處理邏輯，並與瀏覽器端使用同一套架構。
- 透過外掛按需組合功能，或透過預設快速啟動。
- 透過自訂外掛、命令、服務、UI 元件和 Facade API 擴充行為。

Univer 不只是一個試算表檔案檢視器。它是用於構建你自己的生產力介面的框架。

## 🌟 Highlights

<table>
  <tr>
    <td align="center" width="33%">
      ⚡<br />
      <strong>大型場景也流暢</strong><br />
      <sub>Canvas 渲染搭配獨立公式引擎，複雜活頁簿依然流暢。</sub>
    </td>
    <td align="center" width="33%">
      🧩<br />
      <strong>外掛化擴充</strong><br />
      <sub>需要哪些功能就組合、替換或按需載入，不必引入全套。</sub>
    </td>
    <td align="center" width="33%">
      🤖<br />
      <strong>Headless AI 基建</strong><br />
      <sub>在 Node.js 中跑活頁簿與文件邏輯，支撐 Agent、自動化和伺服器端流程。</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      🛠️<br />
      <strong>面向產品整合</strong><br />
      <sub>框架適配器、Facade API、預設配置、無頭執行環境，對接各種實際整合場景。</sub>
    </td>
    <td align="center" width="33%">
      🌗<br />
      <strong>Dark mode 就緒</strong><br />
      <sub>UI 元件與渲染引擎均支援淺色和深色主題。</sub>
    </td>
    <td align="center" width="33%">
      🔌<br />
      <strong>統一的 Facade API</strong><br />
      <sub>共享一致的 API，在瀏覽器和 Node.js 中操作活頁簿、範圍、公式和文件。</sub>
    </td>
  </tr>
</table>

## 🚀 為什麼選擇 Univer？

- **同構設計**：既可以在瀏覽器中執行 UI 應用，也可以在 Node.js 中執行無頭處理邏輯。
- **外掛優先架構**：每個能力都以可組合外掛的形式提供，功能可以新增、移除、替換或延遲載入。
- **Preset Mode 便於快速整合**：當你希望快速取得可執行應用時，可以使用 [`univer-presets`](https://github.com/dream-num/univer-presets) 提供的預設外掛組合。
- **Plugin Mode 提供完整控制**：當你需要自訂載入、更小包體或深度整合時，可以手動組合套件和外掛。
- **Facade API**：透過更高層 API 操作活頁簿、工作表、範圍、文件、公式、命令和事件。
- **Canvas 渲染引擎**：支援大型可編輯文件介面，並在多種文件類型之間共用渲染層。
- **可擴充 UI**：支援 React、Vue、Web Components 和不同框架下的應用外殼整合。

## ⚡ 快速開始

大多數應用應該從 **Preset Mode** 開始。當你需要手動組合套件並控制外掛註冊時，可以使用 **Plugin Mode**。

<details open>
<summary><strong>Preset Mode（推薦）</strong></summary>

Preset 是一組經過整理的 Univer 外掛集合，包含所需的 Facade API 註冊和樣式。

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

Plugin Mode 讓你更底層地控制套件、樣式匯入、locale 合併、Facade API 註冊和外掛順序。

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

頁面需要一個容器：

```html
<div id="app" style="height: 100vh"></div>
```

更多內容請閱讀 [安裝與基礎使用指南](https://docs.univer.ai/guides/sheets/getting-started/installation)、[`createUniver` 參考](https://docs.univer.ai/reference/methods/create-univer) 和 [Facade API 參考](https://docs.univer.ai/reference/classes/univer)。

## 🧩 Preset Mode 與 Plugin Mode

| 選擇 | 適用場景 | 從這裡開始 |
| --- | --- | --- |
| **Preset Mode** | 你希望用最少配置取得可執行的 Sheets、Docs 或 Node 設定。 | [`univer-presets`](https://github.com/dream-num/univer-presets) 和 [快速入門指南](https://docs.univer.ai/guides/sheets/getting-started/installation) |
| **Plugin Mode** | 你需要嚴格控制套件、外掛註冊順序、延遲載入或自訂執行時組合。 | 本倉庫的 [`examples/`](../../examples) 和 [架構指南](https://docs.univer.ai/guides/recipes/architecture/univer) |
| **Headless Mode** | 你需要在沒有 UI 的情況下進行伺服器端活頁簿/文件處理、公式計算或自動化。 | [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) |

請保持所有 `@univerjs/*` 套件版本一致。如果使用 Univer Pro 套件，也請保持 `@univerjs-pro/*` 版本一致。

關於 API 相容性預期、實驗性 API、內部 API 和棄用規則，請閱讀 [API 穩定性政策](../API_STABILITY.md)。

## 🧭 相容性

- **瀏覽器執行時**：Univer 的編譯目標是 Chrome 70，並盡力支援 Edge `>=70`、Firefox `>=63`、Chrome `>=70`、Safari `>=12.0` 和 Electron `>=5`。
- **Polyfills**：Univer 依賴 `Intl.Segmenter`。如果目標瀏覽器或執行時不支援，請新增 `@formatjs/intl-segmenter` 等 polyfill。
- **建構工具**：推薦使用 Vite、esbuild 或 Webpack 5。如果建構工具不支援 `package.json` 中的 `exports` 欄位（Webpack 4 中較常見），可能需要額外配置路徑映射。
- **React**：Univer 的視圖層基於 React 18 構建，支援 React 18 和 19，並對 React 16.9+ 與 17 提供最低限度的相容支援。
- **Node.js 執行時**：Headless Univer 支援 Node.js `>=18.17.0`。開發本 monorepo 需要 Node.js `>=22.18`。

## 🛠️ 你可以構建什麼

| 領域 | 開源能力 | Univer Pro 擴充 |
| --- | --- | --- |
| **Sheets** | 活頁簿、工作表、範圍、選擇、公式、數字格式、篩選、排序、資料驗證、條件格式、超連結、評論、尋找取代、註記、表格、繪圖整合和可擴充 UI 外掛。 | 即時協作、編輯歷史、匯入匯出、列印、圖表、樞紐分析表、迷你圖、大綱、形狀、儲存格內圖形、資料連接器、伺服器端計算和增強公式能力。 |
| **Docs** | 富文字文件模型、編輯 UI、列表、超連結、繪圖整合、評論、快速插入和共享文件架構。 | 協作、匯入匯出、列印、增強表格和列表、分欄、提示區塊、程式碼區塊、引用區塊、形狀和遠端評論資源。 |
| **Slides** | 簡報資料模型和 UI 套件，目前仍在積極開發中。 | Pro 簡報模型和 UI、投影片匯入匯出、圖表和表格模型/UI 外掛，以及共享形狀編輯基礎設施。 |
| **Bases** | 基於 Univer 的外掛、命令和模型架構構建自訂結構化資料體驗。 | Base 資料庫模型、命令、公式整合、工作台 UI、欄位編輯器和渲染引擎視圖。 |
| **Runtime** | 瀏覽器應用、Node.js 無頭使用、Web Worker/RPC 模式、多實例使用和伺服器端自動化。 | 協作客戶端/伺服器端套件、Node.js 協作客戶端、Pro 伺服器端服務、SSR、計算委派、伺服器端計算和 changeset 回放工具。 |
| **Integrations** | React、Vue、Web Components、框架模板、主題、本地化和自訂外掛。 | Pro 預設和企業部署套件。 |

Sheets 是目前最成熟的產品介面。Docs 和 Slides 共享 Univer 的架構，並在同一 SDK 中持續演進。

## 🔓 開源與 Pro

本倉庫包含 Univer 的開源核心和第一方 OSS 外掛。Univer Pro 作為商業擴充層單獨開發，面向進階產品介面、協作、伺服器端能力和企業整合。

| 類別 | 開源 | Univer Pro / 商業版 |
| --- | --- | --- |
| **基礎能力** | 核心 SDK、外掛系統、渲染引擎、公式引擎、Facade API、主題、i18n 和框架適配器。 | Pro 預設和企業部署套件。 |
| **Sheets** | 核心試算表編輯、公式、數字格式、篩選/排序、資料驗證、條件格式、註記、表格、超連結、評論、繪圖、尋找取代。 | 協作、編輯歷史、匯入匯出、列印、圖表、樞紐分析表、迷你圖、大綱、形狀、儲存格內圖形、資料連接器、範圍預處理和增強公式引擎能力。 |
| **Docs** | 文件模型和編輯 UI、列表、超連結、評論、快速插入和繪圖整合。 | 協作、匯入匯出、列印、增強表格/列表、分欄、提示區塊、程式碼區塊、引用區塊、形狀和遠端執行緒評論資源。 |
| **Slides** | OSS 簡報模型和 UI 套件。 | Pro 簡報模型/UI 套件、投影片匯入匯出、圖表、表格和可重複使用形狀編輯器 UI。 |
| **Bases** | 用於自訂資料類產品的可擴充外掛架構。 | Base 資料庫核心模型、命令、變更、公式整合、工作台 UI、欄位編輯器和渲染引擎整合。 |
| **伺服器端與執行時** | Node.js 無頭執行時、RPC/Web Worker 模式和面向伺服器端自動化的基礎能力。 | 協作伺服器、Node.js 協作客戶端、SSR 服務、計算委派、伺服器端計算和協作 changeset 回放工具。 |

Pro 功能請參考 [Univer Pro 指南](https://docs.univer.ai/guides/pro)。這裡將其單獨列出，是為了清楚區分 OSS 套件的能力邊界。

邊界原則：

- 本倉庫中的 OSS 套件應能在 Apache-2.0 授權下獨立使用。Univer Pro 是選用的，使用公開 OSS SDK API 不需要依賴 Pro。
- OSS 套件中的 bug、回歸和安全問題應在 OSS 倉庫中回報和修復，即使存在相關的 Pro 功能。
- OSS 文件不應暗示 Pro-only 能力已包含在公開的 `@univerjs/*` 套件中。Pro-only API、套件和部署路徑應被明確命名。
- 當某個 OSS 功能存在 Pro 增強時，OSS 行為仍應被獨立記錄，方便使用者在不先閱讀商業文件的情況下評估開源能力。

## 🌐 生態

- **核心 SDK**：[`dream-num/univer`](https://github.com/dream-num/univer)，也就是目前的 monorepo。
- **Presets**：[`dream-num/univer-presets`](https://github.com/dream-num/univer-presets)，面向瀏覽器和 Node.js 應用的預設外掛組合。
- **AI agent skills**：[`dream-num/univer-sdk-skills`](https://github.com/dream-num/univer-sdk-skills)，供 AI agent 使用的可重複使用說明，涵蓋 Univer 整合、Pro 功能、外掛開發和 Node 後端。參見 [AI Skills 指南](https://docs.univer.ai/guides/skills)。
- **文件**：[docs.univer.ai](https://docs.univer.ai)，包含 Sheets、Docs、Slides、recipes 和 Pro 指南。
- **API 參考**：[docs.univer.ai/reference](https://docs.univer.ai/reference/classes/univer)，包含 Facade API 和生成的 API 參考。
- **示例與展示**：[Univer Showcase](https://docs.univer.ai/showcase) 和本倉庫的 [`examples/`](../../examples)。
- **AI-native spreadsheets**：[`dream-num/univer-mcp`](https://github.com/dream-num/univer-mcp)，用於透過自然語言驅動 Univer Sheets 的 Univer Platform / MCP 整合。

## 📦 倉庫結構

```text
.
├── packages/      核心套件、引擎、文件類型、UI 外掛和功能外掛
├── examples/      用於開發的本地瀏覽器和 Node.js 示例
├── common/        共享內部工具、mock 資料、storybook 和工具函式
├── e2e/           Playwright 和視覺比較測試
├── tests/         其他整合測試專案
└── docs/          架構說明、圖片和倉庫內文件
```

套件級 README 位於 [`packages/`](../../packages) 下各套件目錄中。

## 🧑‍💻 開發

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
| `pnpm dev` | 啟動本地 examples 應用。 |
| `pnpm build` | 構建 workspace 套件，不包含內部 common 套件。 |
| `pnpm test` | 透過 Turbo 執行單元測試。 |
| `pnpm typecheck` | 透過 Turbo 執行 TypeScript 檢查。 |
| `pnpm lint` | 執行 ESLint。 |
| `pnpm test:e2e` | 執行 Playwright 測試。 |
| `pnpm storybook:dev` | 啟動用於 UI 元件開發的 Storybook。 |

提交 pull request 前請閱讀 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 📝 貢獻者筆記

深入修改前，建議閱讀這些倉庫內說明：

- [Building Isomorphic Univer](../ISOMORPHIC.md)：如何拆分瀏覽器、Node.js、UI 與共享外掛邏輯。
- [API 穩定性政策](../API_STABILITY.md)：stable、experimental、internal、deprecated 和破壞性變更預期。
- [Contributing to Facade API](../CONTRIBUTING-FACADE.md)：`FUniver`、`FWorkbook`、`FRange` 等 Facade API 的設計約定。
- [Naming Convention](../NAMING_CONVENTION.md)：檔案、目錄、介面、外掛、命令和依賴注入 token 的命名規則。
- [Fixing Memory Leaks](../FIX_MEMORY_LEAK.md)：Univer 實例常見記憶體洩漏模式和除錯流程。
- [Architecture TLDRs](../tldr)：公式引擎、Web Worker、權限、選擇區和 ref-range 行為的簡明說明。

## 💬 社群

- 在 [GitHub Discussions](https://github.com/dream-num/univer/discussions) 提問。
- 加入 [Discord](https://discord.gg/z3NKNT6D2f) 與社群交流。
- 關注 [Twitter / X](https://twitter.com/univerhq) 和 [YouTube](https://www.youtube.com/@dreamNum)。

參與社群前，請閱讀 [行為準則](../../CODE_OF_CONDUCT.md)。

## 🔒 安全

如果你認為發現了安全問題，請遵循 [安全政策](../../SECURITY.md)。

## ❤️ 贊助

Univer 由社群和贊助者共同支援。你可以透過 [Open Collective](https://opencollective.com/univer) 支援這個專案。

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

## 📄 授權

Copyright (c) 2021-present DreamNum Co., Ltd.

基於 [Apache-2.0](../../LICENSE) 授權開源。
