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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { CellValueType, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    TableColumnFilterTypeEnum,
    TableConditionTypeEnum,
    TableDateCompareTypeEnum,
    TableNumberCompareTypeEnum,
    TableStringCompareTypeEnum,
} from '../../../types/enum';
import {
    excelSerialToDateTime,
    getCellValueWithConditionType,
    getConditionExecuteFunc,
    getStringFromDataStream,
    isDateDynamicFilter,
    isNumberDynamicFilter,
} from '../condition';
import {
    dateM1,
    dateM10,
    dateM11,
    dateM12,
    dateM2,
    dateM3,
    dateM4,
    dateM5,
    dateM6,
    dateM7,
    dateM8,
    dateM9,
    dateQ1,
    dateQ2,
    dateQ3,
    dateQ4,
    getDateFilterExecuteFunc,
    lastQuarter,
    lastWeek,
    lastYear,
    nextMonth,
    nextQuarter,
    nextWeek,
    nextYear,
    thisMonth,
    thisQuarter,
    thisWeek,
    thisYear,
    today,
    tomorrow,
    yearToDate,
    yesterday,
} from '../date-filter-util';
import { above, below, getBottomN, getNumberFilterExecuteFunc, getTopN } from '../number-filter-util';
import {
    getTextFilterExecuteFunc,
    textContain,
    textEndWith,
    textEqual,
    textNotContain,
    textNotEqual,
    textStartWith,
} from '../text-filter-util';
import { getLargestK, getSmallestK } from '../top-n';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'filter-util-workbook',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'filter-util-workbook',
        sheetOrder: ['sheet-1'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet-1',
                rowCount: 10,
                columnCount: 8,
                cellData: {
                    0: {
                        0: { v: 'plain text', t: CellValueType.STRING },
                        1: { v: 'true', t: CellValueType.BOOLEAN },
                        2: { v: 1, t: CellValueType.BOOLEAN },
                        3: { v: true },
                        4: { p: { body: { dataStream: 'rich text\r\n' } } as any },
                    },
                    1: {
                        0: { v: '42', t: CellValueType.NUMBER },
                        1: { v: 44927, t: CellValueType.NUMBER },
                        2: { v: undefined },
                    },
                },
            },
        },
    };
}

