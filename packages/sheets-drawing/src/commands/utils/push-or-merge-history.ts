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

import type { IUndoRedoItem, IUndoRedoService } from '@univerjs/core';

export type DrawingHistoryMergeMode = 'replace' | 'append';

export function pushOrMergeDrawingHistory(
    undoRedoService: Pick<IUndoRedoService, 'pitchTopUndoElement' | 'pushUndoRedo'>,
    item: IUndoRedoItem,
    historyMergeId?: string,
    mode: DrawingHistoryMergeMode = 'replace'
): void {
    if (!historyMergeId) {
        undoRedoService.pushUndoRedo(item);
        return;
    }

    const top = undoRedoService.pitchTopUndoElement();
    if (top?.unitID === item.unitID && top.id === historyMergeId) {
        if (mode === 'append') {
            top.redoMutations.push(...item.redoMutations);
            top.undoMutations.unshift(...item.undoMutations);
        } else {
            top.redoMutations = item.redoMutations;
        }
        return;
    }

    undoRedoService.pushUndoRedo({ ...item, id: historyMergeId });
}
