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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import { afterInitApply, createInterceptorKey, Disposable, ICommandService, InterceptorManager, IResourceManagerService, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import type { IInsertColMutationParams, IMoveColumnsMutationParams, IMoveRangeMutationParams, IMoveRowsMutationParams, IRemoveRowsMutationParams, IRemoveSheetCommandParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { InsertColMutation, InsertRowMutation, MoveColsMutation, MoveRangeMutation, MoveRowsMutation, RemoveColMutation, RemoveRowMutation, RemoveSheetCommand, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/delete-conditional-rule.mutation';
import { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory } from '../commands/mutations/delete-conditional-rule.mutation';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';
import { CFRuleType, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '../base/const';
import type { IConditionFormattingRule, IHighlightCell, IRuleModelJson } from '../models/type';
import type { IDataBarCellData, IDataBarRenderParams, IIconSetCellData, IIconSetRenderParams } from '../render/type';
import { dataBarCellCalculateUnit } from './calculate-unit/data-bar';
import { highlightCellCalculateUnit } from './calculate-unit/highlight-cell';
import { colorScaleCellCalculateUnit } from './calculate-unit/color-scale';
import { iconSetCalculateUnit } from './calculate-unit/icon-set';
import type { ICalculateUnit, IContext } from './calculate-unit/type';
import { EMPTY_STYLE } from './calculate-unit/type';

type ComputeStatus = 'computing' | 'end' | 'error';

interface IComputeCache { status: ComputeStatus };

const beforeUpdateRuleResult = createInterceptorKey<{ subUnitId: string; unitId: string; cfId: string }, undefined>('conditional-formatting-before-update-rule-result');
@OnLifecycle(LifecycleStages.Starting, ConditionalFormattingService)
export class ConditionalFormattingService extends Disposable {
    private _afterInitApplyPromise: Promise<void>;
    // <unitId,<subUnitId,<cfId,IComputeCache>>>
    private _ruleCacheMap: Map<string, Map<string, Map<string, IComputeCache>>> = new Map();

    private _ruleComputeStatus$: Subject<{ status: ComputeStatus; result?: ObjectMatrix<any>; unitId: string; subUnitId: string; cfId: string }> = new Subject();
    public ruleComputeStatus$ = this._ruleComputeStatus$.asObservable();

    public interceptorManager = new InterceptorManager({ beforeUpdateRuleResult });

    private _calculationUnitMap: Map<IConditionFormattingRule['rule']['type'], ICalculateUnit> = new Map();

    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCellChange();
        this._initCacheManager();
        this._initRemoteCalculate();
        this._initSnapshot();
        this._initSheetChange();
        this._registerCalculationUnit(dataBarCellCalculateUnit);
        this._registerCalculationUnit(colorScaleCellCalculateUnit);
        this._registerCalculationUnit(highlightCellCalculateUnit);
        this._registerCalculationUnit(iconSetCalculateUnit);
        this._afterInitApplyPromise = afterInitApply(_commandService);
    }

    public composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cell = this._conditionalFormattingViewModel.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            // High priority should be applied at the back, overwriting the previous results.
            // reverse is a side-effect function that changes the original array.
            const ruleList = cell.cfList.map((item) => this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule).reverse();
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
                if (type === CFRuleType.highlightCell) {
                    ruleCacheItem!.ruleCache && Tools.deepMerge(pre, { style: ruleCacheItem!.ruleCache });
                } else if (type === CFRuleType.colorScale) {
                    const ruleCache = ruleCacheItem?.ruleCache as string;
                    if (ruleCache) {
                        pre.style = { ...(pre.style ?? {}), bg: { rgb: ruleCache } };
                    }
                } else if (type === CFRuleType.dataBar) {
                    const ruleCache = ruleCacheItem?.ruleCache as IDataBarRenderParams;
                    if (ruleCache && ruleCache !== EMPTY_STYLE) {
                        pre.dataBar = ruleCache;
                        pre.isShowValue = ruleCache.isShowValue;
                    }
                } else if (type === CFRuleType.iconSet) {
                    const ruleCache = ruleCacheItem?.ruleCache as IIconSetRenderParams;
                    if (ruleCache && ruleCache !== EMPTY_STYLE) {
                        pre.iconSet = ruleCache;
                        pre.isShowValue = ruleCache.isShowValue;
                    }
                }
                return pre;
            }, {} as { style?: IHighlightCell['style'] } & IDataBarCellData & IIconSetCellData & { isShowValue: boolean });
            return result;
        }
        return null;
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._conditionalFormattingRuleModel.getUnitRules(unitID);
            const resultMap: IRuleModelJson[keyof IRuleModelJson] = {};
            if (map) {
                map.forEach((v, key) => {
                    resultMap[key] = v;
                });
                return JSON.stringify(resultMap);
            }
            return '';
        };
        const parseJson = (json: string): IRuleModelJson[keyof IRuleModelJson] => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IRuleModelJson[keyof IRuleModelJson]>({
                pluginName: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._conditionalFormattingRuleModel.deleteUnitId(unitID);
                },
                onLoad: (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const ruleList = [...value[subunitId]].reverse();
                        ruleList.forEach((rule) => {
                            this._conditionalFormattingRuleModel.addRule(unitID, subunitId, rule);
                        });
                    });
                },
            })
        );
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const unitId = params.unitId || getUnitId(this._univerInstanceService);
                        const subUnitId = params.subUnitId || getSubUnitId(this._univerInstanceService);
                        const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        if (!ruleList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        ruleList.forEach((item) => {
                            const params: IDeleteConditionalRuleMutationParams = {
                                unitId, subUnitId,
                                cfId: item.cfId,
                            };
                            redos.push({
                                id: DeleteConditionalRuleMutation.id, params,
                            });
                            undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                        });

                        return {
                            redos,
                            undos,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _registerCalculationUnit(unit: ICalculateUnit) {
        this._calculationUnitMap.set(unit.type, unit);
    }

    private _getComputedCache(unitId: string, subUnitId: string, cfId: string) {
        return this._ruleCacheMap.get(unitId)?.get(subUnitId)?.get(cfId);
    }

    private _setComputedCache(unitId: string, subUnitId: string, cfId: string, value: IComputeCache) {
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
        this.disposeWithMe(this._conditionalFormattingViewModel.markDirty$.subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        }));

        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.pipe(filter((item) => item.type !== 'sort')).subscribe((item) => {
            this._deleteComputeCache(item.unitId, item.subUnitId, item.rule.cfId);
        }));
    }

    private _initCellChange() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                const collectRule = (unitId: string, subUnitId: string, cellData: [number, number][]) => {
                    const ruleIds: Set<string> = new Set();
                    cellData.forEach(([row, col]) => {
                        const ruleItem = this._conditionalFormattingViewModel.getCellCf(unitId, subUnitId, row, col);
                        ruleItem?.cfList.forEach((item) => ruleIds.add(item.cfId));
                    });
                    return [...ruleIds].map((cfId) => this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId) as IConditionFormattingRule).filter((rule) => !!rule);
                };

                switch (commandInfo.id) {
                    case SetRangeValuesMutation.id: {
                        const params = commandInfo.params as ISetRangeValuesMutationParams;
                        const { subUnitId, unitId, cellValue } = params;
                        const cellMatrix: [number, number][] = [];
                        new ObjectMatrix(cellValue).forValue((row, col, value) => {
                            // When P and V are involved
                            const result = value && Object.keys(value).some((key) => ['p', 'v'].includes(key));
                            if (result) {
                                cellMatrix.push([row, col]);
                            }
                        });
                        const rules = collectRule(unitId, subUnitId, cellMatrix);
                        rules.forEach((rule) => {
                            this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                            this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                        });
                        break;
                    }
                    case InsertColMutation.id:
                    case RemoveColMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IInsertColMutationParams;
                        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        const effectRange: IRange = { ...range, endColumn: Number.MAX_SAFE_INTEGER };
                        if (allRules) {
                            const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                            effectRule.forEach((rule) => {
                                this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                                this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                            });
                        }
                        break;
                    }
                    case RemoveRowMutation.id:
                    case InsertRowMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IRemoveRowsMutationParams;
                        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        const effectRange: IRange = { ...range, endRow: Number.MAX_SAFE_INTEGER };
                        if (allRules) {
                            const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                            effectRule.forEach((rule) => {
                                this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                                this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                            });
                        }
                        break;
                    }
                    case MoveRowsMutation.id: {
                        const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveRowsMutationParams;
                        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        const effectRange: IRange = {
                            startRow: Math.min(sourceRange.startRow, targetRange.startRow),
                            endRow: Number.MAX_SAFE_INTEGER,
                            startColumn: 0,
                            endColumn: Number.MAX_SAFE_INTEGER,
                        };
                        if (allRules) {
                            const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                            effectRule.forEach((rule) => {
                                this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                                this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                            });
                        }
                        break;
                    }
                    case MoveColsMutation.id: {
                        const { sourceRange, targetRange, unitId, subUnitId } = commandInfo.params as IMoveColumnsMutationParams;
                        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        const effectRange: IRange = {
                            startRow: 0,
                            endRow: Number.MAX_SAFE_INTEGER,
                            startColumn: Math.min(sourceRange.startColumn, targetRange.startColumn),
                            endColumn: Number.MAX_SAFE_INTEGER,
                        };
                        if (allRules) {
                            const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, effectRange)));
                            effectRule.forEach((rule) => {
                                this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                                this._deleteComputeCache(unitId, subUnitId, rule.cfId);
                            });
                        }
                        break;
                    }
                    case MoveRangeMutation.id: {
                        const { unitId, to, from } = commandInfo.params as IMoveRangeMutationParams;
                        const handleSubUnit = (value: IMoveRangeMutationParams['from']) => {
                            const cellMatrix: [number, number][] = [];
                            new ObjectMatrix(value.value).forValue((row, col) => {
                                cellMatrix.push([row, col]);
                            });
                            const rules = collectRule(unitId, value.subUnitId, cellMatrix);
                            rules.forEach((rule) => {
                                this._conditionalFormattingViewModel.markRuleDirty(unitId, value.subUnitId, rule);
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
            const cache = this._getComputedCache(unitId, subUnitId, cfId) || {} as IComputeCache;
            cache.status = status;
            this._setComputedCache(unitId, subUnitId, cfId, cache);
            if (status === 'end' && result) {
                this.interceptorManager.fetchThroughInterceptors(this.interceptorManager.getInterceptPoints().beforeUpdateRuleResult)({
                    subUnitId, unitId, cfId,
                }, undefined);
                result.forValue((row, col, value) => {
                    this._conditionalFormattingViewModel.setCellCfRuleCache(unitId, subUnitId, row, col, cfId, value);
                });
            }
        }));
    }

    private async _handleCalculateUnit(unitId: string, subUnitId: string, rule: IConditionFormattingRule) {
        await this._afterInitApplyPromise;
        // We need to perform a secondary verification, as the rule may have been deleted after initApply.
        if (!this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, rule.cfId)) {
            return;
        }
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        let cache = this._getComputedCache(unitId, subUnitId, rule.cfId);
        if (cache && ['computing', 'end'].includes(cache.status)) {
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
        const context: IContext = { unitId, subUnitId, accessor: this._injector, workbook: workbook!, worksheet };
        const result = await unit.handle(rule, context);
        this._ruleComputeStatus$.next({ status: 'end', unitId, subUnitId, cfId: rule.cfId, result });
    }
}

const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getSheetId();
