# 前端 IOC 依赖注入在 UniverSheet 3.0 的实现

## 介绍

在软件工程中，依赖项注入是一种技术，通过它一个对象(或静态方法)可以提供另一个对象的依赖项。依赖项是可以使用的对象(服务)。
在理解它在编程中的含义之前，首先让我们了解一下它的总体含义，这可以帮助我们更好地理解这个概念。
依赖是指依靠某种东西来获得支持。比如我会说我们对手机的依赖程度过高。

在讨论依赖注入之前，我们先理解编程中的依赖是什么意思。
当 class A 使用 class B 的某些功能时，则表示 class A 具有 class B 依赖。
在 Java 中，在使用其他 class 的方法之前，我们首先需要创建那个 class 的对象(即 class A 需要创建一个 class B 实例)。
因此，将创建对象的任务转移给其他 class，并直接使用依赖项的过程，被称为“依赖项注入”。

## 需求

为什么需要使用依赖注入？

假设我们有一个 car class，其中包含各种对象，例如车轮、引擎等。
这里的 car class 负责创建所有依赖对象。现在，如果我们决定将来放弃 MRFWheels，而希望使用 Yokohama 车轮，该怎么办？
我们将需要使用新的 Yokohama 依赖关系来重新创建 car 对象。但是，当使用依赖注入（DI）时，我们可以在运行时更改车轮 wheels（因为可以在运行时而不是在编译时注入依赖项）。

你可以将依赖注入视为代码中的中间人，它负责创建想要的 wheels 对象，并将其提供给 car class。
它使 car class 不需要创建车轮 wheels、电池 battery 对象等。

## 设计

组件之间依赖关系由容器在运行期决定，形象的说，即由容器动态的将某个依赖关系注入到组件之中。依赖注入的目的并非为软件系统带来更多功能，而是为了提升组件重用的频率，并为系统搭建一个灵活、可扩展的平台。通过依赖注入机制，我们只需要通过简单的配置，而无需任何代码就可指定目标需要的资源，完成自身的业务逻辑，而不需要关心具体的资源来自何处，由谁实现。

理解 DI 的关键是：“谁依赖谁，为什么需要依赖，谁注入谁，注入了什么”，那我们来深入分析一下：

-   谁依赖于谁：当然是应用程序依赖于 IoC 容器；
-   为什么需要依赖：应用程序需要 IoC 容器来提供对象需要的外部资源；
-   谁注入谁：很明显是 IoC 容器注入应用程序里依赖的对象；
-   注入了什么：就是注入某个对象所需要的外部资源/依赖。

依赖注入明确描述了 “被注入对象依赖 IoC 容器配置依赖对象”，依赖注入是控制反转设计思想的一种实现。

## 原理

提供一个依赖管理的容器 “IOCContainer” 以及一个添加依赖项的方法 “addMapping”, 该方法接受 2 个参数 “依赖项的名称” 和 “依赖性项的 class 类型”，因为 javascript 不支持类型，所以依赖项的名称是必须的，指定依赖的名称也可以防止在 webpack 这类包管理工具中使用代码混淆，造成找不到类型的问题

```ts
class IOCContainer {
    addMapping(name: string, type: Class) {
        // ...
    }
}
```

我们使用一个全局的 Map 管理所有的依赖项

```ts
class IOCContainer {
    typedMap: Map<string, Class>;
}
```

getInstance 是我们从容器中获取依赖项的方法，它接受两个参数一个是依赖项的名称，另外一个是依赖项的作用域类型，这里我们提供 2 中作用域类型，“单例作用域” 以及 “多例作用域”

```ts
class IOCContainer {
    getInstance(name: string, type: Scope) {
        // ...
    }
}
```

现在我们已经有了一个最简单的 IOC 容器，但是还存在一个问题现在容器并不知道依赖项之间的依赖关系，我们还需要一种机制这种机制可以让容器确定谁是依赖项谁是被依赖项

我们使用 @Inject 注解来确定依赖项之间的关联关系

```ts
function Inject(name: string): void {
    // ...
}
```

@Inject 接收一个参数 name, 用来指定依赖项的名称。

### 示例

```ts
function bootstrap(): IOCContainer {
    const container = new IOCContainer();
    container.addMapping('Environment', Environment);
    container.addMapping('SheetContext', SheetContext);
    container.addMapping('UndoManager', UndoManager);
    container.addMapping('UniverSheet', UniverSheet);
    container.addMapping('PluginManager', PluginManager);
    return container;
}

class SheetContext {
    @Inject('Environment')
    private environment: Environment;
}

class UniverSheet {
    @Inject('SheetContext')
    private context: SheetContext;

    static newInstance(): UniverSheet {
        return bootstrap().getInstance('UniverSheet', Scope.prototype);
    }
}
```

以上我们就完成了一个简单版本的 IOC 容器

## 参考

-   [动手造轮子：实现一个简单的依赖注入](https://www.cnblogs.com/weihanli/p/implement-dependency-injection.html)
-   [依赖注入是什么？如何使用它](https://chinese.freecodecamp.org/news/a-quick-intro-to-dependency-injection-what-it-is-and-when-to-use-it/)
-   [什么是注入，什么时候使用它](https://blog.csdn.net/weixin_39932344/article/details/110813701)
