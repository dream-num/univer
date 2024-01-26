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

import { ActionType, type Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';

import { getRetainAndDeleteFromReplace } from '../basics/retain-delete-params';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

// Used to record all intermediate states when typing with IME,
// and then output the entire undo and redo operations.
export class IMEInputManagerService implements IDisposable {
    private _previousActiveRange: Nullable<ITextRangeWithStyle> = null;
    private _undoMutationParamsCache: IRichTextEditingMutationParams[] = [];
    private _redoMutationParamsCache: IRichTextEditingMutationParams[] = [];

    clearUndoRedoMutationParamsCache() {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
    }

    setActiveRange(range: Nullable<ITextRangeWithStyle>) {
        this._previousActiveRange = range;
    }

    pushUndoRedoMutationParams(undoParams: IRichTextEditingMutationParams, redoParams: IRichTextEditingMutationParams) {
        this._undoMutationParamsCache.push(undoParams);
        this._redoMutationParamsCache.push(redoParams);
    }

    fetchComposedUndoRedoMutationParams(newText: string) {
        if (this._undoMutationParamsCache.length === 0 || this._previousActiveRange == null) {
            return null;
        }

        const { unitId } = this._undoMutationParamsCache[0];
        const { segmentId, startOffset, collapsed } = this._previousActiveRange;

        const undoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: [],
        };

        const redoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: [],
        };

        if (collapsed) {
            undoMutationParams.mutations.push({
                t: ActionType.RETAIN,
                len: startOffset,
                segmentId,
            });
            redoMutationParams.mutations.push({
                t: ActionType.RETAIN,
                len: startOffset,
                segmentId,
            });
        } else {
            if (startOffset > 0) {
                undoMutationParams.mutations.push({
                    t: ActionType.RETAIN,
                    len: startOffset,
                    segmentId,
                });
            }

            undoMutationParams.mutations.push(this._undoMutationParamsCache[0].mutations.find((m) => m.t === ActionType.INSERT)!);

            redoMutationParams.mutations.push(...getRetainAndDeleteFromReplace(this._previousActiveRange, segmentId));
        }

        if (newText.length) {
            undoMutationParams.mutations.push({
                t: ActionType.DELETE,
                len: newText.length,
                line: 0,
                segmentId,
            });

            redoMutationParams.mutations.push({
                t: ActionType.INSERT,
                body: {
                    dataStream: newText,
                },
                len: newText.length,
                line: 0,
                segmentId,
            });
        }

        return { redoMutationParams, undoMutationParams, previousActiveRange: this._previousActiveRange };
    }

    dispose(): void {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
        this._previousActiveRange = null;
    }
}
