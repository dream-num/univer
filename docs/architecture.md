# Architecture Nodes

## Univer Architecture Introduction

Univer is a web-based office collaboration and data processing SDK, mainly in the form of Office products (sheet / doc / slide). Univer organizes code in a plugin-based manner, allowing users to choose plugins according to their actual needs to form a Univer application. For example, users can add capabilities such as collaborative editing, macro recording, and AI-generated scripting languages to traditional spreadsheets in a plugin-based manner. Users can also embed Univer applications into their own applications, and integrate the capabilities of Univer and their own applications through plugins. And, with the help of Univer's official database connectors, user can load and process data in Univer, leveraging Univer's plugin ecosystem.

## Core Requirements for Univer Architecture Design

Some of these design requirements come from the product planning of Univer, and some come from the learning of team members participating in other project research and development.

1. **100% embrace the web technology stack**. Univer needs to run in a considerable number of environments, meet the needs of rapid iteration, and allow customers, ISVs, and communities to have the ability to develop secondary development. The only technology stack that can meet these needs is the technology stack with web technology as its core.
2. **Pluginization and high scalability**. Univer's modules should be as plug-in as possible, and the coupling relationship between plug-ins should be decoupled as much as possible, so as to reduce the cost of adapting to different user needs and different operating environments, and reduce the threshold for secondary development.
3. **Hierarchical structure and one-way dependency**. Univer's modules are not allowed to have circular dependencies, which allows us to load the required levels and modules according to the needs of different environments.
4. **Design for multiple platforms**. Decouple the coupling relationship between code and specific operating environment to facilitate migration to different operating environments.
5. **Design for high testability**. The modules are based on interfaces as much as possible to establish dependency relationships, which is convenient for independent testing.

## Plugins and Dependency Injection

### Plugin

Univer's modules should be considered from the perspective of **business type (Sheet / Doc / Slide), concern (configuration management / UI / shortcut keys / canvas rendering), function (Sheet basic operation / Sheet conditional formatting / Sheet filter, operating environment (desktop / mobile / Node.js, etc.)** and other factors, divided into various plugins (plugin), combined into a Univer application.

For example, you could create a standard Spreadsheet application like this:

```ts
import { UniverDocs } from '@univerjs/docs';
import { UniverRenderEngine } from '@univerjs/engine-render';
import { sheetsPlugin } from '@univerjs/sheets';
import { UniverUI } from '@univerjs/ui';
import { LocaleType, Univer } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { FormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsUI } from '@univerjs/sheets-ui';

const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
});

univer.registerPlugin(UniverDocs, {
    hasScroll: false,
});
univer.registerPlugin(UniverRenderEngine);
univer.registerPlugin(UniverUI, {
    container: 'univer-container', // where to mount the UI
    header: true,
    footer: true,
});
univer.registerPlugin(sheetsPlugin);
univer.registerPlugin(UniverSheetsUI);
univer.registerPlugin(FormulaPlugin);

// call univer.createUniverSheet() to create a spreadsheet
```

The design based on plugins enables Univer to meet various operating environments (PC browser / Node / mobile terminal), different functional requirements, different configuration requirements, secondary development, third-party plugins and other needs.

You can refer to the document [Plugin Extension Capability](./plugin-extension-capability.md) for more information about the plugin extension capability.

### Dependency injection

<img width="962" alt="" src="https://github.com/dream-num/univer/assets/12122021/2102f948-4ede-49b2-ac7d-45adf943a5b5">

