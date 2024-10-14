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

import type { IDisposable } from '../common/di';
import type { CommandListener, IExecutionOptions } from '../services/command/command.service';
import type { LifecycleStages } from '../services/lifecycle/lifecycle';
import { Inject, Injector } from '../common/di';
import { ICommandService } from '../services/command/command.service';
import { IUniverInstanceService } from '../services/instance/instance.service';
import { LifecycleService } from '../services/lifecycle/lifecycle.service';
import { RedoCommand, UndoCommand } from '../services/undoredo/undoredo.service';
import { Univer } from '../univer';

/**
 * `FBase` is a base class for all facade classes.
 * It provides a way to extend classes with static and instance methods.
 * The `_initialize` as a special method that will be called after the constructor. You should never call it directly.
 */
export abstract class FBase {
    private static _constructorQueue: Array<() => void> = [];

    constructor() {
        FBase._constructorQueue.forEach((fn) => {
            fn();
        });
    }

    _initialize() { }

    static extend(source: any): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name === '_initialize') {
                FBase._constructorQueue.push(
                    source.prototype._initialize.bind(this)
                );
            } else if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }
}

export class FUniver extends FBase {
    /**
     * Create an FUniver instance, if the injector is not provided, it will create a new Univer instance.
     *
     * @static
     *
     * @param {Univer | Injector} wrapped - The Univer instance or injector instance.
     * @returns {FUniver} - The FUniver instance.
     */
    static newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        return injector.createInstance(FUniver);
    }

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    /**
     * Dispose the UniverSheet by the `unitId`. The UniverSheet would be unload from the application.
     *
     * @param unitId The unit id of the UniverSheet.
     * @returns Whether the Univer instance is disposed successfully.
     */
    disposeUnit(unitId: string): boolean {
        return this._univerInstanceService.disposeUnit(unitId);
    }

    /**
     * Get the current lifecycle stage.
     *
     * @returns {LifecycleStages} - The current lifecycle stage.
     */
    getCurrentLifecycleStage(): LifecycleStages {
        const lifecycleService = this._injector.get(LifecycleService);
        return lifecycleService.stage;
    }

    /**
     * Undo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} undo result
     */
    undo(): Promise<boolean> {
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo an editing on the currently focused document.
     *
     * @returns {Promise<boolean>} redo result
     */
    redo(): Promise<boolean> {
        return this._commandService.executeCommand(RedoCommand.id);
    }

    /**
     * Register a callback that will be triggered before invoking a command.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Register a callback that will be triggered when a command is invoked.
     *
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

    /**
     * Execute command
     *
     * @param {string} id Command ID
     * @param {object} params Command parameters
     * @param {IExecutionOptions} options Command execution options
     * @returns {Promise<R>} Command execution result
     */
    executeCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }
}
