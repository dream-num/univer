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

import type { IStyleBase } from '@univerjs/core';
import { CellValueType, ObjectMatrix, Range, Rectangle, Tools } from '@univerjs/core';
import dayjs from 'dayjs';
import { deserializeRangeWithSheet, ERROR_TYPE_SET, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange } from '@univerjs/engine-formula';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFTimePeriodOperator } from '../../base/const';
import type { IAverageHighlightCell, IConditionFormattingRule, IFormulaHighlightCell, IHighlightCell, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../../models/type';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../conditional-formatting-formula.service';
import { compareWithNumber, filterRange, getCellValue, isFloatsEqual, isNullable, serialTimeToTimestamp } from './utils';
import type { ICalculateUnit } from './type';
import { EMPTY_STYLE } from './type';

export const highlightCellCalculateUnit: ICalculateUnit = {
    type: CFRuleType.highlightCell,
    handle: async (rule: IConditionFormattingRule, context) => {
        const ruleConfig = rule.rule as IHighlightCell;
        const { worksheet } = context;
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
                        ? Math.round(Math.max(Math.min(configRule.value, 100), 0) / 100 * allValue.length)
                        : Math.round(Math.max(Math.min(configRule.value, allValue.length), 0));
                    if (configRule.isBottom) {
                        return { rank: allValue[allValue.length - targetIndex] };
                    } else {
                        return { rank: allValue[Math.max(targetIndex - 1, 0)] };
                    }
                }
                case CFSubRuleType.formula: {
                    const subRuleConfig = ruleConfig as IFormulaHighlightCell;
                    const lexerTreeBuilder = context.accessor.get(LexerTreeBuilder);
                    const formulaString = subRuleConfig.value;
                    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formulaString);
                    if (!sequenceNodes) {
                        return {
                            sequenceNodes: null,
                        };
                    } else {
                        return { sequenceNodes };
                    }
                }
            }
        };
        const cache = getCache();
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
                    const subRuleConfig = ruleConfig as ITimePeriodHighlightCell;
                    const v = serialTimeToTimestamp(Number(value));
                    switch (subRuleConfig.operator) {
                        case CFTimePeriodOperator.last7Days: {
                            const start = dayjs().subtract(7, 'day').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.lastMonth: {
                            const preMonth = dayjs().subtract(1, 'month');
                            const start = preMonth.startOf('month').valueOf();
                            const end = preMonth.endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.lastWeek: {
                            const start = dayjs().subtract(1, 'week').valueOf();
                            const end = dayjs().valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.nextMonth: {
                            const nextMonth = dayjs().add(1, 'month');
                            const start = nextMonth.startOf('month').valueOf();
                            const end = nextMonth.endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.nextWeek: {
                            const week = dayjs();
                            const nextWeek = week.add(1, 'week');
                            const start = nextWeek.startOf('week').valueOf();
                            const end = nextWeek.endOf('week').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.thisMonth: {
                            const start = dayjs().startOf('month').valueOf();
                            const end = dayjs().endOf('month').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.thisWeek: {
                            const start = dayjs().startOf('week').valueOf();
                            const end = dayjs().endOf('week').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.tomorrow: {
                            const start = dayjs().startOf('day').add(1, 'day').valueOf();
                            const end = dayjs().endOf('day').add(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.yesterday: {
                            const start = dayjs().startOf('day').subtract(1, 'day').valueOf();
                            const end = dayjs().endOf('day').subtract(1, 'day').valueOf();
                            return v >= start && v <= end;
                        }
                        case CFTimePeriodOperator.today: {
                            const start = dayjs().startOf('day').valueOf();
                            const end = dayjs().endOf('day').valueOf();
                            return v >= start && v <= end;
                        }
                        default: {
                            return false;
                        }
                    }
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
                    if (!cache?.sequenceNodes) {
                        return false;
                    }
                    const { unitId, subUnitId } = context;
                    const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);

                    const getRangeFromCell = (row: number, col: number) => ({ startRow: row, endRow: row, startColumn: col, endColumn: col });
                    const originRange = getRangeFromCell(rule.ranges[0].startRow, rule.ranges[0].startColumn);
                    const sequenceNodes = Tools.deepClone(cache.sequenceNodes);
                    const transformSequenceNodes = Array.isArray(sequenceNodes)
                        ? sequenceNodes.map((node) => {
                            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                                const gridRangeName = deserializeRangeWithSheet(node.token);
                                const relativeRange = Rectangle.getRelativeRange(gridRangeName.range, originRange);
                                const newRange = Rectangle.getPositionRange(relativeRange, getRangeFromCell(row, col), gridRangeName.range);
                                const newToken = serializeRange(newRange);
                                return {
                                    ...node, token: newToken,
                                };
                            }
                            return node;
                        })
                        : sequenceNodes;
                    let formulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);
                    if (formulaString) {
                        formulaString = `=${formulaString}`;
                        conditionalFormattingFormulaService.registerFormula(unitId, subUnitId, rule.cfId, formulaString);
                        const formulaItem = conditionalFormattingFormulaService.getFormulaResult(unitId, subUnitId, formulaString);
                        if (formulaItem && formulaItem.status === FormulaResultStatus.SUCCESS) {
                            return formulaItem.result === true;
                        } else {
                            // If the formula triggers the calculation, wait for the result,
                            // and use the previous style cache until the result comes out
                            const cache = conditionalFormattingFormulaService.getCache(unitId, subUnitId, rule.cfId);
                            const style = cache?.getValue(row, col);
                            return style && style !== EMPTY_STYLE;
                        }
                    }
                    return false;
                }
            }
        };
        const computeResult = new ObjectMatrix<IStyleBase>();
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
