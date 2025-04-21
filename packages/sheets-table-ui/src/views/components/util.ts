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

/* eslint-disable max-lines-per-function */

import type { Injector } from '@univerjs/core';
import type { ITableFilterItem } from '@univerjs/sheets-table';
import type { IConditionCompareTypeEnum } from './type';
import { LocaleService } from '@univerjs/core';
import { TableConditionTypeEnum, TableDateCompareTypeEnum, TableNumberCompareTypeEnum, TableStringCompareTypeEnum } from '@univerjs/sheets-table';
import { ConditionSubComponentEnum } from './type';

export function getCascaderListOptions(injector: Injector) {
    const localeService = injector.get(LocaleService);
    const t = localeService.t;
    return [
        {
            value: TableConditionTypeEnum.String,
            label: t(`sheets-table.condition.${TableConditionTypeEnum.String}`),
            children: [
                {
                    value: TableStringCompareTypeEnum.Equal,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.Equal}`),
                },
                {
                    value: TableStringCompareTypeEnum.NotEqual,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableStringCompareTypeEnum.Contains,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.Contains}`),
                },
                {
                    value: TableStringCompareTypeEnum.NotContains,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.NotContains}`),
                },
                {
                    value: TableStringCompareTypeEnum.StartsWith,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.StartsWith}`),
                },
                {
                    value: TableStringCompareTypeEnum.EndsWith,
                    label: t(`sheets-table.string.compare.${TableStringCompareTypeEnum.EndsWith}`),
                },
            ],
        },
        {
            value: TableConditionTypeEnum.Number,
            label: t(`sheets-table.condition.${TableConditionTypeEnum.Number}`),
            children: [
                {
                    value: TableNumberCompareTypeEnum.Equal,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.Equal}`),
                },
                {
                    value: TableNumberCompareTypeEnum.NotEqual,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.GreaterThan,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.GreaterThan}`),
                },
                {
                    value: TableNumberCompareTypeEnum.GreaterThanOrEqual,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.GreaterThanOrEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.LessThan,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.LessThan}`),
                },
                {
                    value: TableNumberCompareTypeEnum.LessThanOrEqual,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.LessThanOrEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Between,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.Between}`),
                },
                {
                    value: TableNumberCompareTypeEnum.NotBetween,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.NotBetween}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Above,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.Above}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Below,
                    label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.Below}`),
                },
                // {
                //     value: TableNumberCompareTypeEnum.TopN,
                //     label: t(`sheets-table.number.compare.${TableNumberCompareTypeEnum.TopN}`),
                // },
            ],
        },
        {
            value: TableConditionTypeEnum.Date,
            label: t(`sheets-table.condition.${TableConditionTypeEnum.Date}`),
            children: [
                {
                    value: TableDateCompareTypeEnum.Equal,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Equal}`),
                },
                {
                    value: TableDateCompareTypeEnum.NotEqual,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.After,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.After}`),
                },
                {
                    value: TableDateCompareTypeEnum.AfterOrEqual,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.AfterOrEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.Before,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Before}`),
                },
                {
                    value: TableDateCompareTypeEnum.BeforeOrEqual,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.BeforeOrEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.Between,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Between}`),
                },
                {
                    value: TableDateCompareTypeEnum.NotBetween,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.NotBetween}`),
                },
                {
                    value: TableDateCompareTypeEnum.Today,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Today}`),
                },
                {
                    value: TableDateCompareTypeEnum.Yesterday,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Yesterday}`),
                },
                {
                    value: TableDateCompareTypeEnum.Tomorrow,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Tomorrow}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisWeek,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.ThisWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastWeek,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.LastWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextWeek,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.NextWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisMonth,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.ThisMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastMonth,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.LastMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextMonth,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.NextMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisYear,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.ThisYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastYear,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.LastYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextYear,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.NextYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.Quarter,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Quarter}`),
                },
                {
                    value: TableDateCompareTypeEnum.Month,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Month}`),
                },
            ],
        },
    ];
}

export function getConditionDateSelect(injector: Injector, dateType?: TableDateCompareTypeEnum) {
    if (!dateType) {
        return [];
    }
    const localeService = injector.get(LocaleService);
    const t = localeService.t;
    switch (dateType) {
        case TableDateCompareTypeEnum.Quarter:
            return [
                {
                    value: TableDateCompareTypeEnum.Q1,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Q1}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q2,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Q2}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q3,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Q3}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q4,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.Q4}`),
                },
            ];
        case TableDateCompareTypeEnum.Month:
            return [
                {
                    value: TableDateCompareTypeEnum.M1,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M1}`),
                },
                {
                    value: TableDateCompareTypeEnum.M2,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M2}`),
                },
                {
                    value: TableDateCompareTypeEnum.M3,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M3}`),
                },
                {
                    value: TableDateCompareTypeEnum.M4,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M4}`),
                },
                {
                    value: TableDateCompareTypeEnum.M5,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M5}`),
                },
                {
                    value: TableDateCompareTypeEnum.M6,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M6}`),
                },
                {
                    value: TableDateCompareTypeEnum.M7,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M7}`),
                },
                {
                    value: TableDateCompareTypeEnum.M8,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M8}`),
                },
                {
                    value: TableDateCompareTypeEnum.M9,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M9}`),
                },
                {
                    value: TableDateCompareTypeEnum.M10,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M10}`),
                },
                {
                    value: TableDateCompareTypeEnum.M11,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M11}`),
                },
                {
                    value: TableDateCompareTypeEnum.M12,
                    label: t(`sheets-table.date.compare.${TableDateCompareTypeEnum.M12}`),
                },
            ];
        default:
            return [];
    }
}

