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

import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ISetSheetTableParams, ITableFilterItem } from '@univerjs/sheets-table';
import type { LocaleKey } from '../locale/types';
import type { IFilterByValueWithTreeItem, ITableFilterColorList, ITableFilterItemList } from '../types';
import {
    cellToRange,
    ColorKit,
    DEFAULT_STYLES,
    Disposable,
    getColorStyle,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Rectangle,
} from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import {
    isColorTableFilter,
    isConditionFilter,
    isManualTableFilter,
    SetSheetTableFilterCommand,
    SheetTableService,
    TABLE_FILTER_EMPTY_VALUE,
    TableManager,
} from '@univerjs/sheets-table';
import { FilterByEnum } from '../types';

interface ISheetTableFilterPanelProps {
    unitId: string;
    subUnitId: string;
    tableFilter: ITableFilterItem | undefined;
    currentFilterBy: FilterByEnum;
    tableId: string;
    columnIndex: number;
}

export class SheetsTableUiService extends Disposable {
    private _itemsCache: Map<string, ITableFilterItemList> = new Map();
    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(SheetTableService) private _sheetTableService: SheetTableService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._registerTableFilterChangeEvent();
    }

    private _registerTableFilterChangeEvent() {
        this._commandService.onCommandExecuted((command) => {
            if (command.id === SetRangeValuesMutation.id) {
                const { unitId, subUnitId, cellValue } = command.params as ISetRangeValuesMutationParams;
                const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                if (!tables.length) {
                    return;
                }
                const matrix = new ObjectMatrix(cellValue);
                matrix.forValue((row, col, _value) => {
                    const cellRange = cellToRange(row, col);
                    const overlapTable = tables.find((table) => {
                        const tableRange = table.getTableFilterRange();
                        return Rectangle.intersects(tableRange, cellRange);
                    });
                    if (overlapTable) {
                        const colIndex = col - overlapTable.getRange().startColumn;
                        this._itemsCache.delete(overlapTable.getId() + colIndex);
                    }
                });
            } else if (command.id === SetSheetTableFilterCommand.id) {
                const { unitId, tableId } = command.params as ISetSheetTableParams;
                const table = this._tableManager.getTable(unitId, tableId);
                if (!table) {
                    return;
                }
                const subUnitId = table.getSubunitId();
                const allSubTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                allSubTables.forEach((table) => {
                    const range = table.getRange();
                    for (let i = range.startColumn; i <= range.endColumn; i++) {
                        this._itemsCache.delete(table.getId() + i);
                    }
                });
            }
        });
    }

    getTableFilterPanelInitProps(unitId: string, subUnitId: string, tableId: string, column: number): ISheetTableFilterPanelProps {
        const table = this._tableManager.getTable(unitId, tableId)!;

        const tableRange = table.getRange();
        const tableFilter = table.getTableFilterColumn(column - tableRange.startColumn);
        return {
            unitId,
            subUnitId,
            tableFilter,
            currentFilterBy: isConditionFilter(tableFilter)
                ? FilterByEnum.Condition
                : isColorTableFilter(tableFilter) ? FilterByEnum.Color : FilterByEnum.Items,
            tableId,
            columnIndex: column - tableRange.startColumn,
        };
    }

    getTableFilterCheckedItems(unitId: string, tableId: string, columnIndex: number): string[] {
        const table = this._tableManager.getTable(unitId, tableId);
        const checkedItems: string[] = [];
        if (table) {
            const filter = table.getTableFilterColumn(columnIndex);
            if (filter && isManualTableFilter(filter)) {
                checkedItems.push(...filter.values.map((value) => value === TABLE_FILTER_EMPTY_VALUE ? this._localeService.t<LocaleKey>('sheets-table-ui.condition.empty') : value));
            }
        }
        return checkedItems;
    }

    async setTableFilter(
        unitId: string,
        tableId: string,
        columnIndex: number,
        tableFilter: ITableFilterItem | undefined
    ): Promise<boolean> {
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return false;
        }
        const setTableFilterParams: ISetSheetTableParams = {
            unitId,
            tableId,
            column: columnIndex,
            tableFilter,
        };
        return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
    }

    getTableFilterColors(
        unitId: string,
        subUnitId: string,
        tableId: string,
        columnIndex: number
    ): ITableFilterColorList {
        const emptyResult = { cellFillColors: [], cellTextColors: [] };
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return emptyResult;
        }

        const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return emptyResult;
        }

        const normalizeColor = (color: Nullable<string>) => color ? new ColorKit(color).toRgbString() : null;
        const currentFilter = table.getTableFilterColumn(columnIndex);
        const checkedFillColors = new Set(
            isColorTableFilter(currentFilter) ? currentFilter.cellFillColors?.map(normalizeColor) : []
        );
        const checkedTextColors = new Set(
            isColorTableFilter(currentFilter) ? currentFilter.cellTextColors?.map(normalizeColor) : []
        );
        const cellFillColors = new Map<string | null, boolean>();
        const cellTextColors = new Map<string | null, boolean>();
        const tableRange = table.getTableFilterRange();
        const column = tableRange.startColumn + columnIndex;
        const filteredRowsByOtherColumns = this._getFilteredRowsByOtherColumns(
            worksheet,
            tableId,
            unitId,
            columnIndex
        );

        for (let row = tableRange.startRow; row <= tableRange.endRow; row++) {
            if (filteredRowsByOtherColumns.has(row)) {
                continue;
            }

            const cellData = worksheet.getCell(row, column);
            const style = worksheet.getComposedCellStyleByCellData(row, column, cellData);
            const fillColor = normalizeColor(getColorStyle(style.bg));
            const textColor = normalizeColor(getColorStyle(style.cl) ?? getColorStyle(DEFAULT_STYLES.cl));
            cellFillColors.set(fillColor, checkedFillColors.has(fillColor));
            cellTextColors.set(textColor, checkedTextColors.has(textColor));
        }

        return {
            cellFillColors: Array.from(cellFillColors, ([color, checked]) => ({ color, checked })),
            cellTextColors: Array.from(cellTextColors, ([color, checked]) => ({ color, checked })),
        };
    }

    getTableFilterItems(unitId: string, subUnitId: string, tableId: string, columnIndex: number): ITableFilterItemList {
        if (this._itemsCache.has(tableId + columnIndex)) {
            return this._itemsCache.get(tableId + columnIndex) || { data: [], itemsCountMap: new Map(), allItemsCount: 0 };
        }
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return { data: [], itemsCountMap: new Map(), allItemsCount: 0 };
        }
        const tableRange = table.getTableFilterRange();
        const { startRow, endRow, startColumn } = tableRange;
        const column = startColumn + columnIndex;
        const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return { data: [], itemsCountMap: new Map(), allItemsCount: 0 };
        }

        const data: IFilterByValueWithTreeItem[] = [];

        const map = new Map<string, number>();
        const filteredRowsByOtherColumns = this._getFilteredRowsByOtherColumns(
            worksheet,
            tableId,
            unitId,
            columnIndex
        );

        let allItemsCount = 0;
        for (let row = startRow; row <= endRow; row++) {
            if (filteredRowsByOtherColumns.has(row)) {
                continue;
            }
            let stringItem = this._sheetTableService.getCellValueWithConditionType(worksheet, row, column) as string;

            if (stringItem == null) {
                stringItem = this._localeService.t<LocaleKey>('sheets-table-ui.condition.empty');
            }

            if (!map.has(stringItem)) {
                data.push({
                    title: stringItem,
                    key: `${column}_${row}`,
                    leaf: true,
                });
            }
            allItemsCount++;
            map.set(stringItem, (map.get(stringItem) || 0) + 1);
        }
        this._itemsCache.set(tableId + columnIndex, { data, itemsCountMap: map, allItemsCount });
        return { data, itemsCountMap: map, allItemsCount };
    }

    private _getFilteredRowsByOtherColumns(
        worksheet: Worksheet,
        tableId: string,
        unitId: string,
        columnIndex: number
    ): Set<number> {
        const filteredRows = new Set<number>();
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return filteredRows;
        }

        const tableRange = table.getTableFilterRange();
        const tableFilters = table.getTableFilters();
        for (let column = tableRange.startColumn; column <= tableRange.endColumn; column++) {
            const currentColumnIndex = column - tableRange.startColumn;
            if (currentColumnIndex !== columnIndex && table.getTableFilterColumn(currentColumnIndex)) {
                tableFilters.doColumnFilter(worksheet, tableRange, currentColumnIndex, filteredRows);
            }
        }
        return filteredRows;
    }
}
