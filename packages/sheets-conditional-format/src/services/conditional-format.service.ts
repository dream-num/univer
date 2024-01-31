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

import type { ICellData, IRange } from '@univerjs/core';
import { CellValueType, Disposable, ICommandService, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Range, Rectangle, Tools } from '@univerjs/core';
import type { IInsertColMutationParams, IMoveColumnsMutationParams, IMoveRangeMutationParams, IMoveRowsMutationParams, IRemoveRowsMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { InsertColMutation, InsertRowMutation, INumfmtService, MoveColsMutation, MoveRangeMutation, MoveRowsMutation, RefRangeService, RemoveColMutation, RemoveRowMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { NumberOperator, RuleType, SubRuleType, TextOperator, TimePeriodOperator } from '../base/const';
import type { IAverageHighlightCell, IConditionFormatRule, IHighlightCell, INumberHighlightCell, IRankHighlightCell, ITextHighlightCell, ITimePeriodHighlightCell } from '../models/type';

function isFloatsEqual(a: number, b: number) {
    return Math.abs(a - b) < Number.EPSILON;
}
const isNullable = (v: any) => [undefined, null].includes(v);

const getCellValue = (cell?: ICellData) => {
    if (!cell) {
        return null;
    }
    const v = cell.v;
    const dataStream = cell.p?.body?.dataStream.replace(/\r\n$/, '');
    return !isNullable(v) ? v : !isNullable(dataStream) ? dataStream : null;
};
type ComputeStatus = 'computing' | 'end' | 'error';

interface AverageComputeCache { average: number };
interface CountComputeCache { count: Map<any, number> };
interface RankComputeCache { rank: number };

type ComputeCache = Partial<AverageComputeCache & CountComputeCache & RankComputeCache & { status: ComputeStatus }>;
@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatService)
export class ConditionalFormatService extends Disposable {
    // <unitId,<subUnitId,<cfId,ComputeCache>>>
    private _ruleCacheMap: Map<string, Map<string, Map<string, ComputeCache>>> = new Map();

    private _ruleComputeStatus$: Subject<{ status: ComputeStatus;result?: ObjectMatrix<any>;unitId: string; subUnitId: string; cfId: string }> = new Subject();
    ruleComputeStatus$ = this._ruleComputeStatus$.asObservable();

    constructor(@Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCellChange();
        this._initCacheManager();
        this._ruleComputeStatus$.subscribe(({ status, subUnitId, unitId, cfId, result }) => {
            const cache = this._getComputedCache(unitId, subUnitId, cfId) || {};
            cache.status = status;
            this._setComputedCache(unitId, subUnitId, cfId, cache);
            if (status === 'end' && result) {
                result.forValue((row, col, value) => {
                    this._conditionalFormatViewModel.setCellCfRuleCache(unitId, subUnitId, row, col, cfId, value);
                });
            }
        });
    }

    private _getComputedCache(unitId: string, subUnitId: string, cfId: string) {
        return this._ruleCacheMap.get(unitId)?.get(subUnitId)?.get(cfId);
    }

    private _setComputedCache(unitId: string, subUnitId: string, cfId: string, value: ComputeCache) {
        let unitMap = this._ruleCacheMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._ruleCacheMap.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        subUnitMap.set(cfId, value);
    }

    private _deleteComputeCache(unitId: string, subUnitId: string, cfId: string) {
        const unitCache = this._ruleCacheMap.get(unitId);
        const subUnitCache = unitCache?.get(subUnitId);
        if (subUnitCache) {
            subUnitCache.delete(cfId);
            const size = subUnitCache.size;
            if (!size) {
                unitCache?.delete(subUnitId);
            }
        }
    }

    private _initCacheManager() {
        this._conditionalFormatViewModel.markDirty$.subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        });
        this._conditionalFormatRuleModel.$ruleChange.pipe(filter((item) => item.type !== 'sort')).subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        });
    }

    composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cell = this._conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const ruleList = cell.cfList.map((item) => this._conditionalFormatRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule);
            const endIndex = ruleList.findIndex((rule) => rule?.stopIfTrue);
            if (endIndex > -1) {
                ruleList.splice(endIndex + 1);
            }
            const result = ruleList.reduce((pre, rule) => {
                const type = rule.rule.type;
                const ruleCacheItem = cell.cfList.find((cache) => cache.cfId === rule.cfId);
                if (type === RuleType.highlightCell) {
                    if (ruleCacheItem?.isDirty) {
                        this._handleHighlightCell(unitId, subUnitId, rule);
                    }
                    ruleCacheItem!.ruleCache && Tools.deepMerge(pre, { style: ruleCacheItem!.ruleCache });
                } else if (type === RuleType.colorScale) {
                    if (ruleCacheItem?.isDirty) {
                        this._handleHighlightCell(unitId, subUnitId, rule);
                    }

                    pre.colorScale = ruleCacheItem!.ruleCache;
                } else if (type === RuleType.dataBar) {
                    if (ruleCacheItem?.isDirty) {
                        this._handleHighlightCell(unitId, subUnitId, rule);
                    }
                    pre.dataBar = ruleCacheItem!.ruleCache;
                }
                return pre;
            }, {} as { style?: IHighlightCell['style'] } & { dataBar?: any; colorScale?: any });
            return result;
        }
        return null;
    }

    private _initCellChange() {
        this._commandService.onCommandExecuted((commandInfo) => {
            const collectRule = (unitId: string, subUnitId: string, cellData: [number, number][]) => {
                const ruleIds: Set<string> = new Set();
                cellData.forEach(([row, col]) => {
                    const ruleItem = this._conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
                    ruleItem?.cfList.forEach((item) => ruleIds.add(item.cfId));
                });
                return [...ruleIds].map((cfId) => this._conditionalFormatRuleModel.getRule(unitId, subUnitId, cfId) as IConditionFormatRule).filter((rule) => !!rule);
            };

            switch (commandInfo.id) {
                case SetRangeValuesMutation.id:{
                    const params = commandInfo.params as ISetRangeValuesMutationParams;
                    const { subUnitId, unitId, cellValue } = params;
                    const cellMatrix: [number, number][] = [];
                    new ObjectMatrix(cellValue).forValue((row, col) => {
                        cellMatrix.push([row, col]);
                    });
                    const rules = collectRule(unitId, subUnitId, cellMatrix);
                    rules.forEach((rule) => {
                        this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                        this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                    });
                    break;
                }
                case InsertColMutation.id:
                case RemoveColMutation.id:{
                    const { range, unitId, subUnitId } = commandInfo.params as IInsertColMutationParams;
                    const allRules = this._conditionalFormatRuleModel.getAllRule(unitId, subUnitId);
                    const effectRange: IRange = { ...range, endColumn: Number.MAX_SAFE_INTEGER };
                    if (allRules) {
                        const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                        effectRule.forEach((rule) => {
                            this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                            this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                        });
                    }
                    break;
                }
                case RemoveRowMutation.id:
                case InsertRowMutation.id:{
                    const { range, unitId, subUnitId } = commandInfo.params as IRemoveRowsMutationParams;
                    const allRules = this._conditionalFormatRuleModel.getAllRule(unitId, subUnitId);
                    const effectRange: IRange = { ...range, endRow: Number.MAX_SAFE_INTEGER };
                    if (allRules) {
                        const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                        effectRule.forEach((rule) => {
                            this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                            this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                        });
                    }
                    break;
                }
                case MoveRowsMutation.id:{
                    const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveRowsMutationParams;
                    const allRules = this._conditionalFormatRuleModel.getAllRule(unitId, subUnitId);
                    const effectRange: IRange = { startRow: Math.min(sourceRange.startRow, targetRange.startRow),
                                                  endRow: Number.MAX_SAFE_INTEGER,
                                                  startColumn: 0,
                                                  endColumn: Number.MAX_SAFE_INTEGER };
                    if (allRules) {
                        const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                        effectRule.forEach((rule) => {
                            this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                            this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                        });
                    }
                    break;
                }
                case MoveColsMutation.id:{
                    const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveColumnsMutationParams;
                    const allRules = this._conditionalFormatRuleModel.getAllRule(unitId, subUnitId);
                    const effectRange: IRange = { startRow: 0,
                                                  endRow: Number.MAX_SAFE_INTEGER,
                                                  startColumn: Math.min(sourceRange.startColumn, targetRange.startColumn),
                                                  endColumn: Number.MAX_SAFE_INTEGER };
                    if (allRules) {
                        const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                        effectRule.forEach((rule) => {
                            this._conditionalFormatViewModel.markRuleDirty(unitId, subUnitId, rule);
                            this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                        });
                    }
                    break;
                }
                case MoveRangeMutation.id:{
                    const { unitId, to, from } = commandInfo.params as IMoveRangeMutationParams;
                    const handleSubUnit = (value: IMoveRangeMutationParams['from']) => {
                        const cellMatrix: [number, number][] = [];
                        new ObjectMatrix(value.value).forValue((row, col) => {
                            cellMatrix.push([row, col]);
                        });
                        const rules = collectRule(unitId, value.subUnitId, cellMatrix);
                        rules.forEach((rule) => {
                            this._conditionalFormatViewModel.markRuleDirty(unitId, value.subUnitId, rule);
                            this._deleteComputeCache(unitId, value.subUnitId, rule.cfId);
                        });
                    };
                    handleSubUnit(to);
                    handleSubUnit(from);
                    break;
                }
            }
        });
    }

    private _handleHighlightCell(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        const ruleConfig = rule.rule as IHighlightCell;
        let cache = this._getComputedCache(unitId, subUnitId, rule.cfId);
        if (cache && cache.status === 'computing') {
            return;
        }
        console.log('_handleHighlightCell::', cache);
        const getCache = (ruleConfig: IHighlightCell) => {
            // eslint-disable-next-line no-console
            console.log('getCache::', ruleConfig);
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
            return {};
        };
        if (!cache) {
            cache = getCache(ruleConfig);
            cache.status = 'computing';
            this._setComputedCache(unitId, subUnitId, rule.cfId, cache);
        }
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
                            return v >= start && v < end;
                        }
                        case NumberOperator.notBetween:{
                            const [start, end] = subRuleConfig.value;
                            return !(v >= start && v < end);
                        }
                        case NumberOperator.equal:{
                            const condition = subRuleConfig.value;
                            return isFloatsEqual(condition, v);
                        }
                        case NumberOperator.notEqual:{
                            const condition = subRuleConfig.value;
                            return !isFloatsEqual(condition, v);
                        }
                        case NumberOperator.greaterThan:{
                            const condition = subRuleConfig.value;
                            return v > condition;
                        }
                        case NumberOperator.greaterThanOrEqual:{
                            const condition = subRuleConfig.value;
                            return v >= condition;
                        }
                        case NumberOperator.lessThan:{
                            const condition = subRuleConfig.value;
                            return v < condition;
                        }
                        case NumberOperator.lessThanOrEqual:{
                            const condition = subRuleConfig.value;
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
                    const condition = subRuleConfig.value;
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
                        case TextOperator.endWith:{
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
                    const v = this._numfmtService.serialTimeToTimestamp(Number(value));
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
                            const start = dayjs().valueOf();
                            const end = dayjs().add(1, 'month').valueOf();
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
                    // 返回一个空属性,表明已经被处理过了.否则在外层判断 cache 的时候,会读不到结果.
                    computeResult.setValue(row, col, emptyStyle);
                }
            });
        });
        setTimeout(() => {
            this._ruleComputeStatus$.next({ status: 'end', unitId, subUnitId, result: computeResult, cfId: rule.cfId });
        }, 0);
    }
}
