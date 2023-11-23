import { IRange, ISelectionCell, Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { ISelectionStyle, ISelectionWithStyle } from '../basics/selection';

export const NORMAL_SELECTION_PLUGIN_NAME = 'normalSelectionPluginName';

export interface ISelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
    sheetId: string;
}

export interface ISelectionManagerInsertParam extends ISelectionManagerSearchParam {
    selectionDatas: ISelectionWithStyle[];
}

//{ [pluginName: string]: { [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } } }
export type ISelectionInfo = Map<string, Map<string, Map<string, ISelectionWithStyle[]>>>;

/**
 * This service is responsible for managing the selection data.
 *
 * You can generally modify its data through SetSelectionsOperation.
 *
 * In the same app and sub-table, there will be different functional selection areas,
 * such as charts, formulas, conditional formats, etc.,
 * which are distinguished by the pluginName.
 *
 * The selection data drawn by the user through the SelectionRenderService will be saved to this service.
 *
 * Data changes within the service will also notify the SelectionController to redraw the selection area.
 *
 * Not only will switching sub-tables trigger a redraw, but also changing row and column widths,
 * hiding rows and columns, automatic row height, dragging rows and columns, deleting rows and columns,
 * and so on, will cause the size of the selection area to change.
 */
export class SelectionManagerService implements IDisposable {
    private readonly _selectionInfo: ISelectionInfo = new Map();

    private _currentSelection: Nullable<ISelectionManagerSearchParam> = null;

    // private _isSelectionEnabled: boolean = true;

    private readonly _selectionInfo$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);
    private readonly _copySelectionInfo$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly selectionInfo$ = this._selectionInfo$.asObservable();

    private _dirty: boolean = true;

    // get isSelectionEnabled() {
    //     return this._isSelectionEnabled;
    // }

    // get currentStyle() {
    //     return this._currentStyle;
    // }

    getCurrent() {
        return this._currentSelection;
    }

    getLastByPlugin(pluginName: string) {
        if (this._currentSelection == null) {
            return;
        }
        return this._getLastByParam({ ...this._currentSelection, pluginName });
    }

    changePlugin(pluginName: string) {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection = {
            pluginName,
            unitId: this._currentSelection?.unitId,
            sheetId: this._currentSelection?.sheetId,
        };

        this.refresh(this._currentSelection);
    }

    changePluginNoRefresh(pluginName: string) {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection = {
            pluginName,
            unitId: this._currentSelection?.unitId,
            sheetId: this._currentSelection?.sheetId,
        };
    }

    reset() {
        if (this._currentSelection == null) {
            return;
        }
        this._currentSelection = {
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: this._currentSelection?.unitId,
            sheetId: this._currentSelection?.sheetId,
        };
        this._selectionInfo.clear();

        this.refresh(this._currentSelection);
    }

    resetPlugin() {
        if (this._currentSelection == null) {
            return;
        }

        this._currentSelection.pluginName = NORMAL_SELECTION_PLUGIN_NAME;
        this.refresh(this._currentSelection);
    }

    dispose(): void {
        this._selectionInfo$.complete();
        // this._currentSelection$.complete();
    }

    makeDirty(dirty: boolean = true) {
        this._dirty = dirty;
    }

    refreshSelection() {
        if (this._currentSelection == null) {
            return;
        }

        this.refresh(this._currentSelection);
    }

    setCurrentSelection(param: ISelectionManagerSearchParam) {
        if (this._dirty === false) {
            return;
        }
        this._currentSelection = param;

        this.refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ISelectionManagerSearchParam) {
        this._currentSelection = param;
    }

    getSelectionInfo(): Readonly<ISelectionInfo> {
        return this._selectionInfo;
    }

    getSelectionDatasByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(param);
    }

    getSelections(): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(this._currentSelection);
    }

    getSelectionRanges(): Nullable<IRange[]> {
        const selectionDataList = this.getSelections();
        if (selectionDataList == null) {
            return;
        }

        return selectionDataList.map((selectionData: ISelectionWithStyle) => selectionData.range);
    }

    getFirst(): Readonly<Nullable<ISelectionWithStyle>> {
        return this._getFirstByParam(this._currentSelection);
    }

    getLast(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._currentSelection) as Readonly<
            Nullable<ISelectionWithStyle & { primary: ISelectionCell }>
        >;
    }

    addNoRefresh(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam(
            {
                ...this._currentSelection,
                selectionDatas,
            },
            false
        );
    }

    add(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            selectionDatas,
        });
    }

    replace(selectionDatas: ISelectionWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDatas,
        });
        this.refresh(this._currentSelection);
    }

    replaceWithNoRefresh(selectionDatas: ISelectionWithStyle[]) {
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

    /**
     * Determine whether multiple current selections overlap
     */
    isOverlapping(): boolean {
        const selectionDataList = this.getSelections();
        if (selectionDataList == null) {
            return false;
        }

        return selectionDataList.some(({ range }, index) =>
            selectionDataList.some(({ range: range2 }, index2) => {
                if (index === index2) {
                    return false;
                }
                return (
                    range.startRow <= range2.endRow &&
                    range.endRow >= range2.startRow &&
                    range.startColumn <= range2.endColumn &&
                    range.endColumn >= range2.startColumn
                );
            })
        );
    }

    private _getSelectionDatas(param: Nullable<ISelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, sheetId } = param;
        return this._selectionInfo.get(pluginName)?.get(unitId)?.get(sheetId);
    }

    private refresh(param?: ISelectionManagerSearchParam): void {
        this._selectionInfo$.next(this._getSelectionDatas(param));
    }

    private _getFirstByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[0];
    }

    private _getLastByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle>> {
        const selectionData = this._getSelectionDatas(param);

        return selectionData?.[selectionData.length - 1];
    }

    private _addByParam(insertParam: ISelectionManagerInsertParam, isRefresh = true): void {
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

        if (isRefresh) {
            this.refresh({ pluginName, unitId, sheetId });
        }
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
