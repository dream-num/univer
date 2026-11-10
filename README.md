<a id="readme-top"></a>

<p align="center"><img src="./docs/img/readme/hero-banner.png" alt="Univer Office SDK" width="960" /></p>

<h1 align="center">Build your own AI office with Univer Office SDK.</h1>

<p align="center">Start with open-source Sheets and Docs, then connect your own application or agent.</p>

<p align="center"><a href="#quick-start">🚀 Quick start</a> · <a href="https://docs.univer.ai/">📚 Documentation</a> · <a href="https://univer.ai/compare/">⚖️ Feature comparison</a> · <a href="https://univer.ai/">🌐 Website</a> · <a href="https://docs.univer.ai/showcase">🎮 Showcase</a> · <a href="https://docs.univer.ai/reference/classes/univer">🔧 API Reference</a> · <a href="https://docs.univer.ai/blog">📝 Blog</a></p>

<p align="center"><strong>English</strong> · <a href="./docs/readme/fr-FR.md">Français</a> · <a href="./docs/readme/de-DE.md">Deutsch</a> · <a href="./docs/readme/es-ES.md">Español</a> · <a href="./docs/readme/zh-CN.md">简体中文</a> · <a href="./docs/readme/zh-TW.md">繁體中文</a> · <a href="./docs/readme/ja-JP.md">日本語</a> · <a href="./docs/readme/ko-KR.md">한국어</a></p>

<p align="center">
  <a href="https://github.com/dream-num/univer/releases"><img src="https://img.shields.io/github/v/release/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=4F46E5&amp;logo=github&amp;logoColor=white" alt="Release" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=0F766E" alt="License" /></a>
  <a href="https://github.com/dream-num/univer/actions/workflows/build-packages.yml"><img src="https://img.shields.io/github/actions/workflow/status/dream-num/univer/build-packages.yml?style=flat&amp;labelColor=30363D" alt="Build" /></a>
  <a href="https://www.codefactor.io/repository/github/dream-num/univer/overview/dev"><img src="https://www.codefactor.io/repository/github/dream-num/univer/badge/dev?style=flat" alt="CodeFactor" /></a>
  <a href="https://codecov.io/gh/dream-num/univer"><img src="https://img.shields.io/codecov/c/gh/dream-num/univer?token=aPfyW2pIMN&amp;style=flat&amp;labelColor=30363D" alt="Codecov" /></a>
</p>

<p align="center">
  <a href="https://github.com/dream-num/univer"><img src="https://img.shields.io/github/stars/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=4F46E5" alt="Stars" /></a>
  <a href="https://github.com/dream-num/univer/graphs/contributors"><img src="https://img.shields.io/github/contributors/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=4F46E5" alt="Contributors" /></a>
  <a href="https://github.com/dream-num/univer/issues"><img src="https://img.shields.io/github/issues/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=4F46E5" alt="Issues" /></a>
  <a href="https://github.com/dream-num/univer/commits/dev/"><img src="https://img.shields.io/github/last-commit/dream-num/univer?style=flat&amp;labelColor=30363D&amp;color=4F46E5" alt="Last Commit" /></a>
</p>

<p align="center">
  <a href="https://discord.gg/z3NKNT6D2f"><img src="https://img.shields.io/discord/1136129819961217077?logo=discord&amp;logoColor=FFFFFF&amp;label=discord&amp;color=5865F2&amp;style=flat&amp;labelColor=30363D" alt="Discord" /></a>
  <a href="https://twitter.com/univerhq"><img src="https://img.shields.io/badge/%40univerhq-18181B?style=flat&amp;logo=x&amp;logoColor=white" alt="X: @univerhq" /></a>
  <a href="https://opencollective.com/univer"><img src="https://img.shields.io/opencollective/all/univer?logo=opencollective&amp;style=flat&amp;labelColor=30363D&amp;color=0F766E&amp;label=supporters&amp;logoColor=white" alt="Open Collective" /></a>
</p>

<p align="center">
  <a href="https://trendshift.io/repositories/4376"><img src="https://trendshift.io/api/badge/repositories/4376" alt="Trendshift" /></a>
</p>

<details>
<summary>Table of contents</summary>

