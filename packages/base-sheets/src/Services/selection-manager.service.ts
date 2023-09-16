import { ISelectionRangeWithStyle, ISelectionStyle, mergeCellHandler, NORMAL_SELECTION_PLUGIN_STYLE } from '@univerjs/base-render';
import { IRangeData, makeCellRangeToRangeData, Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export const NORMAL_SELECTION_PLUGIN_NAME = 'normalSelectionPluginName';

export interface ISelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
    sheetId: string;
}

export interface ISelectionManagerInsertParam extends ISelectionManagerSearchParam {
    selectionDatas: ISelectionRangeWithStyle[];
}

//{ [pluginName: string]: { [unitId: string]: { [sheetId: string]: ISelectionData[] } } }
export type ISelectionInfo = Map<string, Map<string, Map<string, ISelectionRangeWithStyle[]>>>;

/**
 * This service is for managing settings border style status.
 */
export class SelectionManagerService implements IDisposable {
    private readonly _selectionInfo: ISelectionInfo = new Map();

    private _currentSelection: Nullable<ISelectionManagerSearchParam> = null;

    private _currentStyle: ISelectionStyle = NORMAL_SELECTION_PLUGIN_STYLE;

    private _isSelectionEnabled: boolean = true;

    private readonly _selectionInfo$ = new BehaviorSubject<Nullable<ISelectionRangeWithStyle[]>>(null);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly selectionInfo$ = this._selectionInfo$.asObservable();

    get isSelectionEnabled() {
        return this._isSelectionEnabled;
    }

    get currentStyle() {
        return this._currentStyle;
    }

    enableSelection() {
        this._isSelectionEnabled = true;
    }

    disableSelection() {
        this._isSelectionEnabled = false;

        if (this._currentSelection == null) {
            return;
        }

        this._selectionInfo.set(this._currentSelection.pluginName, new Map());

        this.refresh(this._currentSelection);
    }

    resetPlugin() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection.pluginName = NORMAL_SELECTION_PLUGIN_NAME;

        this.refresh(this._currentSelection);
    }

    setCurrentStyle(style: ISelectionStyle = NORMAL_SELECTION_PLUGIN_STYLE) {
        this._currentStyle = style;
    }

    dispose(): void {
        this._selectionInfo$.complete();
        // this._currentSelection$.complete();
    }

    setCurrentSelection(param: ISelectionManagerSearchParam) {
        this._currentSelection = param;

        this.refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ISelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getSelectionInfo(): Readonly<ISelectionInfo> {
        return this._selectionInfo;
    }

    getSelectionDatasByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle[]>> {
        return this._getSelectionDatas(param);
    }

    getSelectionDatas(): Readonly<Nullable<ISelectionRangeWithStyle[]>> {
        return this._getSelectionDatas(this._currentSelection);
    }

    getRangeDatas(): Nullable<IRangeData[]> {
        const selectionDataList = this.getSelectionDatas();
        if (selectionDataList == null) {
            return;
        }
        return selectionDataList.map((selectionData: ISelectionRangeWithStyle) => {
            const rangeData = selectionData.rangeData;
            const { startRow, startColumn, endRow, endColumn } = rangeData;
            return {
                startRow,
                startColumn,
                endRow,
                endColumn,
            };
        });
    }

    getFirst(): Readonly<Nullable<ISelectionRangeWithStyle>> {
        return this._getFirstByParam(this._currentSelection);
    }

    getLast(): Readonly<Nullable<ISelectionRangeWithStyle>> {
        return this._getLastByParam(this._currentSelection);
    }

    add(selectionDatas: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            selectionDatas,
        });
    }

    replace(selectionDatas: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDatas,
        });
        this.refresh(this._currentSelection);
    }

    replaceWithNoRefresh(selectionDatas: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDatas,
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

    transformCellDataToSelectionData(row: number, column: number, mergeData: IRangeData[]): Nullable<ISelectionRangeWithStyle> {
        const newCellRange = mergeCellHandler(row, column, mergeData);

        const newSelectionData = makeCellRangeToRangeData(newCellRange);

        if (!newSelectionData) {
            return;
        }

        return {
            rangeData: newSelectionData,
            cellRange: newCellRange,
            style: NORMAL_SELECTION_PLUGIN_STYLE,
        };
    }

    private _getSelectionDatas(param: Nullable<ISelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, sheetId } = param;
        return this._selectionInfo.get(pluginName)?.get(unitId)?.get(sheetId);
    }

    private refresh(param: ISelectionManagerSearchParam): void {
        this._selectionInfo$.next(this._getSelectionDatas(param));
    }

    private _getFirstByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[0];
    }

    private _getLastByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[selectionData.length - 1];
    }

    private _addByParam(insertParam: ISelectionManagerInsertParam): void {
        const { pluginName, unitId, sheetId, selectionDatas } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, [...selectionDatas]);
        } else {
            const OldSelectionDatas = sheetSelectionData.get(sheetId)!;
            OldSelectionDatas.push(...selectionDatas);
        }

        this.refresh({ pluginName, unitId, sheetId });
    }

    private _replaceByParam(insertParam: ISelectionManagerInsertParam) {
        const { pluginName, unitId, sheetId, selectionDatas } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, selectionDatas);
        } else {
            const OldSelectionDatas = sheetSelectionData.get(sheetId)!;
            OldSelectionDatas.splice(0, OldSelectionDatas.length, ...selectionDatas);
        }

        // this.refresh({ pluginName, unitId, sheetId });
    }

    private _clearByParam(param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(0);

        this.refresh(param);
    }

    private _removeByParam(index: number, param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(index, 1);

        this.refresh(param);
    }

    // private refreshCurrentSelection(): void {
    //     this._currentSelection$.next(this._currentSelection);
    // }
}
