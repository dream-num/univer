import { createIdentifier, IAccessor, IDisposable, Inject, Injector, Optional, SkipSelf } from '@wendellhu/redi';

import { toDisposable } from '../../Shared/lifecycle';
import { IKeyValue } from '../../Shared/Types';
import { IContextService } from '../context/context.service';
import { ILogService } from '../log/log.service';

export const enum CommandType {
    /** Command could generate some operations or mutations. */
    COMMAND = 0,
    /** An operation that do not require conflict resolve.  */
    OPERATION = 1,
    /** An operation that need to be resolved before applied on peer client. */
    MUTATION = 2,
}

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

export interface IMultiCommand<P extends object = object, R = boolean> extends ICommand<P, R> {
    name: string;
    multi: true;
    priority: number;

    preconditions?: (contextService: IContextService) => boolean;
}

/**
 * Mutation would change the model of Univer applications.
 */
export interface IMutation<P extends object = object, R = boolean> extends ICommand<P, R> {
    type: CommandType.MUTATION;
    handler(accessor: IAccessor, params: P): Promise<R>; // mutations must have params
}

/**
 * Operation would change the state of Univer applications. State should only be in memory and does not
 * require conflicting resolution.
 */
export interface IOperation<P extends object = object, R = boolean> extends ICommand<P, R> {
    type: CommandType.OPERATION;
}

/**
 * The command info, only a command id and responsible params
 */
// TODO: change object to serializable interface type
export interface ICommandInfo<T extends object = object> {
    id: string;

    /**
     * Args should be serializable.
     */
    params?: T;
}

export interface IExecutionOptions {
    silent?: boolean;
}

export type CommandListener = (commandInfo: Readonly<ICommandInfo>) => void;

export interface ICommandService {
    registerCommand(command: ICommand): IDisposable;

    registerAsMultipleCommand(command: ICommand): IDisposable;

    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> | R;

    /**
     * Register a hook that will be triggered when the
     *
     * @param id the command that will be fired.
     * @param callback the callback function that would be called
     */
    onCommandWillExecute<P extends object = object>(
        id: string,
        callback: (params?: P) => ICommandInfo[][]
    ): IDisposable;

    /**
     * The method that would be trigger when a command is executing. Gather all interceptors and middlewares.
     * Should return a series of mutations or operations that would be executed as well.
     *
     * @param id ID of the command that would be fired
     * @param params Command parameters
     *
     * @returns redo and undo mutations / operations
     */
    triggerCommandWillFire<P extends object = object>(id: string, params: P): ICommandInfo[][];

    /**
     * Register a callback function that will be executed when a command is executed.
     */
    onCommandExecuted(listener: CommandListener): IDisposable;
}

export const ICommandService = createIdentifier<ICommandService>('anywhere.command-service');

/**
 * The registry of commands.
 */
class CommandRegistry {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly commands = new Map<string, ICommand>();

    private readonly commandInjector = new Map<string, Injector>();

    registerCommand(command: ICommand, injector: Injector): IDisposable {
        if (this.commands.has(command.id) || this.commandInjector.has(command.id)) {
            throw new Error(`Command ${command.id} has registered before!`);
        }

        this.commands.set(command.id, command);
        this.commandInjector.set(command.id, injector);

        return toDisposable(() => {
            this.commands.delete(command.id);
            this.commandInjector.delete(command.id);

            command.onDispose?.();
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

    private readonly _commandWillExecuteRegistry: Map<string, Set<(params?: object) => ICommandInfo[][]>> = new Map();

    private readonly _commandExecutedListeners: CommandListener[] = [];

    private _multiCommandDisposables = new Map<string, IDisposable>();

    private _commandExecutingLevel = 0;

    constructor(
        @SkipSelf() @Optional(ICommandService) private readonly _parentCommandService: CommandService,
        @Inject(Injector) private readonly _injector: Injector,
        @ILogService private readonly _log: ILogService
    ) {
        this._commandRegistry = new CommandRegistry();
    }

    // TODO: support registering to multi command
    registerCommand(command: ICommand): IDisposable {
        return this._registerCommand(command, this._injector);
    }

    registerAsMultipleCommand(command: ICommand): IDisposable {
        return this._registerMultiCommand(command, this._injector);
    }

    onCommandWillExecute<P extends object = object>(
        id: string,
        callback: (params?: P) => ICommandInfo[][]
    ): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService.onCommandWillExecute(id, callback);
        }

        const set = !this._commandWillExecuteRegistry.has(id)
            ? (() => {
                  const newSet = new Set<(params?: P) => ICommandInfo[][]>();
                  this._commandWillExecuteRegistry.set(id, newSet as Set<(params?: object) => ICommandInfo[][]>);
                  return newSet;
              })()
            : this._commandWillExecuteRegistry.get(id)!;

        set.add(callback);

        return toDisposable(() => {
            set.delete(callback);
            if (set.size === 0) {
                this._commandWillExecuteRegistry.delete(id);
            }
        });
    }

    triggerCommandWillFire<P extends object = object>(id: string, params: P): ICommandInfo[][] {
        if (this._parentCommandService) {
            return this._parentCommandService.triggerCommandWillFire(id, params);
        }

        if (!this._commandWillExecuteRegistry.has(id)) {
            return [];
        }

        // TODO: @wzhudev: it may be better to wrap all undo & redos.
        return Array.from(this._commandWillExecuteRegistry.get(id)!)
            .map((interceptor) => interceptor(params))
            .flat();
    }

    onCommandExecuted(listener: (commandInfo: ICommandInfo) => void): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService.onCommandExecuted(listener);
        }

