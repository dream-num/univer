# Univer 贡献指南

> 此贡献指南正在更新中，尚有不完善的地方，仅供参考

## 工具

-   vite
-   pnpm
-   Typescript
-   preact

## 工程介绍

pnpm 管理的多包项目，

-   cli 脚手架
-   examples 案例
-   packages 插件和核心
-   patches 补丁
-   scripts 脚本

## 注意事项

-   PR 贡献请提交到 dev 分支，提到其它分支的会被驳回
-   commit 信息必须使用全英文，代码中注释和 issues 尽量使用英文，便于全球的开发者沟通交流

## 基本命令

开发

```sh
npm run dev
```

测试

```sh
npm run test
```

打包

```sh
npm run build
```

生成 API

```sh
npm run api
```

重新安装依赖

```sh
npm run clean
```

## 脚本

### api

使用 `npm run api`，会调用 `scripts/api`文件，内部会触发各个插件生成 API 的命令，插件内部，使用更详细的 node.js 脚本来执行具体的 API 解析指令。

## 开发

### 安装依赖

Node.js >= 14.19

```sh
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
npx playwright install
pnmp i
npm run dev
```

### 命令

在某个子包里执行某个命令

```sh
pnpm run --filter  [package name] [command]
```

比如启动 `packages/sheets-plugin-sort` 工程的`dev`开发模式

```sh
pnpm run --filter @univer/sheets-plugin-sort dev

```

### 清除

遇到任何 npm 安装问题，请先尝试一键重新安装依赖

```sh
npm run clean
```

### 安装依赖

如果更新了项目，发现缺少依赖库，尝试安装一下

```sh
pnpm install
```

## 风格指南

