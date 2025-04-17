/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IKeyValue } from '../../shared/types';

import { findLast, remove } from '../../common/array';
import { createIdentifier, Inject, Injector } from '../../common/di';
import { CustomCommandExecutionError } from '../../common/error';
import { sequence, sequenceAsync } from '../../common/sequence';
import { Disposable, DisposableCollection, toDisposable } from '../../shared/lifecycle';
import { IContextService } from '../context/context.service';
import { ILogService } from '../log/log.service';

/**
 * The type of a command.
 */
export enum CommandType {
    /**
     * Responsible for creating, orchestrating, and executing MUTATION or OPERATION according to specific business
     * logic. For example, a delete row COMMAND will generate a delete row MUTATION, an insert row MUTATION for undo,
     * and a set cell content MUTATION.
     */
    COMMAND = 0,
    /**
     * OPERATION is the change made to data that is not saved to snapshot, without conflict resolution,
     * such as modifying scroll position, modifying sidebar state, etc.
     */
    OPERATION = 1,
    /**
     * MUTATION is the change made to the data saved to snapshot, such as inserting rows and columns,
     * modifying cell content, modifying filter ranges, etc. If you want to add collaborative editing capabilities to
     * Univer, it is the smallest unit of conflict resolution.
     */
    MUTATION = 2,
}

/**
 * In Univer, all data modifications need to be executed through commands. The command-based approach can better track
 * changes in values, implement functions such as undo, redo, and collaborative editing, handle complex associated
 * logic between functions, etc.
 *
 * All commands should implements this interface or related {@link IMutation} or {@link IOperation} interface, and
 * should be registered in the {@link ICommandService}.
 */
export interface ICommand<P extends object = object, R = boolean> {
    /**
     * Identifier of the command. It should be unique in the application unless it is a {@link IMultiCommand}.
     * Its pattern should be like `<namespace>.<type>.<command-name>`.
     *
     * @example { id: 'sheet.command.set-selection-frozen' }
     */
    readonly id: string;
    /**
     * The type of the command.
     */
    readonly type: CommandType;
    /**
     * The handler of the command.
     * @param accessor The accessor to the dependency injection container.
     * @param params Params of the command. Params should be serializable.
     * @param options Options of the command.
     * @returns The result of the command. By default it should be a boolean value which indicates the command is
     * executed successfully or not.
     */
    handler(accessor: IAccessor, params?: P, options?: IExecutionOptions): Promise<R> | R;
}

/**
 * A command that may have multiple implementations. Each implementation should have different `priority`
 * and `preconditions` callback to determine which implementation should be executed.
 */
export interface IMultiCommand<P extends object = object, R = boolean> extends ICommand<P, R> {
    /** The name of the multi command. It should be unique in the application. */
    name: string;
    /** @ignore */
    multi: true;
    /** Priority of this implementation. Implementation with higher priority will be checked first. */
    priority: number;
    /**
     * A callback function that tells `ICommandService` if this implementation should be executed.
     * @param contextService The context service.
     * @returns If this implementation should be executed, return `true`, otherwise return `false`.
     */
    preconditions?: (contextService: IContextService) => boolean;
}

export interface IMutationCommonParams {
    /**
     * It is used to indicate which {@link CommandType.COMMAND} triggers the mutation.
     */
    trigger?: string;
}

/**
 * {@link CommandType.MUTATION} should implement this interface.
 */
export interface IMutation<P extends object, R = boolean> extends ICommand<P, R> {
    type: CommandType.MUTATION;
    /**
     * The handler of the mutation.
     * @param accessor The accessor to the dependency injection container.
     * @param params Params of the mutation. Params should be serializable.
     * @returns The result of the mutation. By default it should be a boolean value which indicates the mutation is
     * executed successfully or not.
     */
    handler(accessor: IAccessor, params: P): R;
}

/**
 * {@link CommandType.OPERATION} should implement this interface.
 */
export interface IOperation<P extends object = object, R = boolean> extends ICommand<P, R> {
    type: CommandType.OPERATION;
    /**
     * The handler of the operation.
     * @param accessor The accessor to the dependency injection container.
     * @param params Params of the operation. Params should be serializable.
     * @returns The result of the operation. By default it should be a boolean value which indicates the operation is
     * executed successfully or not.
     */
    handler(accessor: IAccessor, params: P): R;
}

/**
 * This object represents an execution of a command.
 */
