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

import type { Injector } from '@univerjs/core';
import type { ITableFilterItem } from '@univerjs/sheets-table';
import type { LocaleKey } from '../../locale/types';
import type { IConditionCompareTypeEnum } from './type';
import { LocaleService } from '@univerjs/core';
import {
    TableConditionTypeEnum,
    TableDateCompareTypeEnum,
    TableNumberCompareTypeEnum,
    TableStringCompareTypeEnum,
} from '@univerjs/sheets-table';
import { ConditionSubComponentEnum } from './type';

export function getCascaderListOptions(injector: Injector) {
    const localeService = injector.get(LocaleService);
    return [
        {
            value: TableConditionTypeEnum.String,
            label: localeService.t<LocaleKey>(`sheets-table-ui.condition.${TableConditionTypeEnum.String}`),
            children: [
                {
                    value: TableStringCompareTypeEnum.Equal,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.Equal}`),
                },
                {
                    value: TableStringCompareTypeEnum.NotEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableStringCompareTypeEnum.Contains,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.Contains}`),
                },
                {
                    value: TableStringCompareTypeEnum.NotContains,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.NotContains}`),
                },
                {
                    value: TableStringCompareTypeEnum.StartsWith,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.StartsWith}`),
                },
                {
                    value: TableStringCompareTypeEnum.EndsWith,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.string.compare.${TableStringCompareTypeEnum.EndsWith}`),
                },
            ],
        },
        {
            value: TableConditionTypeEnum.Number,
            label: localeService.t<LocaleKey>(`sheets-table-ui.condition.${TableConditionTypeEnum.Number}`),
            children: [
                {
                    value: TableNumberCompareTypeEnum.Equal,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.Equal}`),
                },
                {
                    value: TableNumberCompareTypeEnum.NotEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.GreaterThan,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.GreaterThan}`),
                },
                {
                    value: TableNumberCompareTypeEnum.GreaterThanOrEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.GreaterThanOrEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.LessThan,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.LessThan}`),
                },
                {
                    value: TableNumberCompareTypeEnum.LessThanOrEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.LessThanOrEqual}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Between,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.Between}`),
                },
                {
                    value: TableNumberCompareTypeEnum.NotBetween,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.NotBetween}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Above,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.Above}`),
                },
                {
                    value: TableNumberCompareTypeEnum.Below,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.Below}`),
                },
                // {
                //     value: TableNumberCompareTypeEnum.TopN,
                //     label: localeService.t<LocaleKey>(`sheets-table-ui.number.compare.${TableNumberCompareTypeEnum.TopN}`),
                // },
            ],
        },
        {
            value: TableConditionTypeEnum.Date,
            label: localeService.t<LocaleKey>(`sheets-table-ui.condition.${TableConditionTypeEnum.Date}`),
            children: [
                {
                    value: TableDateCompareTypeEnum.Equal,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Equal}`),
                },
                {
                    value: TableDateCompareTypeEnum.NotEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.NotEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.After,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.After}`),
                },
                {
                    value: TableDateCompareTypeEnum.AfterOrEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.AfterOrEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.Before,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Before}`),
                },
                {
                    value: TableDateCompareTypeEnum.BeforeOrEqual,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.BeforeOrEqual}`),
                },
                {
                    value: TableDateCompareTypeEnum.Between,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Between}`),
                },
                {
                    value: TableDateCompareTypeEnum.NotBetween,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.NotBetween}`),
                },
                {
                    value: TableDateCompareTypeEnum.Today,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Today}`),
                },
                {
                    value: TableDateCompareTypeEnum.Yesterday,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Yesterday}`),
                },
                {
                    value: TableDateCompareTypeEnum.Tomorrow,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Tomorrow}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisWeek,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.ThisWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastWeek,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.LastWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextWeek,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.NextWeek}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisMonth,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.ThisMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastMonth,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.LastMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextMonth,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.NextMonth}`),
                },
                {
                    value: TableDateCompareTypeEnum.ThisYear,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.ThisYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.LastYear,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.LastYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.NextYear,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.NextYear}`),
                },
                {
                    value: TableDateCompareTypeEnum.Quarter,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Quarter}`),
                },
                {
                    value: TableDateCompareTypeEnum.Month,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Month}`),
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
    switch (dateType) {
        case TableDateCompareTypeEnum.Quarter:
            return [
                {
                    value: TableDateCompareTypeEnum.Q1,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Q1}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q2,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Q2}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q3,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Q3}`),
                },
                {
                    value: TableDateCompareTypeEnum.Q4,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.Q4}`),
                },
            ];
        case TableDateCompareTypeEnum.Month:
            return [
                {
                    value: TableDateCompareTypeEnum.M1,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M1}`),
                },
                {
                    value: TableDateCompareTypeEnum.M2,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M2}`),
                },
                {
                    value: TableDateCompareTypeEnum.M3,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M3}`),
                },
                {
                    value: TableDateCompareTypeEnum.M4,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M4}`),
                },
                {
                    value: TableDateCompareTypeEnum.M5,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M5}`),
                },
                {
                    value: TableDateCompareTypeEnum.M6,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M6}`),
                },
                {
                    value: TableDateCompareTypeEnum.M7,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M7}`),
                },
                {
                    value: TableDateCompareTypeEnum.M8,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M8}`),
                },
                {
                    value: TableDateCompareTypeEnum.M9,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M9}`),
                },
                {
                    value: TableDateCompareTypeEnum.M10,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M10}`),
                },
                {
                    value: TableDateCompareTypeEnum.M11,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M11}`),
                },
                {
                    value: TableDateCompareTypeEnum.M12,
                    label: localeService.t<LocaleKey>(`sheets-table-ui.date.compare.${TableDateCompareTypeEnum.M12}`),
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
            compare: TableStringCompareTypeEnum.Equal,
            info: {},
        };
    }

    const filterInfo = tableFilter.filterInfo;
    const { conditionType, compareType } = filterInfo;
    if (conditionType === TableConditionTypeEnum.Date) {
        if (compareType === TableDateCompareTypeEnum.Between || compareType === TableDateCompareTypeEnum.NotBetween) {
            // ensure expectedValue is an array of two dates
            let dateRange: [Date, Date] | undefined;
            if (Array.isArray(filterInfo.expectedValue)) {
                dateRange = filterInfo.expectedValue.map((i) => (typeof i === 'string' ? new Date(i) : i)) as [Date, Date];
            }

            return {
                type: conditionType,
                compare: compareType,
                info: {
                    dateRange,
                },
            };
        } else if (
            compareType === TableDateCompareTypeEnum.Today
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
            // ensure expectedValue is a date or an array of two dates
            let date: Date | [Date, Date] | undefined;

            if (typeof filterInfo.expectedValue === 'string') {
                date = new Date(filterInfo.expectedValue);
            } else if (Array.isArray(filterInfo.expectedValue)) {
                for (let i = 0; i < filterInfo.expectedValue.length; i++) {
                    if (typeof filterInfo.expectedValue[i] === 'string') {
                        filterInfo.expectedValue[i] = new Date(filterInfo.expectedValue[i]);
                    }
                }
            }

            return {
                type: conditionType,
                compare: compareType,
                info: {
                    date,
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
