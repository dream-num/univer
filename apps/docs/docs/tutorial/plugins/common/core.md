---
sidebar_position: 1
---

# @univerjs/core

@univerjs/core 是 Univer 的核心仓库，它提供了一些基础的功能，包括：

-   提供作为应用入口和其他 plugin 挂载点的 `Univer` 类
-   各个类型文档的基本模型
-   定义或者实现一些基础服务，例如
    -   权限控制
    -   命令系统
    -   Undo Redo
    -   配置系统
    -   日志系统
    -   上下文系统
    -   生命周期
    -   本地存储
    -   国际化
    -   资源管理

@univerjs/core 的 API 请参考 API 文档。

## Univer Sheet

### Models

`core` 跟 sheet 相关的模块主要是基数据结构和一个 `SheetInterceptorService`：

* UniverSheet 类型，它负责管理 Sheet 相关的 plugin
* Workbook 类型，它是一个工作簿，包含多个 Worksheet，存储工作簿的元数据
* Worksheet 类型，它是一个工作表，存储每个子表的数据
* `SheetInterceptorService`，允许其他插件干预从 Worksheet 上取值的行为

### `SheetInterceptorService`

`SheetInterceptorService` 是 core 提供的一个较为特殊的服务，它允许上层业务修改从 Worksheet 中获取单元格数据、获取行列隐藏信息等操作的结果，以及在特定的 command 执行时补充 mutation 或者 operation。这个服务的主要目的是为了实现一些特殊的功能，例如：

1. sheet 公式
2. sheet 条件格式
3. sheet 数据验证
4. sheet 数据透视表

等等。

**何时使用 `SheetInterceptorService`，何时不要使用？**

当各个功能需要操作同一块数据或者状态，但是它们之前并没有明确的依赖关系时使用 `SheetInterceptorService`，例如：数据透视表、公式、条件格式、数据验证、单元格原始数据都可能影响其他功能对单元格内容的取值结果，但是它们之间并没有明确的依赖关系，因此使用 `SheetInterceptorService` 来实现这些功能是比较合适的。

如果一个功能明确地依赖其他功能，例如公式需要在下拉填充或复制粘贴功能被调用时做一些操作，那么公式模块应该直接依赖下拉填充和复制粘贴模块，而不是通过 `SheetInterceptorService` 来实现。
