import { ISelectionRangeWithStyle, ISelectionStyle, mergeCellHandler, NORMAL_SELECTION_PLUGIN_STYLE } from '@univerjs/base-render';
import { Direction, IRangeData, makeCellRangeToRangeData, Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export const NORMAL_SELECTION_PLUGIN_NAME = 'normalSelectionPluginName';

export interface ISelectionManagerSearchParam {
    pluginName: string;
    unitId: string;
    sheetId: string;
}

export interface ISelectionManagerInsertParam extends ISelectionManagerSearchParam {
    selectionDataList: ISelectionRangeWithStyle[];
}

//{ [pluginName: string]: { [unitId: string]: { [sheetId: string]: ISelectionData[] } } }
export type ISelectionInfo = Map<string, Map<string, Map<string, ISelectionRangeWithStyle[]>>>;

/**
 * This service is for managing settings border style status.
 */
export class SelectionManagerService implements IDisposable {
    private readonly _selectionInfo: ISelectionInfo = new Map();

    private _currentSelection: Nullable<ISelectionManagerSearchParam> = null;

    private readonly _selectionInfo$ = new BehaviorSubject<Nullable<ISelectionRangeWithStyle[]>>(null);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly selectionInfo$ = this._selectionInfo$.asObservable();

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

    getSelectionDataListByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle[]>> {
        return this._getSelectionDataList(param);
    }

    getSelectionDataList(): Readonly<Nullable<ISelectionRangeWithStyle[]>> {
        return this._getSelectionDataList(this._currentSelection);
    }

    getRangeDataList(): Nullable<IRangeData[]> {
        const selectionDataList = this.getSelectionDataList();
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

    add(selectionDataList: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._addByParam({
            ...this._currentSelection,
            selectionDataList,
        });
    }

    replace(selectionDataList: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDataList,
        });
        this.refresh(this._currentSelection);
    }

    replaceWithNoRefresh(selectionDataList: ISelectionRangeWithStyle[]) {
        if (this._currentSelection == null) {
            return;
        }
        this._replaceByParam({
            ...this._currentSelection,
            selectionDataList,
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
            strokeDashArray: [],
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            controls: {},
            hasAutoFill: true,
        };
    }

    createCopyPasteSelection(): ISelectionStyle {
        return {
            strokeDashArray: [1, 0, 1, 1],
            strokeWidth: 2,
            stroke: '#FFF000',
            fill: 'rgba(0, 0, 0, 0.2)',
            controls: {},
            hasAutoFill: false,
        };
    }

    createDefaultSelection(): ISelectionStyle {
        return NORMAL_SELECTION_PLUGIN_STYLE;
    }

    /**
     * Move the selection according to different directions, usually used for the shortcut key operation of ↑ ↓ ← →
     * @param direction
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
    getMoveCellInfo(
        direction: Direction,
        rowCount: number,
        columnCount: number,
        mergeData: IRangeData[],
        selectionData: Nullable<ISelectionRangeWithStyle>
    ): Nullable<ISelectionRangeWithStyle> {
        const cellRange = selectionData?.cellRange;

        const style = selectionData?.style;

        if (!cellRange) return;

        let { startRow: mergeStartRow, startColumn: mergeStartColumn, endRow: mergeEndRow, endColumn: mergeEndColumn } = cellRange;

        let { row, column } = cellRange;
        // const rowCount = this._skeleton?.getRowCount() || DEFAULT_WORKSHEET_ROW_COUNT;
        // const columnCount = this._skeleton?.getColumnCount() || DEFAULT_WORKSHEET_COLUMN_COUNT;
        switch (direction) {
            case Direction.UP:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    row = --mergeStartRow;
                } else {
                    row--;
                }
                if (row < 0) {
                    row = 0;
                }
                break;
            case Direction.DOWN:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    row = ++mergeEndRow;
                } else {
                    row++;
                }

                if (row > rowCount) {
                    row = rowCount;
                }
                break;
            case Direction.LEFT:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    column = --mergeStartColumn;
                } else {
                    column--;
                }

                if (column < 0) {
                    column = 0;
                }
                break;
            case Direction.RIGHT:
                if (cellRange.isMerged || cellRange.isMergedMainCell) {
                    column = ++mergeEndColumn;
                } else {
                    column++;
                }

                if (column > columnCount) {
                    column = columnCount;
                }
                break;

            default:
                break;
        }

        const newCellRange = mergeCellHandler(row, column, mergeData);

        const newSelectionData = makeCellRangeToRangeData(newCellRange);

        if (!newSelectionData) {
            return;
        }

        return {
            rangeData: newSelectionData,
            cellRange: newCellRange,
            style,
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

    private _getSelectionDataList(param: Nullable<ISelectionManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { pluginName, unitId, sheetId } = param;
        return this._selectionInfo.get(pluginName)?.get(unitId)?.get(sheetId);
    }

    private refresh(param: ISelectionManagerSearchParam): void {
        this._selectionInfo$.next(this._getSelectionDataList(param));
    }

    private _getFirstByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle>> {
        const selectionData = this._getSelectionDataList(param);

        return selectionData?.[0];
    }

    private _getLastByParam(param: Nullable<ISelectionManagerSearchParam>): Readonly<Nullable<ISelectionRangeWithStyle>> {
        const selectionData = this._getSelectionDataList(param);

        return selectionData?.[selectionData.length - 1];
    }

    private _addByParam(insertParam: ISelectionManagerInsertParam): void {
        const { pluginName, unitId, sheetId, selectionDataList } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, [...selectionDataList]);
        } else {
            const OldSelectionDataList = sheetSelectionData.get(sheetId)!;
            OldSelectionDataList.push(...selectionDataList);
        }

        this.refresh({ pluginName, unitId, sheetId });
    }

    private _replaceByParam(insertParam: ISelectionManagerInsertParam) {
        const { pluginName, unitId, sheetId, selectionDataList } = insertParam;

        if (!this._selectionInfo.has(pluginName)) {
            this._selectionInfo.set(pluginName, new Map());
        }

        const unitSelectionData = this._selectionInfo.get(pluginName)!;

        if (!unitSelectionData.has(unitId)) {
            unitSelectionData.set(unitId, new Map());
        }

        const sheetSelectionData = unitSelectionData.get(unitId)!;

        if (!sheetSelectionData.has(sheetId)) {
            sheetSelectionData.set(sheetId, selectionDataList);
        } else {
            const OldSelectionDataList = sheetSelectionData.get(sheetId)!;
            OldSelectionDataList.splice(0, OldSelectionDataList.length, ...selectionDataList);
        }

        // this.refresh({ pluginName, unitId, sheetId });
    }

    private _clearByParam(param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDataList(param);

        selectionData?.splice(0);

        this.refresh(param);
    }

    private _removeByParam(index: number, param: ISelectionManagerSearchParam): void {
        const selectionData = this._getSelectionDataList(param);

        selectionData?.splice(index, 1);

        this.refresh(param);
    }

    // private refreshCurrentSelection(): void {
    //     this._currentSelection$.next(this._currentSelection);
    // }
}
