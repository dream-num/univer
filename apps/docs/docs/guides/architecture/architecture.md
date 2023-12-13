---
sidebar_position: 1
---

# Univer 架构

这篇文档介绍 Univer 的整体架构。

## Univer 代码的组织方式

<img width="962" alt="" src="/img/architecture.png" />

### 插件

Univer 的模块按照多种因素综合考虑拆分成了各个插件（plugin），多个插件组合成为一个 Univer 应用。

插件化架构为 Univer 带来这些以下优势：

1. 无论运行在什么环境下，Univer 都可以通过加载不同的插件来满足不同的需求（例如在 Node.js 环境下，可以不加载 UI 相关的插件）从而减少冗余代码带来的开销
2. 你可以按照自己的需要选择加载哪些插件，减少不必要的代码。
3. 插件化架构使得 Univer 更容易修改和扩展，你可以自行开发插件来满足自己的需求，而不必更改 Univer 本身的代码。
4. 插件化架构可以让 Univer 各个模块的职责及依赖关系更加明确，更易于理解、修改、测试和维护。

### 拆分插件的考虑因素

插件的划分是相当灵活的，你完全可以有自己的一套依据。不过以下是我们（Univer 核心团队）所使用的一些依据：

* 是否存在在某些环境下需要加载而在另一环境下不需要加载的模块，如果存在这样的模块，这些模块适宜放在一个单独的插件中。例如 Node.js 中不需要加载 UI 相关的模块，因此 sheet 基本功能中和 UI 相关的部分被拆分到 @univerjs/sheet-ui 中。
* 可以按照不同的文档类型划分，例如 @univerjs/sheet 和 @univerjs/doc 就是按照文档类型划分的。
* 一些复杂的功能可以单独划分成一个插件，例如 @univerjs/sheet-numfmt 就是一个单独的插件，它提供了修改数字格式的功能。
* 一些通用的底层能力可以单独划分成一个插件，例如 @univerjs/design 提供设计系统相关的能力，例如主题、颜色、组件等等、@univerjs/rpc 提供 RPC 能力等等

### 插件的类型

Univer 对插件的类型做了区分，这使得 Univer 能够在最合适的时机初始化插件，从而尽可能节约插件的内存占用。

目前有以下几种类型：

* `PluginType.Univer` Univer 核心插件，这些插件会在 Univer 实例创建的时候就开始加载并触发 `onStarting` 生命周期
* `PluginType.Doc` Doc 文档类型插件
* `PluginType.Sheet` Sheet 文档类型插件

除了 `PluginType.Univer` 之外的插件只会在对应类型的文件第一次被创建的时候开始加载并经历其生命周期。

:::note
关于生命周期的介绍请参考下面的 “插件生命周期” 一节。
:::

### 依赖注入

插件内部可以划分为多个模块（划分的方式可参考下面 “层次结构” 的介绍）这些模块中可以加入 Univer 的依赖注入系统，这样 Univer 就能自动解析这些模块之间的依赖关系并实例化这些模块，从而大大降低在一个复杂系统中管理依赖的复杂度。目前 Univer 官方插件均接入了依赖注入系统。

