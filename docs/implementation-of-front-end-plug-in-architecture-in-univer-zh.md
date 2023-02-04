# 前端插件化架构在 Univer 的实现

## 需求

在前端开发中，当你的系统功能逐渐增多，模块间的交互就会越来越复杂，如果没有做提前设计，代码很容易变得臃肿和难以阅读。

这时候就需要考虑加入设计模式了，通常来说，只需要加入几种常见的设计模式，比如观察者模式、命令模式，就可以让模块间解耦，让你的系统变得更加健壮、扩展性更强。

Luckysheet 2.0 很少用到设计模式，扩展性不好，模块拆分不够细致，所以我们 Univer 重构的时候，重点考虑了扩展性，设计了一种插件化架构，或者叫微内核架构。有了插件，扩展自己的功能就方便了，而且不用改造核心库，可以和官方保持同步。下面就来介绍下我们团队在重构 Univer 时候的思考。

> [Univer](https://github.com/dream-num/univer)，原 [Luckysheet 2.0](https://github.com/dream-num/Luckysheet) 升级。

## 设计

我们改造的目标是抽离核心模块，构造可扩展的插件系统，支持多实例，npm 引入，增强 SDK 等。重点就是设计插件系统。

实现一个插件系统，主要解决 3 块内容

1. 插件初始化，插件的逻辑
2. 插件管理，安装、卸载等
3. 插件和核心通信，插件和插件通信

下面简要介绍 Univer 的插件设计

## 原理

### 插件初始化

首先我们在核心构造一个`Plugin`基类，将插件要用到基础属性和方法放在这里，比如插件名称，插件的生命周期。

初始化即安装时调用 `onMounted` 方法，卸载时调用 `onDestroy` 方法。

> 为便于理解，以下部分代码经过简化，我们主要讲解下思路

```ts
export abstract class Plugin {
    protected _name: string;

    protected constructor(name: string) {
        this._name = name;
    }

    getPluginName(): string {
        return this._name;
    }

    onMounted(): void;

    onDestroy(): void;

    // 其它方法
}
```

有了基类，接着就是实现一个插件，任何的插件都需要继承这个`Plugin`类，比如排序插件，需要传入插件名称，内部自行实现好初始化的时候具体插件要做的事情

```ts
export class SortPlugin extends Plugin {
    constructor() {
        super('sort');
    }

    // 初始化
    onMounted(): void {
        // 插件具体初始化逻辑
    }

    // 卸载
    onDestroy(): void {}

    // 其它方法
}
```

### 插件管理

有了具体的插件之后，需要安装插件到核心，我们先提供了 `PluginManager` 的插件管理类，专门负责插件的存储、安装、卸载。

思路是每个插件都存储到数组中，安装的时候，执行插件内部的初始化方法即可，卸载的时候，再执行内部的卸载方法并把插件移除掉。管理类主要是起到存储插件和调用插件内部方法的作用。

```ts
export class PluginManager {
    private _plugins: Plugin[];

    constructor() {}

    _initialize(plugins: Plugin[]) {
        plugins.forEach((plugin: Plugin) => {
            plugin.onMounted();
        });
    }

    // 安装
    install(plugin: Plugin) {
        const { _plugins } = this;
        _plugins.push(plugin);
        this._initialize([plugin]);
    }

    // 卸载
    uninstall(name: string) {
        const { _plugins } = this;
        const index = _plugins.findIndex((item) => item.getPluginName() === name);
        if (index > -1) {
            const plugin = _plugins.splice(index, 1)[0];
            if (plugin) {
                plugin.onDestroy();
            }
        }
    }

    // 其它方法
}
```

我们还在`UniverSheet`实例上提供了方便安装插件的 API `installPlugin`

> 提示：这种包装的 API 随处可见，这让我们 API 有统一的出口，更方便使用

```ts
export class UniverSheet {
    private _context: SheetContext;

    installPlugin(plugin: Plugin): void {
        this._context.getPluginManager().install(plugin);
    }

    uninstallPlugin(name: string): void {
        this._context.getPluginManager().uninstall(name);
    }

    // 其它方法
}
```

### 插件通信

我们有两种通信机制：全局`SheetContext`和观察者模式。

关于 `SheetContext`，这是我们设计的一个全局上下文，使用依赖注入的方式，将`SheetContext`注入到各个插件模块，这样在插件模块中就能调用到`SheetContext`上通用的方法了，我们扩充下 `Plugin` 类，使用我们内部实现的`IOC`，将全局 `SheetContext` 注入进来。这样就实现了插件和核心的通信。

> 关于 `IOC` 的内容，参考我们的另一篇文章

```ts
export abstract class Plugin {
    // 注入 SheetContext
    @Inject('SheetContext')
    protected _context: SheetContext;
    protected _name: string;

    protected constructor(name: string) {
        this._name = name;
    }

    getPluginName(): string {
        return this._name;
    }

    getGlobalContext(): SheetContext {
        return this._context;
    }

    onMounted(ctx: SheetContext): void;

    onDestroy(): void;

    // 其它方法
}
```

关于观察者模式，我们实现了

1. `Observable` 类，提供基础的观察者模式功能如增加、移除、通知
2. `PathObservable` 类，包装单个 `Observable`，并提供观察者名称和命名空间
3. `ObserverManager` 管理类，和`PluginManager`类似，专门负责`PathObservable`实例的管理

然后在插件实例中，提供快捷注册观察者的方法 `pushToObserve`，同时提供获取其它插件的 API `getPluginByName`，这样就能监听其它插件的消息了。这样实现了插件之间的通信。

```ts
export abstract class Plugin<O = any> {
    @Inject('SheetContext')
    protected _context: SheetContext;
    protected _name: string;
    protected _observeNames: string[];

    protected constructor(name: string) {
        this._name = name;
        this._observeNames = [];
    }

    onMounted(context: SheetContext): void {}

    onDestroy(): void {
        this.deleteObserve(...this._observeNames);
    }

    onMapping(ioc: IOCContainer): void {}

    getPluginName(): string {
        return this._name;
    }

    getGlobalContext(): SheetContext {
        return this._context;
    }

    // 获取观察者
    getObserver<K extends keyof Obs & string>(name: K): Nullable<Observable<PropsFrom<Obs[K]>>> {
        const manager = this._context.getObserverManager();
        return manager.getObserver(name, this._name);
    }

    // 获取其它插件实例
    getPluginByName<T extends Plugin>(name: string): Nullable<T> {
        return this._context.getPluginManager().getPluginByName<T>(name);
    }

    // 注册观察者
    pushToObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this._context.getObserverManager();
        names.forEach((name) => {
            if (!this._observeNames.includes(name)) {
                this._observeNames.push(name);
            }
            manager.addObserver(name, this._name, new Observable());
        });
    }

    // 移除观察者
    deleteObserve<K extends keyof Obs & string>(...names: K[]): void {
        const manager = this._context.getObserverManager();
        names.forEach((name) => {
            manager.removeObserver(name, this._name);
        });
    }
}
```

## 总结

以上就是我们在 Luckysheet 重构为 Univer 的时候，关于插件化架构的设计和思考，项目还在不断优化和迭代，也有很多不足的地方，欢迎指出探讨。

最新源码请关注我们的官方 GitHub 仓库： <https://github.com/dream-num/Univer>

## 参考

-   [Univer](https://github.com/dream-num/Univer)
-   [前端进阶：跟着开源项目学习插件化架构](https://zhuanlan.zhihu.com/p/149973342)
