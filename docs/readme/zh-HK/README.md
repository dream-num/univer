# Univer

<p align="center">
  <a href="../../../README.md">English</a>
  |
  <a href="../zh-CN/README.md">简体中文</a>
  |
  繁體中文
  |
  <a href="../ja-JP/README.md">日本語</a>
</p>

## 介紹

Univer 是一個開源的協作解決方案，旨在賦予所有系統協作能力。接入我們之後，用戶可以同步在自己的系統中查看和編輯 Microsoft Office 文件，避免上傳和下載PPT、Word、Excel。

在這個倉庫中提供了 Univer 前端代碼，一套基於 Canvas 的框架，用於構建文件、電子表格和幻燈片。

> ⚠️ 這個項目仍在開發中，僅用於測試和學習，請勿用於生產

## Demo

- [Univer Demo](https://dream-num.github.io/univer-demo/)

## 開發

### 環境

- [node.js](https://nodejs.org) version 16.20.0
- [pnpm](https://pnpm.io) version 8.6.2

### 安裝

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
pnpm i
```

### 開發

啟動全部

```bash
npm run dev
```

啟動 sheets

```bash
npm run dev:sheet
```

啟動 docs

```bash
npm run dev:doc
```

啟動 slides

```bash
npm run dev:slide
```

## 社區

歡迎加入我們的 [Discord 社區](https://discord.gg/w2f6VUKw)。

## 問題回饋

請到 [Issues](http://github.com/dream-num/univer/issues) 提交問題。

## 關注者

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## 整體架構

Univer 採用 TypeScript 編寫，按照插件化架構進行設計，核心以外的功能都以插件的形式進行開發，將來會建設插件市場，滿足更加個性化的需求
![image](../../source/overall.png)

## 渲染引擎

Univer sheet、document、slide 採用同一套渲染引擎架構，把應用抽象為文本流、表格、畫布，core 部分觸發渲染，object 為渲染器。
![image](../../source/Render%20Engine.png)

1. 做到了應用互相間的嵌套和操作。
2. sheet 單元格支持嵌入 doc 文字
3. slide 中支持插入 sheet、doc、slide

|     slide 10-layer embedding      |         Sheet in slide and doc in cell         |   wrap text around a picture    |
| :-------------------------------: | :--------------------------------------------: | :-----------------------------: |
| ![image](../../source/Slide.png) | ![image](../../source/Sheet%20in%20slide.png) | ![image](../../source/doc.png) |

## 公式引擎

Univer 自研公式引擎，支持異步計算，lambda 函數及範圍命名

![image](../../source/Formula%20Engine.png)
