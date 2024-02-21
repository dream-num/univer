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

import type { IRange, Worksheet } from '@univerjs/core';
import { createInterceptorKey, Disposable, ICommandService, InterceptorManager, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Rectangle, Tools } from '@univerjs/core';
import type { IInsertColMutationParams, IMoveColumnsMutationParams, IMoveRangeMutationParams, IMoveRowsMutationParams, IRemoveRowsMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { InsertColMutation, InsertRowMutation, MoveColsMutation, MoveRangeMutation, MoveRowsMutation, RemoveColMutation, RemoveRowMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { RuleType } from '../base/const';
import type { IConditionFormatRule, IHighlightCell } from '../models/type';
import type { IDataBarRenderParams } from '../render/type';
import { getCellValue, isNullable } from './calculate-unit/utils';
import { dataBarCellCalculateUnit } from './calculate-unit/data-bar';
import { highlightCellCalculateUnit } from './calculate-unit/highlight-cell';
import type { IColorScaleRenderParams } from './calculate-unit/color-scale';
import { colorScaleCellCalculateUnit } from './calculate-unit/color-scale';

type ComputeStatus = 'computing' | 'end' | 'error';

interface ICalculationUnit< R = ObjectMatrix<any>> {
    type: IConditionFormatRule['rule']['type'];
    handle(rule: IConditionFormatRule, worksheet: Worksheet): R;
};
interface ComputeCache { status: ComputeStatus };

const beforeUpdateRuleResult = createInterceptorKey< { subUnitId: string; unitId: string; cfId: string }>('conditional-format-before-update-rule-result');
@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatService)
export class ConditionalFormatService extends Disposable {
    // <unitId,<subUnitId,<cfId,ComputeCache>>>
    private _ruleCacheMap: Map<string, Map<string, Map<string, ComputeCache>>> = new Map();

    private _ruleComputeStatus$: Subject<{ status: ComputeStatus;result?: ObjectMatrix<any>;unitId: string; subUnitId: string; cfId: string }> = new Subject();
    public ruleComputeStatus$ = this._ruleComputeStatus$.asObservable();

    public interceptorManager = new InterceptorManager({ beforeUpdateRuleResult });

    private _calculationUnitMap: Map<IConditionFormatRule['rule']['type'], ICalculationUnit> = new Map();

    constructor(@Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCellChange();
        this._initCacheManager();
        this._initRemoteCalculate();
        this._registerCalculationUnit(dataBarCellCalculateUnit);
        this._registerCalculationUnit(colorScaleCellCalculateUnit);
        this._registerCalculationUnit(highlightCellCalculateUnit);
    }

    public composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cell = this._conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            // High priority should be applied at the back, overwriting the previous results.
            // reverse is a side-effect function that changes the original array.
            const ruleList = cell.cfList.map((item) => this._conditionalFormatRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule).reverse();
            const endIndex = ruleList.findIndex((rule) => rule?.stopIfTrue);
            if (endIndex > -1) {
                ruleList.splice(endIndex + 1);
            }
            const result = ruleList.reduce((pre, rule) => {
                const type = rule.rule.type;
                const ruleCacheItem = cell.cfList.find((cache) => cache.cfId === rule.cfId);
                if (ruleCacheItem?.isDirty) {
                    this._handleCalculateUnit(unitId, subUnitId, rule);
                }
                if (type === RuleType.highlightCell) {
                    ruleCacheItem!.ruleCache && Tools.deepMerge(pre, { style: ruleCacheItem!.ruleCache });
                } else if (type === RuleType.colorScale) {
                    const ruleCache = ruleCacheItem?.ruleCache as IColorScaleRenderParams;
                    if (ruleCache && ruleCache !== '') {
                        pre.colorScale = ruleCache;
                    }
                } else if (type === RuleType.dataBar) {
                    const ruleCache = ruleCacheItem?.ruleCache as IDataBarRenderParams;
                    if (ruleCache && Object.keys(ruleCache).length > 0) {
                        pre.dataBar = ruleCache;
                    }
                }
                return pre;
            }, {} as { style?: IHighlightCell['style'] } & { dataBar?: IDataBarRenderParams } & { colorScale?: IColorScaleRenderParams });
            return result;
        }
        return null;
    }

    private _registerCalculationUnit(unit: ICalculationUnit) {
        this._calculationUnitMap.set(unit.type, unit);
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
        this.disposeWithMe(this._conditionalFormatViewModel.markDirty$.subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        }));

        this.disposeWithMe(this._conditionalFormatRuleModel.$ruleChange.pipe(filter((item) => item.type !== 'sort')).subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        }));
    }

    private _initCellChange() {
        this.disposeWithMe(
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
                        new ObjectMatrix(cellValue).forValue((row, col, value) => {
                            const cell = value && getCellValue(value);
                            if (!isNullable(cell)) {
                                cellMatrix.push([row, col]);
                            }
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
                        const allRules = this._conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
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
                        const allRules = this._conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
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
                        const allRules = this._conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
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
                        const allRules = this._conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
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
            }));
    }

    private _initRemoteCalculate() {
        this.disposeWithMe(this._ruleComputeStatus$.subscribe(({ status, subUnitId, unitId, cfId, result }) => {
            const cache = this._getComputedCache(unitId, subUnitId, cfId) || {} as ComputeCache;
            cache.status = status;
            this._setComputedCache(unitId, subUnitId, cfId, cache);
            if (status === 'end' && result) {
                this.interceptorManager.fetchThroughInterceptors(this.interceptorManager.getInterceptPoints().beforeUpdateRuleResult)({
                    subUnitId, unitId, cfId,
                }, undefined);
                result.forValue((row, col, value) => {
                    this._conditionalFormatViewModel.setCellCfRuleCache(unitId, subUnitId, row, col, cfId, value);
                });
                this._deleteComputeCache(unitId, subUnitId, cfId);
            }
        }));
    }

    private async _handleCalculateUnit(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        let cache = this._getComputedCache(unitId, subUnitId, rule.cfId);
        if (cache && cache.status === 'computing') {
            return;
        }
        if (!cache) {
            cache = { status: 'computing' };
            this._setComputedCache(unitId, subUnitId, rule.cfId, cache);
        }
        const unit = this._calculationUnitMap.get(rule.rule.type);
        if (!unit || !worksheet) {
            return;
        }
        const result = await unit.handle(rule, worksheet);
        this._ruleComputeStatus$.next({ status: 'end', unitId, subUnitId, cfId: rule.cfId, result });
    }
}
