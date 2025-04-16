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

import type { IStyleData, Nullable } from '@univerjs/core';
import type { IAverageHighlightCell, IFormulaHighlightCell, IHighlightCell, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../type';
import type { IContext } from './base-calculate-unit';
import { CellValueType, dayjs, Range, Tools } from '@univerjs/core';
import { ERROR_TYPE_SET } from '@univerjs/engine-formula';
import { CFNumberOperator, CFSubRuleType, CFTextOperator, CFTimePeriodOperator } from '../../base/const';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../../services/conditional-formatting-formula.service';
import { BaseCalculateUnit, CalculateEmitStatus } from './base-calculate-unit';
import { compareWithNumber, getCellValue, isFloatsEqual, isNullable, serialTimeToTimestamp } from './utils';

interface IConfig {
    value: any;
    type: CFSubRuleType;
}
export class HighlightCellCalculateUnit extends BaseCalculateUnit<Nullable<IConfig>, Nullable<IStyleData>> {
    // eslint-disable-next-line max-lines-per-function
    override preComputing(row: number, col: number, context: IContext): void {
        const ruleConfig = context.rule.rule as IHighlightCell;
        const ranges = context.rule.ranges;
        // eslint-disable-next-line max-lines-per-function, complexity
        const getCache = () => {
            switch (ruleConfig.subType) {
                case CFSubRuleType.average: {
                    let sum = 0;
                    let count = 0;
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = context.getCellValue(row, col);
                            const v = getCellValue(cell || undefined);
                            if (cell && cell.t === CellValueType.NUMBER && v !== undefined) {
                                sum += Number(v) || 0;
                                count++;
                            }
                        });
                    });
                    return { value: sum / count, type: ruleConfig.subType };
                }
                case CFSubRuleType.uniqueValues:
                case CFSubRuleType.duplicateValues: {
                    const cacheMap: Map<any, number> = new Map();
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = context.getCellValue(row, col);
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
                    return { value: cacheMap, type: ruleConfig.subType };
                }
                case CFSubRuleType.rank: {
                    let allValue: number[] = [];
                    ranges.forEach((range) => {
                        Range.foreach(range, (row, col) => {
                            const cell = context.getCellValue(row, col);
                            const v = getCellValue(cell || undefined);
                            if (cell && cell.t === CellValueType.NUMBER && v !== undefined) {
                                allValue.push(Number(v) || 0);
                            }
                        });
                    });
                    allValue.sort((a, b) => b - a);
                    const configRule = context.rule.rule as IRankHighlightCell;
                    if (configRule.isPercent) {
                        if (configRule.isBottom) {
                            allValue = allValue.toReversed();
                        }

                        // Calculate the index directly based on the threshold percentage.
                        const threshold = Tools.clamp(configRule.value, 0, 100) / 100;
                        const targetIndex = Math.floor(threshold * allValue.length);
                        // Ensure the index is within bounds
                        const safeIndex = Tools.clamp(targetIndex - 1, 0, allValue.length - 1);
                        return { value: allValue[safeIndex], type: ruleConfig.subType };
                    }

                    const targetIndex = Math.floor(Tools.clamp(configRule.isBottom ? (configRule.value - 1) : configRule.value, 0, allValue.length));
                    if (configRule.isBottom) {
                        return { value: allValue[allValue.length - targetIndex - 1], type: ruleConfig.subType };
                    } else {
                        return { value: allValue[Math.max(targetIndex - 1, 0)], type: ruleConfig.subType };
                    }
                }
                case CFSubRuleType.formula: {
                    const _ruleConfig = ruleConfig as IFormulaHighlightCell;
                    const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);
                    conditionalFormattingFormulaService.registerFormulaWithRange(context.unitId, context.subUnitId, context.rule.cfId, _ruleConfig.value, context.rule.ranges);
                    const result = conditionalFormattingFormulaService.getFormulaMatrix(context.unitId, context.subUnitId, context.rule.cfId, _ruleConfig.value);
                    if (result && result.status === FormulaResultStatus.SUCCESS) {
                        this._preComputingStatus$.next(CalculateEmitStatus.preComputingEnd);
                        return {
                            value: result.result,
                            type: ruleConfig.subType,
                        };
                    } else {
                        this._preComputingStatus$.next(CalculateEmitStatus.preComputing);
                    }
                    return null;
                }
                case CFSubRuleType.timePeriod: {
                    const subRuleConfig = ruleConfig as ITimePeriodHighlightCell;
                    switch (subRuleConfig.operator) {
                        case CFTimePeriodOperator.last7Days: {
                            return {
                                value: {
                                    start: dayjs().subtract(7, 'day').valueOf(),
                                    end: dayjs().valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.lastMonth: {
                            return {
                                value: {
                                    start: dayjs().startOf('month').subtract(1, 'month').valueOf(),
                                    end: dayjs().endOf('month').subtract(1, 'month').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.lastWeek: {
                            return {
                                value: {
                                    start: dayjs().startOf('week').subtract(1, 'week').valueOf(),
                                    end: dayjs().endOf('week').subtract(1, 'week').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.nextMonth: {
                            return {
                                value: {
                                    start: dayjs().startOf('month').add(1, 'month').valueOf(),
                                    end: dayjs().endOf('month').add(1, 'month').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.nextWeek: {
                            return {
                                value: {
                                    start: dayjs().startOf('week').add(1, 'week').valueOf(),
                                    end: dayjs().endOf('week').add(1, 'week').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.thisMonth: {
                            return {
                                value: {
                                    start: dayjs().startOf('month').valueOf(),
                                    end: dayjs().endOf('month').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.thisWeek: {
                            return {
                                value: {
                                    start: dayjs().startOf('week').valueOf(),
                                    end: dayjs().endOf('week').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.today: {
                            return {
                                value: {
                                    start: dayjs().startOf('day').valueOf(),
                                    end: dayjs().endOf('day').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.tomorrow: {
                            return {
                                value: {
                                    start: dayjs().startOf('day').add(1, 'day').valueOf(),
                                    end: dayjs().endOf('day').add(1, 'day').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                        case CFTimePeriodOperator.yesterday: {
                            return {
                                value: {
                                    start: dayjs().startOf('day').subtract(1, 'day').valueOf(),
                                    end: dayjs().endOf('day').subtract(1, 'day').valueOf(),
                                },
                                type: ruleConfig.subType,
                            };
                        }
                    }
                }
            }
        };
        const result = getCache();
        this.setPreComputingCache(result);
    }

    // eslint-disable-next-line max-lines-per-function
    protected override getCellResult(row: number, col: number, preComputingResult: Nullable<IConfig>, context: IContext) {
        const cellValue = context.getCellValue(row, col);
        const ruleConfig = context.rule.rule as IHighlightCell;
        // eslint-disable-next-line max-lines-per-function, complexity
        const run = () => {
            switch (ruleConfig.subType) {
                case CFSubRuleType.number: {
                    const v = cellValue && Number(cellValue.v);
                    const isNumber = cellValue?.t === CellValueType.NUMBER;
                    const subRuleConfig = ruleConfig as INumberHighlightCell;
                    if (!isNumber) {
                        if ([CFNumberOperator.notEqual, CFNumberOperator.notBetween].includes(subRuleConfig.operator)) {
                            return true;
                        }
                        return false;
                    }

                    if (isNullable(v) || Number.isNaN(v)) {
                        return;
                    }

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
                    if (isNullable(value) || Number.isNaN(Number(value)) || cellValue?.t !== CellValueType.NUMBER || !preComputingResult) {
                        return;
                    }
                    const v = serialTimeToTimestamp(Number(value));
                    const { start, end } = preComputingResult.value!;
                    return v >= start && v <= end;
                }
                case CFSubRuleType.average: {
                    const value = cellValue && cellValue.v;
                    const v = Number(value);
                    const isNumber = cellValue?.t === CellValueType.NUMBER;
                    const subRuleConfig = ruleConfig as IAverageHighlightCell;

                    if (!isNumber) {
                        if (CFNumberOperator.notEqual === subRuleConfig.operator) {
                            return true;
                        }
                        return false;
                    }

                    if (isNullable(value) || Number.isNaN(v) || !preComputingResult) {
                        return false;
                    }

                    const average = preComputingResult.value;

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

                    if (isNullable(value) || Number.isNaN(v) || cellValue?.t !== CellValueType.NUMBER || !preComputingResult) {
                        return false;
                    }

                    const targetValue = preComputingResult.value;
                    const subRuleConfig = ruleConfig as IRankHighlightCell;
                    if (subRuleConfig.isBottom) {
                        return v <= targetValue;
                    } else {
                        return v >= targetValue;
                    }
                }
                case CFSubRuleType.uniqueValues: {
                    const value = getCellValue(cellValue!);

                    if (isNullable(value) || !preComputingResult) {
                        return false;
                    }
                    const uniqueCache = preComputingResult.value;
                    return uniqueCache.get(value) === 1;
                }
                case CFSubRuleType.duplicateValues: {
                    const value = getCellValue(cellValue!);

                    if (isNullable(value) || !preComputingResult) {
                        return false;
                    }
                    const uniqueCache = preComputingResult.value;
                    return uniqueCache.get(value) !== 1;
                }
                case CFSubRuleType.formula: {
                    // const _ruleConfig = ruleConfig as IFormulaHighlightCell;
                    const cache = preComputingResult?.value;
                    if (cache) {
                        const value = cache.getValue(row, col);
                        return value === true;
                    }
                    return false;
                }
            }
        };
        const result = run();
        return result ? ruleConfig.style : {};
    }
}
