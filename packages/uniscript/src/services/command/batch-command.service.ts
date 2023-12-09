import type { CommandListener, ICommand, ICommandService, IExecutionOptions } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

export class BatchCommandService implements ICommandService {
    beforeCommandExecuted(listener: CommandListener): IDisposable {
        throw new Error('Method not implemented.');
    }

    registerCommand(command: ICommand<object, boolean>): IDisposable {
        throw new Error('Method not implemented.');
    }

    registerAsMultipleCommand(command: ICommand<object, boolean>): IDisposable {
        throw new Error('Method not implemented.');
    }

    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P | undefined,
        options?: IExecutionOptions | undefined
    ): Promise<R> {
        throw new Error('Method not implemented.');
    }

    syncExecuteCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P | undefined,
        options?: IExecutionOptions | undefined
    ): R {
        throw new Error('Method not implemented.');
    }

    onCommandExecuted(listener: CommandListener): IDisposable {
        throw new Error('Method not implemented.');
    }
}

// TODO: @wzhudev: the facade injector should register this command service to implement command batching
// for performance reasons, and undo redo experience.
