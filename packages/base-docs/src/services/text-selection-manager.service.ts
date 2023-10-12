import { ISelectionStyle, ITextSelectionRangeWithStyle } from '@univerjs/base-render';
import { ISelectionCell, Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export const NORMAL_TEXT_SELECTION_PLUGIN_NAME = 'normalTextSelectionPluginName';

export interface ITextSelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
}

export interface ITextSelectionManagerInsertParam extends ITextSelectionManagerSearchParam {
    textRanges: ITextSelectionRangeWithStyle[];
}

//{ [pluginName: string]: { [unitId: string]: ITextSelectionRangeWithStyle[] } }
export type ITextSelectionInfo = Map<string, Map<string, ITextSelectionRangeWithStyle[]>>;

/**
 * This service is for selection.
 */
export class TextSelectionManagerService implements IDisposable {
    private readonly _textSelectionInfo: ITextSelectionInfo = new Map();

    private _currentSelection: Nullable<ITextSelectionManagerSearchParam> = null;

    private readonly _textSelectionInfo$ = new BehaviorSubject<Nullable<ITextSelectionRangeWithStyle[]>>(null);

    readonly textSelectionInfo$ = this._textSelectionInfo$.asObservable();

    reset() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection = {
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId: this._currentSelection?.unitId,
        };
        this._textSelectionInfo.clear();

        this.refresh(this._currentSelection);
    }

    resetPlugin() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection.pluginName = NORMAL_TEXT_SELECTION_PLUGIN_NAME;

        this.refresh(this._currentSelection);
    }

    dispose(): void {
        this._textSelectionInfo$.complete();
    }

    refreshSelection() {
        if (this._currentSelection == null) {
            return;
        }
        this.refresh(this._currentSelection);
    }

    setCurrentSelection(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;

        this.refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ITextSelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getTextSelectionInfo(): Readonly<ITextSelectionInfo> {
        return this._textSelectionInfo;
    }

    getTextRangesByParam(
        param: Nullable<ITextSelectionManagerSearchParam>
    ): Readonly<Nullable<ITextSelectionRangeWithStyle[]>> {
        return this._getTextRanges(param);
    }

    getSelections(): Readonly<Nullable<ITextSelectionRangeWithStyle[]>> {
        return this._getTextRanges(this._currentSelection);
    }

    getFirst(): Readonly<Nullable<ITextSelectionRangeWithStyle>> {
        return this._getFirstByParam(this._currentSelection);
    }

    getLast(): Readonly<Nullable<ITextSelectionRangeWithStyle & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._currentSelection) as Readonly<
            Nullable<ITextSelectionRangeWithStyle & { primary: ISelectionCell }>
        >;
    }

    add(textRanges: ITextSelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            textRanges,
        });
    }

    replace(textRanges: ITextSelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            textRanges,
        });
        this.refresh(this._currentSelection);
    }

    replaceWithNoRefresh(textRanges: ITextSelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            textRanges,
        });
    }

    clear(): void {
        if (this._currentSelection == null) {
            return;
        }
        this._clearByParam(this._currentSelection);
    }

    remove(index: number): void {
        if (this._currentSelection == null) {
            return;
        }

        this._removeByParam(index, this._currentSelection);
    }

    createDefaultAutoFillSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: {},
            hasAutoFill: true,
        };
    }

    createCopyPasteSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: {},
            hasAutoFill: false,
        };
    }

    createDefaultSelection(): ISelectionStyle {
        return {
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            widgets: { tr: true, tl: true, br: true, bl: true },
            hasAutoFill: false,
        };
    }

    private _getTextRanges(param: Nullable<ITextSelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId } = param;
        return this._textSelectionInfo.get(pluginName)?.get(unitId);
    }

    private refresh(param: ITextSelectionManagerSearchParam): void {
        this._textSelectionInfo$.next(this._getTextRanges(param));
    }

    private _getFirstByParam(
        param: Nullable<ITextSelectionManagerSearchParam>
    ): Readonly<Nullable<ITextSelectionRangeWithStyle>> {
        const textRange = this._getTextRanges(param);

        return textRange?.[0];
    }

    private _getLastByParam(
        param: Nullable<ITextSelectionManagerSearchParam>
    ): Readonly<Nullable<ITextSelectionRangeWithStyle>> {
        const textRange = this._getTextRanges(param);

        return textRange?.[textRange.length - 1];
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

        this.refresh({ pluginName, unitId });
    }

    private _replaceByParam(insertParam: ITextSelectionManagerInsertParam) {
        const { pluginName, unitId, textRanges } = insertParam;

        if (!this._textSelectionInfo.has(pluginName)) {
            this._textSelectionInfo.set(pluginName, new Map());
        }

        const unitTextRange = this._textSelectionInfo.get(pluginName)!;

        if (!unitTextRange.has(unitId)) {
            unitTextRange.set(unitId, textRanges);
        } else {
            const OldTextRanges = unitTextRange.get(unitId)!;
            OldTextRanges.splice(0, OldTextRanges.length, ...textRanges);
        }

        // this.refresh({ pluginName, unitId, sheetId });
    }

    private _clearByParam(param: ITextSelectionManagerSearchParam): void {
        const textRange = this._getTextRanges(param);

        textRange?.splice(0);

        this.refresh(param);
    }

    private _removeByParam(index: number, param: ITextSelectionManagerSearchParam): void {
        const textRange = this._getTextRanges(param);

        textRange?.splice(index, 1);

        this.refresh(param);
    }
}
