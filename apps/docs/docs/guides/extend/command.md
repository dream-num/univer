---
sidebar_position: 2
---

# 扩展命令

:::info
建议在阅读本小节内容之前先[了解 Univer 的命令系统](/docs/guides/architecture/#命令系统)。
:::

## 创建新命令

创建一个命令需要两个步骤：

第一步，创建一个实现 `ICommand` 接口的对象：

```ts
import { ICommand, CommandType } from '@univer/core';

export interface IYourCommandInterface {
    // Your command's param's interface.
}

export const YourCommand: ICommand = {
    name: 'your-command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IYourCommandInterface) => {
        // Implement your business logic here.
    }
}
```

命令需要声明以下属性：

1. `name`：命令的名称，必须唯一；我们建议以 `业务域:类型:含义` 的方式来命名，例如 `sheet.command.copy`、`sheet.command.paste` 等
2. `type`：命令的类型
3. `handler`：命令的执行逻辑，接收一个 `IAccessor` 对象以及命令参数，通过 `IAccessor` 对象可以访问 Univer 的依赖注入系统

命令可接收参数，参数需要是一个对象，接口由你的业务逻辑决定。当然一个命令也可以不接收参数，此时 `handler` 的第二个参数为 `undefined`。

第二步，将 Command 注册到命令服务上：

```ts
import { ICommandService, Disposable } from '@univer/core';

export class YourController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        this.disposeWithMe(this._commandService.registerCommand(YourCommand));
    }
}
```

之后就可以通过 `ICommandService` 来执行命令了。实践中常用的方式是通过 UI 触发，请参考[拓展 UI](/docs/guides/extend/ui)。

### Undo / Redo

Univer 提供了 undo redo 的能力，如果你的命令需要接入，需要在命令的 `handler` 回调函数中调用 `IUndoRedoService` 的对应方法：

```ts
import { IUndoRedoService } from '@univer/core';

export const YourCommand: ICommand = {
    name: 'your-command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IYourCommandInterface) => {
        const undoRedoService = accessor.get(IUndoRedoService);

        undoRedoService.pushUndoRedo({
            unitID: 'your-documents-id',
            undoMutations: [/** mutations for undo */],
            redoMutations: [/** mutations for do and redo */],
        });
    }
}
```

## 扩展已有命令

除了创建新命令，Univer 还支持扩展已有的命令，这在扩展 Univer 内置能力时尤其必要。以下介绍三个比较典型的场景。

### 在其他 COMMAND 执行的时机补充 MUTATIONS

### 扩展复制粘贴

### 扩展下拉填充
