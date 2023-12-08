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

## Univer Sheet Models

* UniverSheet 类型，它负责管理 Sheet 相关的 plugin
* Workbook 类型，它是一个工作簿，包含多个 Worksheet，存储工作簿的元数据
* Worksheet 类型，它是一个工作表，存储每个子表的数据

## Univer Doc Models
