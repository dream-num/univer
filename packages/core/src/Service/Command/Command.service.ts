import { createIdentifier, IDisposable, Inject, Injector, Optional, SkipSelf } from '@wendellhu/redi';

interface DependencyGetter {
    get: Injector['get'];
}

export const enum CommandType {
    /**  */
    OPERATION = 0,
    MUTATION = 1,
}

export interface ICommand {
    id: string;
    type: CommandType;

    handler(dependencyGetter: DependencyGetter, ...args: unknown[]): Promise<boolean>;
}

export interface ICommandInfo {
    id: string;
    type: CommandType;
    args: (number | string | null)[];
}

export type CommandListener = (commandInfo: ICommandInfo) => void;

export interface ICommandService {
    registerCommand(command: ICommand): IDisposable;
    executeCommand(id: string, ...args: unknown[]): Promise<boolean> | boolean;
    onCommandExecuted(listener: CommandListener): IDisposable;
}

export const ICommandService = createIdentifier<ICommandService>('anywhere.command-service');

export function toDisposable(callback: () => void): IDisposable {
    return {
        dispose: callback,
    };
}

/**
 * The registry of commands.
 */
class CommandRegistry {
    private readonly commands = new Map<string, ICommand>();
    private readonly commandInjector = new Map<string, Injector>();

    registerCommand(command: ICommand, injector: Injector): IDisposable {
        if (this.commands.has(command.id) || this.commandInjector.has(command.id)) {
            throw new Error();
        }

        this.commands.set(command.id, command);
        this.commandInjector.set(command.id, injector);

        return toDisposable(() => {
            this.commands.delete(command.id);
            this.commandInjector.delete(command.id);
        });
    }

    getCommand(id: string): [ICommand, Injector] | null {
        if (!this.commands.has(id) || !this.commandInjector.has(id)) {
            return null;
        }

        return [this.commands.get(id)!, this.commandInjector.get(id)!];
    }
}

export class CommandService implements ICommandService {
    private readonly _commandRegistry: CommandRegistry;
    private readonly _listenerRegistry: CommandListener[] = [];

    constructor(@SkipSelf() @Optional(CommandService) private readonly _parentCommandService: CommandService, @Inject(Injector) private readonly _injector: Injector) {
        this._commandRegistry = new CommandRegistry();
    }

    registerCommand(command: ICommand): IDisposable {
        return this._registerCommand(command, this._injector);
    }

    onCommandExecuted(listener: (commandInfo: ICommandInfo) => void): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService.onCommandExecuted(listener);
        }

        if (this._listenerRegistry.indexOf(listener) === -1) {
            this._listenerRegistry.push(listener);
            return toDisposable(() => {
                const index = this._listenerRegistry.indexOf(listener);
                this._listenerRegistry.splice(index, 1);
            });
        }

        throw new Error();
    }

    async executeCommand(id: string, ...args: unknown[]): Promise<boolean> {
        if (this._parentCommandService) {
            return this._parentCommandService.executeCommand(id, ...args);
        }

        const item = this._commandRegistry.getCommand(id);
        if (item) {
            const command = item[0];
            const injector = item[1];

            await this._execute(command, injector, ...args);

            const commandInfo: ICommandInfo = {
                id: command.id,
                type: command.type,
                args: [...args] as unknown[] as (number | string | null)[], // TODO: @wzhudev move strict args control of serialization
            };

            this._listenerRegistry.forEach((l) => l(commandInfo));

            return true;
        }

        throw new Error();
    }

    private _registerCommand(command: ICommand, injector: Injector): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService._registerCommand(command, injector);
        }

        return this._commandRegistry.registerCommand(command, injector);
    }

    private _execute(command: ICommand, injector: Injector, ...args: unknown[]): Promise<boolean> {
        // TODO@wzhudev: emit command executed info
        return injector.invoke(command.handler, ...args);
    }
}