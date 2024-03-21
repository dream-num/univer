# @univerjs/sheets

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)
[![license](https://img.shields.io/npm/l/@univerjs/sheets)](https://img.shields.io/npm/l/@univerjs/sheets)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

`@univerjs/sheets` 承载 sheet 的主要（基础）业务逻辑，base-sheets 被设计为 UI 无关，因此也可以运行在 Node.js 环境中，借此可以实现协同编辑等功能。

`@univerjs/sheets` 为 Univer Sheet 提供了以下能力：

* 提供核心能力，例如数字格式、选区管理、权限等等
* 更改电子表格数据的 commands / mutations
* 公式核心能力
* 数字格式核心能力

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/sheets

# 使用 pnpm
pnpm add @univerjs/sheets
```

### `SheetInterceptorService`

`SheetInterceptorService` 是 `@univerjs/sheets` 提供的一个较为特殊的服务，它允许上层业务修改从 Worksheet 中获取单元格数据、获取行列隐藏信息等操作的结果，以及在特定的 command 执行时补充 mutation 或者 operation。这个服务的主要目的是为了实现一些特殊的功能，例如：

1. sheet 公式
2. sheet 条件格式
3. sheet 数据验证
4. sheet 数据透视表

具体的使用方法请参考 API 文档。

#### **何时使用 `SheetInterceptorService`，何时不要使用？**

当各个功能需要操作同一块数据或者状态，但是它们之前并没有明确的依赖关系时使用 `SheetInterceptorService`，例如：数据透视表、公式、条件格式、数据验证、单元格原始数据都可能影响其他功能对单元格内容的取值结果，但是它们之间并没有明确的依赖关系，因此使用 `SheetInterceptorService` 来实现这些功能是比较合适的。

如果一个功能明确地依赖其他功能，例如公式需要在下拉填充或复制粘贴功能被调用时做一些操作，那么公式模块应该直接依赖下拉填充和复制粘贴模块，而不是通过 `SheetInterceptorService` 来实现。
