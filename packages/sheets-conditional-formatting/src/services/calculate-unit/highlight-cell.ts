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

/* eslint-disable max-lines-per-function */

import type { IStyleBase } from '@univerjs/core';
import type { IAverageHighlightCell, IConditionFormattingRule, IFormulaHighlightCell, IHighlightCell, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../../models/type';
import type { ICalculateUnit } from './type';
import { CellValueType, ObjectMatrix, Range } from '@univerjs/core';
import { ERROR_TYPE_SET } from '@univerjs/engine-formula';
import dayjs from 'dayjs';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFTimePeriodOperator } from '../../base/const';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../conditional-formatting-formula.service';
import { EMPTY_STYLE } from './type';
import { compareWithNumber, filterRange, getCellValue, isFloatsEqual, isNullable, serialTimeToTimestamp } from './utils';

export const highlightCellCalculateUnit: ICalculateUnit = {
    type: CFRuleType.highlightCell,
    handle: async (rule: IConditionFormattingRule, context) => {
        const ruleConfig = rule.rule as IHighlightCell;

        const { worksheet, unitId, subUnitId } = context;
        const ranges = filterRange(rule.ranges, worksheet.getMaxRows() - 1, worksheet.getMaxColumns() - 1);

        const getCache = () => {
            switch (ruleConfig.subType) {
                case CFSubRuleType.average: {
                    let sum = 0;
                    let count = 0;
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            const v = getCellValue(cell || undefined);
                            if (cell && cell.t === CellValueType.NUMBER && v !== undefined) {
                                sum += Number(v) || 0;
                                count++;
                            }
                        });
                    });
                    return { average: sum / count };
                }
                case CFSubRuleType.uniqueValues:
                case CFSubRuleType.duplicateValues: {
                    const cacheMap: Map<any, number> = new Map();
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            const v = getCellValue(cell || undefined);
                            if (v !== undefined) {
                                const cache = cacheMap.get(v);
                                if (cache) {
                                    cacheMap.set(v, cache + 1);
                                } else {
                                    cacheMap.set(v, 1);
                                }
                            }
                        });
                    });
                    return { count: cacheMap };
                }
                case CFSubRuleType.rank: {
                    const allValue: number[] = [];
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = worksheet?.getCellRaw(row, col);
                            const v = getCellValue(cell || undefined);
                            if (cell && cell.t === CellValueType.NUMBER && v !== undefined) {
                                allValue.push(Number(v) || 0);
                            }
                        });
                    });
                    allValue.sort((a, b) => b - a);
                    const configRule = rule.rule as IRankHighlightCell;
                    const targetIndex = configRule.isPercent
                        ? Math.floor(Math.max(Math.min(configRule.value, 100), 0) / 100 * allValue.length)
                        : Math.floor(Math.max(Math.min(configRule.isBottom ? (configRule.value - 1) : configRule.value, allValue.length), 0));
                    if (configRule.isBottom) {
                        return { rank: allValue[allValue.length - targetIndex - 1] };
                    } else {
                        return { rank: allValue[Math.max(targetIndex - 1, 0)] };
                    }
                }
                case CFSubRuleType.formula: {
                    const _ruleConfig = ruleConfig as IFormulaHighlightCell;
                    const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);
                    conditionalFormattingFormulaService.registerFormulaWithRange(context.unitId, context.subUnitId, rule.cfId, _ruleConfig.value, rule.ranges);
                    break;
                }
                case CFSubRuleType.timePeriod: {
                    const subRuleConfig = ruleConfig as ITimePeriodHighlightCell;
                    switch (subRuleConfig.operator) {
                        case CFTimePeriodOperator.last7Days: {
                            return {
                                timePeriod: {
                                    start: dayjs().subtract(7, 'day').valueOf(),
                                    end: dayjs().valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.lastMonth: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('month').subtract(1, 'month').valueOf(),
                                    end: dayjs().endOf('month').subtract(1, 'month').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.lastWeek: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('week').subtract(1, 'week').valueOf(),
                                    end: dayjs().endOf('week').subtract(1, 'week').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.nextMonth: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('month').add(1, 'month').valueOf(),
                                    end: dayjs().endOf('month').add(1, 'month').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.nextWeek: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('week').add(1, 'week').valueOf(),
                                    end: dayjs().endOf('week').add(1, 'week').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.thisMonth: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('month').valueOf(),
                                    end: dayjs().endOf('month').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.thisWeek: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('week').valueOf(),
                                    end: dayjs().endOf('week').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.today: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('day').valueOf(),
                                    end: dayjs().endOf('day').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.tomorrow: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('day').add(1, 'day').valueOf(),
                                    end: dayjs().endOf('day').add(1, 'day').valueOf(),
                                },
                            };
                        }
                        case CFTimePeriodOperator.yesterday: {
                            return {
                                timePeriod: {
                                    start: dayjs().startOf('day').subtract(1, 'day').valueOf(),
                                    end: dayjs().endOf('day').subtract(1, 'day').valueOf(),
                                },
                            };
                        }
                    }
                }
            }
        };
        const cache = getCache();

        // eslint-disable-next-line complexity
        const check = (row: number, col: number) => {
            const cellValue = worksheet?.getCellRaw(row, col);
            switch (ruleConfig.subType) {
                case CFSubRuleType.number: {
                    const v = cellValue && Number(cellValue.v);
                    if (isNullable(v) || Number.isNaN(v) || cellValue?.t !== CellValueType.NUMBER) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as INumberHighlightCell;
                    return compareWithNumber({ operator: subRuleConfig.operator, value: subRuleConfig.value || 0 }, v || 0);
                }
                case CFSubRuleType.text: {
                    const subRuleConfig = ruleConfig as ITextHighlightCell;
                    const value = getCellValue(cellValue!);
                    const v = value === null ? '' : String(value);
                    const condition = subRuleConfig.value || '';
                    switch (subRuleConfig.operator) {
                        case CFTextOperator.beginsWith: {
                            return v.startsWith(condition);
                        }
                        case CFTextOperator.containsBlanks: {
                            return /^\s*$/.test(v);
                        }
                        case CFTextOperator.notContainsBlanks: {
                            return !/^\s*$/.test(v);
                        }
                        case CFTextOperator.containsErrors: {
                            return (ERROR_TYPE_SET as Set<unknown>).has(v);
                        }
                        case CFTextOperator.notContainsErrors: {
                            return !(ERROR_TYPE_SET as Set<unknown>).has(v);
                        }
                        case CFTextOperator.containsText: {
                            return v.indexOf(condition) > -1;
                        }
                        case CFTextOperator.notContainsText: {
                            return v.indexOf(condition) === -1;
                        }
                        case CFTextOperator.endsWith: {
                            return v.endsWith(condition);
                        }
                        case CFTextOperator.equal: {
                            return v === condition;
                        }
                        case CFTextOperator.notEqual: {
                            return v !== condition;
                        }
                        default: {
                            return false;
                        }
                    }
                }
                case CFSubRuleType.timePeriod: {
                    const value = getCellValue(cellValue!);
                    if (isNullable(value) || Number.isNaN(Number(value)) || cellValue?.t !== CellValueType.NUMBER) {
                        return false;
                    }
                    const v = serialTimeToTimestamp(Number(value));
                    const { start, end } = cache!.timePeriod!;
                    return v >= start && v <= end;
                }
                case CFSubRuleType.average: {
                    const value = cellValue && cellValue.v;
                    const v = Number(value);
                    if (isNullable(value) || Number.isNaN(v) || cellValue?.t !== CellValueType.NUMBER) {
                        return false;
                    }
                    const subRuleConfig = ruleConfig as IAverageHighlightCell;
                    const average = cache?.average!;

                    switch (subRuleConfig.operator) {
                        case CFNumberOperator.greaterThan: {
                            return v > average;
                        }
                        case CFNumberOperator.greaterThanOrEqual: {
                            return v >= average;
                        }
                        case CFNumberOperator.lessThan: {
                            return v < average;
                        }
                        case CFNumberOperator.lessThanOrEqual: {
                            return v <= average;
                        }
                        case CFNumberOperator.equal: {
                            return isFloatsEqual(v, average);
                        }
                        case CFNumberOperator.notEqual: {
                            return !isFloatsEqual(v, average);
                        }
                        default: {
                            return false;
                        }
                    }
                }
                case CFSubRuleType.rank: {
                    const value = getCellValue(cellValue!);

                    const v = Number(value);

                    if (isNullable(value) || Number.isNaN(v) || cellValue?.t !== CellValueType.NUMBER) {
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
                case CFSubRuleType.uniqueValues: {
                    const value = getCellValue(cellValue!);

                    if (isNullable(value)) {
                        return false;
                    }
                    const uniqueCache = cache!.count!;
                    return uniqueCache.get(value) === 1;
                }
                case CFSubRuleType.duplicateValues: {
                    const value = getCellValue(cellValue!);

                    if (isNullable(value)) {
                        return false;
                    }
                    const uniqueCache = cache!.count!;
                    return uniqueCache.get(value) !== 1;
                }
                case CFSubRuleType.formula: {
                    const _ruleConfig = ruleConfig as IFormulaHighlightCell;
                    const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);
                    const result = conditionalFormattingFormulaService.getFormulaResult(unitId, subUnitId, rule.cfId, _ruleConfig.value, row, col);
                    if (result && result.status === FormulaResultStatus.SUCCESS) {
                        return result.result === true;
                    }
                    return false;
                }
            }
        };
        const computeResult = new ObjectMatrix<IStyleBase>();
        if (ruleConfig.subType === CFSubRuleType.formula) {
            const _ruleConfig = ruleConfig as IFormulaHighlightCell;
            const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);
            const aliasItemMap = conditionalFormattingFormulaService.getSubUnitFormulaMap(unitId, subUnitId);
            const item = aliasItemMap?.getValue(conditionalFormattingFormulaService.createCFormulaId(rule.cfId, _ruleConfig.value), ['id']);
            if (!item || (item.status !== FormulaResultStatus.SUCCESS)) {
                return conditionalFormattingFormulaService.getCache(unitId, subUnitId, rule.cfId) || computeResult;
            }
        }
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (check(row, col)) {
                    computeResult.setValue(row, col, ruleConfig.style);
                } else {
                    // Returns an empty property indicating that it has been processed.
                    computeResult.setValue(row, col, EMPTY_STYLE as IStyleBase);
                }
            });
        });
        return computeResult;
    },
};

