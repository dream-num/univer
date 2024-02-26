/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Worksheet } from '@univerjs/core';
import { CellValueType, ObjectMatrix, Range } from '@univerjs/core';
import dayjs from 'dayjs';
import { NumberOperator, RuleType, SubRuleType, TextOperator, TimePeriodOperator } from '../../base/const';
import type { IAverageHighlightCell, IConditionFormatRule, IHighlightCell, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../../models/type';
import { getCellValue, isFloatsEqual, isNullable, serialTimeToTimestamp } from './utils';

export const highlightCellCalculateUnit = {
    type: RuleType.highlightCell,
    handle: (rule: IConditionFormatRule, worksheet: Worksheet) => {
        const ruleConfig = rule.rule as IHighlightCell;
        const getCache = () => {
            switch (ruleConfig.subType) {
                case SubRuleType.average:{
                    let sum = 0;
                    let count = 0;
                    rule.ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            if (cell && cell.t === CellValueType.NUMBER) {
                                sum += Number(cell.v || 0);
                                count++;
                            }
                        });
                    });
                    return { average: sum / count };
                }
                case SubRuleType.uniqueValues:
                case SubRuleType.duplicateValues:{
                    const cacheMap: Map<any, number> = new Map();
                    rule.ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            if (cell && !isNullable(cell.v)) {
                                const cache = cacheMap.get(cell.v);
                                if (cache) {
                                    cacheMap.set(cell.v, cache + 1);
                                } else {
                                    cacheMap.set(cell.v, 1);
                                }
                            }
                        });
                    });
                    return { count: cacheMap };
                }
                case SubRuleType.rank:{
                    const allValue: number[] = [];
                    rule.ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            if (cell && cell.t === CellValueType.NUMBER) {
                                allValue.push(Number(cell.v || 0));
                            }
                        });
                    });
                    allValue.sort((a, b) => b - a);
                    const configRule = rule.rule as IRankHighlightCell;
                    const targetIndex = configRule.isPercent
                        ? Math.round(Math.max(Math.min(configRule.value, 100), 0) / 100 * allValue.length)
                        : Math.round(Math.max(Math.min(configRule.value, allValue.length), 0));
                    if (configRule.isBottom) {
                        return { rank: allValue[allValue.length - targetIndex] };
                    } else {
                        return { rank: allValue[Math.max(targetIndex - 1, 0)] };
                    }
                }
            }
        };
        const cache = getCache();
        const check = (row: number, col: number) => {
            const cellValue = worksheet?.getCellRaw(row, col);
            const value = getCellValue(cellValue!);
            switch (ruleConfig.subType) {
                case SubRuleType.number:{
                    const v = Number(value);
                    if (isNullable(value) || Number.isNaN(value)) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as INumberHighlightCell;

                    switch (subRuleConfig.operator) {
                        case NumberOperator.between:{
                            const [start, end] = subRuleConfig.value;
                            return v >= start && v <= end;
                        }
                        case NumberOperator.notBetween:{
                            const [start, end] = subRuleConfig.value;
                            return !(v >= start && v <= end);
                        }
                        case NumberOperator.equal:{
                            const condition = subRuleConfig.value || 0;
                            return isFloatsEqual(condition, v);
                        }
                        case NumberOperator.notEqual:{
                            const condition = subRuleConfig.value || 0;
                            return !isFloatsEqual(condition, v);
                        }
                        case NumberOperator.greaterThan:{
                            const condition = subRuleConfig.value || 0;
                            return v > condition;
                        }
                        case NumberOperator.greaterThanOrEqual:{
                            const condition = subRuleConfig.value || 0;
                            return v >= condition;
                        }
                        case NumberOperator.lessThan:{
                            const condition = subRuleConfig.value || 0;
                            return v < condition;
                        }
                        case NumberOperator.lessThanOrEqual:{
                            const condition = subRuleConfig.value || 0;
                            return v <= condition;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.text:{
                    const subRuleConfig = ruleConfig as ITextHighlightCell;
                    const v = String(value);
                    const condition = subRuleConfig.value || '';
                    switch (subRuleConfig.operator) {
                        case TextOperator.beginsWith:{
                            return v.startsWith(condition);
                        }
                        case TextOperator.containsBlanks:{
                            return /\s/.test(v);
                        }
                        case TextOperator.notContainsBlanks:{
                            return !/\s/.test(v);
                        }
                        case TextOperator.containsErrors:{
                            // wait do do.
                            return false;
                        }
                        case TextOperator.notContainsErrors:{
                            return false;
                        }
                        case TextOperator.containsText:{
                            return v.indexOf(condition) > -1;
                        }
                        case TextOperator.notContainsText:{
                            return v.indexOf(condition) === -1;
                        }
                        case TextOperator.endsWith:{
                            return v.endsWith(condition);
                        }
                        case TextOperator.equal:{
                            return v === condition;
                        }
                        case TextOperator.notEqual:{
                            return v !== condition;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.timePeriod:{
                    if (isNullable(value) || Number.isNaN(Number(value))) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as ITimePeriodHighlightCell;
                    const v = serialTimeToTimestamp(Number(value));
                    switch (subRuleConfig.operator) {
                        case TimePeriodOperator.last7Days:{
                            const start = dayjs().subtract(7, 'day').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.lastMonth:{
                            const start = dayjs().subtract(1, 'month').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.lastWeek:{
                            const start = dayjs().subtract(1, 'week').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.nextMonth:{
                            const nextMonth = dayjs().add(1, 'month');
                            const start = nextMonth.startOf('month').valueOf();
                            const end = nextMonth.endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.nextWeek:{
                            const start = dayjs().valueOf();
                            const end = dayjs().add(1, 'week').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.thisMonth:{
                            const start = dayjs().startOf('month').valueOf();
                            const end = dayjs().endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.thisWeek:{
                            const start = dayjs().startOf('week').valueOf();
                            const end = dayjs().endOf('week').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.tomorrow:{
                            const start = dayjs().startOf('day').add(1, 'day').valueOf();
                            const end = dayjs().endOf('day').add(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        case TimePeriodOperator.yesterday:{
                            const start = dayjs().startOf('day').subtract(1, 'day').valueOf();
                            const end = dayjs().endOf('day').subtract(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.average:{
                    const v = Number(value);
                    if (isNullable(value) || Number.isNaN(v)) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as IAverageHighlightCell;
                    const average = cache?.average!;

                    switch (subRuleConfig.operator) {
                        case NumberOperator.greaterThan:{
                            return v > average;
                        }
                        case NumberOperator.greaterThanOrEqual:{
                            return v >= average;
                        }
                        case NumberOperator.lessThan:{
                            return v < average;
                        }
                        case NumberOperator.lessThanOrEqual:{
                            return v <= average;
                        }
                        case NumberOperator.equal:{
                            return isFloatsEqual(v, average);
                        }
                        case NumberOperator.notEqual:{
                            return !isFloatsEqual(v, average);
                        }
                        default:{
                            return false;
                        }
                    }
                }
                case SubRuleType.rank:{
                    const v = Number(value);

                    if (isNullable(value) || Number.isNaN(v)) {
                        return false;
                    }

                    const targetValue = cache!.rank!;
                    const subRuleConfig = ruleConfig as IRankHighlightCell;
                    if (subRuleConfig.isBottom) {
                        return v <= targetValue;
                    } else {
                        return v >= targetValue;
                    }
                }
                case SubRuleType.uniqueValues:{
                    if (isNullable(value)) {
                        return false;
                    }
                    const uniqueCache = cache!.count!;
                    return uniqueCache.get(value) === 1;
                }
                case SubRuleType.duplicateValues:{
                    if (isNullable(value)) {
                        return false;
                    }
                    const uniqueCache = cache!.count!;
                    return uniqueCache.get(value) !== 1;
                }
            }
        };
        const computeResult = new ObjectMatrix();
        const emptyStyle = {};
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (check(row, col)) {
                    computeResult.setValue(row, col, ruleConfig.style);
                } else {
                    // Returns an empty property indicating that it has been processed.
                    computeResult.setValue(row, col, emptyStyle);
                }
            });
        });
        return computeResult;
    },
};
