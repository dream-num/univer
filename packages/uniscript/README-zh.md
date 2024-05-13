# @univerjs/uniscript

[![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)
[![license](https://img.shields.io/npm/l/@univerjs/uniscript)](https://img.shields.io/npm/l/@univerjs/uniscript)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## 简介

![](./assets/uniscript.jpeg)

`@univerjs/uniscript` 提供了一个基于 TypeScript 的 DSL，可以用来操作 Univer 的数据结构和业务逻辑。

用户可以在 @univerjs/uniscript 提供的代码编辑器中编写业务逻辑，以达成更加灵活的业务需求。如图所示，用户可以编写一段 Uniscript 用于从选区中读取身份证号并验证这些身份证号的合法性，把不合法的身份证号的背景标记为红色。

:::caution
Uniscript 仍在试验阶段，建议不要在生产环境中使用。你可以在[路线图](https://univer.ai/zh-CN/guides/sheet/roadmap/)了解 Uniscript 的迭代计划。
:::

:::tip
Uniscript 的 DSL 实际上是一套封装 Univer 内部实现细节的 Facade API，这套 API 定义在[这里](https://univer.ai/guides/sheet/facade/facade)。
:::

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/uniscript

# 使用 pnpm
pnpm add @univerjs/uniscript
```

### 获取编辑器实例

@univerjs/uniscript 内部使用了 [monaco editor](https://microsoft.github.io/monaco-editor/) 作为代码编辑器，你可以通过以下方式获取编辑器实例：

```ts
const editor = univer
  .__getInjector()
  .get(ScriptEditorService)
  .getEditorInstance();
```

或者在你的模块中注入 `ScriptEditorService` 以获取编辑器实例。

```ts
export class YourModule {
  constructor(
    @Inject(ScriptEditorService) private readonly _scriptEditorService
  ) {}

  private _getEditor() {
    return this._scriptEditorService.getEditorInstance();
  }
}
```
