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
    <a href="./README-zh.md">简体中文</a>
    |
    日本語
</p>

> 🚧 このプロジェクトはまだ開発中です。API が大きく変更される可能性があることにご注意ください。問題や提案をお寄せください。
> また、日本語の開発ドキュメントはまだ未完成です。英語のドキュメントをご参照ください。

## はじめに

Univer は、スプレッドシート、ドキュメント、スライドを含む、エンタープライズ向けドキュメントおよびデータコラボレーションソリューションです。高い拡張性を備えた設計により、開発者は Univer 上で独自の機能をカスタマイズできます。

特徴：

- 📈 Univer は、**スプレッドシート**と**ドキュメント**の両方をサポートするように設計されています。将来的には**スライド**もサポートされる予定です。
- ⚙️ Univer は簡単に**組み込む**ことができ、アプリケーションにシームレスに統合できます。
- 🎇 Univer は**強力**で、**数式**、**条件付き書式**、**データ検証**、**フィルタリング**、**共同編集**、**印刷**、**インポート＆エクスポート**、幅広い機能を提供しています。さらに、今後も多くの機能が追加される予定です。
- 🔌 Univer は、*プラグインアーキテクチャ*と*ファサード API*のおかげで**高い拡張性**を持ち、開発者が Univer 上で独自の要件を実装するのが楽しみになります。
- 💄 Univer は、*テーマ*を使用して外観をパーソナライズできるため、**高度にカスタマイズ可能**です。また、国際化（i18n）のサポートも提供しています。
- ⚡ Univerは**パフォーマンス**に優れています。
  - ✏️ Univer は、Canvas ベースの効率的な*レンダリングエンジン*を搭載しており、さまざまなドキュメントタイプを完璧にレンダリングできます。レンダリングエンジンは、*句読点の圧縮*、*テキストと画像のレイアウト*、*スクロールバッファリング*などの高度な組版機能をサポートしています。
  - 🧮 Univer は、Web ワーカーやサーバーサイドでも動作可能な超高速の*数式エンジン*を搭載しています。
- 🌌 Univer は**高度に統合された**システムです。ドキュメント、スプレッドシート、スライドは相互に連携でき、同じ Canvas 上にレンダリングすることもできるため、Univer 内で情報とデータの流れを実現できます。

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

## 使い方

Univer を npm パッケージとしてインポートすることをお勧めします。ドキュメントサイトの [Quick Start](https://univer.ai/guides/sheet/getting-started/quickstart) セクションをご覧ください。また、[オンラインプレイグラウンド](https://univer.ai/playground/)では、開発環境を構築することなく Univer をプレビューすることができます。

Univer はプラグインアーキテクチャを採用しています。以下のパッケージをインストールすることで、Univer の機能を拡張することができます。

### パッケージ

| 名称                                                       | 説明                                                                                                                      | バージョン                                                                                                                     |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                                   | Univer のプラグインシステムとアーキテクチャを実装します。また、基本的なサービスや様々な種類のドキュメントのモデルを提供します。               | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [data-validation](./packages/data-validation)             | Univer のデータ検証機能を実装します。                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/data-validation)](https://npmjs.org/package/@univerjs/data-validation) |
| [design](./packages/design)                               | Univer のデザインシステムを実装。CSS と React ベースのコンポーネントキットを提供します。                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                                   | リッチテキスト編集機能の基本ロジックを実装し、他の種類の文書でもテキスト編集を容易にします。                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                             | Univer ドキュメントのユーザーインターフェースを提供します。                                                                       | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)               | Canvas をベースとしたレンダリングエンジンを実装し、拡張可能です。                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)                 | ナンバーフォーマットエンジンを実装します。                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)                 | canvas context2d をベースにしたレンダリングエンジンを実装します。                                                                | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [facade](./packages/facade/)                              | Univer をより簡単に使用するための API レイヤーとして機能します。                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                       |
| [find-replace](./packages/find-replace)                   | Univer の検索と置換機能を実装しています。                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/find-replace)](https://npmjs.org/package/@univerjs/find-replace)               |
| [network](./packages/network)                             | WebSocket と HTTP をベースにしたネットワークサービスを実装します。                                                                | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)               |
| [rpc](./packages/rpc)                                     | Univer 文書の異なるレプリカ間でデータを同期するための RPC メカニズムとメソッドを実装します。                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                               | スプレッドシート機能の基本ロジック。                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-conditional-formatting](./packages/sheets-conditional-formatting)   | スプレッドシートの条件付き書式設定機能を実装します。                                                          | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting)](https://npmjs.org/package/@univerjs/sheets-conditional-formatting) |
| [sheets-conditional-formatting-ui](./packages/sheets-conditional-formatting-ui)   | スプレッドシートの条件付き書式設定機能を実装します。                                                          | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-conditional-formatting-ui)](https://npmjs.org/package/@univerjs/sheets-conditional-formatting-ui) |
| [sheets-data-validation](./packages/sheets-data-validation) | スプレッドシートのデータ検証機能を実装します。                                                                             | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-data-validation)](https://npmjs.org/package/@univerjs/sheets-data-validation) |
| [sheets-find-replace](./packages/sheets-find-replace)     | スプレッドシートの検索と置換機能を実装します。                                                                             | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace) |
| [sheets-formula](./packages/sheets-formula)               | スプレッドシートに数式を実装します。                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)                 | スプレッドシートの数値フォーマットを実装します。                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-zen-editor](./packages/sheets-zen-editor)         | スプレッドシートの禅編集モードを実装します。                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)   |
| [sheets-ui](./packages/sheets-ui)                         | Univer スプレッドシートのユーザーインターフェースを提供します。                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                                       | React ベースの Univer とワークベンチのレイアウトを提供し、基本的なユーザーインタラクションを実装します。                                 | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) (試験的)                 | Typescript に基づく DSL を実装し、より高度なタスクの実行を可能にします。                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## コントリビュート

どのようなコントリビュートでも結構です。[問題や機能に関するリクエスト](https://github.com/dream-num/univer/issues)をお寄せください。まずは[コントビューティングガイド](./CONTRIBUTING.md)をお読みください。

Univer にコードをコントリビュートしたい方は、コントリビュートガイドもご参照ください。開発環境のセットアップからプルリクエストの提出までの手順を説明しています。

## サポート

Univer プロジェクトの成長と開発は、バッカーやスポンサーのサポートに依存しています。プロジェクトをサポートしていただける方は、スポンサーになることを検討していただければ幸いです。[Open Collective](https://opencollective.com/univer) からスポンサーになることができます。

スポンサーの皆様、ありがとうございます。スペースの制限のため、一部のスポンサーのみをここに掲載しています。ランキングは特にありません。

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

## リンク

- [ドキュメント](https://univer.ai/guides/sheet/introduction)
- [Online Playground](https://univer.ai/playground/)
- [公式 Website](https://univer.ai)

### コミュニティ

- [Discord コミュニティ](https://discord.gg/z3NKNT6D2f)

## ライセンス

Univer は Apache-2.0 ライセンスの下で配布されています。

---

Copyright © 2019-2024 Shanghai DreamNum Technology Co., Ltd. All rights reserved
