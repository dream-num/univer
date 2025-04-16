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

import type { IDisposable, IUndoRedoItem } from '@univerjs/core';
import { ICommandService, Inject, Injector, IUndoRedoService, LifecycleService, LifecycleStages, RedoCommand, toDisposable, UndoCommand } from '@univerjs/core';
import { filter } from 'rxjs';
import { FBase } from './f-base';

/**
 * @hideconstructor
 */
export class FHooks extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        super();
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
     */
    onStarting(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Starting)).subscribe(callback));
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
     */
    onReady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Ready)).subscribe(callback));
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
     */
    onRendered(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Rendered)).subscribe(callback));
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {})` as instead
     */
    onSteady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Steady)).subscribe(callback));
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeUndo, (event) => {})` as instead
     */
    onBeforeUndo(callback: (action: IUndoRedoItem) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === UndoCommand.id) {
                const undoredoService = this._injector.get(IUndoRedoService);
                const action = undoredoService.pitchTopUndoElement();
                if (action) {
                    callback(action);
                }
            }
        });
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Undo, (event) => {})` as instead
     */
    onUndo(callback: (action: IUndoRedoItem) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === UndoCommand.id) {
                const undoredoService = this._injector.get(IUndoRedoService);
                const action = undoredoService.pitchTopUndoElement();
                if (action) {
                    callback(action);
                }
            }
        });
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeRedo, (event) => {})` as instead
     */
    onBeforeRedo(callback: (action: IUndoRedoItem) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.beforeCommandExecuted((command) => {
            if (command.id === RedoCommand.id) {
                const undoredoService = this._injector.get(IUndoRedoService);
                const action = undoredoService.pitchTopRedoElement();
                if (action) {
                    callback(action);
                }
            }
        });
    }

    /**
     * @param callback
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Redo, (event) => {})` as instead
     */
    onRedo(callback: (action: IUndoRedoItem) => void): IDisposable {
        const commandService = this._injector.get(ICommandService);

        return commandService.onCommandExecuted((command) => {
            if (command.id === RedoCommand.id) {
                const undoredoService = this._injector.get(IUndoRedoService);
                const action = undoredoService.pitchTopRedoElement();
                if (action) {
                    callback(action);
                }
            }
        });
    }
}