export interface ICommandInfo<T extends object = object> {
    /**
     * Id of the command being executed.
     */
    id: string;
    /**
     * Type of the command.
     */
    type?: CommandType;
    /**
     * Parameters of this execution.
     */
    params?: T;
}

/** This object represents an execution of a {@link CommandType.MUTATION} */
export interface IMutationInfo<T extends object = object> {
    id: string;
    type?: CommandType.MUTATION;
    params: T;
}

/** This object represents an execution of a {@link CommandType.OPERATION} */
export interface IOperationInfo<T extends object = object> {
    id: string;
    type?: CommandType.OPERATION;
    params: T;
}

export interface IExecutionOptions {
    /** This mutation should only be executed on the local machine, and should not be synced to replicas. */
    onlyLocal?: boolean;
    /** This command is from collaboration peers. */
    fromCollab?: boolean;
    /** @deprecated */
    fromChangeset?: boolean;
    [key: PropertyKey]: string | number | boolean | undefined;
}

export type CommandListener = (commandInfo: Readonly<ICommandInfo>, options?: IExecutionOptions) => void;

/**
 * The identifier of the command service.
 */
export const ICommandService = createIdentifier<ICommandService>('univer.core.command-service');
/**
 * The service to register and execute commands.
 */
export interface ICommandService {
    /**
     * Check if a command is already registered at the current command service.
     * @param commandId The id of the command.
     * @returns If the command is registered, return `true`, otherwise return `false`.
     */
    hasCommand(commandId: string): boolean;
    /**
     * Register a command to the command service.
     * @param command The command to register.
     */
    registerCommand(command: ICommand<object, unknown>): IDisposable;
    /**
     * Unregister a command from the command service.
     * @param commandId The id of the command to unregister.
     */
    unregisterCommand(commandId: string): void;
    /**
     * Register a command as a multi command.
     * @param command The command to register as a multi command.
     */
    registerMultipleCommand(command: ICommand<object, unknown>): IDisposable;
    /**
     * Execute a command with the given id and parameters.
     * @param id Identifier of the command.
     * @param params Parameters of this execution.
     * @param options Options of this execution.
     * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
     */
    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R>;
    /**
     * Execute a command with the given id and parameters synchronously.
     * @param id Identifier of the command.
     * @param params Parameters of this execution.
     * @param options Options of this execution.
     * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
     */
    syncExecuteCommand<P extends object = object, R = boolean>(id: string, params?: P, options?: IExecutionOptions): R;
    /**
     * Register a callback function that will be executed after a command is executed.
     * @param listener
     */
    onCommandExecuted(listener: CommandListener): IDisposable;
    /**
     * Register a callback function that will be executed before a command is executed.
     * @param listener
     */
    beforeCommandExecuted(listener: CommandListener): IDisposable;
}

class CommandRegistry {
    private readonly _commands = new Map<string, ICommand>();
    private readonly _commandTypes = new Map<string, CommandType>();

    registerCommand(command: ICommand): IDisposable {
        if (this._commands.has(command.id)) {
            throw new Error(`[CommandRegistry]: command "${command.id}" has been registered before.`);
        }

        this._commands.set(command.id, command);
        this._commandTypes.set(command.id, command.type);

        return toDisposable(() => {
            this.unregisterCommand(command.id);
        });
    }

    unregisterCommand(commandId: string): void {
        this._commands.delete(commandId);
        this._commandTypes.delete(commandId);
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
        this.registerCommand(NilCommand);
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
        return this._commandRegistry.registerCommand(command);
    }

    unregisterCommand(commandId: string): void {
        this._commandRegistry.unregisterCommand(commandId);
        this._multiCommandDisposables.get(commandId)?.dispose();
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
            if (error instanceof CustomCommandExecutionError) {
                // If need custom logic, can add it here
                return false as R;
            } else {
                throw error;
            }
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
            if (error instanceof CustomCommandExecutionError) {
                return false as R;
            } else {
                throw error;
            }
        }
    }

    private _pushCommandExecutionStack(stackItem: ICommandExecutionStackItem): IDisposable {
        this._commandExecutionStack.push(stackItem);
        return toDisposable(() => remove(this._commandExecutionStack, stackItem));
    }

    private _registerMultiCommand(command: ICommand): IDisposable {
        // compose a multi command and register it
        const registry = this._commandRegistry.getCommand(command.id);
        let multiCommand: MultiCommand;

        if (!registry) {
            multiCommand = new MultiCommand(command.id);

            const disposableCollection = new DisposableCollection();
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
