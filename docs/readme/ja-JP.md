<div align="center">

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="../img/banner-light.png">
    <img src="../img/banner-dark.png" alt="Univer" width="420" />
</picture>

**スプレッドシート、ドキュメント、プレゼンテーションを構築するためのフルスタックでアイソモーフィックなオフィス SDK。**

Univer は、プラグインアーキテクチャ、Canvas ベースのレンダリング、
数式エンジン、ブラウザと Node.js の両方で使える Facade API により、
組み込み型の生産性体験を構築できます。

[English](../../README.md) | [简体中文](./zh-CN.md) | [繁體中文](./zh-TW.md) | 日本語 | [한국어](./ko-KR.md) | [Español](./es-ES.md)

[📖 ドキュメント](https://docs.univer.ai) | [✨ ショーケース](https://docs.univer.ai/showcase) | [📘 API Reference](https://docs.univer.ai/reference/classes/univer) | [📝 ブログ](https://docs.univer.ai/blog)

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

## ✨ Univer とは？

Univer は、自分のプロダクト内にオフィスアプリケーションを作るためのオープンソース SDK です。スプレッドシート、ドキュメント、プレゼンテーション体験に必要な構成要素を提供しつつ、ホスト型アプリや固定 UI を強制しません。

Univer は次のような場面に適しています。

- SaaS、社内ツール、BI ワークフロー、AI アプリケーションにスプレッドシートやドキュメント編集を組み込む。
- ブラウザと同じアーキテクチャで、サーバー上のワークブック/ドキュメント処理を実行する。
- 必要な機能だけをプラグインで組み合わせる、または presets で素早く始める。
- カスタムプラグイン、コマンド、サービス、UI コンポーネント、Facade API で振る舞いを拡張する。

Univer は単なるスプレッドシートファイルビューアではありません。独自の生産性インターフェースを構築するためのフレームワークです。

## 🌟 Highlights

<table>
  <tr>
    <td align="center" width="33%">
      ⚡<br />
      <strong>大規模な編集面に対応</strong><br />
      <sub>Canvas ベースのレンダリングと専用の数式エンジンにより、複雑なワークブックでも応答性を保ちます。</sub>
    </td>
    <td align="center" width="33%">
      🧩<br />
      <strong>プラグイン前提の設計</strong><br />
      <sub>必要な機能を組み合わせ、置換、遅延読み込み、拡張できます。</sub>
    </td>
    <td align="center" width="33%">
      🤖<br />
      <strong>Headless AI 基盤</strong><br />
      <sub>Node.js でワークブックとドキュメントのロジックを実行し、エージェント、自動化、サーバーサイドワークフローを支えます。</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      🛠️<br />
      <strong>プロダクト向け SDK</strong><br />
      <sub>フレームワークアダプター、Facade API、presets、headless runtime が実際の統合経路に対応します。</sub>
    </td>
    <td align="center" width="33%">
      🌗<br />
      <strong>Dark mode 対応</strong><br />
      <sub>UI コンポーネントとレンダリングエンジンの両方がライト/ダークテーマに対応します。</sub>
    </td>
    <td align="center" width="33%">
      🔌<br />
      <strong>統合 Facade API</strong><br />
      <sub>ブラウザと Node.js の両方で、ワークブック、範囲、数式、ドキュメントを一貫した API で扱えます。</sub>
    </td>
  </tr>
</table>

## 🚀 なぜ Univer なのか？

- **アイソモーフィック設計**：ブラウザの UI アプリと Node.js のヘッドレス処理の両方で動作します。
- **プラグイン優先アーキテクチャ**：すべての機能は組み合わせ可能なプラグインとして提供され、追加、削除、置換、遅延読み込みが可能です。
- **Preset Mode による高速な統合**：すぐに動くアプリが必要な場合は、[`univer-presets`](https://github.com/dream-num/univer-presets) の curated plugin bundle を利用できます。
- **Plugin Mode による完全な制御**：カスタム読み込み、より小さなバンドル、深い統合が必要な場合は、パッケージを手動で組み合わせられます。
- **Facade API**：ワークブック、ワークシート、範囲、ドキュメント、数式、コマンド、イベントを高レベル API で扱えます。
- **Canvas レンダリングエンジン**：大規模な編集可能ドキュメント面をサポートし、複数の文書タイプでレンダリング層を共有します。
- **拡張可能な UI**：React、Vue、Web Components、各種フレームワークのアプリケーションシェルに統合できます。

## ⚡ クイックスタート

多くのアプリケーションでは **Preset Mode** から始めるのがおすすめです。パッケージを手動で組み合わせ、プラグイン登録を制御したい場合は **Plugin Mode** を使います。

<details open>
<summary><strong>Preset Mode（推奨）</strong></summary>

Preset は、必要な Facade API 登録とスタイルを含む Univer プラグインの curated collection です。

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

Plugin Mode では、パッケージ、スタイルの import、locale の merge、Facade API 登録、プラグイン順序をより低レベルで制御できます。

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

ページにはコンテナが必要です。

```html
<div id="app" style="height: 100vh"></div>
```

詳しくは [Installation & Basic Usage guide](https://docs.univer.ai/guides/sheets/getting-started/installation)、[`createUniver` reference](https://docs.univer.ai/reference/methods/create-univer)、[Facade API reference](https://docs.univer.ai/reference/classes/univer) を参照してください。

## 🧩 Preset Mode と Plugin Mode

| 選択肢 | 使う場面 | はじめに読むもの |
| --- | --- | --- |
| **Preset Mode** | 最小限の設定で Sheets、Docs、Node の動作環境を作りたい場合。 | [`univer-presets`](https://github.com/dream-num/univer-presets) と [getting started guide](https://docs.univer.ai/guides/sheets/getting-started/installation) |
| **Plugin Mode** | パッケージ、プラグイン登録順、遅延読み込み、実行時の構成を厳密に制御したい場合。 | このリポジトリの [`examples/`](../../examples) と [architecture guide](https://docs.univer.ai/guides/recipes/architecture/univer) |
| **Headless Mode** | UI なしでサーバー側のワークブック/ドキュメント処理、数式計算、自動化を行いたい場合。 | [Headless Univer](https://docs.univer.ai/guides/sheets/getting-started/node) |

すべての `@univerjs/*` パッケージは同じバージョンに揃えてください。Univer Pro パッケージを使う場合も、`@univerjs-pro/*` のバージョンを揃えてください。

API 互換性、experimental API、internal API、deprecation rules については [API Stability Policy](../API_STABILITY.md) を参照してください。

## 🧭 互換性

- **ブラウザ実行環境**：Univer は Chrome 70 をターゲットとしてコンパイルされており、Edge `>=70`、Firefox `>=63`、Chrome `>=70`、Safari `>=12.0`、Electron `>=5` で動作することを目指しています。
- **Polyfills**：Univer は `Intl.Segmenter` に依存しています。対象ブラウザや実行環境が対応していない場合は、`@formatjs/intl-segmenter` などの polyfill を追加してください。
- **ビルドツール**：Vite、esbuild、Webpack 5 を推奨します。`package.json` の `exports` フィールドに対応していないビルドツール（Webpack 4 など）では、追加のパスマッピングが必要になる場合があります。
- **React**：Univer の view layer は React 18 ベースで構築されており、React 18 と 19 をサポートします。React 16.9+ と 17 には最小限の互換サポートを提供します。
- **Node.js runtime**：Headless Univer は Node.js `>=18.17.0` をサポートします。この monorepo の開発には Node.js `>=22.18` が必要です。

## 🛠️ 構築できるもの

| 領域 | オープンソースの機能 | Univer Pro 拡張 |
| --- | --- | --- |
| **Sheets** | ワークブック、ワークシート、範囲、選択、数式、数値書式、フィルター、ソート、データ検証、条件付き書式、ハイパーリンク、コメント、検索と置換、ノート、テーブル、描画連携、拡張可能な UI プラグイン。 | リアルタイム共同編集、編集履歴、インポート/エクスポート、印刷、チャート、ピボットテーブル、スパークライン、アウトライン、図形、セル内グラフィックス、データコネクタ、サーバーサイド計算、強化された数式機能。 |
| **Docs** | リッチドキュメントモデル、編集 UI、リスト、ハイパーリンク、描画連携、コメント、クイック挿入、共有ドキュメントアーキテクチャ。 | 共同編集、インポート/エクスポート、印刷、強化されたテーブルとリスト、段組み、コールアウト、コードブロック、引用ブロック、図形、リモートコメントリソース。 |
| **Slides** | プレゼンテーションデータモデルと UI パッケージ。現在も活発に開発中です。 | Pro スライドモデルと UI、スライドのインポート/エクスポート、チャートとテーブルのモデル/UI プラグイン、共有の図形編集基盤。 |
| **Bases** | Univer のプラグイン、コマンド、モデルのアーキテクチャ上に、カスタムの構造化データ体験を構築できます。 | Base データベースモデル、コマンド、数式連携、ワークベンチ UI、フィールドエディタ、レンダリングエンジンビュー。 |
| **Runtime** | ブラウザアプリ、Node.js ヘッドレス利用、Web Worker/RPC パターン、複数インスタンス、サーバー向け自動化。 | 共同編集クライアント/サーバーパッケージ、Node.js 共同編集クライアント、Pro サーバーサービス、SSR、計算委譲、サーバーサイド計算、changeset replay ツール。 |
| **Integrations** | React、Vue、Web Components、フレームワークテンプレート、テーマ、ローカライズ、カスタムプラグイン。 | Pro presets とエンタープライズデプロイパッケージ。 |

現在もっとも成熟しているプロダクト面は Sheets です。Docs と Slides も Univer のアーキテクチャを共有し、同じ SDK の中で継続的に進化しています。

## 🔓 Open Source と Pro

このリポジトリには Univer のオープンソースコアと first-party OSS プラグインが含まれています。Univer Pro は、高度なプロダクトサーフェス、共同編集、サーバー機能、エンタープライズ連携のための商用拡張レイヤーとして別途開発されています。

| カテゴリ | Open source | Univer Pro / commercial |
| --- | --- | --- |
| **Foundation** | Core SDK、プラグインシステム、レンダリングエンジン、数式エンジン、Facade API、テーマ、i18n、フレームワークアダプタ。 | Pro presets とエンタープライズデプロイパッケージ。 |
| **Sheets** | コアのスプレッドシート編集、数式、数値書式、フィルター/ソート、データ検証、条件付き書式、ノート、テーブル、ハイパーリンク、コメント、描画、検索と置換。 | 共同編集、編集履歴、インポート/エクスポート、印刷、チャート、ピボットテーブル、スパークライン、アウトライン、図形、セル内グラフィックス、データコネクタ、範囲の前処理、強化された数式エンジン機能。 |
| **Docs** | ドキュメントモデルと編集 UI、リスト、ハイパーリンク、コメント、クイック挿入、描画連携。 | 共同編集、インポート/エクスポート、印刷、強化されたテーブル/リスト、段組み、コールアウト、コードブロック、引用ブロック、図形、リモートスレッドコメントリソース。 |
| **Slides** | OSS のプレゼンテーションモデルと UI パッケージ。 | Pro スライドモデル/UI パッケージ、スライドのインポート/エクスポート、チャート、テーブル、再利用可能な図形エディタ UI。 |
| **Bases** | カスタムのデータ中心プロダクト向けの拡張可能なプラグインアーキテクチャ。 | Base データベースコアモデル、コマンド、ミューテーション、数式連携、ワークベンチ UI、フィールドエディタ、レンダリングエンジン連携。 |
| **Server and runtime** | Node.js ヘッドレスランタイム、RPC/Web Worker パターン、サーバー向け自動化のプリミティブ。 | 共同編集サーバー、Node.js 共同編集クライアント、SSR サービス、計算委譲、サーバーサイド計算、共同編集 changeset replay ツール。 |

Pro 機能は [Univer Pro guide](https://docs.univer.ai/guides/pro) に記載されています。ここでは OSS パッケージの範囲を明確にするため、意図的に分けて説明しています。

Boundary principles:

- このリポジトリの OSS パッケージは Apache-2.0 license の下で単独利用できることを意図しています。Univer Pro は任意であり、公開 OSS SDK API の利用に Pro は不要です。
- OSS パッケージの bugs、regressions、security issues は、関連する Pro 機能がある場合でも OSS リポジトリで報告・修正されるべきです。
- OSS documentation は、Pro-only capabilities が公開 `@univerjs/*` packages に含まれるかのように示すべきではありません。Pro-only APIs、packages、deployment paths は明示的に名前を出してください。
- OSS feature に Pro enhancement がある場合でも、OSS behavior は独立して文書化し、commercial docs を先に読まなくても open-source surface を評価できるようにします。

## 🌐 エコシステム

- **Core SDK**：[`dream-num/univer`](https://github.com/dream-num/univer)、この monorepo です。
- **Presets**：[`dream-num/univer-presets`](https://github.com/dream-num/univer-presets)、ブラウザと Node.js アプリ向けの curated plugin bundle。
- **AI agent skills**：[`dream-num/univer-sdk-skills`](https://github.com/dream-num/univer-sdk-skills)、Univer 統合、Pro 機能、プラグイン開発、Node バックエンドに取り組む AI agent 向けの再利用可能な指示集です。[AI Skills guide](https://docs.univer.ai/guides/skills) も参照してください。
- **Documentation**：[docs.univer.ai](https://docs.univer.ai)、Sheets、Docs、Slides、recipes、Pro guides を含みます。
- **API Reference**：[docs.univer.ai/reference](https://docs.univer.ai/reference/classes/univer)、Facade API と生成された API reference。
- **Examples and showcase**：[Univer Showcase](https://docs.univer.ai/showcase) とこのリポジトリの [`examples/`](../../examples)。
- **AI-native spreadsheets**：[`dream-num/univer-mcp`](https://github.com/dream-num/univer-mcp)、自然言語で Univer Sheets を操作する Univer Platform / MCP 統合。

## 📦 リポジトリ構成

```text
.
├── packages/      コアパッケージ、エンジン、文書タイプ、UI プラグイン、機能プラグイン
├── examples/      開発用のローカルブラウザ/Node.js デモ
├── common/        共有内部ツール、mock data、storybook、ユーティリティ
├── e2e/           Playwright とビジュアル比較テスト
├── tests/         追加の統合テストプロジェクト
└── docs/          アーキテクチャメモ、画像、リポジトリ内ドキュメント
```

パッケージごとの README は [`packages/`](../../packages) 配下の各パッケージにあります。

## 🧑‍💻 開発

必要環境：

- Node.js `>=22.18`
- pnpm `>=10`

```bash
git clone https://github.com/dream-num/univer.git
cd univer
pnpm install
pnpm dev
```

よく使うコマンド：

| コマンド | 用途 |
| --- | --- |
| `pnpm dev` | ローカル examples アプリを起動します。 |
| `pnpm build` | 内部 common パッケージを除いて workspace パッケージをビルドします。 |
| `pnpm test` | Turbo 経由でユニットテストを実行します。 |
| `pnpm typecheck` | Turbo 経由で TypeScript チェックを実行します。 |
| `pnpm lint` | ESLint を実行します。 |
| `pnpm test:e2e` | Playwright テストを実行します。 |
| `pnpm storybook:dev` | UI コンポーネント開発用の Storybook を起動します。 |

Pull request を作成する前に [CONTRIBUTING.md](../../CONTRIBUTING.md) を読んでください。

## 📝 Contributor Notes

より深い変更を行う前に読む価値のあるリポジトリ内メモです。

- [Building Isomorphic Univer](../ISOMORPHIC.md)：ブラウザ、Node.js、UI、共有プラグインロジックの分離方針。
- [API Stability Policy](../API_STABILITY.md)：stable、experimental、internal、deprecated、breaking-change expectations。
- [Contributing to Facade API](../CONTRIBUTING-FACADE.md)：`FUniver`、`FWorkbook`、`FRange` などの Facade API 設計方針。
- [Naming Convention](../NAMING_CONVENTION.md)：ファイル、フォルダ、インターフェース、プラグイン、コマンド、DI token の命名規則。
- [Fixing Memory Leaks](../FIX_MEMORY_LEAK.md)：Univer インスタンスでよくあるメモリリークパターンとデバッグ手順。
- [Architecture TLDRs](../tldr)：数式エンジン、Web Worker、権限、選択、ref-range の簡潔な設計メモ。

## 💬 コミュニティ

- [GitHub Discussions](https://github.com/dream-num/univer/discussions) で質問できます。
- [Discord](https://discord.gg/z3NKNT6D2f) でコミュニティと交流できます。
- [Twitter / X](https://twitter.com/univerhq) と [YouTube](https://www.youtube.com/@dreamNum) もフォローできます。

参加する前に [Code of Conduct](../../CODE_OF_CONDUCT.md) を読んでください。

## 🔒 セキュリティ

セキュリティ上の問題を見つけたと思われる場合は、[Security Policy](../../SECURITY.md) に従ってください。

## ❤️ スポンサー

Univer はコミュニティとスポンサーによって支えられています。[Open Collective](https://opencollective.com/univer) からプロジェクトを支援できます。

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

## 📄 ライセンス

Copyright (c) 2021-present DreamNum Co., Ltd.

[Apache-2.0](../../LICENSE) ライセンスの下で公開されています。
