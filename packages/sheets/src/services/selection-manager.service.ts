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

import { type IRange, type ISelectionCell, type Nullable, ThemeService } from '@univerjs/core';
import { type IDisposable, Inject } from '@wendellhu/redi';
import { BehaviorSubject, Subject } from 'rxjs';

import type { ISelectionStyle, ISelectionWithStyle } from '../basics/selection';

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

export enum SelectionMoveType {
    MOVE_START,
    MOVING,
    MOVE_END,
}

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

    private _searchParamForSelection: Nullable<ISelectionManagerSearchParam> = null;

    private readonly _selectionMoveStart$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoveStart$ = this._selectionMoveStart$.asObservable();

    private readonly _selectionMoving$ = new Subject<Nullable<ISelectionWithStyle[]>>();
    readonly selectionMoving$ = this._selectionMoving$.asObservable();

    private readonly _selectionMoveEnd$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    private readonly _selectionMoveEndBefore$ = new BehaviorSubject<Nullable<ISelectionWithStyle[]>>(null);
    readonly selectionMoveEndBefore$ = this._selectionMoveEndBefore$.asObservable();

    private _dirty: boolean = true;

    // FIMXE: this dependency is not correct!
    constructor(@Inject(ThemeService) private readonly _themeService: ThemeService) {
        // empty
    }

    getCurrent() {
        return this._searchParamForSelection;
    }

    getLastByPlugin(pluginName: string) {
        if (this._searchParamForSelection == null) {
            return;
        }
        return this._getLastByParam({ ...this._searchParamForSelection, pluginName });
    }

    changePlugin(pluginName: string) {
        if (this._searchParamForSelection == null) {
            return;
        }
        this._searchParamForSelection = {
            pluginName,
            unitId: this._searchParamForSelection?.unitId,
            sheetId: this._searchParamForSelection?.sheetId,
        };

        this._refresh(this._searchParamForSelection);
    }

    changePluginNoRefresh(pluginName: string) {
        if (this._searchParamForSelection == null || this._searchParamForSelection.pluginName === pluginName) {
            return;
        }

        // Fetch the old selections.
        const selections = this.getSelectionDatasByParam(this._searchParamForSelection);

        this._searchParamForSelection = {
            pluginName,
            unitId: this._searchParamForSelection?.unitId,
            sheetId: this._searchParamForSelection?.sheetId,
        };

        if (selections != null) {
            this.add([]);
        }
    }

    reset() {
        if (this._searchParamForSelection == null) {
            return;
        }
        this._searchParamForSelection = {
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: this._searchParamForSelection?.unitId,
            sheetId: this._searchParamForSelection?.sheetId,
        };
        this._selectionInfo.clear();

        this._refresh(this._searchParamForSelection);
    }

    resetPlugin() {
        if (this._searchParamForSelection == null) {
            return;
        }

        this._searchParamForSelection.pluginName = NORMAL_SELECTION_PLUGIN_NAME;
        this._refresh(this._searchParamForSelection);
    }

    dispose(): void {
        this._selectionMoveEnd$.complete();
        this._selectionMoveStart$.complete();
        this._selectionMoving$.complete();
    }

    makeDirty(dirty: boolean = true) {
        this._dirty = dirty;
    }

    refreshSelection() {
        if (this._searchParamForSelection == null) {
            return;
        }

        this._refresh(this._searchParamForSelection);
    }

    setSelectionSeachParam(param: ISelectionManagerSearchParam) {
        if (this._dirty === false) {
            return;
        }

        this._searchParamForSelection = param;
        this._refresh(param);
    }

    setCurrentSelectionNotRefresh(param: ISelectionManagerSearchParam) {
        this._searchParamForSelection = param;
    }

    getSelectionInfo(): Readonly<ISelectionInfo> {
        return this._selectionInfo;
    }

    getSelectionDatasByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(param);
    }

    getSelections(): Readonly<Nullable<ISelectionWithStyle[]>> {
        return this._getSelectionDatas(this._searchParamForSelection);
    }

    getSelectionRanges(): Nullable<IRange[]> {
        const selectionDataList = this.getSelections();
        if (selectionDataList == null) {
            return;
        }

        return selectionDataList.map((selectionData: ISelectionWithStyle) => selectionData.range);
    }

    getFirst(): Readonly<Nullable<ISelectionWithStyle>> {
        return this._getFirstByParam(this._searchParamForSelection);
    }

    getLast(): Readonly<Nullable<ISelectionWithStyle & { primary: ISelectionCell }>> {
        // The last selection position must have a primary.
        return this._getLastByParam(this._searchParamForSelection) as Readonly<
            Nullable<ISelectionWithStyle & { primary: ISelectionCell }>
        >;
    }

    addNoRefresh(selectionDatas: ISelectionWithStyle[]) {
        if (this._searchParamForSelection == null) {
            return;
        }
        this._addByParam(
            {
                ...this._searchParamForSelection,
                selectionDatas,
            },
            false
        );
    }

    add(selectionDatas: ISelectionWithStyle[]) {
        if (this._searchParamForSelection == null) {
            return;
        }

        this._addByParam({
            ...this._searchParamForSelection,
            selectionDatas,
        });
    }

    replace(selectionDatas: ISelectionWithStyle[], type: SelectionMoveType = SelectionMoveType.MOVE_END) {
        if (this._searchParamForSelection == null) {
            return;
        }

        this._replaceByParam({
            ...this._searchParamForSelection,
            selectionDatas,
        });

        if (type === SelectionMoveType.MOVE_START) {
            this._refreshStart(this._searchParamForSelection);
        } else if (type === SelectionMoveType.MOVING) {
            this._refreshMoving(this._searchParamForSelection);
        } else {
            // type == SelectionMoveType.MOVE_END
            this._refresh(this._searchParamForSelection);
        }
    }

    replaceWithNoRefresh(selectionDatas: ISelectionWithStyle[]) {
        if (this._searchParamForSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._searchParamForSelection,
            selectionDatas,
        });
    }

    clear(): void {
        if (this._searchParamForSelection == null) {
            return;
        }
        this._clearByParam(this._searchParamForSelection);
    }

    remove(index: number): void {
        if (this._searchParamForSelection == null) {
            return;
        }

        this._removeByParam(index, this._searchParamForSelection);
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
            strokeWidth: 1.5,
            stroke: this._themeService.getCurrentTheme().primaryColor,
            fill: 'rgba(178, 178, 178, 0.10)',
            widgets: {},
            hasAutoFill: false,
            strokeDash: 8,
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

    private _refresh(param?: ISelectionManagerSearchParam): void {
        // _selectionMoveEndBefore$ listener:
        // selection.render-controller _selectionManagerService.selectionMoveEndBefore$.subscribe
        // --> _selectionRenderService.reset() --> _clearSelectionControls()
        // --> _selectionRenderService.addCellSelectionControlBySelectionData()
        this._selectionMoveEndBefore$.next(this._getSelectionDatas(param));
        this._selectionMoveEnd$.next(this._getSelectionDatas(param));
    }

    private _refreshStart(param?: ISelectionManagerSearchParam): void {
        this._selectionMoveStart$.next(this._getSelectionDatas(param));
    }

    private _refreshMoving(param?: ISelectionManagerSearchParam): void {
        this._selectionMoving$.next(this._getSelectionDatas(param));
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
            let oldSelectionDatas = sheetSelectionData.get(sheetId);
            if (oldSelectionDatas == null) {
                oldSelectionDatas = [];
                sheetSelectionData.set(sheetId, oldSelectionDatas);
            }
            oldSelectionDatas.push(...selectionDatas);
        }

        if (isRefresh) {
            this._refresh({ pluginName, unitId, sheetId });
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
            let oldSelectionDatas = sheetSelectionData.get(sheetId);
            if (oldSelectionDatas == null) {
                oldSelectionDatas = [];
                sheetSelectionData.set(sheetId, oldSelectionDatas);
            }
            oldSelectionDatas.splice(0, oldSelectionDatas.length, ...selectionDatas);
        }

        // this.refresh({ pluginName, unitId, sheetId });
    }

    private _clearByParam(param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(0);

        this._refresh(param);
    }

    private _removeByParam(index: number, param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDatas(param);

        selectionData?.splice(index, 1);

        this._refresh(param);
    }

    // private refreshCurrentSelection(): void {
    //     this._currentSelection$.next(this._currentSelection);
    // }
}
