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

import type { JSONXActions, Nullable } from '@univerjs/core';
import { ICommandService, IUndoRedoService, IUniverInstanceService, JSONX, RedoCommandId, RxDisposable, UndoCommandId } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { DeleteCommand, InsertCommand } from '../commands/commands/core-editing.command';

interface IDocChangeState {
    actions: JSONXActions;
    textRanges: Nullable<ITextRangeWithStyle[]>;
}

export interface IDocStateChangeParams {
    commandId: string;
    unitId: string;
    segmentId?: string;
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
        @Inject(IUndoRedoService) private _undoRedoService: IUndoRedoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initialize();
    }

    setChangeState(changeState: IDocStateChangeParams) {
        const { trigger, noHistory } = changeState;
        // No need to emit stateChange when the mutation is from collaboration.
        if (trigger == null) {
            return;
        }
        this._cacheChangeState(changeState);
        // Mutations by user or historyService need collaboration.
        if (!noHistory) {
            this._docStateChange$.next(changeState);
        }
    }

    private _initialize() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command) => {
                if (command.id === UndoCommandId || command.id === RedoCommandId) {
                    const univerDoc = this._univerInstanceService.getCurrentUniverDocInstance();
                    if (univerDoc == null) {
                        return;
                    }

                    const unitId = univerDoc.getUnitId();

                    this._pushHistory(unitId);
                }
            })
        );
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
        // Use the first state.commandId as commandId, because we will only have one core mutation type.
        const commandId = cacheStates[0].commandId;

        const firstState = cacheStates[0];
        const lastState = cacheStates[len - 1];

        const redoParams: IRichTextEditingMutationParams = {
            unitId,
            actions: cacheStates.reduce((acc, cur) => JSONX.compose(acc, cur.redoState.actions), null as JSONXActions),
            textRanges: lastState.redoState.textRanges,
        };

        const undoParams: IRichTextEditingMutationParams = {
            unitId,
            // Always need to put undoParams after redoParams, because `reverse` will change the `cacheStates` order.
            actions: cacheStates.reverse().reduce((acc, cur) => JSONX.compose(acc, cur.undoState.actions), null as JSONXActions),
            textRanges: firstState.undoState.textRanges,
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