The plugin can divide the code into the various layers of modules introduced in the "Hierarchical Structure" section below according to actual needs. The service and controller in these modules need to be added to the dependency injection system of Univer, so that Univer can automatically resolve the dependency relationship between these modules and instantiate these modules. The documentation of the dependency injection system refers to [redi - redi](https://redi.wendell.fun/zh-CN).

### Public and private modules of plugins and extension points

You can export the identifier of these modules in the index.ts file of each plugin. If the identifier of a module is exported, then other plugins can import the identifier of these modules to establish a dependency relationship with these modules, and these modules become public modules of the previous plugin, otherwise it is a private module. If you are familiar with Angular, you will easily find that this is very similar to the concept of NgModule, except that we do not need to declare the exports field, but use the export of es module to distinguish public modules.

### Plugin lifecycle

Plugins have the following four lifecycles

```ts
export const enum LifecycleStages {
    Starting,
    Ready,
    Rendered,
    Steady,
}
```

* `Starting` The first lifecycle of the plugin mounted on the Univer instance, at this time the Univer business instance has not been created. The plugin should add its own modules to the dependency injection system during this lifecycle. It is not recommended to initialize the internal modules of the plugin outside this lifecycle.
* `Ready` The first business instance of Univer has been created, and the plugin can do most of the initialization work during this lifecycle.
* `Rendered` The first rendering has been completed, and the plugin can do initialization work that requires DOM dependency during this lifecycle.
* `Steady` Triggered after a period of time after `Rendered`, the plugin can do non-first screen must work during this lifecycle to improve loading performance.

Correspondingly, there are four lifecycle hooks on the Plugin type

```ts
/**
 * Plug-in base class, all plug-ins must inherit from this base class. Provide basic methods.
 */
export abstract class Plugin {
    onStarting(_injector: Injector): void {}

    onReady(): void {}

    onRendered(): void {}

    onSteady(): void {}
}
```

In addition to these four lifecycle hooks, modules within the plugin can use the OnLifecycle decorator to declare that they need to be initialized at a specific lifecycle stage, for example:

```ts
@OnLifecycle(LifecycleStages.Rendered, IMEInputController)
export class IMEInputController extends Disposable {}
```

You can also listen to lifecycle events by injecting `LifecycleService`.

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

### When should you write a plugin?

The division of plugins is primarily based on whether certain modules need to be loaded in specific scenarios. For example, when running on the Node.js platform, UI-related modules may not be required, so these modules can be placed in a separate plugin and not loaded on the Node.js platform. Another example is when you want to allow users to choose whether to load a particular feature, you can place that feature in a separate plugin.

## Layers

![image](../img/layers.png)

The modules within a plugin should generally belong to the following layers:

* View: Handles rendering and interaction, including canvas rendering and React components.
* Controller: Encapsulates business logic, especially functional logic, and dispatches commands.
* Command: Executes logic using the command pattern, modifying the state or data of lower layers such as Service/Model.
* Service: Encapsulates functionality based on concerns for use by higher-level modules, stores internal application state, and manipulates underlying data, etc.
* Model: Stores business data.

There should be a unidirectional dependency relationship between the layers. Except for some Controllers that act as view-models in MVVM and may hold references to UI layer objects, other layers are prohibited from referencing code from higher-level modules.

Note: The code within a plugin is not limited to belonging to only one layer. For example, a plugin may provide both View and Controller simultaneously.

## Command System

Changes to the application state and data are executed through the command system. The Univer core provides a command service, with the dependency injection token ICommandService. Higher-level modules can encapsulate business logic within commands and execute the business logic by accessing other services through the command system. With the command system, Univer can easily implement collaborative editing, macro recording, undo/redo, and follow browsing capabilities.

Plugins can register commands using the registerCommand interface provided by ICommandService and execute commands using the executeCommand interface.

```ts
export interface ICommand<P extends object = object, R = boolean> {
    /**
     * ${businessName}.${type}.${name}
     */
    readonly id: string;
    readonly type: CommandType;

    handler(accessor: IAccessor, params?: P): Promise<R>;

    /** When this command is unregistered, this function would be called. */
    onDispose?: () => void;
}

export interface ICommandService {
    registerCommand(command: ICommand): IDisposable;

    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> | R;
}
```

There are three types of commands in total:

```ts
export const enum CommandType {
    /** Command could generate some operations or mutations. */
    COMMAND = 0,
    /** An operation that do not require conflict resolve.  */
    OPERATION = 1,
    /** An operation that need to be resolved before applied on peer client. */
    MUTATION = 2,
}
```

* `COMMAND` is responsible for creating, orchestrating, and executing `MUTATION` or `OPERATION` based on specific business logic. For example, a **Delete Row `COMMAND`** would generate a **Delete Row `MUTATION`**, an **Insert Row `MUTATION`** for undo, and a **Set Cell Content `MUTATION`**.
  * `COMMAND` is the main carrier of business logic. If a _user action_ requires different _underlying behaviors_ based on the application state—for example, when a user clicks the bold text button and the effective range of the bold operation needs to be determined based on the current selection—the corresponding logic should be handled by the `COMMAND`.
  * It can dispatch other `COMMAND`, `OPERATION`, or `MUTATION`.
  * Asynchronous execution is allowed.
* `MUTATION` represents the changes made to the persisted data and involves conflict resolution in collaborative editing. Examples include inserting rows or columns, modifying cell content, changing filter ranges, and other operations.
  * It cannot dispatch any other commands.
  * **It must be executed synchronously**.
* `OPERATION` represents the changes made to non-persisted data (or application state) and does not involve conflict resolution. Examples include modifying scroll position, changing sidebar states, and other operations.
  * It cannot dispatch any other commands.
  * **It must be executed synchronously**.

### Collaborative Editing

`ICommandService` provides event listening interfaces that allow plugins to listen to which commands have been executed and what parameters were used for execution. In practice, an event is dispatched after a command is executed. The event looks like:

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

For collaborative editing, the collaboration plugin can listen to all `MUTATION` type commands and, through collaborative editing algorithms, send these `MUTATION` to other collaborative clients. The plugin can then use `ICommandService` to reapply these `MUTATION`.

### Operation Recording and Playback

By listening to the execution of `OPERATION` and `MUTATION`, plugins can record user actions and implement features such as:

* Collaborative cursors
* Magic Share, similar to Lark video
* Macro recording
* AppScript

and more.

## User Interface

Univer provides mechanisms to simplify UI development and reduce the workload of menus, shortcuts, and interaction components across different devices. Functional plugins do not need to concern themselves with UI details; they can focus solely on business logic.

### ShortcutService

By injecting an `IShortcutItem` into the `IShortcutService`, you can register a shortcut key and configure its key combination, priority, trigger conditions, and the associated command to be executed.

```ts
export interface IShortcutItem<P extends object = object> {
    /** This should reuse the corresponding command's id. */
    id: string;
    description?: string;

    priority?: number;
    /** A callback that will be triggered to examine if the shortcut should be invoked. */
    preconditions?: (contextService: IContextService) => boolean;

    /** A command can be bound to several bindings, with different static parameters perhaps. */
    binding: number;
    mac?: number;
    win?: number;
    linux?: number;

    /** Static parameters of this shortcut. Would be send to `CommandService.executeCommand`. */
    staticParameters?: P;
}

export interface IShortcutService {
    registerShortcut(shortcut: IShortcutItem): IDisposable;

    getCommandShortcut(id: string): string | null;
}
```

### MenuService

By registering an IMenuItem with the IMenuService, you can configure a menu item.

```ts
interface IMenuItemBase<V> {
    /** ID of the menu item. Normally it should be the same as the ID of the command that it would invoke.  */
    id: string;
    title: string;
    description?: string;
    icon?: string;
    tooltip?: string;

    /** In what menu should the item display. */
    positions: OneOrMany<MenuPosition | string>;

    /** @deprecated this type seems unnecessary */
    type: MenuItemType;
    /**
     * Custom label component id.
     * */
    label?:
        | string
        | {
              name: string;
              props?: Record<string, string | number>;
          };

    hidden$?: Observable<boolean>;
    disabled$?: Observable<boolean>;

    /** On observable value that should emit the value of the corresponding selection component. */
    value$?: Observable<V>;
}

export interface IMenuService {
    menuChanged$: Observable<void>;

    addMenuItem(item: IMenuItem): IDisposable;

    /** Get menu items for display at a given position or a submenu. */
    getMenuItems(position: MenuPosition | string): Array<IDisplayMenuItem<IMenuItem>>;
    getMenuItem(id: string): IMenuItem | null;
}
```


