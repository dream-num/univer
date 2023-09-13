# Univer

<p align="center">
  <a href="../../../README.md">English</a>
  |
  简体中文
  |
  <a href="../zh-HK/README.md">繁體中文</a>
  |
  <a href="../ja-JP/README.md">日本語</a>
</p>

## 介绍

Univer 是一个开源的协作解决方案，旨在将协作能力赋能所有系统。 接入我们之后，用户可以同步在自己的系统中查看和编辑 Microsoft Office 文件，避免上传和下载 PowerPoint、Word、Excel。

我们在本仓库中提供了 Univer 前端代码，一套基于 Canvas 的框架，用于构建文档、电子表格和幻灯片。

> ⚠️ 该项目仍在开发中，仅用于测试和学习，请勿用于生产

## Demo

- [Univer Demo](https://dream-num.github.io/univer-demo/)

## 开发

### 环境

- [node.js](https://nodejs.org) version 16.20.0
- [pnpm](https://pnpm.io) version 8.6.2

### 安装

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
pnpm i
```

### 开发

启动全部

```bash
npm run dev
```

启动 sheets

```bash
npm run dev:sheet
```

启动 docs

```bash
npm run dev:doc
```

启动 slides

```bash
npm run dev:slide
```

## 社区

欢迎加入我们的 [Discord 社区](https://discord.gg/w2f6VUKw)。

## 问题反馈

请到 [Issues](http://github.com/dream-num/univer/issues) 提交问题。

## 关注者

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## 整体架构

Univer 采用 TypeScript 编写，按照插件化架构进行设计，核心外的功能都以插件的形式进行开发，今后会建设插件市场，满足更加个性化的需求
![image](../../source/overall.png)

## 渲染引擎

Univer sheet, document, slide 采用同一套渲染引擎架构，把应用抽象为文本流，表格，画布，core 部分触发渲染，object 为渲染器。
![image](../../source/Render%20Engine.png)

1. 做到了应用互相间的嵌套和操作。
2. sheet 单元格支持嵌入 doc 文字
3. slide 中支持插入 sheet，doc，slide

|     slide 10-layer embedding      |         Sheet in slide and doc in cell         |   wrap text around a picture    |
| :-------------------------------: | :--------------------------------------------: | :-----------------------------: |
| ![image](../../source/Slide.png) | ![image](../../source/Sheet%20in%20slide.png) | ![image](../../source/doc.png) |

## 公式引擎

Univer 自研公式引擎，支持异步计算，lambda 函数及范围命名

![image](../../source/Formula%20Engine.png)
