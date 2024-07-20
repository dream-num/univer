/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, IDisposable } from '../../common/di';
import { createIdentifier, Inject, Injector } from '../../common/di';

import { findLast, remove } from '../../common/array';
import { sequence, sequenceAsync } from '../../common/sequence';
import { Disposable, DisposableCollection, toDisposable } from '../../shared/lifecycle';
import type { IKeyValue } from '../../shared/types';
import { IContextService } from '../context/context.service';
import { ILogService } from '../log/log.service';

export enum CommandType {
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

    handler(accessor: IAccessor, params?: P, options?: IExecutionOptions): Promise<R> | R;

    /**
     * When this command is unregistered, this function would be called.
     *
     * @deprecated
     */
    onDispose?: () => void;
}

export interface IMultiCommand<P extends object = object, R = boolean> extends ICommand<P, R> {
    name: string;
    multi: true;
    priority: number;

    preconditions?: (contextService: IContextService) => boolean;
}

export interface IMutationCommonParams {
    trigger?: string;
}

/**
 * Mutation would change the model of Univer applications.
 */
export interface IMutation<P extends object, R = boolean> extends ICommand<P, R> {
    type: CommandType.MUTATION;

    /**
     * Mutations must be a sync process.
     * @param accessor
     * @param params Params of the mutation. A mutation must has params.
     */
    handler(accessor: IAccessor, params: P): R;
}

/**
 * Operation would change the state of Univer applications. State should only be in memory and does not
 * require conflicting resolution.
 */
export interface IOperation<P extends object = object, R = boolean> extends ICommand<P, R> {
    type: CommandType.OPERATION;

    /**
     * Operations must be a sync process.
     * @param accessor
     * @param params Params of the operation. A operation must has params.
     */
    handler(accessor: IAccessor, params: P): R;
}

/**
 * The command info, only a command id and responsible params
 */
export interface ICommandInfo<T extends object = object> {
    id: string;

    type?: CommandType;

    /**
     * Args should be serializable.
     */
    params?: T;
}

export interface IMutationInfo<T extends object = object> {
    id: string;
    type?: CommandType.MUTATION;
    params: T;
}

export interface IOperationInfo<T extends object = object> {
    id: string;
    type?: CommandType.OPERATION;
    params: T;
}

export interface IExecutionOptions {
    /** This mutation should only be executed on the local machine, and not synced to replicas. */
    onlyLocal?: boolean;

    /** This command is from collaboration peers. */
    fromCollab?: boolean;

    fromChangeset?: boolean;

    [key: PropertyKey]: string | number | boolean | undefined;
}

export type CommandListener = (commandInfo: Readonly<ICommandInfo>, options?: IExecutionOptions) => void;

export interface ICommandService {
    /**
     * Check if a command is already registered at the current command service.
     *
     * @param commandId The id of the command.
     */
    hasCommand(commandId: string): boolean;

    registerCommand(command: ICommand<object, unknown>): IDisposable;

    registerMultipleCommand(command: ICommand<object, unknown>): IDisposable;

    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R>;

    hasCommand(id: string): boolean;

    syncExecuteCommand<P extends object = object, R = boolean>(id: string, params?: P, options?: IExecutionOptions): R;

    /**
     * Register a callback function that will be executed after a command is executed.
     */
    onCommandExecuted(listener: CommandListener): IDisposable;

    /**
     * Register a callback function that will be executed before a command is executed.
     * @param listener
     */
    beforeCommandExecuted(listener: CommandListener): IDisposable;
}

export const ICommandService = createIdentifier<ICommandService>('anywhere.command-service');

/**
 * The registry of commands.
 */
export class CommandRegistry {
    private readonly _commands = new Map<string, ICommand>();
    private readonly _commandTypes = new Map<string, CommandType>();

    registerCommand(command: ICommand): IDisposable {
        if (this._commands.has(command.id)) {
            throw new Error(`[CommandRegistry]: command "${command.id}" has been registered before.`);
        }

        this._commands.set(command.id, command);
        this._commandTypes.set(command.id, command.type);

        return toDisposable(() => {
            this._commands.delete(command.id);
            this._commandTypes.delete(command.id);

            command.onDispose?.();
        });
    }

