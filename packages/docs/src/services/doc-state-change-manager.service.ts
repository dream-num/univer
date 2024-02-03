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

import type { Nullable, TextXAction } from '@univerjs/core';
import { IUndoRedoService, RedoCommandId, RxDisposable, TextX, UndoCommandId } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { DeleteCommand, InsertCommand } from '../commands/commands/core-editing.command';

interface IDocChangeState {
    actions: TextXAction[];
    textRanges: Nullable<ITextRangeWithStyle[]>;
}

export interface IDocStateChangeParams {
    commandId: string;
    unitId: string;
    trigger: Nullable<string>;
    redoState: IDocChangeState;
    undoState: IDocChangeState;
    noHistory?: boolean;
}

const HISTORY_DELAY = 300;

// This class sends out state-changing events, what is the state, the data model,
// and the cursor & selection, and this class mainly serves the History(undo/redo) module and
// the collaboration module.
export class DocStateChangeManagerService extends RxDisposable {
    private readonly _docStateChange$ = new BehaviorSubject<Nullable<IDocStateChangeParams>>(null);
    readonly docStateChange$ = this._docStateChange$.asObservable();

    private _stateCache: Map<string, IDocStateChangeParams[]> = new Map();
    private _timer: Nullable<ReturnType<typeof setTimeout>> = null;

    constructor(
        @Inject(IUndoRedoService) private _undoRedoService: IUndoRedoService
    ) {
        super();
    }

    setChangeState(changeState: IDocStateChangeParams) {
        const { trigger } = changeState;
        // No need to emit stateChange when the mutation is from collaboration.
        if (trigger == null) {
            return;
        }
        this._cacheChangeState(changeState);
        // Mutations by user or historyService need collaboration.
        this._docStateChange$.next(changeState);
    }

    private _cacheChangeState(changeState: IDocStateChangeParams) {
        const { trigger, unitId, noHistory } = changeState;

        if (trigger === RedoCommandId || trigger === UndoCommandId || noHistory) {
            return;
        }

        if (this._stateCache.has(unitId)) {
            const cacheStates = this._stateCache.get(unitId);

            cacheStates?.push(changeState);
        } else {
            this._stateCache.set(unitId, [changeState]);
        }

        if (trigger === InsertCommand.id || trigger === DeleteCommand.id) {
            if (this._timer) {
                clearTimeout(this._timer);
            }
            this._timer = setTimeout(() => {
                this._pushHistory(unitId);
            }, HISTORY_DELAY);
        } else {
            this._pushHistory(unitId);
        }
    }

    private _pushHistory(unitId: string) {
        const undoRedoService = this._undoRedoService;
        const cacheStates = this._stateCache.get(unitId);

        if (!Array.isArray(cacheStates) || cacheStates.length === 0) {
            return;
        }

        const len = cacheStates.length;
        // Use the first state.commandId as commandId, because we will only have one core mutation.
        const commandId = cacheStates[0].commandId;

        const redoParams: IRichTextEditingMutationParams = {
            unitId,
            actions: cacheStates.reduce((acc, cur) => {
                return TextX.compose(acc, cur.redoState.actions);
            }, [] as TextXAction[]),
            textRanges: cacheStates[len - 1].redoState.textRanges,
        };

        const undoParams: IRichTextEditingMutationParams = {
            unitId,
            // Always need to put undoParams after redoParams, because `reverse` will change the `cacheStates` order.
            actions: cacheStates.reverse().reduce((acc, cur) => {
                return TextX.compose(acc, cur.undoState.actions);
            }, [] as TextXAction[]),
            textRanges: cacheStates[0].undoState.textRanges,
        };

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: [{ id: commandId, params: undoParams }],
            redoMutations: [{ id: commandId, params: redoParams }],
        });

        // Empty the cacheState.
        cacheStates.length = 0;
    }
}
