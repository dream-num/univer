# @univerjs/core

[![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)
[![license](https://img.shields.io/npm/l/@univerjs/core)](https://img.shields.io/npm/l/@univerjs/core)

## 简介

`@univerjs/core` 是 Univer 的核心包，它提供的基础能力包括：

- 提供作为应用入口和其他 plugin 挂载点的 `Univer` 类型，以及管理不同类型文档的 `UniverDoc` 和 `UniverSheet` 类型
- 各个类型文档的基本模型
- 定义或者实现一些基础服务，例如
  - 权限控制
  - 命令系统
  - Undo Redo
  - 配置系统
  - 日志系统
  - 上下文系统
  - 生命周期
  - 本地存储
  - 国际化
  - 资源管理

`@univerjs/core` 的 API 请参考 API 文档。

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/core

# 使用 pnpm
pnpm add @univerjs/core
```

### 配置

```typescript
import { Univer } from '@univerjs/core';

new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales,
    logLevel: LogLevel.VERBOSE,
});
```

#### 选项

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| theme | [Theme](https://univer.ai/api/design/#built-in-themes) | - | 应用的主题，用于控制应用的外观。 |
| locale | [LocaleType](https://univer.ai/api/core/enums/LocaleType.html) | `LocaleType.ZH_CN` | 应用的语言环境，默认值为 `LocaleType.ZH_CN`。 |
| locales | [ILocales](https://univer.ai/api/core/interfaces/ILocales.html) | - | 应用支持的语言环境，默认支持中文。 |
| logLevel | [LogLevel](https://univer.ai/api/core/enums/LogLevel.html) | `LogLevel.SILENT` | 应用的日志级别。 |
