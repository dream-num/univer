<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="../img/banner-light.png">
    <img src="../img/banner-dark.png" alt="Univer" width="420" />
</picture>

**스프레드시트, 문서, 프레젠테이션을 만들기 위한 풀스택 동형 오피스 SDK.**

Univer는 플러그인 아키텍처, Canvas 기반 렌더링, 수식 엔진,
브라우저와 Node.js에서 함께 사용할 수 있는 Facade API로
임베드 가능한 생산성 경험을 만들 수 있게 해줍니다.

[English](../../README.md) | [简体中文](./zh-CN.md) | [繁體中文](./zh-TW.md) | [日本語](./ja-JP.md) | 한국어 | [Español](./es-ES.md)

[📖 문서](https://docs.univer.ai) | [✨ 쇼케이스](https://docs.univer.ai/showcase) | [📘 API Reference](https://docs.univer.ai/reference/classes/univer) | [📝 블로그](https://docs.univer.ai/blog)

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

## ✨ Univer란?

Univer는 제품 안에 오피스 애플리케이션을 만들기 위한 오픈소스 SDK입니다. 호스팅 앱이나 고정된 UI를 강제하지 않으면서 스프레드시트, 문서, 프레젠테이션 경험에 필요한 빌딩 블록을 제공합니다.

Univer는 다음과 같은 경우에 적합합니다.

- SaaS 제품, 내부 도구, BI 워크플로, AI 애플리케이션에 스프레드시트나 문서 편집 기능을 임베드할 때.
- 브라우저와 같은 아키텍처로 서버에서 워크북/문서 처리를 실행할 때.
- 필요한 기능만 플러그인으로 조합하거나 presets로 빠르게 시작할 때.
- 커스텀 플러그인, 명령, 서비스, UI 컴포넌트, Facade API로 동작을 확장할 때.

Univer는 단순한 스프레드시트 파일 뷰어가 아닙니다. 자체 생산성 화면을 구축하기 위한 프레임워크입니다.

## 🌟 Highlights

<table>
  <tr>
    <td align="center" width="33%">
      ⚡<br />
      <strong>대규모 화면에 맞춘 설계</strong><br />
      <sub>Canvas 기반 렌더링과 전용 수식 엔진이 복잡한 워크북도 반응성 있게 유지합니다.</sub>
    </td>
    <td align="center" width="33%">
      🧩<br />
      <strong>플러그인 중심 확장</strong><br />
      <sub>필요한 기능을 조합, 교체, 지연 로딩하거나 확장할 수 있습니다.</sub>
    </td>
    <td align="center" width="33%">
      🤖<br />
      <strong>Headless AI 인프라</strong><br />
      <sub>Node.js에서 워크북과 문서 로직을 실행해 에이전트, 자동화, 서버 사이드 워크플로를 지원합니다.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      🛠️<br />
      <strong>제품 통합을 위한 SDK</strong><br />
      <sub>프레임워크 어댑터, Facade API, presets, headless runtime이 실제 통합 경로에 맞춰집니다.</sub>
    </td>
    <td align="center" width="33%">
      🌗<br />
      <strong>Dark mode 지원</strong><br />
      <sub>UI 컴포넌트와 렌더링 엔진이 모두 라이트/다크 테마를 지원합니다.</sub>
    </td>
    <td align="center" width="33%">
      🔌<br />
      <strong>통합 Facade API</strong><br />
      <sub>브라우저와 Node.js에서 워크북, 범위, 수식, 문서를 일관된 API로 다룰 수 있습니다.</sub>
    </td>
  </tr>
</table>

## 🚀 왜 Univer인가?

- **동형 설계**: 브라우저 UI 앱과 Node.js headless 처리를 모두 실행할 수 있습니다.
- **플러그인 우선 아키텍처**: 모든 기능은 조합 가능한 플러그인으로 제공되어 추가, 제거, 교체, 지연 로딩이 가능합니다.
- **빠른 통합을 위한 Preset Mode**: 빠르게 동작하는 앱이 필요할 때 [`univer-presets`](https://github.com/dream-num/univer-presets)의 curated plugin bundle을 사용할 수 있습니다.
- **완전한 제어를 위한 Plugin Mode**: 커스텀 로딩, 더 작은 번들, 깊은 통합이 필요할 때 패키지를 직접 조합할 수 있습니다.
- **Facade API**: 워크북, 워크시트, 범위, 문서, 수식, 명령, 이벤트를 고수준 API로 다룰 수 있습니다.
- **Canvas 렌더링 엔진**: 큰 편집 가능한 문서 표면을 지원하고 여러 문서 타입이 렌더링 레이어를 공유합니다.
- **확장 가능한 UI**: React, Vue, Web Components 및 프레임워크별 애플리케이션 셸에 통합할 수 있습니다.

## ⚡ 빠른 시작

대부분의 애플리케이션은 **Preset Mode**로 시작하는 것을 권장합니다. 패키지를 직접 조합하고 플러그인 등록을 제어해야 한다면 **Plugin Mode**를 사용하세요.

<details open>
<summary><strong>Preset Mode (권장)</strong></summary>

Presets는 필요한 Facade API 등록과 스타일을 포함하는 Univer 플러그인의 curated collection입니다.

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

Plugin Mode는 패키지, 스타일 import, locale 병합, Facade API 등록, 플러그인 순서를 더 낮은 수준에서 제어할 수 있게 해줍니다.

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

페이지에는 컨테이너가 필요합니다.

```html
<div id="app" style="height: 100vh"></div>
```

자세한 내용은 [Installation & Basic Usage guide](https://docs.univer.ai/guides/sheets/getting-started/installation), [`createUniver` reference](https://docs.univer.ai/reference/methods/create-univer), [Facade API reference](https://docs.univer.ai/reference/classes/univer)를 참고하세요.

## 🧩 Preset Mode vs Plugin Mode

| 선택 | 사용 시점 | 시작하기 |
| --- | --- | --- |
| **Preset Mode** | 최소 설정으로 동작하는 Sheets, Docs, Node 구성이 필요할 때. | [`univer-presets`](https://github.com/dream-num/univer-presets) 및 [getting started guide](https://docs.univer.ai/guides/sheets/getting-started/installation) |
| **Plugin Mode** | 패키지, 플러그인 등록 순서, 지연 로딩, 런타임 구성을 엄격하게 제어해야 할 때. | 이 저장소의 [`examples/`](../../examples) 및 [architecture guide](https://docs.univer.ai/guides/recipes/architecture/univer) |
| **Headless Mode** | UI 없이 서버 측 워크북/문서 처리, 수식 계산, 자동화가 필요할 때. | [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) |

모든 `@univerjs/*` 패키지는 같은 버전으로 유지하세요. Univer Pro 패키지를 사용하는 경우 `@univerjs-pro/*` 버전도 맞춰야 합니다.

API 호환성 기대치, experimental APIs, internal APIs, deprecation rules는 [API Stability Policy](../API_STABILITY.md)를 참고하세요.

## 🧭 호환성

- **브라우저 런타임**: Univer는 Chrome 70을 대상으로 컴파일되며 Edge `>=70`, Firefox `>=63`, Chrome `>=70`, Safari `>=12.0`, Electron `>=5`에서 잘 동작하도록 노력합니다.
- **Polyfills**: Univer는 `Intl.Segmenter`에 의존합니다. 대상 브라우저나 런타임이 이를 제공하지 않는다면 `@formatjs/intl-segmenter` 같은 polyfill을 추가하세요.
- **빌드 도구**: Vite, esbuild, Webpack 5를 권장합니다. 빌드 도구가 `package.json`의 `exports` 필드를 지원하지 않는 경우(Webpack 4에서 흔함) 추가 path mapping이 필요할 수 있습니다.
- **React**: Univer의 view layer는 React 18 기반이며 React 18과 19를 지원합니다. React 16.9+ 및 17에는 최소한의 호환성 지원을 제공합니다.
- **Node.js runtime**: Headless Univer는 Node.js `>=18.17.0`을 지원합니다. 이 monorepo를 개발하려면 Node.js `>=22.18`이 필요합니다.

## 🛠️ 만들 수 있는 것

| 영역 | 오픈소스 기능 | Univer Pro 확장 |
| --- | --- | --- |
| **Sheets** | 워크북, 워크시트, 범위, 선택, 수식, 숫자 서식, 필터링, 정렬, 데이터 유효성 검사, 조건부 서식, 하이퍼링크, 댓글, 찾기/바꾸기, 노트, 테이블, drawing integration, 확장 가능한 UI 플러그인. | 실시간 협업, 편집 기록, import/export, printing, charts, pivot tables, sparklines, outlines, shapes, in-cell graphics, data connectors, server-side calculation, 향상된 formula 기능. |
| **Docs** | 리치 문서 모델, 편집 UI, 목록, 하이퍼링크, drawing integration, 댓글, quick insert, 공유 문서 아키텍처. | 협업, import/export, printing, 향상된 tables/lists, columns, callouts, code blocks, quotes, shapes, remote comment resources. |
| **Slides** | 프레젠테이션 데이터 모델과 UI 패키지. 현재 활발히 개발 중입니다. | Pro slide model/UI, slide import/export, chart/table model 및 UI plugins, 공유 shape editing infrastructure. |
| **Bases** | Univer의 plugin, command, model 아키텍처 위에서 커스텀 structured-data 경험을 만들 수 있습니다. | Base database model, commands, formula integration, workbench UI, field editors, render-engine views. |
| **Runtime** | 브라우저 앱, Node.js headless 사용, Web Worker/RPC 패턴, multi-instance 사용, 서버 지향 자동화. | Collaboration client/server packages, Node.js collaboration client, Pro server services, SSR, computing delegation, server-side calculation, changeset replay tooling. |
| **Integrations** | React, Vue, Web Components, 프레임워크 템플릿, 테마, 로컬라이제이션, 커스텀 플러그인. | Pro presets, enterprise deployment packages. |

Sheets는 현재 가장 성숙한 제품 영역입니다. Docs와 Slides는 Univer의 아키텍처를 공유하며 같은 SDK 안에서 계속 발전하고 있습니다.

## 🔓 Open Source와 Pro

이 저장소에는 Univer의 오픈소스 코어와 first-party OSS 플러그인이 포함되어 있습니다. Univer Pro는 고급 product surfaces, collaboration, server features, enterprise integrations를 위한 commercial extension layer로 별도 개발됩니다.

| 카테고리 | Open source | Univer Pro / commercial |
| --- | --- | --- |
| **Foundation** | Core SDK, 플러그인 시스템, 렌더링 엔진, 수식 엔진, Facade API, 테마, i18n, framework adapters. | Pro presets, enterprise deployment packages. |
| **Sheets** | 핵심 스프레드시트 편집, 수식, 숫자 서식, filter/sort, 데이터 유효성 검사, 조건부 서식, 노트, 테이블, 하이퍼링크, 댓글, drawing, 찾기/바꾸기. | 협업, 편집 기록, import/export, print, charts, pivot tables, sparklines, outlines, shapes, in-cell graphics, data connectors, range preprocessing, 향상된 formula engine 기능. |
| **Docs** | 문서 모델과 편집 UI, 목록, 하이퍼링크, 댓글, quick insert, drawing integration. | 협업, import/export, print, 향상된 tables/lists, columns, callouts, code blocks, quotes, shapes, remote thread-comment resources. |
| **Slides** | OSS presentation model과 UI packages. | Pro slide model/UI packages, slide import/export, charts, tables, reusable shape editor UI. |
| **Bases** | 커스텀 data-centric products를 위한 확장 가능한 plugin architecture. | Base database core model, commands, mutations, formula integration, workbench UI, field editors, render-engine integration. |
| **Server and runtime** | Node.js headless runtime, RPC/Web Worker patterns, server-oriented automation primitives. | Collaboration server, Node.js collaboration client, SSR services, computing delegation, server-side calculation, collaboration changeset replay tooling. |

Pro 기능은 [Univer Pro guide](https://docs.univer.ai/guides/pro)에 문서화되어 있습니다. 여기서는 OSS 패키지의 범위를 명확히 하기 위해 의도적으로 분리했습니다.

Boundary principles:

- 이 저장소의 OSS 패키지는 Apache-2.0 license 아래에서 독립적으로 유용하게 사용할 수 있도록 의도되었습니다. Univer Pro는 선택 사항이며, 공개 OSS SDK API를 사용하는 데 필요하지 않습니다.
- OSS 패키지의 bugs, regressions, security issues는 관련 Pro 기능이 있더라도 OSS 저장소에서 보고하고 수정해야 합니다.
- OSS documentation은 Pro-only capabilities가 공개 `@univerjs/*` packages에 포함된 것처럼 암시해서는 안 됩니다. Pro-only APIs, packages, deployment paths는 명확히 이름을 표시해야 합니다.
- OSS feature에 Pro enhancement가 있더라도 OSS behavior는 독립적으로 문서화되어야 하며, 사용자가 commercial docs를 먼저 읽지 않고도 open-source surface를 평가할 수 있어야 합니다.

## 🌐 생태계

- **Core SDK**: [`dream-num/univer`](https://github.com/dream-num/univer), 이 monorepo입니다.
- **Presets**: [`dream-num/univer-presets`](https://github.com/dream-num/univer-presets), 브라우저와 Node.js 앱을 위한 curated plugin bundle입니다.
- **AI agent skills**: [`dream-num/univer-sdk-skills`](https://github.com/dream-num/univer-sdk-skills), Univer 통합, Pro 기능, 플러그인 개발, Node 백엔드를 다루는 AI agent용 재사용 지침입니다. [AI Skills guide](https://docs.univer.ai/guides/skills)를 참고하세요.
- **Documentation**: [docs.univer.ai](https://docs.univer.ai), Sheets, Docs, Slides, recipes, Pro guides를 포함합니다.
- **API Reference**: [docs.univer.ai/reference](https://docs.univer.ai/reference/classes/univer), Facade API와 생성된 API reference입니다.
- **Examples and showcase**: [Univer Showcase](https://docs.univer.ai/showcase)와 이 저장소의 [`examples/`](../../examples).
- **AI-native spreadsheets**: [`dream-num/univer-mcp`](https://github.com/dream-num/univer-mcp), 자연어로 Univer Sheets를 제어하기 위한 Univer Platform / MCP 통합입니다.

## 📦 저장소 안내

```text
.
├── packages/      Core packages, engines, document types, UI plugins, feature plugins
├── examples/      개발에 사용하는 로컬 브라우저 및 Node.js 데모
├── common/        공유 내부 도구, mock data, storybook, utilities
├── e2e/           Playwright 및 visual comparison tests
├── tests/         추가 integration test projects
└── docs/          architecture notes, images, repository-local documentation
```

패키지별 README는 [`packages/`](../../packages)의 각 패키지 옆에 있습니다.

## 🧑‍💻 개발

요구 사항:

- Node.js `>=22.18`
- pnpm `>=10`

```bash
git clone https://github.com/dream-num/univer.git
cd univer
pnpm install
pnpm dev
```

유용한 명령:

| 명령 | 목적 |
| --- | --- |
| `pnpm dev` | 로컬 examples 앱을 시작합니다. |
| `pnpm build` | 내부 common 패키지를 제외하고 workspace 패키지를 빌드합니다. |
| `pnpm test` | Turbo를 통해 unit tests를 실행합니다. |
| `pnpm typecheck` | Turbo를 통해 TypeScript checks를 실행합니다. |
| `pnpm lint` | ESLint를 실행합니다. |
| `pnpm test:e2e` | Playwright tests를 실행합니다. |
| `pnpm storybook:dev` | UI component 개발용 Storybook을 시작합니다. |

Pull request를 열기 전에 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 읽어 주세요.

## 📝 Contributor Notes

더 깊은 변경을 하기 전에 읽어볼 만한 저장소 내부 문서입니다.

- [Building Isomorphic Univer](../ISOMORPHIC.md): 브라우저, Node.js, UI, 공유 플러그인 로직을 나누는 방법.
- [API Stability Policy](../API_STABILITY.md): stable, experimental, internal, deprecated, breaking-change expectations.
- [Contributing to Facade API](../CONTRIBUTING-FACADE.md): `FUniver`, `FWorkbook`, `FRange` 등 Facade API의 설계 기준.
- [Naming Convention](../NAMING_CONVENTION.md): 파일, 폴더, 인터페이스, 플러그인, 명령, DI token naming 규칙.
- [Fixing Memory Leaks](../FIX_MEMORY_LEAK.md): Univer 인스턴스의 흔한 memory leak 패턴과 디버깅 흐름.
- [Architecture TLDRs](../tldr): formula engine, Web Worker, permission, selection, ref-range 동작에 대한 간단한 설계 메모.

## 💬 커뮤니티

- [GitHub Discussions](https://github.com/dream-num/univer/discussions)에서 질문할 수 있습니다.
- [Discord](https://discord.gg/z3NKNT6D2f)에서 커뮤니티와 대화할 수 있습니다.
- [Twitter / X](https://twitter.com/univerhq)와 [YouTube](https://www.youtube.com/@dreamNum)를 팔로우하세요.

참여하기 전에 [Code of Conduct](../../CODE_OF_CONDUCT.md)를 읽어 주세요.

## 🔒 보안

보안 문제를 발견했다고 생각되면 [Security Policy](../../SECURITY.md)를 따라 주세요.

## ❤️ 스폰서

Univer는 커뮤니티와 스폰서의 지원을 받습니다. [Open Collective](https://opencollective.com/univer)를 통해 프로젝트를 지원할 수 있습니다.

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

## 📄 라이선스

Copyright (c) 2021-present DreamNum Co., Ltd.

[Apache-2.0](../../LICENSE) 라이선스로 배포됩니다.
