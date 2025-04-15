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

import type { ICellData, Nullable, Worksheet } from '@univerjs/core';
import type { SheetsTableButtonStateEnum } from '../types/enum';
import type { ICalculatedOptions, ITableFilterItem, ITableFilterJSON, ITableRange } from '../types/type';
import { SheetsTableSortStateEnum, TableColumnFilterTypeEnum, TableConditionTypeEnum } from '../types/enum';
import { getTableFilterState, isConditionFilter } from '../util';
import { getCellValueWithConditionType, getConditionExecuteFunc, isNumberDynamicFilter } from './filter-util/condition';

export class TableFilters {
    private _tableColumnFilterList: (ITableFilterItem | undefined)[];
    private _tableSortInfo: { columnIndex: number; sortState: SheetsTableSortStateEnum };
    private _filterOutRows: Set<number>;
    constructor() {
        this._tableColumnFilterList = [];
    }

    setColumnFilter(columnIndex: number, filter: ITableFilterItem | undefined) {
        if (!filter) {
            this._tableColumnFilterList[columnIndex] = undefined;
        } else {
            this._tableColumnFilterList[columnIndex] = filter;
        }
    }

    setSortState(columnIndex: number, sortState: SheetsTableSortStateEnum) {
        this._tableSortInfo = { columnIndex, sortState };
    }

    getColumnFilter(columnIndex: number): ITableFilterItem | undefined {
        return this._tableColumnFilterList[columnIndex];
    }

    getFilterState(columnIndex: number): SheetsTableButtonStateEnum {
        const sortState = this._tableSortInfo?.columnIndex === columnIndex ? this._tableSortInfo.sortState : SheetsTableSortStateEnum.None;
        return getTableFilterState(this._tableColumnFilterList[columnIndex], sortState);
    }

    getSortState() {
        return this._tableSortInfo ?? {};
    }

    getFilterStates(range: ITableRange): SheetsTableButtonStateEnum[] {
        const states = [];
        const { startColumn, endColumn } = range;
        for (let i = startColumn; i <= endColumn; i++) {
            states.push(this.getFilterState(i - startColumn));
        }
        return states;
    }

    getFilterOutRows() {
        return this._filterOutRows;
    }

    doFilter(sheet: Worksheet, range: ITableRange) {
        const filterOutRows = new Set<number>();
        const tableColumnFilterList = this._tableColumnFilterList;
        for (let i = 0; i < tableColumnFilterList.length; i++) {
            const filter = tableColumnFilterList[i];
            if (filter) {
                this.doColumnFilter(sheet, range, i, filterOutRows);
            }
        }
        this._filterOutRows = filterOutRows;
        return filterOutRows;
    }

    doColumnFilter(sheet: Worksheet, range: ITableRange, columnIndex: number, filterOutRows: Set<number>) {
        const filter = this._tableColumnFilterList[columnIndex];
        if (filter && sheet) {
            const { startRow, endRow, startColumn } = range;
            const column = startColumn + columnIndex;
            const executeFunc = this.getExecuteFunc(sheet, range, columnIndex, filter);
            for (let row = startRow; row <= endRow; row++) {
                // const cellValue = sheet.getCell(row, column);
                const conditionType = isConditionFilter(filter) ? filter.filterInfo.conditionType : TableConditionTypeEnum.String;
                const cellValue = getCellValueWithConditionType(sheet, row, column, conditionType);
                if (cellValue === null) {
                    filterOutRows.add(row);
                } else if (!executeFunc(getCellValueWithConditionType(sheet, row, column, conditionType))) {
                    filterOutRows.add(row);
                }
            }
        }
    }

    private _getNumberCalculatedOptions(sheet: Worksheet, range: ITableRange, columnIndex: number): ICalculatedOptions {
        const { startRow, endRow, startColumn } = range;
        const column = startColumn + columnIndex;
        const list = [];
        let count = 0;
        let sum = 0;
        for (let row = startRow; row <= endRow; row++) {
            const val = getCellValueWithConditionType(sheet, row, column, TableConditionTypeEnum.Number) as number;
            if (val !== null) {
                list.push(val);
                count++;
                sum += val;
            }
        }
        return {
            list,
            average: count > 0 ? sum / count : 0,
        };
    }

    getExecuteFunc(sheet: Worksheet, range: ITableRange, columnIndex: number, filter: ITableFilterItem): (value: any) => boolean {
        if (filter.filterType === TableColumnFilterTypeEnum.manual) {
            const valuesSet = new Set(filter.values);
            return (value: string) => {
                return valuesSet.has(value);
            };
        } else if (filter.filterType === TableColumnFilterTypeEnum.condition) {
            const isDynamic = isNumberDynamicFilter(filter.filterInfo.compareType);
            const calculatedOptions = isDynamic ? this._getNumberCalculatedOptions(sheet, range, columnIndex) : undefined;
            return getConditionExecuteFunc(filter, calculatedOptions);
        } else {
            return (value: Nullable<ICellData>) => {
                return true;
            };
        }
    }

    toJSON(): ITableFilterJSON {
        return {
            tableColumnFilterList: this._tableColumnFilterList,
            tableSortInfo: this._tableSortInfo,
        };
    }

    fromJSON(json: ITableFilterJSON) {
        this._tableColumnFilterList = json.tableColumnFilterList ?? [];
        if (json.tableSortInfo) {
            this._tableSortInfo = json.tableSortInfo;
        }
    }

    dispose() {
        this._tableColumnFilterList = [];
    }
}
