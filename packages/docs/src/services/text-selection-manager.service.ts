/**
 * Copyright 2023 DreamNum Inc.
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

import type { ISelectionCell, Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle, TextRange } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { NORMAL_TEXT_SELECTION_PLUGIN_NAME } from '../basics/docs-view-key';

export interface ITextSelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
}

export interface ITextSelectionManagerInsertParam extends ITextSelectionManagerSearchParam {
    textRanges: TextRange[];
}

export type ITextSelectionInfo = Map<string, Map<string, TextRange[]>>;

/**
 * This service is for selection.
 */
export class TextSelectionManagerService implements IDisposable {
    private readonly _textSelectionInfo: ITextSelectionInfo = new Map();

    private _currentSelection: Nullable<ITextSelectionManagerSearchParam> = null;

    private readonly _textSelectionInfo$ = new BehaviorSubject<Nullable<ITextRangeWithStyle[]>>(null);

    readonly textSelectionInfo$ = this._textSelectionInfo$.asObservable();

    getCurrentSelection() {
        return this._currentSelection;
    }

    dispose(): void {
        this._textSelectionInfo$.complete();
    }

    refreshSelection() {
        if (this._currentSelection == null) {
            return;
        }

        this._refresh(this._currentSelection);
    }

    setCurrentSelection(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;
        this._refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getTextSelectionInfo(): Readonly<ITextSelectionInfo> {
        return this._textSelectionInfo;
    }

    getTextRangesByParam(param: Nullable<ITextSelectionManagerSearchParam>): Readonly<Nullable<TextRange[]>> {
        return this._getTextRanges(param);
    }

    getSelections(): Readonly<Nullable<TextRange[]>> {
        return this._getTextRanges(this._currentSelection);
    }

    getFirst(): Readonly<Nullable<TextRange>> {
        return this._getFirstByParam(this._currentSelection);
    }

    getLast(): Readonly<Nullable<TextRange & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._currentSelection) as Readonly<
            Nullable<TextRange & { primary: ISelectionCell }>
        >;
    }

    // Only used in tests.
    add(textRanges: ITextRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            textRanges: textRanges as TextRange[],
        });
    }

    replaceTextRanges(textRanges: ITextRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }

        this._textSelectionInfo$.next(textRanges);
    }

    replaceTextRangesWithNoRefresh(textRanges: TextRange[]) {
        if (this._currentSelection == null) {
            return;
        }

        this._replaceByParam({
            ...this._currentSelection,
            textRanges,
        });
    }

    private _addByParam(insertParam: ITextSelectionManagerInsertParam): void {
        const { pluginName, unitId, textRanges } = insertParam;

        if (!this._textSelectionInfo.has(pluginName)) {
            this._textSelectionInfo.set(pluginName, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(pluginName)!;

        if (!unitTextRange.has(unitId)) {
            unitTextRange.set(unitId, [...textRanges]);
        } else {
            const OldTextRanges = unitTextRange.get(unitId)!;
            OldTextRanges.push(...textRanges);
        }

        this._refresh({ pluginName, unitId });
    }

    // It is will being opened when it needs to be used
    private _clear(): void {
        if (this._currentSelection == null) {
            return;
        }

        this._clearByParam(this._currentSelection);
    }

    // It is will being opened when it needs to be used
    private _remove(index: number): void {
        if (this._currentSelection == null) {
            return;
        }

        this._removeByParam(index, this._currentSelection);
    }

    // It is will being opened when it needs to be used
    private _reset() {
        if (this._currentSelection == null) {
            return;
        }

        this._currentSelection = {
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId: this._currentSelection?.unitId,
        };

        this._textSelectionInfo.clear();

        this._refresh(this._currentSelection);
    }

    // It is will being opened when it needs to be used
    private _resetPlugin() {
        if (this._currentSelection == null) {
            return;
        }

        this._currentSelection.pluginName = NORMAL_TEXT_SELECTION_PLUGIN_NAME;

        this._refresh(this._currentSelection);
    }

    private _getTextRanges(param: Nullable<ITextSelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }

        const { pluginName, unitId } = param;

        return this._textSelectionInfo.get(pluginName)?.get(unitId);
    }

    private _refresh(param: ITextSelectionManagerSearchParam): void {
        const allTextRanges = this._getTextRanges(param) ?? [];

        this._textSelectionInfo$.next(
            allTextRanges.map((textRange) => {
                const startOffset = textRange.startOffset!;
                const endOffset = textRange.endOffset!;
                const collapsed = textRange.collapsed!;
                const style = textRange.style!;

                return {
                    startOffset,
                    endOffset,
                    collapsed,
                    style,
                };
            })
        );
    }

    private _getFirstByParam(param: Nullable<ITextSelectionManagerSearchParam>): Readonly<Nullable<TextRange>> {
        const textRange = this._getTextRanges(param);

        return textRange?.[0];
    }

    private _getLastByParam(param: Nullable<ITextSelectionManagerSearchParam>): Readonly<Nullable<TextRange>> {
        const textRange = this._getTextRanges(param);

        return textRange?.[textRange.length - 1];
    }

    private _replaceByParam(insertParam: ITextSelectionManagerInsertParam) {
        const { pluginName, unitId, textRanges } = insertParam;

        if (!this._textSelectionInfo.has(pluginName)) {
            this._textSelectionInfo.set(pluginName, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(pluginName)!;

        unitTextRange.set(unitId, textRanges);
    }

    private _clearByParam(param: ITextSelectionManagerSearchParam): void {
        const textRange = this._getTextRanges(param);

        textRange?.splice(0);

        this._refresh(param);
    }

    private _removeByParam(index: number, param: ITextSelectionManagerSearchParam): void {
        const textRange = this._getTextRanges(param);

        textRange?.splice(index, 1);

        this._refresh(param);
    }
}
