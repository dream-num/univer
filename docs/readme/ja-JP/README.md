# Univer

<p align="center">
  <a href="../../../README.md">English</a>
  |
  <a href="../zh-CN/README.md">简体中文</a>
  |
  <a href="../zh-HK/README.md">繁體中文</a>
  |
  日本語
</p>

## はじめに

Univer はオープンソースの協力ソリューションで、すべてのシステムに協力能力を提供することを目的としています。 Univer を導入すると、ユーザーは自分のシステムで Microsoft Office ドキュメントを表示および編集でき、PowerPoint、Word、Excelをアップロードおよびダウンロードする必要がありません。

このリポジトリでは、ドキュメント、スプレッドシート、スライドを構築するための Canvas ベースのフレームワークである Univer のフロントエンドコードが提供されています。

> ⚠️ このプロジェクトはまだ開発中であり、テストと学習のためにのみ使用してください。本番環境でのご利用はご遠慮ください。

## デモ

- [Univer demo](https://dream-num.github.io/univer-demo/)

## 開発

### 環境

- [node.js](https://nodejs.org) version 16.20.0
- [pnpm](https://pnpm.io) version 8.6.2

### インストール

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
pnpm i
```

### 開発

すべてを起動

```bash
npm run dev

```

シートを起動

```bash
npm run dev:sheet
```

ドキュメントを起動

```bash
npm run dev:doc
```

スライドを起動

```bash
npm run dev:slide
```

## コミュニティ

[Discord コミュニティ](https://discord.gg/w2f6VUKw) への参加を歓迎します。

## バグ報告

[Issues](http://github.com/dream-num/univer/issues) に問題を報告してください。

## フォロワー

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## アーキテクチャ全体

Univer は TypeScript で書かれており、プラグインベースのアーキテクチャに従って設計されています。コア以外の機能はすべてプラグインの形式で開発され、将来的にはプラグインマーケットを構築し、より個別化された要件を満たします。
![image](../../source/overall.png)

## レンダリングエンジン

Univer sheet、document、slide はすべて同じレンダリングエンジンアーキテクチャを使用し、アプリケーションをテキストフロー、テーブル、キャンバスに抽象化し、core 部分でレンダリングをトリガーし、オブジェクトはレンダラーです。
![image](../../source/Render%20Engine.png)

1. アプリケーション同士のネストと操作を実現しました。
2. シートセルは doc テキストを埋め込みサポート
3. スライドではシート、doc、スライドを挿入サポート

|     slide 10-layer embedding      |         Sheet in slide and doc in cell         |   wrap text around a picture    |
| :-------------------------------: | :--------------------------------------------: | :-----------------------------: |
| ![image](../../source/Slide.png) | ![image](../../source/Sheet%20in%20slide.png) | ![image](../../source/doc.png) |

## 計算エンジン

Univer は独自の計算エンジンを使用し、非同期計算、ラムダ関数、および範囲の命名をサポートしています。

![image](../../source/Formula%20Engine.png)
