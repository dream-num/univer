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

import type { Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ISetSheetTableParams, ITableFilterItem } from '@univerjs/sheets-table';
import type { IFilterByValueWithTreeItem, ITableFilterItemList } from '../types';
import { cellToRange, Disposable, ICommandService, Inject, IUniverInstanceService, ObjectMatrix, Rectangle } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { isConditionFilter, isManualFilter, SetSheetTableFilterCommand, SheetTableService, TableManager } from '@univerjs/sheets-table';
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
        @ICommandService private readonly _commandService: ICommandService
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
            currentFilterBy: isConditionFilter(tableFilter) ? FilterByEnum.Condition : FilterByEnum.Items,
            tableId,
            columnIndex: column - tableRange.startColumn,
        };
    }

    getTableFilterCheckedItems(unitId: string, tableId: string, columnIndex: number): string[] {
        const table = this._tableManager.getTable(unitId, tableId);
        const checkedItems: string[] = [];
        if (table) {
            const filter = table.getTableFilterColumn(columnIndex);
            if (filter && isManualFilter(filter)) {
                checkedItems.push(...filter.values);
            }
        }
        return checkedItems;
    }

    setTableFilter(unitId: string, tableId: string, columnIndex: number, tableFilter: ITableFilterItem | undefined) {
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return;
        }
        const setTableFilterParams: ISetSheetTableParams = {
            unitId,
            tableId,
            column: columnIndex,
            tableFilter,
        };
        this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
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
        let allItemsCount = 0;
        for (let row = startRow; row <= endRow; row++) {
            const isFiltered = worksheet.isRowFiltered(row);
            if (isFiltered) {
                continue;
            }
            const stringItem = this._sheetTableService.getCellValueWithConditionType(worksheet, row, column) as string;

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
}
