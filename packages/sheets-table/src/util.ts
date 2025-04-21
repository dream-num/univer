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

import type { ICellData, IDocumentData, Nullable } from '@univerjs/core';
import type { ITableConditionFilterItem, ITableFilterItem, ITableManualFilterItem } from './types/type';
import { CellValueType } from '@univerjs/core';
import { SheetsTableButtonStateEnum, SheetsTableSortStateEnum, TableColumnFilterTypeEnum } from './types/enum';

export function getColumnName(columnIndex: number, columnText: string): string {
    return `${columnText} ${columnIndex}`;
}

const BooleanTrue = 'TRUE';
const BooleanFalse = 'FALSE';
export const getStringFromDataStream = (data: IDocumentData): string => {
    const dataStream = data.body?.dataStream.replace(/\r\n$/, '') || '';
    return dataStream;
};

/**
 *  transform cell data to dimension name
 * @param cellData the sheet cell data
 * @param styles workBook styles collection
 * @param patternInfoRecord The cache record for pattern info
 * @returns {string} The dimension name
 */
export function convertCellDataToString(cellData: Nullable<ICellData>): string {
    if (cellData) {
        const { v, t, p } = cellData;
        if (p) {
            return getStringFromDataStream(p);
        }
        if ((t === CellValueType.FORCE_STRING || t === CellValueType.STRING) && v !== undefined && v !== null) {
            return String(v);
        } else if (t === CellValueType.BOOLEAN) {
            return v ? BooleanTrue : BooleanFalse;
        } else if (t === CellValueType.NUMBER) {
            return String(v);
        } else {
            // type not set, guess the type is number
            const type = typeof v;
            if (type === 'boolean') {
                return v ? BooleanTrue : BooleanFalse;
            }
            return v === undefined || v === null ? '' : String(v);
        }
    }
    return '';
}

export function getTableFilterState(tableFilter: ITableFilterItem | undefined, sortState: SheetsTableSortStateEnum): SheetsTableButtonStateEnum {
    const hasFilter = tableFilter !== undefined;
    if (hasFilter) {
        switch (sortState) {
            case SheetsTableSortStateEnum.Asc:
                return SheetsTableButtonStateEnum.FilteredSortAsc;
            case SheetsTableSortStateEnum.Desc:
                return SheetsTableButtonStateEnum.FilteredSortDesc;
            default:
                return SheetsTableButtonStateEnum.FilteredSortNone;
        }
    } else {
        switch (sortState) {
            case SheetsTableSortStateEnum.Asc:
                return SheetsTableButtonStateEnum.FilterNoneSortAsc;
            case SheetsTableSortStateEnum.Desc:
                return SheetsTableButtonStateEnum.FilterNoneSortDesc;
            default:
                return SheetsTableButtonStateEnum.FilterNoneSortNone;
        }
    }
}

export function isConditionFilter(filter: ITableFilterItem | undefined): filter is ITableConditionFilterItem {
    if (!filter) {
        return false;
    }
    return filter.filterType === TableColumnFilterTypeEnum.condition;
}

export function isManualFilter(filter: ITableFilterItem | undefined): filter is ITableManualFilterItem {
    if (!filter) {
        return false;
    }
    return filter.filterType === TableColumnFilterTypeEnum.manual;
}
