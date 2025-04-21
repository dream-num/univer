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

import type { IRange, IStyleData, Nullable } from '@univerjs/core';
import type { SheetsTableButtonStateEnum, SheetsTableSortStateEnum, TableColumnDataTypeEnum, TableColumnFilterTypeEnum, TableConditionTypeEnum, TableDateCompareTypeEnum, TableNumberCompareTypeEnum, TableStringCompareTypeEnum } from './enum';

export interface ITableRange {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
}

export interface ITableOptions {
    showHeader?: boolean;
    showFooter?: boolean;
    tableStyleId?: string;
    hasTotalRow?: boolean;
    columns?: ITableColumnJson[];
    filters?: ITableFilterItem[];
}

export interface ITableFilterJSON {
    tableColumnFilterList?: (ITableFilterItem | undefined)[];
    tableSortInfo?: { columnIndex: number; sortState: SheetsTableSortStateEnum };
}

export type ITableFilterItem = ITableManualFilterItem | ITableConditionFilterItem;
export type TableMetaType = Record<string, any>;

/**
 * Represents the table filter item, filter data by provided values.
 */
export interface ITableManualFilterItem {
    filterType: TableColumnFilterTypeEnum.manual;
    values: string[];
    isAllSelected?: boolean;
}

/**
 * Represents the table filter item, filter data by provided condition rules.
 */
export interface ITableConditionFilterItem {
    filterType: TableColumnFilterTypeEnum.condition;
    filterInfo: ITableDateFilterInfo | ITableStringFilterInfo | ITableNumberFilterInfo | ITableLogicFilterInfo;
}

export interface ITableDateFilterInfo {
    conditionType: TableConditionTypeEnum.Date;
    compareType: TableDateCompareTypeEnum;
    expectedValue: Date | [Date, Date] | undefined;
    anchorTime?: number;
}

export interface ITableStringFilterInfo {
    conditionType: TableConditionTypeEnum.String;
    compareType: TableStringCompareTypeEnum;
    expectedValue: string;
}

export interface ITableNumberFilterInfo {
    conditionType: TableConditionTypeEnum.Number;
    compareType: TableNumberCompareTypeEnum;
    expectedValue: number | [number, number];
}

export interface ITableLogicFilterInfo {
    conditionType: TableConditionTypeEnum.Logic;
    compareType: TableNumberCompareTypeEnum;
    expectedValue: (ITableDateFilterInfo | ITableStringFilterInfo | ITableNumberFilterInfo)[];
}

export interface ITableAddedEvent {
    unitId: string;
    subUnitId: string;
    tableId: string;
    tableName: string;
    range: ITableRange;
}

export interface ITableRangeUpdate {
    newRange: IRange;
};

export enum IRangeOperationTypeEnum {
    Insert = 'insert',
    Delete = 'delete',
};

export enum IRowColTypeEnum {
    Row = 'row',
    Col = 'column',
}

export interface ITableRangeRowColOperation {
    operationType: IRangeOperationTypeEnum;
    rowColType: IRowColTypeEnum;
    index: number;
    count: number;
    columnsJson?: ITableColumnJson[];
}

export interface ITableSetConfig {
    name?: string;
    updateRange?: ITableRangeUpdate;
    rowColOperation?: ITableRangeRowColOperation;
    theme?: string;
    options?: {
        showHeader?: boolean;
    };
}

interface ITableBaseEvent {
    unitId: string;
    subUnitId: string;
    tableId: string;
}
export interface ITableNameChangedEvent extends ITableBaseEvent {
    tableName: string;
    oldTableName: string;
}

export interface ITableRangeChangedEvent extends ITableBaseEvent {
    range: ITableRange;
    oldRange: ITableRange;
}

export interface ITableThemeChangedEvent extends ITableBaseEvent {
    theme: string;
    oldTheme: string;
}

export type ITableDeletedEvent = ITableAddedEvent & {
    tableStyleId?: string;
};

export interface ITableRangeChangedEvent {
    unitId: string;
    subUnitId: string;
    tableId: string;
    range: ITableRange;
    oldRange: ITableRange;
}

export interface ITableFilterChangedEvent {
    unitId: string;
    subUnitId: string;
    tableId: string;
}
export interface ITableColumnJson {
    dataType: TableColumnDataTypeEnum;
    id: string;
    displayName: string;
    formula: string;
    meta: TableMetaType;
    style: IStyleData;
}

export interface ITableJson {
    id: string;
    name: string;
    range: ITableRange;
    options: ITableOptions;
    filters: ITableFilterJSON;
    columns: ITableColumnJson[];
    meta: TableMetaType;
}

export interface ITableInfo {
    id: string;
    name: string;
    subUnitId: string;
    range: ITableRange;
    meta: TableMetaType;
    columns: ITableColumnJson[];
    showHeader: boolean;
}

export interface ITableInfoWithUnitId extends ITableInfo {
    unitId: string;
}

export interface ITableResource {
    [subUnitId: string]: ITableJson[];
}

export interface ITableRelationItem {
    tableId: string;
    relationColumnId: string;
}

/**
 * Table relation tuple type, first item is the main table, second item is the sub table
 */
export type TableRelationTupleType = [ITableRelationItem, ITableRelationItem];

export type SubTableColumnItem = ITableColumnJson & { tableId: string };

export interface IDateValue {
    /**
     * @description the date value,  it stores the number of seconds since January 1, 1970, 00:00:00 UTC, it is same to excel date value
     */
    v: number;
    /**
     * @description only date type has this property, we can use it to format the date
     */
    f: string;
}
type IBlankValue = null | undefined;

export type IDataFieldValue = string | number | boolean | IDateValue | IBlankValue;

/**
 * Represents the table header information, which save the original column id and display name of table.
 */
export interface IHeadersTableInfoList {
    tableId: string;
    columnId: string;
    displayName: string;
}
export interface ITableData {
    headers: string[];
    headersTableInfoList: IHeadersTableInfoList[];
    data: Nullable<IDataFieldValue>[][];
}

export interface ICalculatedOptions {
    average?: number;
    list?: number[];
}

export interface ITableRangeWithState {
    range: ITableRange;
    states: SheetsTableButtonStateEnum[];
    tableId: string;
}