我们使用的依赖注入工具为 [redi](https://redi.wendell.fun/zh-CN)，可以参考 redi 的文档了解依赖注入的基本概念，以及如何使用它。

### 插件的公有私有模块

如果一个插件想要暴露一些接口给其他插件使用，插件可以在它的模块出口文件（一般是 index.ts 文件）中导出这些模块的依赖注入标识符（identifier）。如果一个模块的 identifier 被导出，那么其它的插件就可以注入这些模块的 identifier，从而建立对这些模块的依赖关系，这些模块也就成为前一个插件的公有模块，反之就是私有模块。如果你熟悉 Angular 的话，很容易发现这跟 NgModule 的概念非常相似，只不过我们不用 exports 字段来声明一个模块的公有模块，而是用 es module 的 export 来暴露模块并将其视为公有模块。

### 插件生命周期

Univer 的插件存在生命周期，通过使用生命周期，Univer 使得插件的行为更好预测，避免时序相关的逻辑错误。

插件有如下四个生命周期：

* `Starting` plugin 挂载到 Univer 实例上的第一个生命周期，此时 Univer 业务实例尚未被创建。Plugin 在此生命周期中应该将自己模块加入到依赖注入系统当中。不建议在此生命周期之外初始化插件内部模块。
* `Ready` Univer 的第一个业务实例已经创建，plugin 可以在此生命周期做大部分初始化工作。
* `Rendered` 第一次渲染已经完成，plugin 可以在此生命周期进行需要依赖 DOM 的初始化工作。
* `Steady` 在 `Rendered` 一段时间之后触发，plugin 可以在此生命周期进行非首屏必须的工作，以提升加载性能。

对应的，Plugin 类型上有四个生命周期勾子，各个 plugin 可以通过覆盖这些方法来在各个声明周期执行相应的逻辑.


```ts
export abstract class Plugin {
    onStarting(_injector: Injector): void {}
    onReady(): void {}
    onRendered(): void {}
    onSteady(): void {}
}
```

除了这四个生命周期勾子之外，插件内部的模块可以使用 `OnLifecycle` 装饰器声明自己需要在特定的生命周期阶段初始化，例如

```ts
@OnLifecycle(LifecycleStages.Rendered, IMEInputController)
export class IMEInputController extends Disposable {}
```

另外也可以通过注入 `LifecycleService` 来监听生命周期事件。

```ts
export class YourService {
    constructor(
        @Inject(LifecycleService) private _lifecycleService: LifecycleService,
    ) {
        super();

        this._lifecycleService.lifecycle$.subscribe((stage) => this._initModulesOnStage(stage));
    }
}
```

### 模块分层

![image](/img/layers.png)

插件内部的模块应当归属于以下层次：

* View 处理渲染和交互，包括 Canvas 渲染和 React 组件
* Controller 封装业务逻辑（特别是功能逻辑），派发 Command 等
* Command 通过命令模式执行逻辑，修改下面 Service / Model 等层次的状态或数据
* Service 按照关注点封装功能给上层模块使用，存储应用内部状态，操作底层数据等等
* Model 存储业务数据

层次之间需要保持单向依赖关系，除部分 Controller 作为 MVVM 中的 view-model 之外可能持有对 UI 层对象的引用，其他层次禁止引用上层模块的代码。

通过模块分层和限制单向依赖，再搭配良好的模块划分，Univer 能够最大程度的做到在不同宿主中的代码复用。

:::info
如果你使用 Univer CLI 来初始化插件，Univer CLI 将会帮你划分目录。
:::

## 命令系统

在 Univer 当中，对应用状态和数据的变更需要通过命令系统执行。命令系统本身是对应用逻辑的抽象，解耦逻辑的执行过程和其参数。

@univerjs/core 中提供了命令服务，插件可以将业务逻辑封装在命令里，并通过依赖注入系统获取到其他模块从而执行业务逻辑。

插件可以通过 `ICommandService` 提供的 `registerCommand` 接口注册命令，并通过 `executeCommand` 接口执行命令：

`Command` 一共有三种类型：

* `COMMAND` 负责根据特定的业务逻辑创建、编排和执行 `MUTATION` 或 `OPERATION`，例如一个 **删除行 `COMMAND`** 会生成一个 **删除行 `MUTATION`** 和用于 undo 的一个 **插入行 `MUTATION`** 及一个 **设置单元格内容 `MUTATION`**
  * `COMMAND` 是业务逻辑的主要承载者，如果对于一个 _用户操作行为_ 需要根据应用的状态来触发不同的 _底层行为_ —— 例如 _用户点击加粗文字按钮_ 时 需要根据当前选区范围来决定 _加粗操作的生效范围_ —— 相应的判断应该由 `COMMAND` 完成
  * 可以派发其他 `COMMAND` `OPERATION` `MUTATION`
  * 允许异步执行
* `MUTATION` 是对落盘数据所做的变更，例如插入行列，修改单元格内容，修改筛选范围等等操作。如果你想给 Univer 加入协同编辑的能力，那么它就是冲突处理的最小单元。
  * 不可以再派发其他任何命令
  * **必须同步执行**
* `OPERATION` 是对不落盘数据（或称应用状态）所做的变更，不涉及冲突处理，例如修改滚动位置、修改侧边栏状态等等
  * 不可以再派发其他任何命令
  * **必须同步执行**

### 事件监听

`ICommandService` 提供事件监听接口，插件可监听哪些命令被执行了，以及执行的参数是什么。实际上，命令执行后会派发这样一个事件：

```ts
/**
 * The command info, only a command id and responsible params
 */
export interface ICommandInfo<T extends object = object> {
    id: string;

    type: CommandType;

    /**
     * Args should be serializable.
     */
    params?: T;
}
```

通过监听事件的执行，可以以非侵入式的方式扩展 Univer 的能力，例如：

* **协同编辑**：一个协同编辑插件可以监听所有 `MUTATION` 类型命令，并通过协同编辑算法将 `MUTATION` 发送到其他协同端，再通过 `ICommandService` 重新执行这些 `MUTATION`。
* **协同光标**：监听选区变化的 `OPERATION` 并发送到其他端，其他端通过解析参数来绘制协同光标
* **Live Share**：监听滚动和缩放 `OPERATION` 并发送到观众端，观众可以同步演示者的浏览位置
* 操作录制

等等。

## 服务化

### 关注点分离

在介绍“模块分层”时，我们提到的 Univer 模块层次中有一层名为 service，这一层的模块被称为服务，它们的职责是封装一些通用的功能。Univer 在架构上鼓励按照[关注点分离](https://zh.wikipedia.org/zh-sg/%E5%85%B3%E6%B3%A8%E7%82%B9%E5%88%86%E7%A6%BB)的原则将功能封装到不同的服务中，这样可以使得服务更加专注于某一特定的功能，从而使得服务更加易于理解、修改、测试和维护。

### 抽象依赖

在封装服务时，可以采用抽象依赖的原则，将服务对其他服务的依赖抽象为接口，从而使得服务更加易于测试和维护。