export const datePickerSet: Set<IConditionCompareTypeEnum> = new Set([
    TableDateCompareTypeEnum.Equal,
    TableDateCompareTypeEnum.NotEqual,
    TableDateCompareTypeEnum.After,
    TableDateCompareTypeEnum.AfterOrEqual,
    TableDateCompareTypeEnum.Before,
    TableDateCompareTypeEnum.BeforeOrEqual,
]);

export function getSubComponentType(type: TableConditionTypeEnum, compare?: TableStringCompareTypeEnum | TableNumberCompareTypeEnum | TableDateCompareTypeEnum): ConditionSubComponentEnum {
    if (!compare) {
        return ConditionSubComponentEnum.None;
    }
    if (type === TableConditionTypeEnum.String) {
        return ConditionSubComponentEnum.Input;
    } else if (type === TableConditionTypeEnum.Number) {
        if (compare === TableNumberCompareTypeEnum.Between || compare === TableNumberCompareTypeEnum.NotBetween) {
            return ConditionSubComponentEnum.Inputs;
        } else {
            return ConditionSubComponentEnum.Input;
        }
    } else if (type === TableConditionTypeEnum.Date) {
        if (compare === TableDateCompareTypeEnum.Between || compare === TableDateCompareTypeEnum.NotBetween) {
            return ConditionSubComponentEnum.DateRange;
        } else if (compare === TableDateCompareTypeEnum.Quarter || compare === TableDateCompareTypeEnum.Month) {
            return ConditionSubComponentEnum.Select;
        } else if (datePickerSet.has(compare as TableDateCompareTypeEnum)) {
            return ConditionSubComponentEnum.DatePicker;
        }
        return ConditionSubComponentEnum.None;
    }
    return ConditionSubComponentEnum.None;
}

// eslint-disable-next-line complexity
export function getInitConditionInfo(tableFilter?: ITableFilterItem) {
    if (!tableFilter || tableFilter.filterType !== 'condition') {
        return {
            type: TableConditionTypeEnum.String,
            compareType: TableStringCompareTypeEnum.Equal,
            info: {},
        };
    }

    const filterInfo = tableFilter.filterInfo;
    const { conditionType, compareType } = filterInfo;
    if (conditionType === TableConditionTypeEnum.Date) {
        if (compareType === TableDateCompareTypeEnum.Between || compareType === TableDateCompareTypeEnum.NotBetween) {
            return {
                type: conditionType,
                compare: compareType,
                info: {
                    dateRange: filterInfo.expectedValue,
                },
            };
        } else if (compareType === TableDateCompareTypeEnum.Today
            || compareType === TableDateCompareTypeEnum.Yesterday
            || compareType === TableDateCompareTypeEnum.Tomorrow
            || compareType === TableDateCompareTypeEnum.ThisWeek
            || compareType === TableDateCompareTypeEnum.LastWeek
            || compareType === TableDateCompareTypeEnum.NextWeek
            || compareType === TableDateCompareTypeEnum.ThisMonth
            || compareType === TableDateCompareTypeEnum.LastMonth
            || compareType === TableDateCompareTypeEnum.NextMonth
            || compareType === TableDateCompareTypeEnum.ThisYear
            || compareType === TableDateCompareTypeEnum.LastYear
            || compareType === TableDateCompareTypeEnum.NextYear
        ) {
            return {
                type: conditionType,
                compare: compareType,
                info: {},
            };
        } else if (datePickerSet.has(compareType as TableDateCompareTypeEnum)) {
            return {
                type: conditionType,
                compare: compareType,
                info: {
                    date: filterInfo.expectedValue,
                },
            };
        } else {
            const quarter = new Set([TableDateCompareTypeEnum.Q1, TableDateCompareTypeEnum.Q2, TableDateCompareTypeEnum.Q3, TableDateCompareTypeEnum.Q4]);
            if (quarter.has(compareType as TableDateCompareTypeEnum)) {
                return {
                    type: conditionType,
                    compare: TableDateCompareTypeEnum.Quarter,
                    info: {
                        dateSelect: filterInfo.compareType,
                    },
                };
            } else {
                return {
                    type: conditionType,
                    compare: TableDateCompareTypeEnum.Month,
                    info: {
                        dateSelect: filterInfo.compareType,
                    },
                };
            }
        }
    } else if (conditionType === TableConditionTypeEnum.Number) {
        if (compareType === TableNumberCompareTypeEnum.Between || compareType === TableNumberCompareTypeEnum.NotBetween) {
            return {
                type: conditionType,
                compare: compareType,
                info: {
                    numberRange: filterInfo.expectedValue,
                },
            };
        } else {
            return {
                type: conditionType,
                compare: compareType,
                info: {
                    number: filterInfo.expectedValue,
                },
            };
        }
    } else if (conditionType === TableConditionTypeEnum.String) {
        return {
            type: conditionType,
            compare: compareType,
            info: {
                string: filterInfo.expectedValue,
            },
        };
    }

    return {
        type: TableConditionTypeEnum.String,
        compare: TableStringCompareTypeEnum.Equal,
        info: {},
    };
}