describe('table filter utilities', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        vi.restoreAllMocks();
        univer?.dispose();
        univer = undefined;
    });

    it('matches relative date filters from a fixed business anchor', () => {
        const anchor = new Date(2024, 5, 12, 12);

        expect(today(new Date(2024, 5, 12, 8), anchor)).toBe(true);
        expect(yesterday(new Date(2024, 5, 11), anchor)).toBe(true);
        expect(tomorrow(new Date(2024, 5, 13), anchor)).toBe(true);
        expect(thisWeek(new Date(2024, 5, 10), anchor)).toBe(true);
        expect(lastWeek(new Date(2024, 5, 5), anchor)).toBe(true);
        expect(nextWeek(new Date(2024, 5, 17), anchor)).toBe(true);
        expect(thisMonth(new Date(2024, 5, 1), anchor)).toBe(true);
        expect(nextMonth(new Date(2024, 6, 1), anchor)).toBe(true);
        expect(nextMonth(new Date(2024, 7, 1), anchor)).toBe(false);
        expect(thisQuarter(new Date(2024, 3, 1), anchor)).toBe(true);
        expect(lastQuarter(new Date(2024, 1, 15), anchor)).toBe(true);
        expect(nextQuarter(new Date(2024, 6, 15), anchor)).toBe(true);
        expect(thisYear(new Date(2024, 0, 1), anchor)).toBe(true);
        expect(lastYear(new Date(2023, 11, 31), anchor)).toBe(true);
        expect(nextYear(new Date(2025, 0, 1), anchor)).toBe(true);
        expect(yearToDate(new Date(2024, 2, 1), anchor)).toBe(true);
        expect(yearToDate(new Date(2024, 5, 13), anchor)).toBe(false);
    });

    it('matches date month and quarter presets used by table filter menus', () => {
        const monthChecks = [
            dateM1,
            dateM2,
            dateM3,
            dateM4,
            dateM5,
            dateM6,
            dateM7,
            dateM8,
            dateM9,
            dateM10,
            dateM11,
            dateM12,
        ];

        monthChecks.forEach((matchMonth, month) => {
            expect(matchMonth(new Date(2024, month, 1))).toBe(true);
            expect(matchMonth(new Date(2024, (month + 1) % 12, 1))).toBe(false);
        });

        expect(dateQ1(new Date(2024, 1, 1))).toBe(true);
        expect(dateQ2(new Date(2024, 4, 1))).toBe(true);
        expect(dateQ3(new Date(2024, 7, 1))).toBe(true);
        expect(dateQ4(new Date(2024, 10, 1))).toBe(true);
    });

    it('builds executable date predicates for fixed and relative date filters', () => {
        const anchor = new Date(2024, 5, 12).getTime();
        const onJuneTen = new Date(2024, 5, 10);
        const onJuneTwelve = new Date(2024, 5, 12);

        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Equal,
            expectedValue: onJuneTen,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NotEqual,
            expectedValue: onJuneTen,
        })(onJuneTwelve)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.After,
            expectedValue: onJuneTen,
        })(onJuneTwelve)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.AfterOrEqual,
            expectedValue: onJuneTen,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Before,
            expectedValue: onJuneTwelve,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.BeforeOrEqual,
            expectedValue: onJuneTwelve,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Between,
            expectedValue: [onJuneTen, onJuneTwelve],
        })(new Date(2024, 5, 11))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NotBetween,
            expectedValue: [onJuneTen, onJuneTwelve],
        })(new Date(2024, 5, 14))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Today,
            anchorTime: anchor,
        })(onJuneTwelve)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Yesterday,
            anchorTime: anchor,
        })(new Date(2024, 5, 11))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Tomorrow,
            anchorTime: anchor,
        })(new Date(2024, 5, 13))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.ThisWeek,
            anchorTime: anchor,
        })(new Date(2024, 5, 10))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.LastWeek,
            anchorTime: anchor,
        })(new Date(2024, 5, 5))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NextWeek,
            anchorTime: anchor,
        })(new Date(2024, 5, 17))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.ThisMonth,
            anchorTime: anchor,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.LastMonth,
            anchorTime: anchor,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NextMonth,
            anchorTime: anchor,
        })(new Date(2024, 6, 1))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.ThisQuarter,
            anchorTime: anchor,
        })(onJuneTen)).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.LastQuarter,
            anchorTime: anchor,
        })(new Date(2024, 1, 15))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NextQuarter,
            anchorTime: anchor,
        })(new Date(2024, 6, 15))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.ThisYear,
            anchorTime: anchor,
        })(new Date(2024, 0, 1))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.LastYear,
            anchorTime: anchor,
        })(new Date(2023, 0, 1))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.NextYear,
            anchorTime: anchor,
        })(new Date(2025, 0, 1))).toBe(true);
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.YearToDate,
            anchorTime: anchor,
        })(new Date(2024, 2, 1))).toBe(true);
        [
            TableDateCompareTypeEnum.M1,
            TableDateCompareTypeEnum.M2,
            TableDateCompareTypeEnum.M3,
            TableDateCompareTypeEnum.M4,
            TableDateCompareTypeEnum.M5,
            TableDateCompareTypeEnum.M6,
            TableDateCompareTypeEnum.M7,
            TableDateCompareTypeEnum.M8,
            TableDateCompareTypeEnum.M9,
            TableDateCompareTypeEnum.M10,
            TableDateCompareTypeEnum.M11,
            TableDateCompareTypeEnum.M12,
        ].forEach((compareType, month) => {
            expect(getDateFilterExecuteFunc({
                conditionType: TableConditionTypeEnum.Date,
                compareType,
            })(new Date(2024, month, 1))).toBe(true);
        });
        expect(getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: TableDateCompareTypeEnum.Q2,
        })(onJuneTwelve)).toBe(true);
        expect(() => getDateFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Date,
            compareType: 'unsupported' as TableDateCompareTypeEnum,
        })).toThrow('Unsupported compare type');
    });

    it('matches numeric filters including ranges, averages and top n lists', () => {
        expect(above(8, 5)).toBe(true);
        expect(below(3, 5)).toBe(true);
        expect(getTopN([9, 1, 5, 3], 2, 9)).toBe(true);
        expect(getBottomN([9, 1, 5, 3], 2, 1)).toBe(true);
        expect(getLargestK([9, 1, 5, 3], 2).sort((a, b) => a - b)).toEqual([5, 9]);
        expect(getSmallestK([9, 1, 5, 3], 2).sort((a, b) => a - b)).toEqual([1, 3]);

        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.Equal,
            expectedValue: 10,
        }, undefined)!(10)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.NotEqual,
            expectedValue: 10,
        }, undefined)!(9)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.GreaterThanOrEqual,
            expectedValue: 10,
        }, undefined)!(10)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.GreaterThan,
            expectedValue: 10,
        }, undefined)!(11)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.LessThan,
            expectedValue: 10,
        }, undefined)!(9)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.LessThanOrEqual,
            expectedValue: 10,
        }, undefined)!(10)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.Between,
            expectedValue: [20, 10],
        }, undefined)!(15)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.NotBetween,
            expectedValue: [10, 20],
        }, undefined)!(25)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.Above,
            expectedValue: 0,
        }, { average: 12 })!(13)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.Below,
            expectedValue: 0,
        }, { average: 12 })!(11)).toBe(true);
        expect(getNumberFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.Number,
            compareType: TableNumberCompareTypeEnum.TopN,
            expectedValue: 2,
        }, { list: [10, 30, 20] })!(30)).toBe(true);
    });

    it('matches text filters with wildcard-aware predicates', () => {
        expect(textEqual('North-01', 'North-*')).toBe(true);
        expect(textNotEqual('South-01', 'North-*')).toBe(true);
        expect(textContain('FY24 Revenue', 'Revenue')).toBe(true);
        expect(textNotContain('FY24 Cost', 'Revenue')).toBe(true);
        expect(textStartWith('Table Sales', 'Table')).toBe(true);
        expect(textEndWith('Table Sales', 'Sales')).toBe(true);

        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.Contains,
            expectedValue: 'West',
        })('West Region')).toBe(true);
        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.Equal,
            expectedValue: 'West*',
        })('West Region')).toBe(true);
        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.NotEqual,
            expectedValue: 'East*',
        })('West Region')).toBe(true);
        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.NotContains,
            expectedValue: 'East',
        })('West Region')).toBe(true);
        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.EndsWith,
            expectedValue: 'Region',
        })('West Region')).toBe(true);

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(getTextFilterExecuteFunc({
            conditionType: TableConditionTypeEnum.String,
            compareType: 'unknown' as TableStringCompareTypeEnum,
            expectedValue: 'x',
        })('anything')).toBe(true);
        expect(errorSpy).toHaveBeenCalled();
    });

    it('selects condition filter executors and reads typed worksheet values from real workbook data', () => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const worksheet = workbook.getSheetBySheetId('sheet-1')!;

        expect(isNumberDynamicFilter(TableNumberCompareTypeEnum.TopN)).toBe(true);
        expect(isNumberDynamicFilter(TableNumberCompareTypeEnum.Equal)).toBe(false);
        expect(isDateDynamicFilter(TableDateCompareTypeEnum.ThisWeek)).toBe(true);
        expect(isDateDynamicFilter(TableDateCompareTypeEnum.Equal)).toBe(false);

        expect((getConditionExecuteFunc({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Number,
                compareType: TableNumberCompareTypeEnum.TopN,
                expectedValue: 2,
            },
        }, { list: [1, 2, 3] }) as (value: unknown) => boolean)(999)).toBe(true);
        expect((getConditionExecuteFunc({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.String,
                compareType: TableStringCompareTypeEnum.StartsWith,
                expectedValue: 'plain',
            },
        }, undefined) as (value: unknown) => boolean)('plain text')).toBe(true);
        expect((getConditionExecuteFunc({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Number,
                compareType: TableNumberCompareTypeEnum.Equal,
                expectedValue: 42,
            },
        }, undefined) as (value: unknown) => boolean)(42)).toBe(true);
        expect((getConditionExecuteFunc({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Equal,
                expectedValue: new Date(2024, 5, 12),
            },
        }, undefined) as (value: unknown) => boolean)(new Date(2024, 5, 12))).toBe(true);
        expect((getConditionExecuteFunc({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Logic,
                compareType: TableNumberCompareTypeEnum.Equal,
                expectedValue: [],
            },
        }, undefined) as (value: unknown) => boolean)('any')).toBe(true);

        expect(getStringFromDataStream({ body: { dataStream: 'rich text\r\n' } } as any)).toBe('rich text');
        expect(getCellValueWithConditionType(worksheet, 0, 0, TableConditionTypeEnum.String)).toBe('plain text');
        expect(getCellValueWithConditionType(worksheet, 0, 1, TableConditionTypeEnum.String)).toBe('TRUE');
        expect(getCellValueWithConditionType(worksheet, 0, 2, TableConditionTypeEnum.String)).toBe('TRUE');
        expect(getCellValueWithConditionType(worksheet, 0, 3, TableConditionTypeEnum.String)).toBe('TRUE');
        expect(getCellValueWithConditionType(worksheet, 0, 4, TableConditionTypeEnum.String)).toBe('rich text');
        expect(getCellValueWithConditionType(worksheet, 1, 0, TableConditionTypeEnum.Number)).toBe(42);
        expect(getCellValueWithConditionType(worksheet, 0, 4, TableConditionTypeEnum.Number)).toBeNull();
        expect(getCellValueWithConditionType(worksheet, 1, 2, TableConditionTypeEnum.String)).toBeUndefined();
        expect(getCellValueWithConditionType(worksheet, 1, 1, TableConditionTypeEnum.Date)).toEqual(excelSerialToDateTime(44927));
        expect(getCellValueWithConditionType(worksheet, 9, 9, TableConditionTypeEnum.String)).toBeNull();
    });
});