    hasCommand(id: string): boolean {
        return this._commands.has(id);
    }

    getCommand(id: string): [ICommand] | null {
        if (!this._commands.has(id)) {
            return null;
        }

        return [this._commands.get(id)!];
    }

    getCommandType(id: string): CommandType | undefined {
        return this._commandTypes.get(id);
    }
}

interface ICommandExecutionStackItem extends ICommandInfo { }

export const NilCommand: ICommand = {
    id: 'nil',
    type: CommandType.COMMAND,
    handler: () => true,
};

export class CommandService extends Disposable implements ICommandService {
    protected readonly _commandRegistry: CommandRegistry;

    private readonly _beforeCommandExecutionListeners: CommandListener[] = [];
    private readonly _commandExecutedListeners: CommandListener[] = [];

    private _multiCommandDisposables = new Map<string, IDisposable>();

    private _commandExecutingLevel = 0;

    private _commandExecutionStack: ICommandExecutionStackItem[] = [];

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._commandRegistry = new CommandRegistry();
        this._registerCommand(NilCommand);
    }

    override dispose(): void {
        super.dispose();

        this._commandExecutedListeners.length = 0;
        this._beforeCommandExecutionListeners.length = 0;
    }

    hasCommand(commandId: string): boolean {
        return this._commandRegistry.hasCommand(commandId);
    }

    registerCommand(command: ICommand): IDisposable {
        return this._registerCommand(command);
    }

    registerMultipleCommand(command: ICommand): IDisposable {
        return this._registerMultiCommand(command);
    }

    beforeCommandExecuted(listener: CommandListener): IDisposable {
        if (this._beforeCommandExecutionListeners.indexOf(listener) === -1) {
            this._beforeCommandExecutionListeners.push(listener);

            return toDisposable(() => {
                const index = this._beforeCommandExecutionListeners.indexOf(listener);
                this._beforeCommandExecutionListeners.splice(index, 1);
            });
        }

        throw new Error('[CommandService]: could not add a listener twice.');
    }

    onCommandExecuted(listener: (commandInfo: ICommandInfo) => void): IDisposable {
        if (this._commandExecutedListeners.indexOf(listener) === -1) {
            this._commandExecutedListeners.push(listener);

            return toDisposable(() => {
                const index = this._commandExecutedListeners.indexOf(listener);
                this._commandExecutedListeners.splice(index, 1);
            });
        }

        throw new Error('[CommandService]: could not add a listener twice.');
    }

    async executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> {
        try {
            const item = this._commandRegistry.getCommand(id);
            if (item) {
                const [command] = item;
                const commandInfo: ICommandInfo = {
                    id: command.id,
                    type: command.type,
                    params,
                };

                const stackItemDisposable = this._pushCommandExecutionStack(commandInfo);

                this._beforeCommandExecutionListeners.forEach((listener) => listener(commandInfo, options));
                const result = await this._execute<P, R>(command as ICommand<P, R>, params, options);
                this._commandExecutedListeners.forEach((listener) => listener(commandInfo, options));

                stackItemDisposable.dispose();

                return result;
            }
            throw new Error(`[CommandService]: command "${id}" is not registered.`);
        } catch (error) {
            this._logService.error(error);
            throw error;
        }
    }

    syncExecuteCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P | undefined,
        options?: IExecutionOptions
    ): R {
        try {
            const item = this._commandRegistry.getCommand(id);
            if (item) {
                const [command] = item;
                const commandInfo: ICommandInfo = {
                    id: command.id,
                    type: command.type,
                    params,
                };

                // If the executed command is of type `Mutation`, we should add a trigger params,
                // whose value is the command's ID that triggers the mutation.
                if (command.type === CommandType.MUTATION) {
                    const triggerCommand = findLast(
                        this._commandExecutionStack,
                        (item) => item.type === CommandType.COMMAND
                    );
                    if (triggerCommand) {
                        commandInfo.params = commandInfo.params ?? {};
                        (commandInfo.params as IMutationCommonParams).trigger = triggerCommand.id;
                    }
                }

                const stackItemDisposable = this._pushCommandExecutionStack(commandInfo);

                this._beforeCommandExecutionListeners.forEach((listener) => listener(commandInfo, options));
                const result = this._syncExecute<P, R>(command as ICommand<P, R>, params, options);
                this._commandExecutedListeners.forEach((listener) => listener(commandInfo, options));

                stackItemDisposable.dispose();

                return result;
            }

            throw new Error(`[CommandService]: command "${id}" is not registered.`);
        } catch (error) {
            this._logService.error(error);
            throw error;
        }
    }

    private _pushCommandExecutionStack(stackItem: ICommandExecutionStackItem): IDisposable {
        this._commandExecutionStack.push(stackItem);
        return toDisposable(() => remove(this._commandExecutionStack, stackItem));
    }

    private _registerCommand(command: ICommand): IDisposable {
        return this._commandRegistry.registerCommand(command);
    }

    private _registerMultiCommand(command: ICommand): IDisposable {
        // compose a multi command and register it
        const registry = this._commandRegistry.getCommand(command.id);
        let multiCommand: MultiCommand;

        if (!registry) {
            const disposableCollection = new DisposableCollection();
            multiCommand = new MultiCommand(command.id);
            disposableCollection.add(this._commandRegistry.registerCommand(multiCommand));
            disposableCollection.add(
                toDisposable(() => {
                    this._multiCommandDisposables.delete(command.id);
                })
            );

            this._multiCommandDisposables.set(command.id, disposableCollection);
        } else {
            if ((registry[0] as IKeyValue).multi !== true) {
                throw new Error('Command has registered as a single command.');
            } else {
                multiCommand = registry[0] as MultiCommand;
            }
        }

        const implementationDisposable = multiCommand.registerImplementation(command as IMultiCommand);
        return toDisposable(() => {
            implementationDisposable.dispose();
            if (!multiCommand.hasImplementations()) {
                this._multiCommandDisposables.get(command.id)?.dispose();
            }
        });
    }

    private async _execute<P extends object, R = boolean>(command: ICommand<P, R>, params?: P, options?: IExecutionOptions): Promise<R> {
        this._logService.debug(
            '[CommandService]',
            `${'|-'.repeat(Math.max(this._commandExecutingLevel, 0))}executing command "${command.id}"`
        );

        this._commandExecutingLevel++;
        let result: R | boolean;
        try {
            result = await this._injector.invoke(command.handler, params, options);
            this._commandExecutingLevel--;
        } catch (e) {
            result = false;
            this._commandExecutingLevel = 0;
            throw e;
        }

        return result;
    }

    private _syncExecute<P extends object, R = boolean>(command: ICommand<P, R>, params?: P, options?: IExecutionOptions): R {
        this._logService.debug(
            '[CommandService]',
            `${'|-'.repeat(Math.max(0, this._commandExecutingLevel))}executing command "${command.id}".`
        );

        this._commandExecutingLevel++;
        let result: R | boolean;
        try {
            result = this._injector.invoke(command.handler, params, options) as R;
            if (result instanceof Promise) {
                throw new TypeError('[CommandService]: Command handler should not return a promise.');
            }

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

    private readonly _implementations: Array<{ command: IMultiCommand }> = [];

    constructor(readonly id: string) {
        this.name = id;
    }

    registerImplementation(implementation: IMultiCommand): IDisposable {
        const registry = { command: implementation };
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
        const injector = accessor.get(Injector);

        for (const item of this._implementations) {
            const preconditions = item.command.preconditions;
            if (!preconditions || (preconditions && preconditions(contextService))) {
                logService.debug('[MultiCommand]', `executing implementation "${item.command.name}".`);
                const result = await injector.invoke(item.command.handler, params);
                if (result) {
                    return true;
                }
            }
        }

        return false;
    };
}

export function sequenceExecute(tasks: ICommandInfo[], commandService: ICommandService, options?: IExecutionOptions) {
    const taskFns = tasks.map((task) => () => commandService.syncExecuteCommand(task.id, task.params, options));
    return sequence(taskFns);
}

export function sequenceExecuteAsync(
    tasks: ICommandInfo[],
    commandService: ICommandService,
    options?: IExecutionOptions
) {
    const promises = tasks.map((task) => () => commandService.executeCommand(task.id, task.params, options));
    return sequenceAsync(promises);
}
