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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type {
    IDocSelectionInnerParam,
    IRectRangeWithStyle,
    ISuccinctDocRangeParam,
    ITextRangeWithStyle,
} from '@univerjs/engine-render';
import { ICommandService, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';

interface IDocSelectionManagerSearchParam {
    unitId: string;
    subUnitId: string;
}

export interface IRefreshSelectionParam extends IDocSelectionManagerSearchParam {
    docRanges: ISuccinctDocRangeParam[];
    isEditing: boolean;
    options?: {
        [key: string]: boolean;
    };
}

export interface ITextSelectionManagerInsertParam extends IDocSelectionManagerSearchParam, IDocSelectionInnerParam {}

type ITextSelectionInfo = Map<string, Map<string, IDocSelectionInnerParam>>;

/**
 * This service is for text selection.
 */
export class DocSelectionManagerService extends RxDisposable {
    private _currentSelection: Nullable<IDocSelectionManagerSearchParam> = null;

    private readonly _textSelectionInfo: ITextSelectionInfo = new Map();

    private readonly _textSelection$ = new Subject<ITextSelectionManagerInsertParam>();
    readonly textSelection$ = this._textSelection$.asObservable();

    private readonly _refreshSelection$ = new BehaviorSubject<Nullable<IRefreshSelectionParam>>(null);
    readonly refreshSelection$ = this._refreshSelection$.asObservable();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._listenCurrentUnit();
    }

    private _listenCurrentUnit() {
        this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe((documentModel) => {
                if (documentModel == null) {
                    return;
                }

                const unitId = documentModel.getUnitId();

                this._setCurrentSelectionNotRefresh({
                    unitId,
                    subUnitId: unitId,
                });
            });
    }

    __getCurrentSelection() {
        return this._currentSelection;
    }

    getSelectionInfo(params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection) {
        return this._getTextRanges(params);
    }

    refreshSelection(params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection) {
        if (params == null) {
            return;
        }

        this._refresh(params);
    }

    // **Only used in test case** because this does not go through the render layer.
    __TEST_ONLY_setCurrentSelection(param: IDocSelectionManagerSearchParam) {
        this._currentSelection = param;

        this._refresh(param);
    }

    getTextRanges(
        params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection
    ): Readonly<Nullable<ITextRangeWithStyle[]>> {
        return this._getTextRanges(params)?.textRanges;
    }

    getRectRanges(
        params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection
    ): Readonly<Nullable<IRectRangeWithStyle[]>> {
        return this._getTextRanges(params)?.rectRanges;
    }

    getDocRanges(
        params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection
    ) {
        const textRanges = this.getTextRanges(params) ?? [];
        const rectRanges = this.getRectRanges(params) ?? [];
        // Sort ranges by startOffset in ascending order.
        const allRanges = [...textRanges, ...rectRanges]
            .filter((range) => range.startOffset != null && range.endOffset != null)
            .sort((a, b) => {
                if (a.startOffset! > b.startOffset!) {
                    return 1;
                } else if (a.startOffset! < b.startOffset!) {
                    return -1;
                } else {
                    return 0;
                }
            });

        return allRanges;
    }

    getActiveTextRange(): Nullable<ITextRangeWithStyle> {
        const selectionInfo = this._getTextRanges(this._currentSelection);
        if (selectionInfo == null) {
            return;
        }

        const { textRanges } = selectionInfo;

        return textRanges.find((textRange) => textRange.isActive);
    }

    /**
     *
     * @deprecated
     */
    getActiveRectRange(): Nullable<ITextRangeWithStyle> {
        const selectionInfo = this._getTextRanges(this._currentSelection);
        if (selectionInfo == null) {
            return;
        }

        const { rectRanges } = selectionInfo;
        return rectRanges.find((rectRange) => rectRange.isActive);
    }

    // **Only used in test case** because this does not go through the render layer.
    __TEST_ONLY_add(textRanges: ITextRangeWithStyle[], isEditing = true) {
        if (this._currentSelection == null) {
            return;
        }

        this._addByParam({
            ...this._currentSelection,
            textRanges,
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            isEditing,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE, // mock style.
        });
    }

    // Use to replace the current editor selection.
    /**
     * @deprecated pls use replaceDocRanges.
     */
    replaceTextRanges(
        docRanges: ISuccinctDocRangeParam[],
        isEditing = true,
        options?: { [key: string]: boolean }
    ) {
        return this.replaceDocRanges(
            docRanges,
            this._currentSelection,
            isEditing,
            options
        );
    }

    replaceDocRanges(
        docRanges: ISuccinctDocRangeParam[],
        params: Nullable<IDocSelectionManagerSearchParam> = this._currentSelection,
        isEditing = true,
        options?: { [key: string]: boolean }
    ) {
        if (params == null) {
            return;
        }

        // Remove all textRanges.
        // Add new textRanges.
        const { unitId, subUnitId } = params;

        this._refreshSelection$.next({
            unitId,
            subUnitId,
            docRanges,
            isEditing,
            options,
        });
    }

    // Only use in doc-selection-render.controller.ts
    __replaceTextRangesWithNoRefresh(textSelectionInfo: IDocSelectionInnerParam, search: IDocSelectionManagerSearchParam) {
        if (this._currentSelection == null) {
            return;
        }

        const params = {
            ...textSelectionInfo,
            ...search,
        };

        // Store the textSelectionInfo.
        this._replaceByParam(params);

        // Broadcast textSelection changes, this should be used within the application.
        this._textSelection$.next(params);

        const { unitId, subUnitId, segmentId, style, textRanges, rectRanges, isEditing } = params;

        const ranges = [...textRanges, ...rectRanges]
            .filter((range) => range.startOffset != null && range.endOffset != null)
            .sort((a, b) => {
                if (a.startOffset! > b.startOffset!) {
                    return 1;
                } else if (a.startOffset! < b.startOffset!) {
                    return -1;
                } else {
                    return 0;
                }
            });

        // For menu status.
        this._commandService.executeCommand(SetTextSelectionsOperation.id, {
            unitId,
            subUnitId,
            segmentId,
            style,
            isEditing,
            ranges,
        });
    }

    override dispose(): void {
        this._textSelection$.complete();
    }

    private _setCurrentSelectionNotRefresh(param: IDocSelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    private _getTextRanges(param: Nullable<IDocSelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }

        const { unitId, subUnitId = '' } = param;

        return this._textSelectionInfo.get(unitId)?.get(subUnitId);
    }

    private _refresh(param: IDocSelectionManagerSearchParam): void {
        const allTextSelectionInfo = this._getTextRanges(param);

        if (allTextSelectionInfo == null) {
            return;
        }

        const { textRanges, rectRanges } = allTextSelectionInfo;

        const docRanges = [...textRanges, ...rectRanges];

        const { unitId, subUnitId } = param;

        this._refreshSelection$.next({
            unitId,
            subUnitId,
            docRanges,
            isEditing: false,
        });
    }

    private _replaceByParam(insertParam: ITextSelectionManagerInsertParam) {
        const { unitId, subUnitId, ...selectionInsertParam } = insertParam;

        if (!this._textSelectionInfo.has(unitId)) {
            this._textSelectionInfo.set(unitId, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(unitId)!;

        unitTextRange.set(subUnitId, { ...selectionInsertParam });
    }

    private _addByParam(insertParam: ITextSelectionManagerInsertParam): void {
        const { unitId, subUnitId, ...selectionInsertParam } = insertParam;

        if (!this._textSelectionInfo.has(unitId)) {
            this._textSelectionInfo.set(unitId, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(unitId)!;

        if (!unitTextRange.has(subUnitId)) {
            unitTextRange.set(subUnitId, { ...selectionInsertParam });
        } else {
            const OldTextRanges = unitTextRange.get(subUnitId)!;
            OldTextRanges.textRanges.push(...insertParam.textRanges);
        }
    }
}
