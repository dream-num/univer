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
import type { IUndoRedoItem } from '../services/undoredo/undoredo.service';
import { filter } from 'rxjs';
import { Inject, Injector } from '../common/di';
import { ICommandService } from '../services/command/command.service';
import { LifecycleStages } from '../services/lifecycle/lifecycle';
import { LifecycleService } from '../services/lifecycle/lifecycle.service';
import { IUndoRedoService, RedoCommand, UndoCommand } from '../services/undoredo/undoredo.service';
import { toDisposable } from '../shared/lifecycle';
import { FBase } from './f-base';

export class FHooks extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        super();
    }

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifecycleChanged)` as instead
     */
    onStarting(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Starting)).subscribe(callback));
    }

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifecycleChanged)` as instead
     */
    onReady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Ready)).subscribe(callback));
    }

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifecycleChanged, () => {})` as instead
     */
    onRendered(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Rendered)).subscribe(callback));
    }

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.LifecycleChanged, () => {})` as instead
     */
    onSteady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Steady)).subscribe(callback));
    }

    /**
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeUndo, () => {})` as instead
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
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Undo, () => {})` as instead
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
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.BeforeRedo, () => {})` as instead
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
     * @deprecated use `univerAPI.addEvent(univerAPI.Event.Redo, () => {})` as instead
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
