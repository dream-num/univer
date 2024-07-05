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

import type { Nullable } from '@univerjs/core';
import { ICommandService, RxDisposable } from '@univerjs/core';
import type {
    INodePosition,
    ISuccinctTextRangeParam,
    ITextRangeWithStyle,
    ITextSelectionInnerParam,
    ITextSelectionStyle,
    RANGE_DIRECTION,
    TextRange,
} from '@univerjs/engine-render';
import { ITextSelectionRenderManager, NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { BehaviorSubject, takeUntil } from 'rxjs';

import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';

interface ITextSelectionManagerSearchParam {
    unitId: string;
    subUnitId: string;
}

export interface ITextActiveRange {
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
    startNodePosition: Nullable<INodePosition>;
    endNodePosition: Nullable<INodePosition>;
    direction: RANGE_DIRECTION;
    segmentId: string;
    style: ITextSelectionStyle;
    segmentPage: number;
}

interface ITextSelectionManagerInsertParam extends ITextSelectionManagerSearchParam, ITextSelectionInnerParam {}

type ITextSelectionInfo = Map<string, Map<string, ITextSelectionInnerParam>>;

export function serializeTextRange(textRange: TextRange): ITextRangeWithStyle {
    const { startOffset, endOffset, collapsed } = textRange;

    const serializedTextRange: ITextRangeWithStyle = {
        startOffset: startOffset!,
        endOffset: endOffset!,
        collapsed,
    };

    if (typeof textRange.isActive === 'function') {
        serializedTextRange.isActive = textRange.isActive();
    }

    return serializedTextRange;
}

/**
 * This service is for text selection.
 */
export class TextSelectionManagerService extends RxDisposable {
    private _currentSelection: Nullable<ITextSelectionManagerSearchParam> = null;

    private readonly _textSelectionInfo: ITextSelectionInfo = new Map();

    private readonly _textSelection$ = new BehaviorSubject<Nullable<ITextSelectionManagerInsertParam>>(null);
    readonly textSelection$ = this._textSelection$.asObservable();

    constructor(
        @ITextSelectionRenderManager private _textSelectionRenderManager: ITextSelectionRenderManager,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._syncSelectionFromRenderService();
    }

    getCurrentSelection() {
        return this._currentSelection;
    }

    // Get textRanges, style, segmentId
    getCurrentSelectionInfo() {
        return this._getTextRanges(this._currentSelection);
    }

    override dispose(): void {
        this._textSelection$.complete();
    }

    refreshSelection() {
        if (this._currentSelection == null) {
            return;
        }

        this._refresh(this._currentSelection);
    }

    // **Only used in test case** because this does not go through the render layer.
    setCurrentSelection(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;
        this._refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getSelections(): Readonly<Nullable<TextRange[]>> {
        return this._getTextRanges(this._currentSelection)?.textRanges;
    }

    getActiveTextRange(): Nullable<TextRange> {
        const selectionInfo = this._getTextRanges(this._currentSelection);
        if (selectionInfo == null) {
            return;
        }

        const { textRanges } = selectionInfo;
        return textRanges.find((textRange) => textRange.isActive());
    }

    getActiveRange(): Nullable<ITextActiveRange> {
        const selectionInfo = this._getTextRanges(this._currentSelection);
        if (selectionInfo == null) {
            return;
        }

        const { textRanges, segmentId, style, segmentPage } = selectionInfo;
        const activeTextRange = textRanges.find((textRange) => textRange.isActive());

        if (activeTextRange == null) {
            return null;
        }

        const { startOffset, endOffset, collapsed, startNodePosition, endNodePosition, direction } = activeTextRange;

        if (startOffset == null || endOffset == null) {
            return null;
        }

        return {
            startOffset,
            endOffset,
            collapsed,
            startNodePosition,
            endNodePosition,
            direction,
            segmentId,
            segmentPage,
            style,
        };
    }

    // **Only used in test case** because this does not go through the render layer.
    add(textRanges: ISuccinctTextRangeParam[], isEditing = true) {
        if (this._currentSelection == null) {
            return;
        }

        this._addByParam({
            ...this._currentSelection,
            textRanges: textRanges as TextRange[],
            segmentId: '',
            segmentPage: -1,
            isEditing,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE, // mock style.
        });
    }

    replaceTextRanges(textRanges: ISuccinctTextRangeParam[], isEditing = true) {
        if (this._currentSelection == null) {
            return;
        }

        // Remove all textRanges.
        this._textSelectionRenderManager.removeAllTextRanges();
        // Add new textRanges.
        this._textSelectionRenderManager.addTextRanges(textRanges, isEditing);
    }

    // All textRanges should be synchronized from the render layer.
    private _syncSelectionFromRenderService() {
        this._textSelectionRenderManager.textSelectionInner$
            .pipe(takeUntil(this.dispose$))
            .subscribe((params) => {
                if (params == null) {
                    return;
                }

                this._replaceTextRangesWithNoRefresh(params);
            });
    }

    private _replaceTextRangesWithNoRefresh(textSelectionInfo: ITextSelectionInnerParam) {
        if (this._currentSelection == null) {
            return;
        }

        const params = {
            ...this._currentSelection,
            ...textSelectionInfo,
        };

        // Store the textSelectionInfo.
        this._replaceByParam(params);

        // Broadcast textSelection changes, this should be used within the application.
        this._textSelection$.next(params);

        const { unitId, subUnitId, segmentId, style, textRanges, isEditing } = params;

        // For menu status.
        this._commandService.executeCommand(SetTextSelectionsOperation.id, {
            unitId,
            subUnitId,
            segmentId,
            style,
            isEditing,
            ranges: textRanges.map(serializeTextRange),
        });
    }

    private _getTextRanges(param: Nullable<ITextSelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }

        const { unitId, subUnitId = '' } = param;

        return this._textSelectionInfo.get(unitId)?.get(subUnitId);
    }

    private _refresh(param: ITextSelectionManagerSearchParam): void {
        const allTextSelectionInfo = this._getTextRanges(param);

        // Remove all textRanges.
        this._textSelectionRenderManager.removeAllTextRanges();

        if (
            allTextSelectionInfo &&
            Array.isArray(allTextSelectionInfo.textRanges) &&
            allTextSelectionInfo.textRanges.length
        ) {
            this._textSelectionRenderManager.addTextRanges(allTextSelectionInfo.textRanges.map(serializeTextRange));
        }
    }

    private _replaceByParam(insertParam: ITextSelectionManagerInsertParam) {
        const { unitId, subUnitId, style, segmentId, textRanges, isEditing, segmentPage } = insertParam;

        if (!this._textSelectionInfo.has(unitId)) {
            this._textSelectionInfo.set(unitId, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(unitId)!;

        unitTextRange.set(subUnitId, { textRanges, style, segmentId, isEditing, segmentPage });
    }

    private _addByParam(insertParam: ITextSelectionManagerInsertParam): void {
        const { unitId, subUnitId, textRanges, style, segmentId, isEditing, segmentPage } = insertParam;

        if (!this._textSelectionInfo.has(unitId)) {
            this._textSelectionInfo.set(unitId, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(unitId)!;

        if (!unitTextRange.has(subUnitId)) {
            unitTextRange.set(subUnitId, { textRanges, style, segmentId, isEditing, segmentPage });
        } else {
            const OldTextRanges = unitTextRange.get(subUnitId)!;
            OldTextRanges.textRanges.push(...textRanges);
        }
    }
}
