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

import type { DocumentDataModel, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IRenderContext, IRenderModule, ITextRangeWithStyle } from '@univerjs/engine-render';
import { JSONX, RxDisposable } from '@univerjs/core';

interface ICacheParams {
    undoCache: IRichTextEditingMutationParams[];
    redoCache: IRichTextEditingMutationParams[];
}

// Used to record all intermediate states when typing with IME,
// and then output the entire undo and redo operations.
export class DocIMEInputManagerService extends RxDisposable implements IRenderModule {
    private _previousActiveRange: Nullable<ITextRangeWithStyle> = null;

    private _previousDocRanges: ITextRangeWithStyle[] = [];

    private _compositionRange: Nullable<ITextRangeWithStyle> = null;

    private _previousSelectionOptions: Nullable<{ [key: string]: boolean }> = null;

    private _undoMutationParamsCache: IRichTextEditingMutationParams[] = [];

    private _redoMutationParamsCache: IRichTextEditingMutationParams[] = [];

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>
    ) {
        super();
    }

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
        this._compositionRange = range;
    }

    getCompositionRange(): Nullable<ITextRangeWithStyle> {
        return this._compositionRange;
    }

    setCompositionRange(range: Nullable<ITextRangeWithStyle>): void {
        this._compositionRange = range;
    }

    getPreviousDocRanges(): ITextRangeWithStyle[] {
        return this._previousDocRanges;
    }

    setPreviousDocRanges(ranges: ITextRangeWithStyle[]): void {
        this._previousDocRanges = ranges;
    }

    getPreviousSelectionOptions(): Nullable<{ [key: string]: boolean }> {
        return this._previousSelectionOptions;
    }

    setPreviousSelectionOptions(options: Nullable<{ [key: string]: boolean }>): void {
        this._previousSelectionOptions = options;
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
        const firstUndoParams = this._undoMutationParamsCache[0];
        const lastRedoParams = this._redoMutationParamsCache.at(-1);

        const undoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            actions: this._undoMutationParamsCache.reverse().reduce((acc, cur) => {
                return JSONX.compose(acc, cur.actions);
            }, null as JSONXActions),
            textRanges: [], // Add empty array, will never use, just fix type error
            segmentId: firstUndoParams.segmentId,
        };

        const redoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            actions: this._redoMutationParamsCache.reduce((acc, cur) => {
                return JSONX.compose(acc, cur.actions);
            }, null as JSONXActions),
            textRanges: lastRedoParams?.textRanges ?? [],
            segmentId: lastRedoParams?.segmentId,
            options: lastRedoParams?.options,
            isEditing: lastRedoParams?.isEditing,
        };

        return {
            redoMutationParams,
            undoMutationParams,
            previousActiveRange: this._previousActiveRange,
            previousDocRanges: this._previousDocRanges,
            previousSelectionOptions: this._previousSelectionOptions,
        };
    }

    override dispose(): void {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];

        this._previousActiveRange = null;
        this._previousDocRanges = [];
        this._compositionRange = null;
        this._previousSelectionOptions = null;
    }
}
