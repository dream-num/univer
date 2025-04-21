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

import type { IDocumentData, Worksheet } from '@univerjs/core';
import type { TableStringCompareTypeEnum } from '../../types/enum';
import type { ICalculatedOptions, ITableConditionFilterItem, ITableDateFilterInfo, ITableNumberFilterInfo, ITableStringFilterInfo } from '../../types/type';
import { CellValueType } from '@univerjs/core';
import { TableConditionTypeEnum, TableDateCompareTypeEnum, TableNumberCompareTypeEnum } from '../../types/enum';
import { getDateFilterExecuteFunc } from './date-filter-util';
import { getNumberFilterExecuteFunc } from './number-filter-util';
import { getTextFilterExecuteFunc } from './text-filter-util';

type TableConditionCompareType = TableNumberCompareTypeEnum | TableDateCompareTypeEnum | TableStringCompareTypeEnum;

// A dynamic filter returns a result set which might vary due to a change in the data itself or a change in the date on which the filter is being applied
const NumberDynamicFilterCompareTypeSet: Set<TableNumberCompareTypeEnum> = new Set([
    TableNumberCompareTypeEnum.Above,
    TableNumberCompareTypeEnum.Below,
    TableNumberCompareTypeEnum.TopN,
]);

const DateDynamicFilterCompareTypeSet: Set<TableDateCompareTypeEnum> = new Set([
    TableDateCompareTypeEnum.Today,
    TableDateCompareTypeEnum.Yesterday,
    TableDateCompareTypeEnum.Tomorrow,
    TableDateCompareTypeEnum.ThisWeek,
    TableDateCompareTypeEnum.LastWeek,
    TableDateCompareTypeEnum.NextWeek,
    TableDateCompareTypeEnum.ThisMonth,
    TableDateCompareTypeEnum.LastMonth,
    TableDateCompareTypeEnum.NextMonth,
    TableDateCompareTypeEnum.ThisQuarter,
    TableDateCompareTypeEnum.LastQuarter,
    TableDateCompareTypeEnum.NextQuarter,
    TableDateCompareTypeEnum.NextYear,
    TableDateCompareTypeEnum.ThisYear,
    TableDateCompareTypeEnum.LastYear,
    TableDateCompareTypeEnum.YearToDate,
]);

export function isNumberDynamicFilter(compareType: TableConditionCompareType): compareType is TableNumberCompareTypeEnum {
    return NumberDynamicFilterCompareTypeSet.has(compareType as TableNumberCompareTypeEnum);
}

export function isDateDynamicFilter(compareType: TableConditionCompareType): compareType is TableDateCompareTypeEnum {
    return DateDynamicFilterCompareTypeSet.has(compareType as TableDateCompareTypeEnum);
}

export function getConditionExecuteFunc(filter: ITableConditionFilterItem, calculatedOptions: ICalculatedOptions | undefined) {
    if (isNumberDynamicFilter(filter.filterInfo.compareType)) {
        return (value: any) => true;
    } else {
        switch (filter.filterInfo.conditionType) {
            case TableConditionTypeEnum.Date:
                return getDateFilterExecuteFunc(filter.filterInfo as ITableDateFilterInfo);
            case TableConditionTypeEnum.Number:
                return getNumberFilterExecuteFunc(filter.filterInfo as ITableNumberFilterInfo, calculatedOptions);
            case TableConditionTypeEnum.String:
                return getTextFilterExecuteFunc(filter.filterInfo as ITableStringFilterInfo);
            case TableConditionTypeEnum.Logic:
            default:
                return (value: any) => true;
        }
    }
}

export function getCellValueWithConditionType(sheet: Worksheet, row: number, col: number, conditionType: TableConditionTypeEnum) {
    switch (conditionType) {
        case TableConditionTypeEnum.Date:
        {
            const dateNumber = getNumberCellValue(sheet, row, col);
            return dateNumber ? excelSerialToDateTime(dateNumber) : null;
        }
        case TableConditionTypeEnum.Number:
            return getNumberCellValue(sheet, row, col);
        case TableConditionTypeEnum.String:
        default:
            return getStringCellValue(sheet, row, col);
    }
}

export const getStringFromDataStream = (data: IDocumentData): string => {
    const dataStream = data.body?.dataStream.replace(/\r\n$/, '') || '';
    return dataStream;
};

function getStringCellValue(sheet: Worksheet, row: number, col: number) {
    const cellData = sheet.getCell(row, col);
    if (!cellData) return null;
    const { v, t, p } = cellData;
    if (p) {
        return getStringFromDataStream(p);
    }
    if (typeof v === 'string') {
        if (t === CellValueType.BOOLEAN) return v.toUpperCase();
        return v;
    };

    if (typeof v === 'number') {
        if (t === CellValueType.BOOLEAN) return v ? 'TRUE' : 'FALSE';
        return v;
    };

    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';

    if (v === undefined) {
        return '(空白)';
    }

    return String(v);
}
function getNumberCellValue(sheet: Worksheet, row: number, col: number) {
    const cellData = sheet.getCell(row, col);
    if (!cellData) return null;
    const { v, t, p } = cellData;
    if (p) {
        return null;
    }
    if (typeof v === 'string' && t === CellValueType.NUMBER) {
        // use this way to instead of numfmt.parseNumber(v as string).v as number;
        return Number(sheet.getCellRaw(row, col)!.v);
    }
    return Number(v);
}

export function excelSerialToDateTime(serial: number): Date {
    const baseDate = new Date(Date.UTC(1900, 0, 1, 0, 0, 0)); // January 1, 1900, UTC
    const leapDayDate = new Date(Date.UTC(1900, 1, 28, 0, 0, 0)); // February 28, 1900, UTC

    let dayDifference = serial - 1; // Adjust for Excel serial number starting from 1

    // If the serial number corresponds to a date later than February 28, 1900, adjust the day difference
    if (dayDifference > (leapDayDate.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)) {
        dayDifference -= 1;
    }

    if (dayDifference < 0) {
        dayDifference = serial;
    }

    const resultDate = new Date(baseDate.getTime() + dayDifference * (1000 * 3600 * 24));
    return resultDate;
}
