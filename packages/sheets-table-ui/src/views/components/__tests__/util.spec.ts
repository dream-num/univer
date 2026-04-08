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

import { TableConditionTypeEnum, TableDateCompareTypeEnum, TableNumberCompareTypeEnum, TableStringCompareTypeEnum } from '@univerjs/sheets-table';
import { describe, expect, it } from 'vitest';
import { ConditionSubComponentEnum } from '../type';
import { getCascaderListOptions, getConditionDateSelect, getInitConditionInfo, getSubComponentType } from '../util';

const injector = {
    get: () => ({
        t: (key: string) => `t:${key}`,
    }),
} as any;

describe('table filter util', () => {
    it('should build translated cascader/date options for string, number and date filters', () => {
        const cascaderOptions = getCascaderListOptions(injector);
        const quarterOptions = getConditionDateSelect(injector, TableDateCompareTypeEnum.Quarter);
        const monthOptions = getConditionDateSelect(injector, TableDateCompareTypeEnum.Month);

        expect(cascaderOptions).toHaveLength(3);
        expect(cascaderOptions[0]).toEqual(expect.objectContaining({
            value: TableConditionTypeEnum.String,
            label: 't:sheets-table.condition.string',
        }));
        expect(cascaderOptions[1]?.children).toEqual(expect.arrayContaining([
            expect.objectContaining({ value: TableNumberCompareTypeEnum.Between }),
            expect.objectContaining({ value: TableNumberCompareTypeEnum.Above }),
        ]));
        expect(cascaderOptions[2]?.children).toEqual(expect.arrayContaining([
            expect.objectContaining({ value: TableDateCompareTypeEnum.Quarter }),
            expect.objectContaining({ value: TableDateCompareTypeEnum.Month }),
        ]));
        expect(quarterOptions.map((item) => item.value)).toEqual([
            TableDateCompareTypeEnum.Q1,
            TableDateCompareTypeEnum.Q2,
            TableDateCompareTypeEnum.Q3,
            TableDateCompareTypeEnum.Q4,
        ]);
        expect(monthOptions).toHaveLength(12);
        expect(getConditionDateSelect(injector)).toEqual([]);
    });

    it('should select the right condition sub component for common filtering scenarios', () => {
        expect(getSubComponentType(TableConditionTypeEnum.String, TableStringCompareTypeEnum.Contains)).toBe(ConditionSubComponentEnum.Input);
        expect(getSubComponentType(TableConditionTypeEnum.Number, TableNumberCompareTypeEnum.Between)).toBe(ConditionSubComponentEnum.Inputs);
        expect(getSubComponentType(TableConditionTypeEnum.Number, TableNumberCompareTypeEnum.GreaterThan)).toBe(ConditionSubComponentEnum.Input);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Between)).toBe(ConditionSubComponentEnum.DateRange);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Quarter)).toBe(ConditionSubComponentEnum.Select);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.After)).toBe(ConditionSubComponentEnum.DatePicker);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Today)).toBe(ConditionSubComponentEnum.None);
        expect(getSubComponentType(TableConditionTypeEnum.String)).toBe(ConditionSubComponentEnum.None);
    });

    it('should normalize saved filter conditions back to the form state', () => {
        expect(getInitConditionInfo()).toEqual({
            type: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.Equal,
            info: {},
        });

        const dateBetween = getInitConditionInfo({
            filterType: 'condition',
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Between,
                expectedValue: ['2025-01-01', '2025-01-31'],
            },
        } as any);
        expect(dateBetween).toEqual({
            type: TableConditionTypeEnum.Date,
            compare: TableDateCompareTypeEnum.Between,
            info: {
                dateRange: [new Date('2025-01-01'), new Date('2025-01-31')],
            },
        });

        const dateQuarter = getInitConditionInfo({
            filterType: 'condition',
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Q2,
            },
        } as any);
        expect(dateQuarter).toEqual({
            type: TableConditionTypeEnum.Date,
            compare: TableDateCompareTypeEnum.Quarter,
            info: { dateSelect: TableDateCompareTypeEnum.Q2 },
        });

        const numberBetween = getInitConditionInfo({
            filterType: 'condition',
            filterInfo: {
                conditionType: TableConditionTypeEnum.Number,
                compareType: TableNumberCompareTypeEnum.NotBetween,
                expectedValue: [1, 10],
            },
        } as any);
        expect(numberBetween).toEqual({
            type: TableConditionTypeEnum.Number,
            compare: TableNumberCompareTypeEnum.NotBetween,
            info: { numberRange: [1, 10] },
        });

        const stringEquals = getInitConditionInfo({
            filterType: 'condition',
            filterInfo: {
                conditionType: TableConditionTypeEnum.String,
                compareType: TableStringCompareTypeEnum.Equal,
                expectedValue: 'OpenAI',
            },
        } as any);
        expect(stringEquals).toEqual({
            type: TableConditionTypeEnum.String,
            compare: TableStringCompareTypeEnum.Equal,
            info: { string: 'OpenAI' },
        });
    });
});
