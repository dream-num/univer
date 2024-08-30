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

import type { IDisposable, IUndoRedoItem } from '@univerjs/core';
import { ICommandService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import type { FHooks } from '../f-hooks';

export const FUndoRedoHooks = {
    /**
     * Hook that fires before an undo operation is executed.
     * @param callback Function to be called when the event is triggered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    beforeUndo(this: FHooks, callback: (action: IUndoRedoItem) => void): IDisposable {
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
    },
    /**
     * Hook that fires after an undo operation is executed.
     * @param callback Function to be called when the event is triggered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    afterUndo(this: FHooks, callback: (action: IUndoRedoItem) => void): IDisposable {
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
    },
    /**
     * Hook that fires before a redo operation is executed.
     * @param callback Function to be called when the event is triggered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    beforeRedo(this: FHooks, callback: (action: IUndoRedoItem) => void): IDisposable {
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
    },
    /**
     * Hook that fires after a redo operation is executed.
     * @param callback Function to be called when the event is triggered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    afterRedo(this: FHooks, callback: (action: IUndoRedoItem) => void): IDisposable {
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
    },
};
