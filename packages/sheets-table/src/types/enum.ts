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

export enum TableColumnDataTypeEnum {
    None = 'none',
    String = 'string',
    Number = 'number',
    Date = 'date',
    Bool = 'bool',
    Checkbox = 'checkbox',
    List = 'list',
};

export enum TableColumnFilterTypeEnum {
    manual = 'manual',
    condition = 'condition',
}

export enum TableConditionTypeEnum {
    Date = 'date',
    Number = 'number',
    String = 'string',
    Logic = 'logic',
}

export enum TableNumberCompareTypeEnum {
    Equal = 'equal',
    NotEqual = 'notEqual',
    GreaterThan = 'greaterThan',
    GreaterThanOrEqual = 'greaterThanOrEqual',
    LessThan = 'lessThan',
    LessThanOrEqual = 'lessThanOrEqual',
    Between = 'between',
    NotBetween = 'notBetween',
    Above = 'above',
    Below = 'below',
    TopN = 'topN',
}

export enum TableStringCompareTypeEnum {
    Equal = 'equal',
    NotEqual = 'notEqual',
    Contains = 'contains',
    NotContains = 'notContains',
    StartsWith = 'startsWith',
    EndsWith = 'endsWith',
}

export enum TableDateCompareTypeEnum {
    Equal = 'equal',
    NotEqual = 'notEqual',
    After = 'after',
    AfterOrEqual = 'afterOrEqual',
    Before = 'before',
    BeforeOrEqual = 'beforeOrEqual',
    Between = 'between',
    NotBetween = 'notBetween',

    Today = 'today',
    Yesterday = 'yesterday',
    Tomorrow = 'tomorrow',
    ThisWeek = 'thisWeek',
    LastWeek = 'lastWeek',
    NextWeek = 'nextWeek',
    ThisMonth = 'thisMonth',
    LastMonth = 'lastMonth',
    NextMonth = 'nextMonth',
    ThisQuarter = 'thisQuarter',
    LastQuarter = 'lastQuarter',
    NextQuarter = 'nextQuarter',
    ThisYear = 'thisYear',
    LastYear = 'lastYear',
    NextYear = 'nextYear',
    // YTD
    YearToDate = 'yearToDate',

    Quarter = 'quarter',
    Month = 'month',

    M1 = 'm1',
    M2 = 'm2',
    M3 = 'm3',
    M4 = 'm4',
    M5 = 'm5',
    M6 = 'm6',
    M7 = 'm7',
    M8 = 'm8',
    M9 = 'm9',
    M10 = 'm10',
    M11 = 'm11',
    M12 = 'm12',

    Q1 = 'q1',
    Q2 = 'q2',
    Q3 = 'q3',
    Q4 = 'q4',
}

/**
 * Represents the pivot cell style type enum
 */
export enum SheetsTableButtonStateEnum {
    FilteredSortNone = 1,
    FilteredSortAsc = 2,
    FilteredSortDesc = 3,
    FilterNoneSortNone = 4,
    FilterNoneSortAsc = 5,
    FilterNoneSortDesc = 6,
}

export enum SheetsTableSortStateEnum {
    Asc = 'asc',
    Desc = 'desc',
    None = 'none',
}