        if (this._commandExecutedListeners.indexOf(listener) === -1) {
            this._commandExecutedListeners.push(listener);
            return toDisposable(() => {
                const index = this._commandExecutedListeners.indexOf(listener);
                this._commandExecutedListeners.splice(index, 1);
            });
        }

        throw new Error('Could not add a listener twice.');
    }

    async executeCommand<P extends object = object, R = boolean>(id: string, params?: P): Promise<R> {
        if (this._parentCommandService) {
            return this._parentCommandService.executeCommand(id, params);
        }

        const item = this._commandRegistry.getCommand(id);
        if (item) {
            const command = item[0];
            const injector = item[1];

            const result = await this._execute<P, R>(command as ICommand<P, R>, injector, params);

            const commandInfo: ICommandInfo = {
                id: command.id,
                params,
            };

            // emit command execution info
            this._commandExecutedListeners.forEach((listener) => listener(commandInfo));

            return result;
        }

        throw new Error(`Command "${id}" is not registered.`);
    }

    private _registerCommand(command: ICommand, injector: Injector): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService._registerCommand(command, injector);
        }

        return this._commandRegistry.registerCommand(command, injector);
    }

    private _registerMultiCommand(command: ICommand, injector: Injector): IDisposable {
        if (this._parentCommandService) {
            return this._parentCommandService._registerMultiCommand(command, injector);
        }

        // compose a multi command and register it
        const registry = this._commandRegistry.getCommand(command.id);
        let multiCommand: MultiCommand;
        if (!registry) {
            multiCommand = new MultiCommand(command.id);
            this._multiCommandDisposables.set(
                command.id,
                this._commandRegistry.registerCommand(multiCommand, this._injector)
            );
        } else {
            if ((registry[0] as IKeyValue).multi !== true) {
                throw new Error('Command has registered as a single command.');
            } else {
                multiCommand = registry[0] as MultiCommand;
            }
        }

        const commandDisposable = multiCommand.registerImplementation(command as IMultiCommand, injector);
        return toDisposable(() => {
            commandDisposable.dispose();
            if (!multiCommand.hasImplementations()) {
                this._multiCommandDisposables.get(command.id)?.dispose();
            }
        });
    }

    private async _execute<P extends object, R = boolean>(
        command: ICommand<P, R>,
        injector: Injector,
        params?: P
    ): Promise<R> {
        this._log.log(
            '[CommandService]',
            `${'|-'.repeat(this._commandExecutingLevel)}executing command "${command.id}".`
        );

        this._commandExecutingLevel++;
        let result: R | boolean;
        try {
            result = await injector.invoke(command.handler, params);
            this._commandExecutingLevel--;
        } catch (e) {
            result = false;
            this._commandExecutingLevel = 0;
            throw e;
        }

        return result;
    }
}

class MultiCommand implements IMultiCommand {
    readonly name: string;

    readonly multi = true;

    readonly type = CommandType.COMMAND;

    readonly priority: number = 0;

    private readonly _implementations: Array<{ command: IMultiCommand; injector: Injector }> = [];

    constructor(readonly id: string) {
        this.name = id;
    }

    registerImplementation(implementation: IMultiCommand, injector: Injector): IDisposable {
        const registry = { command: implementation, injector };
        this._implementations.push(registry);
        this._implementations.sort((a, b) => b.command.priority - a.command.priority);

        return toDisposable(() => {
            const index = this._implementations.indexOf(registry);
            this._implementations.splice(index, 1);

            implementation.onDispose?.();
        });
    }

    hasImplementations(): boolean {
        return this._implementations.length > 0;
    }

    handler = async (accessor: IAccessor, params?: object | undefined): Promise<boolean> => {
        if (!this._implementations.length) {
            return false;
        }

        const logService = accessor.get(ILogService);
        const contextService = accessor.get(IContextService);

        for (const item of this._implementations) {
            const preconditions = item.command.preconditions;
            if (preconditions?.(contextService)) {
                logService.log(`[MultiCommand]`, `executing implementation "${item.command.name}".`);
                const result = await item.injector.invoke(item.command.handler, params);
                if (result) {
                    return true;
                }
            }
        }

        return false;
    };
}
