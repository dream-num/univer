# 核心设计

## WorkBookObserver

每一个 UniverSheet 实例都会有一个 ObserverManager 来这个实例的 WorkBookObserver，ObserverManager 挂载在 context 上。

在核心中，WorkBookObserver 是初始化内置的，直接从 ObserverManager 实例 调用即可，比如更新国际化信息的 WorkBookObserver `onAfterChangeUILocaleObservable`

在 Plugin 基类 中，也抽象了便捷的方法来创建和销毁的 WorkBookObserver
Plugin WorkBookObserver 方法

-   addObserver: 增加 WorkBookObserver，使用 addObserver 需要在插件初始化的时候手动调用，指定 WorkBookObserver 名称，Plugin 基类会帮您指定 namespace 为当前插件
-   removeObserver: 销毁 WorkBookObserver，此 API 会在插件销毁的时候自动在 onDestroy 中调用，插件开发者无需手动调用，如果插件开发者要手动更新 onDestroy 函数，需要使用 `super.onDestroy()` 来调用 Plugin 基类的销毁方法
-   getObserver：获取 WorkBookObserver，支持在 插件中快捷获取你想要的 WorkBookObserver，如果插件中的其他模块也需要获取 WorkBookObserver，可以将插件实例或者核心 context 注入到其他模块中来调用 WorkBookObserver

    ```js
    // 使用插件的 getObserver
    pluginInstance.getObserver('observeName');

    // 或者

    // 使用 context 的 ObserverManager
    this.context
        .getObserverManager()
        .getObserver('onAfterChangeFontFamilyObservable', 'styleUniverSheet')
        ?.add(() => {});
    ```

API

案例；设置单元格值，设置样式

base-sheets 引入 UI 组件库使用时，推荐分离业务逻辑和 UI，使得能够针对业务逻辑做单元测试，这些业务逻辑包括一些纯输入输出的计算、转换方法等。
