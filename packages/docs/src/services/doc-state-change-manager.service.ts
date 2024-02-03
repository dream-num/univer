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
import { IUndoRedoService, RedoCommandId, RxDisposable, UndoCommandId } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

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

    private _redoCacheStack: IDocStateChangeParams[] = [];
    private _undoCacheStack: IDocStateChangeParams[] = [];

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
        this._pushHistory(changeState);
        this._docStateChange$.next(changeState);
    }

    private _pushHistory(changeState: IDocStateChangeParams) {
        const undoRedoService = this._undoRedoService;
        const { trigger, unitId, commandId, redoState, undoState, noHistory } = changeState;

        if (trigger === RedoCommandId || trigger === UndoCommandId || noHistory) {
            return;
        }

        const redoParams: IRichTextEditingMutationParams = {
            unitId,
            actions: redoState.actions,
            textRanges: redoState.textRanges,
        };

        const undoParams: IRichTextEditingMutationParams = {
            unitId,
            actions: undoState.actions,
            textRanges: undoState.textRanges,
        };

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: [{ id: commandId, params: undoParams }],
            redoMutations: [{ id: commandId, params: redoParams }],
        });
    }
}