我们严格参照 [Google 开源项目风格指南 - TypeScript 风格指南](https://zh-google-styleguide.readthedocs.io/en/latest/google-typescript-styleguide/contents/#)，本文档的风格指南，主要列出不同的地方和需要重点强调的部分。

> 英文： https://google.github.io/styleguide/tsguide.html

部分规范通过配置 eslint 和 Prettier 规则就能从工具层面解决，这里可能不会赘述，请严格根据 eslint 提示来修复问题，如果使用 VS Code 来开发的话，强烈推荐安装 [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 和 [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) 插件。结合 `.vscode/settings.json` 配置，已经实现了保存文件时自动修复简单的 eslint 问题。

### 命名规范

1. 命名规则

    | 命名法                             | 分类                                           |
    | ---------------------------------- | ---------------------------------------------- |
    | 帕斯卡命名法 `UpperCamelCase`      | 类、接口、类型、枚举、装饰器、类型参数、文件名 |
    | 驼峰式命名法 `lowerCamelCase`      | 变量、参数、函数、方法、属性、模块别名         |
    | 全大写下划线命名法 `CONSTANT_CASE` | 全局常量、枚举值                               |
    | 横线命名 `param-case`              | css 变量名                                     |

    - 模块的文件名和文件夹名称用帕斯卡命名法 `UpperCamelCase`，比如 `Domain`文件夹，`Range`文件名
    - 类型目录统一叫 `Types`，位于`src`下级
    - 工具目录统一叫 `Shared`，位于`src`下级，Shared 原则上不应该引入其他功能性的模块，可以引入基础模块，或者被其他模块引用
    - 测试目录统一叫 `test`，位于`src`同级
    - 模块文件夹中如果包含多个模块文件，推荐使用 `index.ts` 搜集起来统一导出，在使用这些模块时导入文件夹名称即可
    - 接口名以 `I` 开头，比如：`IColorStyle`
    - [Action](../packages/core/command/Action)命名，采用`动词 + 模块 + 行为/属性`的模式，如果意思比较明确的，直接采用 `动词 + 模块`，比如
    - `动词 + 模块 + 行为`： `SetWorkSheetActivateAction`
    - `动词 + 模块 + 属性`： `SetWorkSheetNameAction`
    - `动词 + 模块`： `RemoveColumnAction`
    - 类型为 `Map/WeakMap` 的变量，推荐使用 `XXXMap` 来命名，比如 `sheetMap`
    - 类型为 `Array/Set` 的变量推荐使用 `XXXList`来命名，`sheetList`

2. 推荐为私有属性或方法名添加下划线 \_ 前缀

    比如

    ```ts
    class MyClass {
        // 推荐
        private _attr: String;
        private _func() {}
    }
    ```

3. 如果一个私有方法 `_funcUse`调用了另一个私有方法 `_func`，但是后续开发中需要公开 `_func` 提供的功能，我们建议另外包装一个公共方法出来，比如

    ```ts
    class MyClass {
        // 私有
        private _func() {}

        // 公用
        func() {
            this._func();
        }

        private _funcUse() {
            // 私有的方法调用私有的方法
            this._func();

            // 其它逻辑
        }
    }
    ```

4. 变量名、方法名等取名字应该遵循的规则是，在表达清楚含义的前提下尽量简洁。推荐使用完整的单词，切勿使用汉字、拼音，如果想不到好的单词，可以到 [codelf](https://unbug.github.io/codelf/) 搜索下。

### 语言特性

1. 推荐在构造函数中显式地对类成员进行初始化，这样在执行多种参数处理时会更清晰

    比如

    ```ts
    class Foo {
        private _barService: BarService;
        private _fooService: FooService;

        // 推荐
        constructor(barService: BarService, fooConfig: FooConfig) {
            this._barService = barService; // 直接赋值
            this._fooService = this.handleFoo(fooConfig); // 需要转换
        }
    }
    ```

    像下面的参数属性写法，只适用于简单的情况，为保持统一，我们推荐上面的显式写法

    ```ts
    class Foo {
        // 不推荐
        constructor(private readonly barService: BarService) {}
    }
    ```

2. 一个通用方法是否需要独立到类之外，取决于它的通用性。多个类都会用到的话，可以抽离到类之外，类似一个工具函数，否则我们推荐作为私有方法写到同一个类中，让模块组织更清晰。

3. 推荐使用 `new Array` 来生成指定长度的数组，会让代码更简洁

4. 推荐使用存取器 `get` 和 `set` 来包装内部私有属性，这样写的好处是保留了扩展性。如果这个方法可能会考虑翻译到后端（比如公式），或者经常变化的业务数据，推荐使用 `getFunction`、`setFunction`。

    比如

    ```ts
    class Bar {
        private _barInternal = '';

        // 推荐
        get bar() {
            return this._barInternal;
        }

        // 推荐
        set bar(value: string) {
            this._barInternal = value;
        }
    }
    ```

    上面这个例子，如果已经有了`get bar` 和 `set bar`，最好不要再出现 `getBar` 和 `setBar` 方法，以免引起混淆。当你需要修改数据并支持传入多个参数时，应该起一个更具体的方法名称

    比如

    ```ts
    class Bar {
        private _barInternal = '';

        // 推荐
        get bar() {
            return this._barInternal;
        }

        // 推荐
        set bar(value: string) {
            this._barInternal = value;
        }

        // 推荐，多个入参，更具体的方法名称
        setBarName(value: string, name: string) {
            this._barInternal = value + name;
        }

        // 不推荐，会与 set bar 混淆
        setBar(value: string) {
            this._barInternal = value;
        }
    }
    ```

5. 类中的修饰符参照`private` `protected` `public`的顺序组织，内部使用 eslint 规则进行提示约束 `'@typescript-eslint/member-ordering': ['error', { default: ['private-field', 'protected-field', 'public-field', 'private-method', 'protected-method', 'public-method'] }],`

6. 当使用 `forEach` 来简化 `for` 循环时，有三点注意：

    - `forEach` 如果有异步调用，需要关注变量是否被置为 `null`，必要时可以换为 `for-of` 形式的迭代

        比如

        ```ts
        // 使用 forEach 时需要主动避免出现这种情况
        let x: string | null = 'abc';
        myArray.forEach(() => {
            // 异步方法，在使用 x 的时候，x 已被置空
            asyncFunc(x);
        });

        x = null;
        ```

    - 涉及嵌套循环及要求高性能的情况下，则不推荐使用 `forEach`，尽量用 `for` 循环
    - 数组中定位查找元素尽可能使用 `find`、`findIndex`、`some` 代替 `forEach`

7. CSS 单位优先使用`px`，

### 项目规范

1. 可能的优化点,暂未实现的功能,加 TODO

2. 交互比较简单的 UI 推荐放到 `Spreadsheet` 插件，比如 `showGridlines`、`zoomRatio`

3. 单个文件的行数不应该超过 1000 行，过多的行数可能意味着模块组织不合理

4. 一个 API 只能调用一个 Command，插件的 action 需要注入到这一个 Command 中，用于保证撤销重做正常执行

5. Action 默认情况下需要加入撤销重做栈、发送后台、修改本地数据，但是有的操作可能不需要撤销重做或者发送协同后台，这时候要配置 operationType。比如：切换 sheet 页，不需要发送协同；切换选区功能，不需要进撤销重做栈。

6. 不要直接使用 `console.log` 原生方法，推荐使用 `Logger` 静态类提供的方法来打印日志，便于我们对日志进行更精细的控制。

## 能力扩展

核心能力的扩展，依靠 Plugin、Registry 和 Register 来提供

1. Plugin：大的功能块，使用插件扩展核心能力，核心提供了 install 安装插件
2. Registry：插件内部小的功能块，使用核心提供的一个 Registry 静态注册方法，方便在项目初始化的时候快速搜集内部模块的扩展实例。它是一种设计模式
3. Register：Register 将上一步 Registry 注册的方法，再统一动态注册管理，并且提供直接将内部模块动态注册上去的方法，以便开发者在外部进行动态扩增加某一个模块

通常情况下，一个插件内部的小模块，就是使用静态 load 的方式快速搜集模块，再动态 add 到核心的注册管理器上。如果模块比较简单，也可以直接将插件内部的模块直接 add 到注册管理器。

## 插件开发实践

### 新建插件

这里演示在 Univer 主仓库内部新建一个插件的流程

1. 首先到 cli 目录下安装 cli 工具的依赖

    ```sh
    cd cli
    npm i
    ```

2. 运行 cli 命令来选择插件

    先确保回到项目主目录

    ```sh
    cd ..
    ```

    再运行生成插件的命令

    ```shell
    npm run univer-cli create inner
    ```

    其中 create 表示创建一个插件，inner 表示在 Univer 主仓库内部新建插件，也就是放到 packages 文件夹下。inner 模式下，还需要项目根目录的 [tsconfig.json](../tsconfig.json) 文件中，增加当前添加插件的引用地址，必须这样写：

    ```json
    {
        // 其他配置...
        "references": [
            // 已有配置
            { "path": "./packages/core/tsconfig.ref.json" },
            { "path": "./packages/base-render/tsconfig.ref.json" },
            // 新加的配置
            { "path": "./packages/sheets-plugin-data-validation/tsconfig.ref.json" }
        ]
    }
    ```

    如果想在自己电脑的一个空白目录用脚手架新建一个插件，就不用加 inner，运行`npm run univer-cli create`即可。

    接着选择你想要的模板

    - base：基础插件，构建类似 `base-sheets`、`base-docs`、`base-slides` 的插件
    - sheets-plugin：表格插件，构建类似 `sheets-plugin-sort`、`sheets-plugin-data-validation`的插件

    接着再填写你的插件名称，比如填写 `data-validation`，程序将会在 `packages` 文件夹下，生成一个完整的插件模板，比如`packages/sheets-plugin-data-validation`。

3. 根据命令行的提示，使用 pnpm 安装依赖 和 启动开发模式。

    比如 `data-validation` 插件安装依赖

    ```sh
    pnpm i --filter  @univer/sheets-plugin-data-validation
    ```

    启动开发模式

    ```sh
    pnpm run --filter  @univer/sheets-plugin-data-validation dev
    ```

    这里用到了 pnpm 的 `--filter` 的功能来筛选出指定的插件来运行命令，更多学习内容请移步[官网 pnpm 过滤](https://pnpm.io/zh/filtering)

4. 如果需要测试其他的插件和当前插件一起运行，需要在当前插件里安装您所需要的插件，比如以下命令是在`@univer/base-sheets` 插件中安装 `@univer/sheets-plugin-alternating-colors` 插件：

    ```sh
    pnpm add @univer/sheets-plugin-alternating-colors --filter @univer/base-sheets
    ```

    如果您还有协同开发的朋友，他本地的开发需要执行`pnpm install`来链接到安装的插件

    Tips:

    > 为了能方便的调试核心和其它插件的代码，我们建议在主仓库内部进行插件开发，同时我们也提供了插件 CLI，方便在任意文件夹进行插件初始化，请到 [cli](../cli/README.md)) 详细了解

    常用组件 `PLUGIN_NAMES.SPREADSHEET`的方式，其它插件采用自己抛出变量，如`ALTERNATING_PLUGIN_NAME`

### 插件目录

以 base-sheets 插件为例，一个标准的插件目录结构 `src` 目录如下所示

```sh
│  index.ts # 插件出口
│  main.ts # 插件调试预览入口
│  preact.d.ts # preact 声明文件
│  SheetPlugin.tsx # 插件核心导出类（实际名称会根据插件名称替换）
│
├─Controller # 根据Model改变view状态；如果是preact，那就只涉及一些公共业务逻辑，修改view还是在preact的view里
│      index.ts # 出口
│      SpreadsheetController.ts # 具体的数据更新类（实际名称会根据插件名称替换）
│
├─Basics # 基础工具函数、常量、接口（可选）
│  ├─Const # 常量
│  │      index.ts # 出口
│  │
│  ├─Enum # 枚举
│  │      index.ts # 出口
│  │
│  ├─Interfaces # 接口
│  │      index.ts # 出口
│  │
│  └─Shared # 公共方法
│         index.ts # 出口
│
├─Locale # 国际化
│      en.ts # 英文国际化翻译文件
│      index.ts # 出口
│      zh.ts # 中文国际化翻译文件
│
├─Model # 数据 CRDT
│  │
│  ├─Action # 由Command触发（可选）
│  │      index.ts # 出口
│  │
│  ├─Apply # 修改数据（可选）
│  │      index.ts # 出口
│  │
│  └─SpreadsheetModel # 各个Controller对应的数据模型
│         index.ts # 出口
│
├─Types # 声明文件
│      index.d.ts # 具体的声明文件
│
└─View # 视图，dom和canvas的生成和管理
    ├─Render # canvas 组件
    │      index.ts # 出口
    │
    └─UI # DOM 组件
           SpreadsheetButton.tsx # 具体的DOM组件（实际名称会根据插件名称替换）
           SpreadsheetButton.module.less # SpreadsheetButton组件的样式文件（实际名称会根据插件名称替换）
```

针对 DOM 组件，如果简单的组件写在一个 `Component.tsx组件即可`，如果组件比较复杂，建议新建一个组件命名的文件夹，来组织多个`.tsx`、`.less`文件，需要的话，还可以将类型和枚举类拆分出来定义。

### 挂载设置面板

依据插件模板生成的新插件，默认会将插件里的 DOM 元素挂载到界面上的工具栏，内部是在插件里引入了`@univer/base-sheets`，然后通过其 API `addButton` 来动态挂载 DOM 元素，所以工具栏会多出一个`data-validation`插件按钮，即表明插件加载成功

-   filterPlugin 类中的 initialize 初始化时，使用 SheetPlugin 插件提供的 API 来挂载 JSX 组件

    现有的 API 有

    -   addButton：挂载按钮到工具栏
    -   addSider：挂载到右外侧边栏，并且配套了`showSiderByName`支持打开关闭对应插件的侧边栏

            原理：内部使用 preact `setState`将 JSX 组件更新到组件中，并保持国际化 context 的热更新

            一个可以参照的案例:

            使用`addButton`将筛选插件的弹窗框触发按钮和弹出框的组件一同挂载到工具栏

            ```tsx
            export class FilterPlugin extends Plugin {
                // 其他代码
                initialize(context: SheetContext): void {
                    // 其他代码
                    const item: IToolBarItemProps = {
                        locale: 'filter',
                        type: ISlotElement.JSX,
                        show: true,
                        label: <FilterButton config={config} super={this} />,
                    };
                    context.getPluginManager().getPluginByName<SheetPlugin>('spreadsheet')?.addButton(item);
                }
            }
            ```

            参照源码 [./packages/sheets-plugin-filter/src/FilterPlugin.tsx)](http://github.com/dream-num/univer/blob/master/packages/sheets-plugin-filter/src/FilterPlugin.tsx)

            使用 `addMain`将插件组件挂载到中间的核心表格区域，并使用 `showMainByName`来控制组件的显示隐藏。

            ```tsx
            const mainItem: IMainProps = {
                name: ALTERNATING_COLORS_PLUGIN_NAME,
                type: ISlotElement.JSX,
                content: <div>中间的alternating</div>,
            };
            context.getPluginManager().getPluginByName<SheetPlugin>('spreadsheet')?.addMain(mainItem);
            context.getPluginManager().getPluginByName<SheetPlugin>('spreadsheet')?.showMainByName(ALTERNATING_COLORS_PLUGIN_NAME, true);
            ```

            参照源码 [./packages/sheets-plugin-alternating-colors/src/AlternatingColorsPlugin.tsx)](http://github.com/dream-num/univer/blob/master/packages/sheets-plugin-alternating-colors/src/AlternatingColorsPlugin.tsx)

            使用`addSider`将交替颜色的设置面板挂载到侧边栏，交替颜色的按钮

            ```tsx
            export class AlternatingColorsPlugin extends Plugin {
                initialize(context: SheetContext): void {
                    // 其他代码
                    const rangeData = {
                        startRow: 0,
                        endRow: 10,
                        startColumn: 0,
                        endColumn: 10,
                    };
                    const banding = {
                        bandingTheme: {
                            headerColor: 'red',

                            firstBandColor: 'lightgray',

                            secondBandColor: 'lightgreen',

                            footerColor: 'yellow',
                        },
                        showHeader: true,
                        showFooter: true,
                    };

                    const panelItem: ISlotProps = {
                        name: ALTERNATING_COLORS_PLUGIN_NAME,
                        type: ISlotElement.JSX,
                        content: <AlternatingColorsSide config={{ rangeData: rangeData, context: context, banding: banding, alternatingColors: this._alternatingColors }} />,
                    };
                    context.getPluginManager().getPluginByName<SheetPlugin>('spreadsheet')?.addSider(panelItem);
                }
            }
            ```

            参照源码 [./packages/sheets-plugin-alternating-colors/src/AlternatingColorsPlugin.tsx)](http://github.com/dream-num/univer/blob/master/packages/sheets-plugin-alternating-colors/src/AlternatingColorsPlugin.tsx)

-   除了没有您想要的挂载函数，还可以考虑使用 SheetPlugin 插件抛出的 DOM 元素，外部插件直接使用`appendChild`挂载。

    现有抛出元素的 API 有

    -   getToolBarRef：工具栏组件
    -   getContentRef：中间内容区组件
    -   getSplitLeftRef：中间左边内容区组件，在中间内容区被切分为两块内容区的时候存在

            原理：内部使用 preact `ref`链接到元素，布局组件初始化后挂载出来抛出 API，使用 `getContentRef().current`即可获取到具体的 DOM 元素

            一个可以参照的案例:

            ```tsx
            export class SheetPlugin extends Plugin {
                // 其他代码
                register(engineInstance: Engine) {
                    // 获取到内容区DOM
                    let container = this.context.getPluginManager().getPluginByName<SheetPlugin>('spreadsheet')?.getContentRef().current!;

                    // 将内容区设置为引擎的容器
                    engineInstance.setContainer(container);
                }
            }
            ```

### 获取 context

在插件初始化的时候，会自动从核心（@univer/core）注入 context，context 包含 Univer 核心的所有上下文，我们根据 context 进行业务逻辑处理。

比如，获取 workbook

```js
context.getWorkBook();
```

### 挂载 meta data

在核心的 workbook 和 worksheet 存储数据结构上预留了两个 `pluginMetaData` 对象，用来挂载插件数据。在插件初始化的时候，可以设置对应的插件数据。这个数据在核心渲染的时候会统一获取到之后和核心的数据做合并，得到的最终的结果用来渲染页面。

是否需要挂载 meta data,每个插件的情况不一样。插件的临时数据只需要插件自己存储，无需挂载到核心，只有需要存储的插件才需要挂载到核心上。如果一个插件的数据在每一个 sheet 页上都不一样,就要放在 worksheet 上,反之就挂载在 workbook 上

```js
const activeSheetId = context.getWorkBook().getActiveSheet().getSheetId();
// add new AlternatingColors meta data
context.getWorkBook().setPluginMeta < IKeyType < IBandedRange >> (ALTERNATING_COLORS_PLUGIN_NAME, { [activeSheetId]: [] });
```

### 国际化

从 context 调用 `getLocale` API 来动态加载国际化文件

-   `context.getLocale()` 会得到 Locale 实例
-   `context.getLocale().options.currentLocale` 可以获取到当前语言，类似 `zh`、`en`
-   `context.getLocale().load` 可以动态加载国际化文件，比如

    ```js
    context.getLocale().load({
        en: en,
        zh: zh,
    });
    ```

-   `context.getLocale().get('key')`来取得 key 对应的翻译即可，语言不用特定获取，因为在初始化的时候就配置好了

### CSS 模块

我们内部使用 `less + CSS module` 模式来编写样式，一个`.module.less`结尾的 css 文件会被识别为 CSS Module，如果您不需要 CSS Module 功能，可以仅仅使用`.less`结尾。

通常来说，我们建议在组件的容器上加一个组件名开头的样式前缀来区分每一个 DOM 组件。

比如`alternating colors`插件，就会加一个`alternating-colors`前缀

```css
.alternating-colors-panel-setting {
    height: 100%;

    .section {
        padding-top: var(--padding-base);
        h3 {
            margin-bottom: var(--margin-base);
        }
    }
}
```

在组件中引入样式

```tsx
import styles from './index.module.less';
```

请注意，这里推荐使用 styles 这个变量名，因为一个自定义的 preact 组件，通常还需要支持从父级传下来的`style`样式，为了开发业务的用户能够方便的在自定义`tsx`组件中直接写 css 内联样式，自定义的 props 中最好能定义一个`style`属性，同样的，我们通常也支持`className`。

最后在`tsx`组件中或者 ts 方法中使用小驼峰写法来获取 css 变量

```tsx
// tsx组件中的className直接使用
<Container className={style.AlternatingColorsSideSetting}></Container>;

// 或者 作为js变量使用
const s = `${style.AlternatingColorsSideSetting}`;
```

### 测试数据

1. 如果是单元测试需要使用的数据，直接放在 `src` 同级的 `test` 目录下
2. 如果是插件的初始化的入参数据，可以直接写在 `main.ts` 中，或者自己建立一个新的文件夹，如 `src/Data` 文件夹，文件名推荐使用 `DEFAULT_[NAME]_DATA` 的格式，如 `DEFAULT_WORKBOOK_DATA`

### 不使用 preact 构造插件 UI

### 处理国际化

## 注册快捷键

`base-component`插件中向核心提供了`onKeyDownObservable`，可以用来快捷注册键盘快捷键。

我们允许为同一组快捷键注册多个监听。

```ts
const onKeyDownObservable = this._plugin.getContext().getObserverManager().getObserver<KeyboardEvent>('onKeyDownObservable', 'core');

onKeyDownObservable?.add((evt: KeyboardEvent) => {
    // handle Ctrl + A
    if (evt.ctrlKey && evt.key === 'a') {
        // custom function
        this.handleCtrlA();
    }
});
```

## 测试

核心代码测试使用

```sh
# 启动测试
npm run test
```

在提交代码之前需要测试跑一下测试，保证自己的提交的代码一同编写了单元测试并通过。之后会加入 CI 自动化测试。

jest 测试指标含义：

-   `%stmts`是语句覆盖率（statement coverage）：是不是每个语句都执行了？
-   `%Branch`分支覆盖率（branch coverage）：是不是每个 if 代码块都执行了？
-   `%Funcs`函数覆盖率（function coverage）：是不是每个函数都调用了？
-   `%Lines`行覆盖率（line coverage）：是不是每一行都执行了？

我们的目标是所有覆盖率指标都在 85%以上。

UI 测试先安装依赖

```sh
npx playwright install
```

再执行测试

```sh
npm run test:ui
```

UI 测试主要是测试`@univer/style-univer`的组件

-   未与核心耦合、未使用核心`SheetContext`/`locale`的无状态组件，编写单元测试，测试文件的目录和组件在一个层级，参照`./packages/style-univer/src/components/Container>`组件

    ```sh
      Container
      │  container-zh.md # api文档
      │  container.md # api 英文文档
      │  Container.tsx # 组件核心tsx代码
      │  index.module.less # 组件核心less文件
      │  index.ts # 导出
      │
      └─test # 组件测试目录
        Container.test.tsx # 组件测试文件
    ```

    如果您想为`Container`组件增加测试代码，直接在`Container.test.tsx`文件中增加`test`方法即可。

-   与核心耦合、使用了核心`SheetContext`/`locale`的有状态组件，编写 e2e 测试，技术上采用`Playwright`。因为要启动一个浏览器实例和本地服务，所以我们将所有需要 e2e 测试的组件放在一个文件中管理，测试文件为`./packages/style-univer/test/components.e2e.spec.ts`，每个组件编写一个`it`用例即可，不要和之前的函数命名冲突即可。

Tips:

测试 mock 数据 ，sheetId 统一用 sheet-01，因为可能会有多个 sheet

测试命名：Test XXX

测试时特别注意 切换 sheet 页对插件状态的影响

## 注释

注释全部采用英文，我们内部使用 api-extractor 来规范注释，并且会通过 api-documenter 来生成 API 文档

> 注释风格参考 [api-extractor 文档](https://api-extractor.com/pages/tsdoc/doc_comment_syntax/)

Domain 下的核心 API/IData 开放的接口/工具类，需要加标签 `@alpha`、`@beta`、`@public`、`@internal`

这是一个函数注释示例

```ts
/** @public */
export class Statistics {
    /**
     * Returns the average of two numbers.
     *
     * @remarks
     * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
     *
     * @param x - The first input number
     * @param y - The second input number
     * @returns The arithmetic mean of `x` and `y`
     *
     * @beta
     */
    static getAverage(x: number, y: number): number {
        return (x + y) / 2.0;
    }
}
```

接口默认值

```ts
export interface IWorksheetConfig {
    /**
     * Determine whether the sheet is hidden
     *
     * @remarks
     * See {@link BooleanNumber | the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;
}
```

如果英文注释阅读比较困难，可以使用 vscode 插件`Comment Translate`来实时翻译注释，
或者直接添加双语注释

一个双语注释的例子，将中文注释藏到 `@privateRemarks` 标签里，不会展示在英文文档中

```ts
/**
 *
 * Column subscript letter to number
 *
 * @privateRemarks
 * zh: 列下标  字母转数字
 *
 * @param a - Column subscript letter,e.g.,"A1"
 * @returns Column subscript number,e.g.,0
 *
 */
static ABCatNum(a: string): number {
}

```

绑定的事件需要加上 `@eventProperty`

```ts
/**
 * Listen for click events
 * @eventProperty
 */
handleClick(...args: Array<any>) {
}
```

API 还需要提供一个简短的案例，如果有更详细的案例，就不适合放在注释里，可以加一个 `@link` 链接到案例文档

````ts
/**
 * Set the sheet name.
 *
 * @example
 * Set new name:
 * ```ts
 * worksheet.setName('NewSheet')
 * ```
 *
 * @param name - new sheet name
 * @returns current worksheet instance
 *
 * @alpha
 */
setName(name: string): WorkSheet {
}
````

针对范型参数也有特殊的标签来表示 `@typeParam`

```ts
/**
 * @typeParam T - plugin data structure
 * @param name - plugin name
 * @returns information stored by the plugin
 */
getPluginMeta<T>(name: string): T {
}
```

如果是继承的抽象方法，可以在抽象方法定义的地方统一描述，子类使用 `@inheritDoc` 直接引用父类的描述

比如插件的设计中，

接口定义

```ts
export interface BasePlugin {
    /**
     * mapping
     *
     * @param container - IOC container dependency injection
     * @public
     */
    onMapping(container: IOCContainer): void;
}
```

实现接口的抽象方法定义

```ts
export abstract class Plugin<O = any> implements BasePlugin {
    /**
     * {@inheritDoc BasePlugin.onMapping}
     */
    abstract onMapping(container: IOCContainer): void;
}
```

第三方插件定义

```ts
export class AlternatingColorsPlugin extends Plugin {
    /**
     * {@inheritDoc Plugin.onMapping}
     */
    onMapping(IOC: IOCContainer): void {}
}
```

## 为核心贡献 API

首先为您的 API 分好类别，在核心的[Domain](../packages/core/src/Sheets/Domain) 文件夹中，已经有多个模块分类到了不同的文件，比如典型的模块 `WorkSheet`、`WorkBook`、`Range`，如果您的 API 属于这些已分好类的模块，请将他们直接加到这些模块中。如果您的 API 不属于 Domain 文件夹下的任何一个模块，请新建一个文件来编写您的 API，写法上参照 `WorkSheet` 模块的写法即可。

-   如果要实现一个简单的查询 API，函数名是以`get`开头，比如`worksheet.getSheetId`，直接从实例存储的数据中获取
-   如果要实现一个操作类的 API，函数名是以`set`开头，比如`setName`，通常用于参数设置和操作的 API 都需要执行 `Action` 来触发后续`Service`数据更新和协同
    -   如果已有 `Action` 可用，直接调用已有`Action`即可，比如 `range.setBackground` 和 `range.setFontColors` 这两个 API 都是调用的 `SetRangeStyleAction`
    -   如果你的 API 涉及新的操作，那么需要编写对应的`Action`来触发`Service`数据更新和协同

`Univer`的核心架构是

-   `Domain`提供 API，触发`Action`
-   `Action`触发协同，调用`Service`具体操作数据

一个简单的设置 worksheet 切换按钮 color 的 API [setTabColor](../packages/core/src/Sheets/Domain/Worksheet.ts) 的案例

1.  在[ACTION_NAMES](../packages/core/src/Const/ACTION_NAMES.ts)中预先定义一个`Action`名称 `SET_TAB_COLOR_ACTION`

2.  将 `Action` 注册到[CommandManager](../packages/core/src/Command/RegisterAction.ts)

3.  在[Action](../packages/core/src/Sheets/Action)文件夹中新建一个文件[SetTabColorAction.ts](../packages/core/src/Sheets/Action/SetTabColorAction.ts)

    这个 API 只需要一个名称 `color` 即可，所以`Action`的接口格式可以为

    ```js
    // packages/core/src/Command/Action/SetTabColorAction.ts
    interface ISetTabColorActionData extends ISheetActionData {
        color: Nullable<string>;
    }
    ```

    构造器中需要手动将当前执行的数据存储到`this._doActionData`对象中吗，然后执行`this.do()`方法来调用[SetTabColorService](../packages/core/src/Sheets/Apply/SetTabColor.ts)，`SetTabColorService`负责直接操作 `worksheet`上的数据，`Service`操作完之后有一个重要的工作就是返回历史数据给上层的`Action`。还是在构造器中，拿到历史数据后存储到 `this._oldActionData`用于撤销。因为我们设置 tab color 后，撤销的时候也是设置 tab color，所以在`this._oldActionData`也是存储`SET_TAB_COLOR_ACTION`

    ```ts
    this._oldActionData = {
        actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
        sheetId: actionData.sheetId,
        color: this.do(),
    };
    ```

    注意撤销的操作可能和执行不是同一个`Action`，比如清除范围[ClearRangeAction](../packages/core/src/Sheets/Action/ClearRangeAction.ts)之后，撤销的时候需要调用设置范围[SetRangeDataAction](../packages/core/src/Sheets/Action/SetRangeDataAction.ts)。并且也因为撤销重做用到的`Action`不同，所以在`Service`中返回的历史数据，要符合撤销的`Action`的所需的数据结构。

4.  我们在调用撤销 API `worksheet.getCommandManager().undo()` 的时候，核心的 `UndoManager` 会自动调用`this._oldActionData`所存储`Action`所包含的`undo` 方法来执行撤销，我们需要在 `undo`方法里调用对应的 [SetTabColorService](../packages/core/src/Sheets/Apply/SetTabColor.ts)，同时将 `SetTabColorService`返回的数据重新存储到 `this._doActionData` 中。因为在撤销之前，数据可能会被其他客户端修改后协同同步过来，这样本地浏览器存储的历史记录是作废的，所以这里需要重新更新 `this._doActionData`数据。
5.  同样的，我们在调用重做 API `worksheet.getCommandManager().redo()` 的时候，核心的 `UndoManager` 会自动调用`this._doActionData`所存储`Action`所包含的`redo` 方法来执行重做，操作完成后也是更新下`this._oldActionData`数据，原理同撤销。这样一个`Action`的核心功就完成了，其他的辅助的方法可以一同写在这个`Action`类中

6.  在`WorkSheet.ts`中增加一个 API，就叫 `setTabColor`，入参仅仅一个 `color` 就够了，同时支持 `Null`，我们内部很多的 API 是参照了 [Google Sheet API](https://developers.google.com/apps-script/reference/spreadsheet/sheet#settabcolorcolor)，有不适配我们架构的地方会做部分修改。在这个 `setTabColor` API 中，内部组织一个`SET_TAB_COLOR_ACTION`的配置信息，用于生成`Command`，由`CommandManager`触发这个`Action`即可。

    ```ts
    /**
     * Sets the sheet tab color.
     * @param color A color code in CSS notation (like '#ffffff' or 'white'), or null to reset the tab color.
     * @returns WorkSheet This sheet, for chaining.
     */
    setTabColor(color: Nullable<string>): WorkSheet {
        const { _context, _commandManager } = this;
        let setTabColor: ISetTabColorActionData = {
            sheetId: this._sheetId,
            actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
            color: color,
        };
        let command = new Command(_context.getWorkBook(), setTabColor);
        _commandManager.invoke(command);
        return this;
    }
    ```

    注意，简单情况下，一个`Command`包装一个`Action`足够了，复杂情况下，一个 `Command`还可能包含多个 `Action`才能完成一个操作任务，必须[RangeList](../packages/core/src/Sheets/Domain/RangeList.ts)中的`setValue`方法会负责处理多个范围的数据

7.  每一个 API 和 `Action` 都需要编写一个单元测试，API 的测试文件统一放在[test/Domain](../packages/core/test/Domain)文件夹下，比如`WorkSheet.test.ts`测试文件就是专门为所有 worksheet 的 API 编写的测试，测试方法的命名规则为`Test [API Name|描述]`，比如这里的`Test setTabColor`，一个完整的单元测试包括初始化一个新的 Univer 实例，执行 API 操作，撤销，重做

        ```ts
        test('Test setTabColor', () => {
            const container = IOCContainerStartUpReady();
            const context = container.getSingleton<SheetContext>('SheetContext');
            const workbook = container.getSingleton<WorkBook>('WorkBook');
            const commandManager = workbook.getCommandManager();

            const sheetId = 'sheet';
            const worksheet = new WorkSheet(context, { sheetId, tabColor: 'red' });
            worksheet.setCommandManager(commandManager);
            workbook.insertSheet(worksheet);

            // clear sheet
            worksheet.setTabColor('blue');

            // test current sheet tab color
            const currentTabColor = worksheet.getConfig().tabColor;
            expect(currentTabColor).toEqual('blue');

            // undo
            worksheet.getCommandManager().undo();

            // test previous sheet tab color
            const preTabColor = worksheet.getConfig().tabColor;
            expect(preTabColor).toEqual('red');

            // redo
            worksheet.getCommandManager().redo();

            // test next sheet tab color
            const nextTabColor = worksheet.getConfig().tabColor;
            expect(nextTabColor).toEqual('blue');
        });
        ```

    这样一个完整的 API 就开发完成了。

Tips:
核心是否要包装插件 API，要看核心是否提供了 Action，不允许核心调用插件 API，如 Find 插件提供 createTextFinder，核心不提供

8. Action 扩展

当用户输入 `100%`，我们需要自动将单元格格式改为`百分比`，当用户输入`=SUM(2)`时候需要计算公式，这种情况下，我们需要使用到数字格式和公式插件的能力来转换这些数据。所以需要在 Command 执行前做个 Action 拦截的动作，拦截 ActionData 传入到数字格式 Action 扩展和公式 Action 扩展，做完计算之后，直接修改这个 ActionData，并且增加自己的数字格式 Action 和公式 Action，来实现这两种计算。

在编辑单元格的时候，我们是不知道用户是否安装了数字格式插件或者公式插件的，所以我们还做了一个 Action 扩展注册机制，只有按照规范注册了的扩展，才会在 Action 拦截的时候使用，其中，扩展管理的地方负责检验 Action 数据是否打中扩展，打中的扩展就会执行。

ActionOperation 有一个 removeExtension 可以移除 action 拦截。一般情况下，Action 都会走拦截，但是在初始化（比如公式）或者已经拦截的 ActionExtension 里触发的 Action（比如 FormulaActionExtension），这两种情况是不需要拦截的，所以要做过滤。

## 组件开发

### 技术原理

我们采用`preact`框架和`tsx`语法来开发 DOM 组件。

### 设计原则

-   通用：可能在多个页面级组件中用到，达到组件复用的目的，尽量减少和其他模块的耦合性
-   易用：为常用的功能提供设置项，完善的 API
-   方便扩展：如果默认功能不能满足用户要求，需要让用户能很容易看懂你的代码，以便修改源码来满足需要
-   尽量拆分：我们遵循模块和组件拆分`越细越好`的原则

通常来说，通用组件设计成无状态组件比较好，但是如果一个无状态组件嵌套很深，在我们修改组件传参的时候，需要跨越好几个父级组件来传递参数，往往给组件开发带来很大的复杂度，所以一个`context`的设计显得比较重要，通过全局透传的`context`，取得一些统一的参数，这个设计对国际化的功能很有帮助。需不需要用到`context`，要看组件的复杂度，当你的组件元素非常多的时候，可以考虑`context`，构造一个像`Button`的简单小组件，不需要用到`context`

### 目录和命名规范

一个新的`preact tsx`组件，主要包括组件核心逻辑、单元测试和文档。一个完整的`Container`组件的目录结构如下

```sh
├─Container
│  │  container-zh.md # API说明文档中文版 markdown文件名采用
│  │  container.md # API说明文档英文版
│  │  Container.tsx # 组件核心逻辑 组件名采用大驼峰写法
│  │  index.module.less # 样式
│  │  index.ts # 模块导出的出口
│  └─test
│     Container.test.tsx # 单元测试
```

如果遇到更复杂的组件需求，可以在组件文件夹内新建模块，或者将能够复用的部分拆分到更小的组件中，由几个小组件组合成一个大的组件。

### 开发组件

1. 在`Container.tsx`中正常编写组件核心逻辑
2. 在`base-component/src/BaseComponent`中增加一个组件专用接口，比如`ContainerComponent`
3. 在`Container.tsx`中增加`UniverContainer`类导出组件

    ```ts
    export class UniverContainer implements ContainerComponent {
        constructor() {}
        render(): JSXComponent {
            return Container;
        }
    }
    ```

    这时候如果`Container`这里报错了，说明在`JSXElement`需要增加 `Container`的类型

4. 在`style-univer/src/StyleUniver.ts`中的`UniverComponentFactory`类下，在`createComponent`中增加导出`UniverContainer`组件实例
5. 组件已经构造好了，可以测试一下。比如在`base-sheets`中引入使用，在`base-sheets/src/Domain/Spreadsheet.ts`中定义组件类型

    ```ts
    export type ISheetContainerConfig = {
        // other code
        Container: FunctionComponent;
    };
    ```

    在`base-sheets/src/SheetPlugin.tsx`中配置进`config`传输到`base-sheets/src/View/UI/SpreadsheetButton.tsx`组件中使用

    ```ts
    const config: ISheetContainerConfig = {
        Button: Button,
        Container: Container,
    };
    ```

    正常使用组件

    ```ts
    render(props: IProps, state: IState) {
         const { Button, Container } = props.config;
         return (
             <div>
                 <Container>
                     <Button onClick={() => console.log('click')}>button</Button>
                 </Container>
             </div>
         );
     }

    ```

### 工具栏如何加一个按钮

### 如何增加一个侧边栏

### 如何加一个弹窗

## 单元测试

### 核心

jest 单元测试

### preact 组件

| 测试种类 | 技术选型      |
| -------- | ------------- |
| 单元测试 | Jest + Enzyme |
| 快照测试 | Jest          |
| E2E 测试 | Playwright    |

每一个组件都应该至少包含一个完整的 jest 单元测试，我们使用 preact 官方推荐的`@testing-library/preact`库来做 DOM 测试，

> [preact 组件测试](https://preactjs.com/guide/v10/preact-testing-library/)

比如测试一个`Container`组件是否正常渲染

```tsx
// --- ./packages/style-univer/src/Components/Container/test/Container.test.tsx ---
import { h } from 'preact';

import { render } from '@testing-library/preact';

import { Container } from '..';

describe('Container', () => {
    test('should display initial Container', () => {
        const { container } = render(<Container>container content Text</Container>);

        expect(container.textContent).toMatch('container content Text');
    });
});
```

e2e 测试时，内部采用 `window.performance.memory` API 来监测内存使用情况

#### canvas 测试

单元测试，生成 canvas 组件类转换，进行 API 操作，获取参数是否符合预期
e2e 测试，保证渲染一致性，用 canvas 组件生成一个图片，测试的时候用 render 生成 canvas 转成图片，对比之前的图片是否有差异
使用 <https://github.com/mapbox/pixelmatch>

#### 公式测试

先自行整理一些常用公式，后期开放用户测试，搜集 log，用户填写的公式搜集起来，放到测试用例

### 性能测试

### 统计代码行数

```sh
git ls-files | xargs wc -l
```

### 说明文档

每一个组件都应该有一份详细的`.md`说明文档， 文档至少包括组件介绍、API、案例

比如一个简答的`Button`按钮说明文档

````md
---
category: Components
type: 通用
title: Button
subtitle: 按钮
cover: ''
---

## 介绍

通用按钮组件

按钮类型

-   主按钮：类型`primary`，一般用于弹窗的确定按钮，每行的确认按钮，一个操作区域只能有一个主按钮
-   默认按钮：工具栏按钮
-   文本按钮：取消功能

按钮状态

-   禁用：工具栏禁用状态
-   加载中：异步操作等待状态

## API

通过设置 Button 的属性来产生不同的按钮样式，推荐顺序为：`type` -> `shape` -> `size` -> `loading` -> `disabled`。

按钮的属性说明如下：

| 属性      | 说明                                                                                                                                 | 类型                                                              | 默认值    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------- |
| block     | 将按钮宽度调整为其父宽度的选项                                                                                                       | boolean                                                           | false     |
| danger    | 设置危险按钮                                                                                                                         | boolean                                                           | false     |
| disabled  | 按钮失效状态                                                                                                                         | boolean                                                           | false     |
| htmlType  | 设置 `button` 原生的 `type` 值，可选值请参考 [HTML 标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string                                                            | `button`  |
| loading   | 设置按钮载入状态                                                                                                                     | boolean \| { delay: number }                                      | false     |
| shape     | 设置按钮形状                                                                                                                         | `circle` \| `round`                                               | -         |
| size      | 设置按钮大小                                                                                                                         | `large` \| `middle` \| `small`                                    | `middle`  |
| type      | 设置按钮类型                                                                                                                         | `primary` \| `ghost` \| `dashed` \| `link` \| `text` \| `default` | `default` |
| onClick   | 点击按钮时的回调                                                                                                                     | (event) => void                                                   | -         |
| children  | 按钮内容或者子节点                                                                                                                   | any                                                               | -         |
| className | 点击按钮时的回调                                                                                                                     | string                                                            | -         |

支持原生 button 的其他所有属性。

## 案例

```jsx
import { Button } from '@univer/style-univer';

const ToolBar = () => {
    const buttonText = '确认';
    return (
        <Button
            type="primary"
            onClick={() => {
                this.handleClick();
            }}
        >
            {buttonText}
        </Button>
    );
};
```
````

## 依赖管理

### 安装依赖

-   安装生产依赖到某一个插件里，比如在`plugin-sort`里安装`preact`: `pnpm add preact --filter @univer/sheets-plugin-sort`
-   安装开发依赖到某一个插件里，加一个 `-D` 比如在`plugin-sort`里安装`jest`: `pnpm add -D jest --filter @univer/sheets-plugin-sort`
-   安装开发依赖到所有插件里，比如在所有插件里安装`jest`: `pnpm add -D jest`，这类插件一般称为公共依赖，公共依赖包一般安装在项目一级根目录的`package.json`中
-   更新公共依赖包：`pnpm update`

## 打包

### 整体打包

打包`packages`文件夹下的核心库和所有插件，在对应插件的下的`lib`目录下生成 `umd.js`和`esm.js`结尾的文件。

```sh
npm run build
```

### 单个打包

### 版本控制

### 发布 npm

## 插件使用

### 安装插件

先用 npm 安装核心包`@univer/core`、渲染引擎 `@univer/base-render`、表格组件插件`@univer/base-sheets`、基础 UI 插件`@univer/style-univer`和筛选插件`@univer/sheets-plugin-filter`

```sh
npm i @univer/core @univer/base-render @univer/base-sheets @univer/style-univer @univer/sheets-plugin-filter
```

然后再引入插件使用

```js
import { UniverSheet } from '@univer/core';
import '@univer/core/lib/style.css';
import { UniverComponentSheet } from '@univer/style-univer';
import { RenderEngine } from '@univer/base-render';
import { SheetPlugin } from '@univer/base-sheets';

// 初始化universheet
const univerSheet = UniverSheet.newInstance({
    id: 'workbook-01',
});

// 渲染引擎
univerSheetUp.installPlugin(new RenderEngine());

// 加载基础 UI 插件
univerSheetUp.installPlugin(new UniverComponentSheet());

// 基础 sheets 插件
univerSheetUp.installPlugin(
    new SheetPlugin({
        container: 'universheet-demo-up',
    })
);
// 加载筛选插件
univerSheet.installPlugin(new FilterPlugin());
```

### 动态加载

为了提高首屏加载速度，可以使用`import()`动态加载
先用 npm 安装插件

```sh
npm i @univer/core @univer/base-render @univer/base-sheets @univer/style-univer @univer/sheets-plugin-filter
```

然后再动态引入插件使用

```js
import { UniverSheet } from '@univer/core';
import '@univer/core/lib/style.css';
import { UniverComponentSheet } from '@univer/style-univer';
import { RenderEngine } from '@univer/base-render';
import { SheetPlugin } from '@univer/base-sheets';

// 初始化universheet
const univerSheet = UniverSheet.newInstance({
    id: 'workbook-01',
});

// 渲染引擎
univerSheetUp.installPlugin(new RenderEngine());

// 加载基础 UI 插件
univerSheetUp.installPlugin(new UniverComponentSheet());

// 基础 sheets 插件
univerSheetUp.installPlugin(
    new SheetPlugin({
        container: 'universheet-demo-up',
    })
);

// 动态加载筛选插件
import('@univer/sheets-plugin-filter').then(({ FilterPlugin }) => {
    univerSheetUp.installPlugin(new FilterPlugin());
});
```

### 自定义打包插件

如果你感觉一个个安装插件比较麻烦，我们的自定义打包器可以把你需要的插件打包在一起，并且可以统一配置插件。

在工程根目录下运行自定义打包命令

```sh
# 将 sort 和 comment 与核心一起打包，需要打包更多插件只需列在后面
npm run univer-cli -- build --  --include sort comment
```

将核心和插件一起打包为一个完整的模块 `univer-custom-build.es.js`，文件位于`./cli/univer-custom-build/lib/`目录下，同级还有一个`style.css`。
将这两个文件复制到你的工程项目里，引入模块即可，然后通过`univerSheetCustom`初始化整个 universheet 和插件，可以统一配置核心和插件

```js
// 可能需要修改成你自己的模块路径
import { univerSheetCustom } from './univer-custom-build.es.js';
import './style.css';

// 可选的核心配置
const workbookConfig = {
    id: '',
    sheetOrder: [],
    socketEnable: BooleanNumber.FALSE,
    socketUrl: '',
    name: '',
    timeZone: '',
    appVersion: '',
    theme: '',
    skin: '',
    locale: '',
    creator: '',
    styles: [],
    sheets: [],
    lastModifiedBy: '',
    createdTime: '',
    modifiedTime: '',
};

// 可选的spreadsheetConfig插件配置
const spreadsheetConfig = {
    container: 'universheet-demo-up',
};

// 统一配置入口
const universheet = univerSheetCustom({
    workbookConfig: workbookConfig,
    spreadsheetConfig: spreadsheetConfig,
});
```

除了打包为一整个模块，还可以配置为动态模块，

```sh
npm run build:customd
```

将每个插件单独打包出模块，内部自动使用`import()`动态载入插件，提升首屏加载速度，用法上和上面几乎一致，区别是需要将打包后所有文件复制到工程目录即可，其他配置一样。
