---
sidebar_position: 2
---

# Univer Sheet 架构

如同在[架构概要](./architecture) 中所提到的，Univer 以插件化的方式来实现各种功能，Univer Sheet 业务逻辑的实现也是通过插件来完成的，本文档将会介绍 Univer Sheet 的架构。

## 主要插件以及职责

Univer Sheet 的插件架构如下图所示：

*上图并未绘制出全部的模块，仅做示意*。

Univer Sheet 的架构主要由以下几个部分组成：

### core

`core` 跟 sheet 相关的模块主要是基数据结构和一个 `SheetInterceptorService`：

* UniverSheet 类型，它负责管理 Sheet 相关的 plugin
* Workbook 类型，它是一个工作簿，包含多个 Worksheet，存储工作簿的元数据
* Worksheet 类型，它是一个工作表，存储每个子表的数据
* `SheetInterceptorService`，允许其他插件干预从 Worksheet 上取值的行为

#### SheetInterceptorService

一个较为特殊的服务，它允许上层业务修改从 Worksheet 中获取单元格数据、获取行列隐藏信息等操作的结果，以及在特定的 command 执行时补充 mutation 或者 operation。这个服务的主要目的是为了实现一些特殊的功能，例如：

1. sheet 公式
2. sheet 条件格式
3. sheet 数据验证
4. sheet 数据透视表

等等。

**何时使用 SheetInterceptorService，何时不要使用？**

当各个功能需要操作同一块数据或者状态，但是它们之前并没有明确的依赖关系时使用 SheetInterceptorService，例如：数据透视表、公式、条件格式、数据验证、单元格原始数据都可能影响其他功能对单元格内容的取值结果，但是它们之间并没有明确的依赖关系，因此使用 SheetInterceptorService 来实现这些功能是比较合适的。

如果一个功能明确地依赖其他功能，例如公式需要在下拉填充或复制粘贴功能被调用时做一些操作，那么公式模块应该直接依赖下拉填充和复制粘贴模块，而不是通过 SheetInterceptorService 来实现。

### base-sheets

承载 sheet 的主要（基础）业务逻辑和渲染：

* 更改 sheet 数据的 commands / mutations
* 应用程序的内部状态
* 为高级功能提供内部扩展机制
* canvas 渲染
* 更改 canvas 区域状态的 operations

或许 render 部分也应该单独拆解出来，但是目前还没有这个需求。

### ui-plugin-sheets

ui-plugin-sheets 提供了 sheet 的 UI，包括：

* sheet 快捷键
* 复制粘贴逻辑
* sheet 的 UI 组件
* 单元格编辑器

后面如果有跨运行环境的 UI，则通过进一步按照平台拆分 plugin，或者通过二级入口点来解决。

### 其他功能

后续的高级功能