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

import type { ITableFilterItem } from '@univerjs/sheets-table';
import {
    TableColumnFilterTypeEnum,
    TableConditionTypeEnum,
    TableDateCompareTypeEnum,
    TableNumberCompareTypeEnum,
    TableStringCompareTypeEnum,
} from '@univerjs/sheets-table';
import { describe, expect, it } from 'vitest';
import { ConditionSubComponentEnum } from '../type';
import { getInitConditionInfo, getSubComponentType } from '../util';

describe('sheet table condition utilities', () => {
    it('initializes a new condition filter as a text equality rule', () => {
        expect(getInitConditionInfo()).toEqual({
            type: TableConditionTypeEnum.String,
            compare: TableStringCompareTypeEnum.Equal,
            info: {},
        });
    });

    it('maps condition compare types to the editor control needed by users', () => {
        expect(getSubComponentType(TableConditionTypeEnum.String, TableStringCompareTypeEnum.Contains)).toBe(ConditionSubComponentEnum.Input);
        expect(getSubComponentType(TableConditionTypeEnum.Number, TableNumberCompareTypeEnum.Between)).toBe(ConditionSubComponentEnum.Inputs);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Between)).toBe(ConditionSubComponentEnum.DateRange);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Quarter)).toBe(ConditionSubComponentEnum.Select);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.After)).toBe(ConditionSubComponentEnum.DatePicker);
        expect(getSubComponentType(TableConditionTypeEnum.Date, TableDateCompareTypeEnum.Today)).toBe(ConditionSubComponentEnum.None);
    });

    it('hydrates saved date filters back into panel state without losing relative date choices', () => {
        const absoluteDateFilter: ITableFilterItem = {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Between,
                expectedValue: ['2026-01-01', '2026-01-31'],
            },
        };
        const quarterFilter: ITableFilterItem = {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Q3,
            },
        };
        const relativeDateFilter: ITableFilterItem = {
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: {
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.ThisMonth,
            },
        };

        expect(getInitConditionInfo(absoluteDateFilter)).toMatchObject({
            type: TableConditionTypeEnum.Date,
            compare: TableDateCompareTypeEnum.Between,
            info: {
                dateRange: [
                    new Date('2026-01-01'),
                    new Date('2026-01-31'),
                ],
            },
        });
        expect(getInitConditionInfo(quarterFilter)).toEqual({
            type: TableConditionTypeEnum.Date,
            compare: TableDateCompareTypeEnum.Quarter,
            info: {
                dateSelect: TableDateCompareTypeEnum.Q3,
            },
        });
        expect(getInitConditionInfo(relativeDateFilter)).toEqual({
            type: TableConditionTypeEnum.Date,
            compare: TableDateCompareTypeEnum.ThisMonth,
            info: {},
        });
    });
});
