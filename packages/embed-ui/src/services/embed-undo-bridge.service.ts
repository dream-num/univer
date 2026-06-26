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

import type { IUndoRedoItem } from '@univerjs/core';
import { Inject, IUndoRedoService } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';

export interface IEmbedUndoBridgeResult {
    stackUnitId: string;
    routedToHost: boolean;
}

export class EmbedUndoBridgeService {
    constructor(
        @Inject(EmbedFocusOwnerService)
        private readonly _focusOwnerService: EmbedFocusOwnerService,
        @IUndoRedoService
        private readonly _undoRedoService: IUndoRedoService
    ) {
        // noop
    }

    pushUndoRedoForChild(item: IUndoRedoItem): IEmbedUndoBridgeResult {
        const stackUnitId = this.resolveStackUnitId(item.unitID);
        this._undoRedoService.pushUndoRedo({
            ...item,
            unitID: stackUnitId,
        });

        return {
            stackUnitId,
            routedToHost: stackUnitId !== item.unitID,
        };
    }

    resolveStackUnitId(childUnitId: string): string {
        const focusOwner = this._focusOwnerService.getFocusOwner();
        if (!focusOwner || focusOwner.childUnitId !== childUnitId) {
            return childUnitId;
        }

        return focusOwner.hostUnitId;
    }
}
