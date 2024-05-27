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

import { JSONX } from '@univerjs/core';
import type { JSONXActions, Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';

import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

interface ICacheParams {
    undoCache: IRichTextEditingMutationParams[];
    redoCache: IRichTextEditingMutationParams[];
}

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

    getUndoRedoMutationParamsCache() {
        return {
            undoCache: this._undoMutationParamsCache,
            redoCache: this._redoMutationParamsCache,
        };
    }

    setUndoRedoMutationParamsCache({ undoCache = [], redoCache = [] }: ICacheParams) {
        this._undoMutationParamsCache = undoCache;
        this._redoMutationParamsCache = redoCache;
    }

    getActiveRange(): Nullable<ITextRangeWithStyle> {
        return this._previousActiveRange;
    }

    setActiveRange(range: Nullable<ITextRangeWithStyle>) {
        this._previousActiveRange = range;
    }

    pushUndoRedoMutationParams(undoParams: IRichTextEditingMutationParams, redoParams: IRichTextEditingMutationParams) {
        this._undoMutationParamsCache.push(undoParams);
        this._redoMutationParamsCache.push(redoParams);
    }

    fetchComposedUndoRedoMutationParams() {
        if (this._undoMutationParamsCache.length === 0 || this._previousActiveRange == null || this._redoMutationParamsCache.length === 0) {
            return null;
        }

        const { unitId } = this._undoMutationParamsCache[0];

        const undoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            actions: this._undoMutationParamsCache.reverse().reduce((acc, cur) => {
                return JSONX.compose(acc, cur.actions);
            }, null as JSONXActions),
            textRanges: [], // Add empty array, will never use, just fix type error
        };

        const redoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            actions: this._redoMutationParamsCache.reduce((acc, cur) => {
                return JSONX.compose(acc, cur.actions);
            }, null as JSONXActions),
            textRanges: [], // Add empty array, will never use, just fix type error
        };

        return { redoMutationParams, undoMutationParams, previousActiveRange: this._previousActiveRange };
    }

    dispose(): void {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
        this._previousActiveRange = null;
    }
}
