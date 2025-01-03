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
import type { IEventParamConfig } from './f-event';
import { Inject, Injector } from '../common/di';
import { Registry } from '../common/registry';
import { ICommandService } from '../services/command/command.service';
import { IUniverInstanceService } from '../services/instance/instance.service';
import { LifecycleService } from '../services/lifecycle/lifecycle.service';
import { RedoCommand, UndoCommand } from '../services/undoredo/undoredo.service';
import { ColorBuilder, toDisposable } from '../shared';
import { Univer } from '../univer';
import { createFBaseInitialable } from './f-base';
import { FBlob } from './f-blob';
import { FEnum } from './f-enum';
import { FEventName } from './f-event';
import { FHooks } from './f-hooks';
import { FUserManager } from './f-usermanager';

const FBaseInitialable = createFBaseInitialable();

export class FUniver extends FBaseInitialable {
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

    private _eventRegistry: Map<string, Registry<(param: any) => void>> = new Map();

    private _ensureEventRegistry(event: string) {
        if (!this._eventRegistry.has(event)) {
            this._eventRegistry.set(event, new Registry());
        }

        return this._eventRegistry.get(event)!;
    }

    constructor(
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LifecycleService) protected readonly _lifecycleService: LifecycleService
    ) {
        super(_injector);

        this.disposeWithMe(
            this._lifecycleService.lifecycle$.subscribe((stage) => {
                this.fireEvent(this.Event.LifeCycleChanged, { stage });
            })
        );

        this._injector.onDispose(() => {
            this.dispose();
        });
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
     * @deprecated use `addEvent(univerAPI.event.BeforeCommandExecute, () => {})` instead.
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
     * @deprecated use `addEvent(univerAPI.event.CommandExecuted, () => {})` instead.
     * @param {CommandListener} callback The callback.
     * @returns {IDisposable} The disposable instance.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command, options?: IExecutionOptions) => {
            callback(command, options);
        });
    }

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
    ): Promise<R> {
        return this._commandService.executeCommand(id, params, options);
    }

    /**
     * Execute a command with the given id and parameters synchronously.
     * @param id Identifier of the command.
     * @param params Parameters of this execution.
     * @param options Options of this execution.
     * @returns The result of the execution. It is a boolean value by default which indicates the command is executed.
     */
    syncExecuteCommand<P extends object = object, R = boolean>(
        id: string,
        params?: P,
        options?: IExecutionOptions
    ): R {
        return this._commandService.syncExecuteCommand(id, params, options);
    }

    /**
     * Get hooks.
     * @deprecated use `addEvent` instead.
     * @returns {FHooks} FHooks instance
     */
    getHooks(): FHooks {
        return this._injector.createInstance(FHooks);
    }

    /**
     * Create a new blob.
     *
     * @returns {FBlob} The new blob instance
     * @example
     * ```ts
     * const blob = UniverApi.newBlob();
     * ```
     */
    newBlob(): FBlob {
        return this._injector.createInstance(FBlob);
    }

    newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    get Enum() {
        return FEnum.get();
    }

    get Event() {
        return FEventName.get();
    }

    /**
     * Add an event listener
     * @param event key of event
     * @param callback callback when event triggered
     * @returns {Disposable} The Disposable instance, for remove the listener
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.UnitCreated, (params) => {
     *     console.log('unit created', params);
     * });
     * ```
     */
    addEvent(event: keyof IEventParamConfig, callback: (params: IEventParamConfig[typeof event]) => void) {
        this._ensureEventRegistry(event).add(callback);
        return toDisposable(() => this._ensureEventRegistry(event).delete(callback));
    }

    /**
     * Fire an event, used in internal only.
     * @param event {string} key of event
     * @param params {any} parmas of event
     * @returns {boolean} should cancel
     * @example
     * ```ts
     * this.fireEvent(univerAPI.event.UnitCreated, params);
     * ```
     */
    protected fireEvent<T extends keyof IEventParamConfig>(event: T, params: IEventParamConfig[T]) {
        this._eventRegistry.get(event)?.getData().forEach((callback) => {
            callback(params);
        });

        return params.cancel;
    }

    getUserManager(): FUserManager {
        return this._injector.createInstance(FUserManager);
    }
}