- [💡 What is Univer?](#what-is-univer)
  - [Open-source capabilities](#open-source-capabilities)
- [🚀 Build on the open-source foundation](#what-you-can-build)
  - [Quick start: an open-source spreadsheet editor](#quick-start)
  - [Connect your application to editable content](#connect-your-application-to-editable-content)
- [🏗️ Explore the open-source architecture](#open-source-architecture)
  - [Give custom features clear boundaries](#give-custom-features-clear-boundaries)
  - [Compose cross-feature edits and undo/redo](#compose-cross-feature-edits-and-undoredo)
  - [Connect applications and agents through Facade APIs and events](#connect-applications-and-agents-through-facade-apis-and-events)
- [🧩 Extend your application with Univer Office SDK](#open-source-and-commercial-extensions)
  - [Scope and licensing](#scope-and-licensing)
- [🌐 Application patterns and ecosystem](#application-patterns-and-ecosystem)
  - [Univer Workspace: an Office SDK reference application](#univer-workspace-an-office-sdk-reference-application)
  - [CLI, agent integrations, and developer skills](#cli-agent-integrations-and-developer-skills)
- [📚 Documentation and contributing](#documentation-and-contributing)
  - [Runtime compatibility](#runtime-compatibility)
- [💬 Community](#community)
- [🔒 Security](#security)
- [❤️ Sponsors](#sponsors)
- [📄 License](#license)

</details>

<a id="what-is-univer"></a>

## 💡 What is Univer?

<p align="center"><img src="./docs/img/readme/intro-banner.png" alt="Univer Office SDK: Web, Server, and AI SDKs" width="960" /></p>

**Univer** is an Office SDK for building Office applications inside your own product. It provides Office editing, calculation, collaboration, and file processing for people and existing agents, using your data and permissions. The product family covers spreadsheets, documents, presentations, relational tables, canvases, and PDFs.

Univer Office SDK has three parts:

- **Web SDK** is the foundation: content models, editing, rendering, formula calculation, and Facade APIs (application-facing APIs). Compose its plugins into an embedded editor or your own Office application, and reuse the content models, commands, and calculation for Headless processing without an interactive editor.
- **Server SDK** adds backend services for real-time collaboration, edit history, and Office file import and export.
- **AI SDK** connects Office capabilities to existing agents and workflows, with content tools, execution, and review integrations.

**This repository provides the Web SDK's core architecture and engine implementations under Apache-2.0**: content models and snapshot formats, plugin and dependency management, the command system, formula and rendering engines, Facade APIs, UI foundation, and Sheets and Docs editing capabilities. Commercial Web SDK plugins, Server SDK, and commercial AI SDK extensions are distributed and licensed separately.

Agents can use the same open-source APIs; your application supplies the model and tool orchestration. The [quotation example](#connect-your-application-to-editable-content) demonstrates editing, calculation, and saving without an AI SDK dependency.

<a id="open-source-capabilities"></a>

### Open-source capabilities

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<thead>
<tr>
<th>Area</th>
<th>Selected capabilities</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Sheets · Editing and layout</strong></td>
<td>Cell styles, merged cells, in-cell rich text, freeze panes, floating images, and undo/redo.</td>
</tr>
<tr>
<td><strong>Sheets · Data and calculation</strong></td>
<td>Formulas, defined names, filtering, sorting, data validation, conditional formatting, hyperlinks, comments, and find and replace.</td>
</tr>
<tr>
<td><strong>Docs</strong></td>
<td>Rich-text editing, paragraph formatting, lists, hyperlinks, comments, and drawing integration.</td>
</tr>
</tbody>
</table>

</div>

Features are composed through plugins and presets; the [quick start](#quick-start) uses only the **Sheets Core preset**. Images use the corresponding drawing plugins. See the [feature comparison](https://univer.ai/compare/) for detailed open-source and commercial coverage.

The demos below showcase the wider **Univer Office SDK**, including commercial capabilities. They show more than the default open-source setup; see [open source and commercial extensions](#open-source-and-commercial-extensions) for scope.

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<tbody>
<tr>
  <td width="50%"><a href="https://univer.ai/demo/spreadsheets"><img src="./docs/img/readme/cards/sheets.webp" alt="Sheets — Editing and layout · Data and calculation — Open demo" width="420" /></a></td>
  <td width="50%"><a href="https://univer.ai/demo/docs"><img src="./docs/img/readme/cards/docs.webp" alt="Docs — Rich-text editing — Open demo" width="420" /></a></td>
</tr>
<tr>
  <td width="50%"><a href="https://univer.ai/demo/web-app"><img src="./docs/img/readme/cards/web-app.webp" alt="Web App — Sheet-powered apps — Open demo" width="420" /></a></td>
  <td width="50%"><a href="https://univer.ai/demo/universe"><img src="./docs/img/readme/cards/universe.webp" alt="Univer — Composed Office content — Open demo" width="420" /></a></td>
</tr>
<tr>
  <td width="50%"><a href="https://univer.ai/demo/slides"><img src="./docs/img/readme/cards/slides.webp" alt="Slides — Open demo" width="420" /></a></td>
  <td width="50%"><a href="https://univer.ai/demo/relational-tables"><img src="./docs/img/readme/cards/relational-tables.webp" alt="Relational Tables — Open demo" width="420" /></a></td>
</tr>
<tr>
  <td width="50%"><a href="https://univer.ai/demo/canvases"><img src="./docs/img/readme/cards/canvases.webp" alt="Canvases — Open demo" width="420" /></a></td>
  <td width="50%"><a href="https://univer.ai/demo/pdf"><img src="./docs/img/readme/cards/pdf.webp" alt="PDF — Open demo" width="420" /></a></td>
</tr>
</tbody>
</table>

</div>

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="what-you-can-build"></a>

## 🚀 Build on the open-source foundation

<p align="center"><img src="./docs/img/readme/build-banner.png" alt="Build on open source" width="960" /></p>

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<thead>
<tr>
<th>Your goal</th>
<th>Use the open-source foundation</th>
<th>Start here</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Embed Sheets or Docs</strong></td>
<td>Add an editable Office surface to your application or agent product, and connect your data through Facade APIs.</td>
<td><a href="#quick-start">Quick start</a></td>
</tr>
<tr>
<td><strong>Process content without an editor</strong></td>
<td>Reuse content plugins, models, commands, and calculation in Node.js for editing, snapshots, and automated tasks.</td>
<td><a href="https://docs.univer.ai/guides/sheets/getting-started/node">Headless guide</a></td>
</tr>
<tr>
<td><strong>Develop custom features or editors</strong></td>
<td>Reuse the engines, UI components, plugin boundaries, dependency injection, and command/undo systems. Follow existing features to extend Sheets and Docs or develop your own editors.</td>
<td><a href="#open-source-architecture">Open-source architecture</a></td>
</tr>
</tbody>
</table>

</div>

**Coordinate edits and undo/redo across features.** Inserting a row inside a filter range changes both the base content and the filter range; undo needs to restore both. Each feature supplies its own changes and undo data, and the command composes their execution and history. The architecture walkthrough explains how to extend these editing workflows.

<a id="quick-start"></a>

### Quick start: an open-source spreadsheet editor

In a browser application using a bundler such as Vite:

```bash
pnpm add @univerjs/presets @univerjs/preset-sheets-core
```

Create the container before initializing Univer:

```html
<div id="app" style="height: 100vh"></div>
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

Your page now contains a spreadsheet editor. Use the returned `univerAPI` to work with its content. This example uses open-source packages and needs no commercial Univer license or Server SDK.

For component frameworks, retain the `univer` instance returned by `createUniver` and call `univer.dispose()` when the component unmounts. See the [lifecycle guide](https://docs.univer.ai/guides/sheets/getting-started/lifecycle).

Presets compose plugins and register their Facade APIs. For manual control, see the [Plugin Mode example](#manual-plugin-composition) below. The [installation guide](https://docs.univer.ai/guides/sheets/getting-started/installation) covers both modes, peer dependencies, and framework integrations.

Keep coordinated `@univerjs/*` packages on the same version. Commercial packages must use the matching release line; independently released packages such as icons follow their declared compatibility. See the [API Stability Policy](./docs/API_STABILITY.md).

<a id="connect-your-application-to-editable-content"></a>

### Connect your application to editable content

Facade APIs are the application-facing interface to workbooks, worksheets, and ranges. Continue from the quick start to populate a quotation, update a quantity from application code, and read the recalculated total:

```ts
// Wait for formula controllers before editing a newly created workbook.
await new Promise<void>((resolve) => {
  if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Steady) {
    resolve()
    return
  }
  const listener = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) {
      listener.dispose()
      resolve()
    }
  })
})

const workbook = univerAPI.getActiveWorkbook()!
const sheet = workbook.getActiveSheet()

sheet.getRange('A1:D4').setValues([
  ['Item', 'Quantity', 'Unit price', 'Amount'],
  ['Seats', 2, 25, '=B2*C2'],
  ['Support', 1, 100, '=B3*C3'],
  ['Total', '', '', '=SUM(D2:D3)'],
])

// An application control or agent can make the same edit.
sheet.getRange('B2').setValue(4)

univerAPI.getFormula().onCalculationResultApplied().then(() => {
  console.log(sheet.getRange('D4').getValue()) // 200
  localStorage.setItem('quotation', JSON.stringify(workbook.save()))
}).catch(console.error)
```

The editor and your application operate on the same workbook; formula changes are recalculated automatically. `workbook.save()` returns a JSON snapshot containing the workbook and its registered plugin data. Your application owns persistence; this example uses browser storage. On a later page load, after initialization, restore the snapshot **instead of creating a blank workbook**:

```ts
const saved = localStorage.getItem('quotation')
if (saved) {
  univerAPI.createWorkbook(JSON.parse(saved))
}
```

This workflow uses only open-source packages. Snapshot persistence is separate from XLSX import and export, which uses the separately distributed file-conversion capabilities. Use public Facade APIs for application integration; the source links below explain internal implementation and extension points. See the [API Stability Policy](./docs/API_STABILITY.md) before depending on an extension point.

<a id="manual-plugin-composition"></a>

<details>
<summary>Advanced: compose plugins manually (Plugin Mode)</summary>

Use Plugin Mode when you need precise control over plugin selection, dependencies, or loading. The preset above handles this composition for you.

This alternative initialization uses the same `app` container and the Sheets Core preset's browser plugin stack without a Worker. Use it **instead of** the preset initialization, then run the same quotation example with the returned `univerAPI`.

```bash
pnpm add @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui \
  @univerjs/engine-formula @univerjs/engine-render @univerjs/network \
  @univerjs/sheets @univerjs/sheets-ui @univerjs/sheets-formula \
  @univerjs/sheets-formula-ui @univerjs/sheets-numfmt \
  @univerjs/sheets-numfmt-ui @univerjs/ui
```

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import FormulaEnUS from '@univerjs/engine-formula/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverNetworkPlugin } from '@univerjs/network'
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
import '@univerjs/network/facade'
import '@univerjs/docs/facade'
import '@univerjs/docs-ui/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/ui/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'
import '@univerjs/sheets-formula-ui/facade'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      DocsUIEnUS,
      FormulaEnUS,
      SheetsEnUS,
      SheetsFormulaEnUS,
      SheetsFormulaUIEnUS,
      SheetsNumfmtUIEnUS,
      SheetsUIEnUS,
      UIEnUS,
    ),
  },
})

univer.registerPlugin(UniverNetworkPlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverUIPlugin, { container: 'app' })
univer.registerPlugin(UniverDocsUIPlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverSheetsPlugin, {
  onlyRegisterFormulaRelatedMutations: false,
})
univer.registerPlugin(UniverSheetsUIPlugin, {
  protectedRangeShadow: true,
})
univer.registerPlugin(UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)

const univerAPI = FUniver.newAPI(univer)
univerAPI.createWorkbook({})
```

The Docs plugins support spreadsheet rich-text editing. When adding a feature, include its corresponding Facade extensions, locale bundles, and UI styles. Dispose `univer` when its container is unmounted.

</details>

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="open-source-architecture"></a>

## 🏗️ Explore the open-source architecture

<p align="center"><img src="./docs/img/readme/architecture-banner.png" alt="" width="960" /></p>

<a id="give-custom-features-clear-boundaries"></a>

### Give custom features clear boundaries

Univer organizes content logic and UI interaction in separate plugins. Feature plugins manage rules and content changes; UI plugins provide the interface and user interactions. For example, `sheets-filter` manages filter ranges and rules, while `sheets-filter-ui` provides panels, menus, and shortcuts.

```mermaid
%%{init: {'htmlLabels': false, 'theme': 'base', 'themeVariables': {'fontFamily': 'Arial, PingFang SC, Microsoft YaHei, sans-serif', 'fontSize': '17px', 'lineColor': '#64748b'}, 'flowchart': {'htmlLabels': false, 'curve': 'linear', 'nodeSpacing': 28, 'rankSpacing': 45, 'padding': 16, 'wrappingWidth': 270}}}%%
%% A layered overview, not a complete dependency graph.
%% Group arrows indicate reuse of the layer below; internal arrows show selected dependencies.
flowchart TD
  subgraph FEATURES["Feature Plugins"]
    direction LR
    FUI["Filter<br/>UI Plugin"]
    VUI["Data Validation<br/>UI Plugin"]
    FILTER["Filter Plugin"]
    VALIDATION["Data Validation Plugin"]
    FUI --> FILTER
    VUI --> VALIDATION
  end

  subgraph PRODUCTS["Product Plugins"]
    direction LR
    SUI["Sheets UI Plugin"]
    SHEETS["Sheets Plugin"]
    SUI --> SHEETS
  end

  subgraph FOUNDATION["Core Framework & Plugins"]
    direction LR
    UI["UI Plugin"]
    FORMULA["Formula Engine Plugin"]
    RENDER["Render Engine Plugin"]
    CORE["Core"]
    UI --> RENDER
    RENDER --> CORE
    FORMULA --> CORE
  end

  FEATURES --> PRODUCTS
  PRODUCTS --> FOUNDATION

  classDef logic fill:#eff6ff,color:#17365f,stroke:#93b4df,stroke-width:1.5px
  classDef ui fill:#f0fdf4,color:#17543a,stroke:#91c8a7,stroke-width:1.5px
  classDef shared fill:#f6f7f9,color:#334155,stroke:#bac3ce,stroke-width:1.5px
  classDef feature fill:#172d50,color:#ffffff,stroke:#172d50
  class FUI,VUI ui
  class FILTER,VALIDATION logic
  class SUI,SHEETS logic
  class UI,FORMULA,RENDER,CORE shared

  style FEATURES fill:#f7fcf9,stroke:#b5d8c1,color:#17543a
  style PRODUCTS fill:#f5f9ff,stroke:#b6cbea,color:#17365f
  style FOUNDATION fill:#fafbfc,stroke:#cbd2dc,color:#334155
```

**Figure 1: three plugin layers.** Feature plugins build on product plugins, which reuse the core framework and plugins. Group arrows show dependencies on the layer below; Core provides content models, commands, dependency injection, and lifecycle management. Some plugins and dependencies are omitted.

New features keep their rules in their own plugins and cooperate through public services, commands, and defined extension points. UI plugins build on shared UI services and components.

Dependencies are explicit at two levels:

- **Between plugins:** `DependentOn` declares runtime plugin dependencies. The plugin service orders them, and lifecycle stages separate dependency registration, content initialization, and UI initialization.
- **Inside plugins:** dependency injection connects controllers and services through declared dependencies. Supported overrides let an application replace an implementation, adapt a platform service, or supply a test double. Instance-scoped injectors keep application state separate between Univer instances.

Disposable registration also gives commands, listeners, components, and icons a cleanup path when their owner is disposed.

The [filter plugin](./packages/sheets-filter/src/plugin.ts) and its [UI plugin](./packages/sheets-filter-ui/src/plugin.ts) show these boundaries in working code.

<details>
<summary>Inside a feature: Model, Controller, Service, and the UI foundation</summary>

For filtering, `sheets-filter` owns content logic and `sheets-filter-ui` owns UI interaction. Each module has a focused responsibility.

```mermaid
%%{init: {'htmlLabels': false, 'theme': 'base', 'themeVariables': {'fontFamily': 'Arial, PingFang SC, Microsoft YaHei, sans-serif', 'fontSize': '17px', 'lineColor': '#64748b'}, 'flowchart': {'htmlLabels': false, 'curve': 'linear', 'nodeSpacing': 28, 'rankSpacing': 45, 'padding': 16, 'wrappingWidth': 270}}}%%
%% Every arrow means contains. This is code organization, not execution order.
flowchart LR
  FEATURE["Filter Feature"]
  LOGIC["Filter Plugin"]
  UI["Filter UI Plugin"]
  MODEL["Model"]
  SERVICE["Service"]
  CONTROLLER["Controller"]
  COMMAND["Command / Mutation"]
  FACADE["Facade API"]
  VIEW["View"]
  UICTRL["UI Controller"]
  UISERVICE["UI Service"]
  FEATURE --> LOGIC
  FEATURE --> UI
  LOGIC --> MODEL
  LOGIC --> SERVICE
  LOGIC --> CONTROLLER
  LOGIC --> COMMAND
  LOGIC --> FACADE
  UI --> VIEW
  UI --> UICTRL
  UI --> UISERVICE

  classDef logic fill:#eff6ff,color:#17365f,stroke:#93b4df,stroke-width:1.5px
  classDef ui fill:#f0fdf4,color:#17543a,stroke:#91c8a7,stroke-width:1.5px
  classDef shared fill:#f6f7f9,color:#334155,stroke:#bac3ce,stroke-width:1.5px
  classDef feature fill:#172d50,color:#ffffff,stroke:#172d50
  class FEATURE feature
  class LOGIC,MODEL,SERVICE,CONTROLLER,COMMAND,FACADE logic
  class UI,VIEW,UICTRL,UISERVICE ui
```

**Figure 2: code organization. Arrows mean “contains.”** Both plugins can contain Controllers and Services: logic Controllers coordinate content changes and related features; UI Controllers connect menus, shortcuts, and interactions, with UI Services managing panel state. These responsibilities give new features a consistent structure to implement and test.

The UI foundation follows the same division. **`@univerjs/design`** supplies shared components and styles, **`@univerjs/ui`** provides workbench services such as menus, shortcuts, panels, and component registration, and **`@univerjs/icons`** supplies icons. A feature registers its components and icons, contributes menus, and attaches its rendering through these extension points. Teams can add a panel or toolbar feature while reusing the application's UI infrastructure. See the [UI overview](https://docs.univer.ai/guides/sheets/ui/overview) and the filter plugin's [component and icon registration](./packages/sheets-filter-ui/src/controllers/components.controller.ts).

</details>

<a id="compose-cross-feature-edits-and-undoredo"></a>

### Compose cross-feature edits and undo/redo

For example, when rows are inserted inside a filter range, the filter plugin supplies the corresponding range change and its undo data. The row command composes the base edit and participating feature changes, executes them, and records their undo/redo information together. The row insertion feature can use the shared extension mechanism while the filter plugin owns its range-update rules.

The command system distinguishes three kinds of action:

- **Command** orchestrates a business action and the changes it requires.
- **Mutation** changes content saved in a snapshot, with serializable parameters.
- **Operation** changes transient state, such as an open panel or the scroll position.

**A shared structure for undo/redo.** For an undoable edit, the feature implementation supplies the forward mutations and corresponding inverse mutations, and the Command records them through `IUndoRedoService`. When one action affects several features, the Command can combine their changes and undo data in a single undo/redo record, so the user can undo and redo the complete action. See [extending commands](https://docs.univer.ai/blog/custom-command).

Features still need to cooperate. **Interceptors and reference-range handlers give that cooperation a defined place.** At supported extension points, plugins contribute checks or related mutations; interceptor priorities control ordering where the API defines it.

<details>
<summary>Example: commands, callbacks, feature coordination, and undo/redo</summary>

```mermaid
%%{init: {'htmlLabels': false, 'theme': 'base', 'themeVariables': {'fontFamily': 'Arial, PingFang SC, Microsoft YaHei, sans-serif', 'fontSize': '17px', 'lineColor': '#64748b'}, 'flowchart': {'htmlLabels': false, 'curve': 'linear', 'nodeSpacing': 28, 'rankSpacing': 45, 'padding': 16, 'wrappingWidth': 270}}}%%
%% Simplified insert-row example. A command composes mutations and records undo after success.
%% Events may also fire for nested command executions; not every callback is drawn.
flowchart TD
  BEFORE["Before execution<br/>Inspect or cancel"]
  CMD["Insert-row Command"]
  BASE["Row mutations"]
  EXT["Feature extension points<br/>Filter range changes"]
  MODEL["Execute combined mutations"]
  UNDO["Record undo and redo"]
  AFTER["After execution<br/>Notify listeners"]
  BEFORE --> CMD
  CMD --> BASE
  CMD --> EXT
  BASE --> MODEL
  EXT --> MODEL
  MODEL --> UNDO
  UNDO --> AFTER
  classDef entry fill:#f6f7f9,color:#334155,stroke:#bac3ce,stroke-width:1.5px
  classDef core fill:#eff6ff,color:#17365f,stroke:#93b4df,stroke-width:1.5px
  classDef extension fill:#f0fdf4,color:#17543a,stroke:#91c8a7,stroke-width:1.5px
  class BEFORE,AFTER entry
  class CMD,BASE,MODEL,UNDO core
  class EXT extension
```

This diagram simplifies an insert-row workflow. Nested command executions have their own callbacks; it does not show every event or the separate Operation path. See the [row command](./packages/sheets/src/commands/commands/insert-row-col.command.ts), [filter controller](./packages/sheets-filter/src/controllers/sheets-filter.controller.ts), and [interceptor service](./packages/sheets/src/services/sheet-interceptor/sheet-interceptor.service.ts).

</details>

These boundaries support a practical testing strategy: test models and services independently, replace external dependencies through DI, and add regression cases for combined actions and undo/redo. The [filter controller tests](./packages/sheets-filter/src/controllers/__tests__/sheets-filter.controller.spec.ts) exercise row and column changes and their effect on filtering.

<a id="connect-applications-and-agents-through-facade-apis-and-events"></a>

### Connect applications and agents through Facade APIs and events

The repository includes the content models, formula engine, and Canvas rendering and layout engine behind the editors. They are shared building blocks: spreadsheet rich text, for example, reuses document layout and rendering. Custom features can build on these engines instead of implementing a separate content stack. Read about the [formula engine architecture](https://docs.univer.ai/blog/formula) and [rendering engine architecture](https://docs.univer.ai/blog/rendering).

Browser editors, Node.js Headless tasks, and appropriately composed Workers can reuse the corresponding content plugins, models, commands, and calculation. See [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) and the [isomorphic architecture](./docs/ISOMORPHIC.md).

`ICommandService` exposes execution callbacks so plugins can observe commands before and after execution. Facade APIs wrap the underlying capabilities in application objects such as `FWorkbook`, `FWorksheet`, and `FRange`.

Each plugin contributes its own Facade extensions, **typed events through `univerAPI.Event`**, and **enums through `univerAPI.Enum`**. Application code can discover event names and constants from one entry point instead of importing private services or repeating strings. For example, `BeforeCommandExecute` can inspect and cancel an execution; `CommandExecuted` reports executions to listeners. Listeners return disposables, and cancellation applies where the event supports it.

Facade extensions stay with their feature packages, so a content API does not have to pull in unrelated UI APIs. See the [Facade design](https://docs.univer.ai/blog/facade), [command callbacks and event bridge](./packages/core/src/facade/f-univer.ts), and [Enum entry point](./packages/core/src/facade/f-enum.ts).

The repository provides working feature implementations and patterns for extending them. Read the [filter implementation walkthrough](https://docs.univer.ai/blog/anatomy) for a complete example, or the [API Stability Policy](./docs/API_STABILITY.md) before depending on an extension point.

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="open-source-and-commercial-extensions"></a>

## 🧩 Extend your application with Univer Office SDK

<p align="center"><img src="./docs/img/readme/sdk-banner.png" alt="" width="960" /></p>

When you want more ready-to-integrate capabilities, compose the corresponding **Univer Office SDK** modules: additional content types, advanced editing plugins, collaboration, file conversion, and agent tooling. They extend the same content models, plugin architecture, command system, and Facade design introduced above, so you can build on your existing integration.

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<thead>
<tr>
<th>Part</th>
<th>How it extends the foundation</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Open-source Web SDK core · this repository</strong></td>
<td>Open-source models, engines, plugins, UI foundation, and Sheets and Docs capabilities, with corresponding Headless content operations. Use them in commercial applications under Apache-2.0.</td>
</tr>
<tr>
<td><strong>Commercial Web SDK plugins</strong></td>
<td>Follow the core's Plugin, dependency injection, Command/Mutation, and Facade extension patterns. Add charts, shapes, pivot tables, SmartArt, and other features for the corresponding content types.</td>
</tr>
<tr>
<td><strong>Server SDK</strong></td>
<td>Extends the same content models and mutation conventions with real-time collaboration, revision history, and Office file conversion. Integrates with your application's identity, permissions, and storage.</td>
</tr>
<tr>
<td><strong>AI SDK extensions</strong></td>
<td>Reuse Web SDK Headless and Facade capabilities to provide composable Node.js APIs and CLI building blocks for agents to inspect, edit, and check content, with collaboration and Worktree review integrations.</td>
</tr>
</tbody>
</table>

</div>

<a id="scope-and-licensing"></a>

### Scope and licensing

- **This repository:** Apache-2.0 packages that can be used in commercial applications under that license, including the open-source Headless content capabilities.
- **Commercial extensions:** Commercial Web SDK plugins, Server SDK, and AI SDK capabilities beyond the open-source foundation are distributed and licensed separately. **Freemium** evaluation includes watermarks and feature limits.
- **Reference applications:** Open-source applications such as Univer Workspace have their own source licenses. Their SDK dependencies retain their respective licenses.

See the [feature comparison](https://univer.ai/compare/), including its **Open source only** filter, for detailed coverage and [plans and licensing](https://univer.ai/pricing/) for commercial options.

<details>
<summary>How shared content models connect editing, collaboration, and files</summary>

These capabilities operate on serializable **Unit snapshots**, including Sheets' `IWorkbookData`, Docs' `IDocumentData`, Slides' `ISlideData`, and canvases' `IBoardData` (called **Boards** in the API). These types come from core and the respective product packages; current Slides and Boards capabilities are separately distributed commercial products. The shared Unit conventions let browser editors, backend services, and agents work with the same content.

Commands orchestrate edits; **Mutations describe content changes**. Collaboration packages those mutations into **changesets**, applies **operational transformation (OT)** to concurrent changes, and manages confirmed revisions and snapshots. History can reconstruct a revision from a snapshot and subsequent changesets. Read the [collaboration design](https://docs.univer.ai/blog/ot) and [Collaboration SDK overview](https://docs.univer.ai/server/collaboration/overview).

**Exchange** maps Office file structures to and from Univer content snapshots. For OOXML formats such as **XLSX, DOCX, and PPTX**, it parses the file into the corresponding Sheet, Doc, or Slide data and generates the file representation on export. The converted content can enter the same editing, calculation, collaboration, and agent workflows. See [Office file import and export](https://docs.univer.ai/server/import-export/node).

</details>

<details>
<summary>How AI SDK gives agents the same content capabilities</summary>

AI SDK builds on the Web SDK's **Headless content models, commands, calculation, and Facade APIs**. It exposes structured TypeScript APIs and optional Commander presets that applications can compose into their own Office CLI or agent tools.

- **Understand, discover, and edit.** Inspection returns structured content. API Reference helps the agent find Facade symbols and signatures shipped with its SDK. Facade execution distinguishes read and write modes, captures mutations, and works with explicit synchronization and commit results. See [content operations](https://docs.univer.ai/ai/content-operations).
- **Check the rendered result.** A browser Render Runtime reuses Web SDK rendering for screenshots. Slide layout lint adds structured findings for issues such as off-page or overlapping text, giving the agent evidence for another editing pass. See [visual inspection](https://docs.univer.ai/ai/visual-inspection).
- **Edit drafts for human review.** With the corresponding collaboration and Web capabilities, agents can edit and verify an isolated Worktree draft over several rounds, then hand it to a person to review, merge, or reopen. The workflow uses the same snapshots, mutations, and revision conventions. See [Worktree](https://docs.univer.ai/ai/worktree).

For repeated calls, optional [Worker pools and a daemon](https://docs.univer.ai/ai/runtime-architecture) reuse loaded content instances and reduce repeated initialization. Your application owns the root CLI, targets, authorization, and output. Explore the [AI SDK package catalog](https://docs.univer.ai/ai/packages) to select the required capabilities.

</details>

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="application-patterns-and-ecosystem"></a>

## 🌐 Application patterns and ecosystem

<p align="center"><img src="./docs/img/readme/ecosystem-banner.png" alt="" width="960" /></p>

<a id="univer-workspace-an-office-sdk-reference-application"></a>

### Univer Workspace: an Office SDK reference application

For a complete application reference, start with [Univer Workspace](https://github.com/dream-num/univer-workspace). It shows how to compose Univer Office SDK editors, collaboration, file capabilities, existing agents, and human review into a self-hostable workspace. Follow its integration patterns when building your own Office application or agent workspace.

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
  <tr>
    <td width="50%" valign="top">
      <a href="https://space.univer.ai/"><img src="./docs/img/readme/workspace.webp" alt="An editable budget spreadsheet in Univer Workspace" width="420" /></a>
    </td>
    <td width="50%" valign="top">
      <a href="https://univer.ai/demo/web-app"><img src="./docs/img/readme/web-app.webp" alt="A Web App with assumption controls beside its connected editable spreadsheet" width="420" /></a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Agents and editable Office content</strong><br />
      Keep conversations, spreadsheet editing, and Office content in one workspace.<br />
      <a href="https://space.univer.ai/">Try Workspace</a> · <a href="https://github.com/dream-num/univer-workspace">Workspace source and setup</a>
    </td>
    <td width="50%" valign="top">
      <strong>Web App × Sheet · Experimental</strong><br />
      Bind controls to cells: the app writes to the sheet, and sheet changes update the app.<br />
      <a href="https://univer.ai/demo/web-app">Try the sheet-powered app demo</a>
    </td>
  </tr>
</table>

</div>

Workspace is open source; its SDK dependencies follow their respective licenses. See the [Workspace overview](https://univer.ai/workspace/) for connected apps and review workflows.

<p align="center"><a href="https://www.youtube.com/watch?v=1p-SMEiK6Kg"><img src="./docs/img/readme/integration-demo.png" alt="Watch an SDK integration demo" width="720" /></a></p>

[Watch an SDK integration demo](https://www.youtube.com/watch?v=1p-SMEiK6Kg)

<a id="cli-agent-integrations-and-developer-skills"></a>

### CLI, agent integrations, and developer skills

The same SDK capabilities can also be composed into the agents and tools you already use:

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<thead>
<tr>
<th>Project</th>
<th>What it provides</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://github.com/dream-num/univer-cli">Univer CLI</a></td>
<td>A local command-line workspace for creating, editing, inspecting, and delivering Office content.</td>
</tr>
<tr>
<td><a href="https://github.com/dream-num/dsh-univer-office">Univer Office for DeepSeek Harness</a></td>
<td>Linked content, result verification, versioned changes, and isolated Worktree collaboration.</td>
</tr>
<tr>
<td><a href="https://github.com/dream-num/workbuddy-univer-office">Univer Office for WorkBuddy</a></td>
<td>Local Office integration, MCP previews, and draft review. Developer preview.</td>
</tr>
<tr>
<td><a href="https://github.com/dream-num/openclaw-univer-office">Univer Office for OpenClaw</a></td>
<td>Tools for creating, reviewing, and delivering Office content.</td>
</tr>
<tr>
<td><a href="https://github.com/dream-num/univer-sdk-skills">Univer SDK Skills</a></td>
<td>Instructions that help coding agents integrate the SDK, develop plugins, and implement backend workflows.</td>
</tr>
</tbody>
</table>

</div>

Each repository documents its setup and SDK dependencies. Explore the [ecosystem](https://univer.ai/ecosystem/) for agent entry points, or the [documentation](https://docs.univer.ai/) to build your own integration.

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="documentation-and-contributing"></a>

## 📚 Documentation and contributing

Thanks to all [contributors](https://github.com/dream-num/univer/graphs/contributors) who build and improve Univer. Contributions to engines, plugins, tests, documentation, and examples are welcome.

<p align="center"><a href="https://docs.univer.ai/guides/sheets">🧩 Web SDK</a> · <a href="https://docs.univer.ai/server">🖥️ Server SDK</a> · <a href="https://docs.univer.ai/ai">🤖 AI SDK</a> · <a href="https://docs.univer.ai/reference/classes/univer">🔧 API reference</a> · <a href="https://office.univer.ai/">🎮 Live showcase</a></p>

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
  <tr>
    <th align="center"><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/edge/edge_64x64.png" width="32" height="32" alt="" /><br />Edge</th>
    <th align="center"><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/firefox/firefox_64x64.png" width="32" height="32" alt="" /><br />Firefox</th>
    <th align="center"><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/chrome/chrome_64x64.png" width="32" height="32" alt="" /><br />Chrome</th>
    <th align="center"><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/safari/safari_64x64.png" width="32" height="32" alt="" /><br />Safari</th>
    <th align="center"><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/75.0.1/electron/electron_64x64.png" width="32" height="32" alt="" /><br />Electron</th>
  </tr>
  <tr>
    <td align="center"><code>&gt;=88</code></td>
    <td align="center"><code>&gt;=90</code></td>
    <td align="center"><code>&gt;=88</code></td>
    <td align="center"><code>&gt;=14.1</code></td>
    <td align="center"><code>&gt;=12</code></td>
  </tr>
</table>

</div>

<p align="center">Univer is compiled with a Chrome 88 target and aims to work with the versions listed above.</p>

<a id="runtime-compatibility"></a>

### Runtime compatibility

- **Polyfills**: Univer relies on `Intl.Segmenter`. Add a polyfill such as `@formatjs/intl-segmenter` if your target browser or runtime does not provide it.
- **Build tools**: We recommend Vite, esbuild, or Webpack 5. If your build tool does not support the `exports` field in `package.json` (common in Webpack 4), you may need extra path mapping.
- **React**: Univer's view layer is built on React 18, supports React 18 and 19, and provides minimal compatibility support for React 16.9+ and 17.
- **Node.js runtime**: Headless Univer supports Node.js `>=18.17.0`. Developing this monorepo requires Node.js `>=22.18`.

<details>
<summary>Developing in this repository</summary>

### Repository layout

```text
.
├── packages/      Core packages, engines, document types, UI plugins, and feature plugins
├── examples/      All-in-one Vite workbench used for local browser development
├── common/        Shared internal tooling, storybook, and utilities
├── tests/         Additional integration test projects
└── docs/          Architecture notes, images, and repository-local documentation
```

Package-level READMEs live beside each package under [`packages/`](./packages).

### Local development

Requirements:

- Node.js `>=22.18`
- pnpm: use the version declared by `packageManager` in `package.json`.

```bash
git clone https://github.com/dream-num/univer.git
cd univer
pnpm install
pnpm dev
```

Useful commands:

<div align="center" style="overflow-x: auto;">

<table align="center" style="display: table; width: auto; margin-left: auto; margin-right: auto;">
<thead>
<tr>
<th>Command</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td><code class="notranslate">pnpm dev</code></td>
<td>Start the Sheets and Docs development workbench.</td>
</tr>
<tr>
<td><code class="notranslate">pnpm build</code></td>
<td>Build workspace packages, excluding internal common packages.</td>
</tr>
<tr>
<td><code class="notranslate">pnpm test</code></td>
<td>Run unit tests through Turbo.</td>
</tr>
<tr>
<td><code class="notranslate">pnpm typecheck</code></td>
<td>Run TypeScript checks through Turbo.</td>
</tr>
<tr>
<td><code class="notranslate">pnpm lint</code></td>
<td>Run ESLint.</td>
</tr>
<tr>
<td><code class="notranslate">pnpm storybook:dev</code></td>
<td>Start Storybook for UI component development.</td>
</tr>
</tbody>
</table>

</div>

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

</details>

<details>
<summary>Architecture and contributor references</summary>

- [Repository packages](./packages), [presets](./presets), and [examples](./examples).
- [Building Isomorphic Univer](./docs/ISOMORPHIC.md).
- [Contributing to Facade API](./docs/CONTRIBUTING-FACADE.md).
- [API Stability Policy](./docs/API_STABILITY.md).
- [Naming Convention](./docs/NAMING_CONVENTION.md) and [Fixing Memory Leaks](./docs/FIX_MEMORY_LEAK.md).
- [Architecture TLDRs](./docs/tldr) and [OLE attachment notes](./packages/drawing/docs/ole-attachments.md).

</details>

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="community"></a>

## 💬 Community

Ask questions in [GitHub Discussions](https://github.com/dream-num/univer/discussions), join [Discord](https://discord.gg/z3NKNT6D2f), and follow [X](https://twitter.com/univerhq) or [YouTube](https://www.youtube.com/@dreamNum). Please read the [Code of Conduct](./CODE_OF_CONDUCT.md).

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="security"></a>

## 🔒 Security

If you believe you have found a security issue, please follow the [Security Policy](./SECURITY.md).

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="sponsors"></a>

## ❤️ Sponsors

Univer is supported by the community and sponsors. You can support the project through [Open Collective](https://opencollective.com/univer).

<p>
  <a href="https://opencollective.com/univer/sponsor/0/website"><img src="https://opencollective.com/univer/sponsor/0/avatar.svg" alt="Become a sponsor" /></a>
</p>

<p>
  <a href="https://opencollective.com/univer/backer/0/website"><img src="https://opencollective.com/univer/backer/0/avatar.svg" width="64" height="64" alt="Backer 0" /></a>
  <a href="https://opencollective.com/univer/backer/1/website"><img src="https://opencollective.com/univer/backer/1/avatar.svg" width="64" height="64" alt="Backer 1" /></a>
  <a href="https://opencollective.com/univer/backer/2/website"><img src="https://opencollective.com/univer/backer/2/avatar.svg" width="64" height="64" alt="Backer 2" /></a>
  <a href="https://opencollective.com/univer/backer/3/website"><img src="https://opencollective.com/univer/backer/3/avatar.svg" width="64" height="64" alt="Backer 3" /></a>
  <a href="https://opencollective.com/univer/backer/4/website"><img src="https://opencollective.com/univer/backer/4/avatar.svg" width="64" height="64" alt="Backer 4" /></a>
  <a href="https://opencollective.com/univer/backer/5/website"><img src="https://opencollective.com/univer/backer/5/avatar.svg" width="64" height="64" alt="Backer 5" /></a>
  <a href="https://opencollective.com/univer/backer/6/website"><img src="https://opencollective.com/univer/backer/6/avatar.svg" width="64" height="64" alt="Backer 6" /></a>
</p>

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>

<a id="license"></a>

## 📄 License

Copyright (c) 2021-present DreamNum Co., Ltd.

The open-source packages in this repository are licensed under [Apache-2.0](./LICENSE). Commercial SDK modules are distributed and licensed separately.

<p align="right"><a href="#readme-top"><img src="https://img.shields.io/badge/%E2%86%91%20Back%20to%20top-30363D?style=flat-square" alt="Back to top" height="20" /></a></p>
