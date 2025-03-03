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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { IInsertColMutationParams, IMoveColumnsMutationParams, IMoveRangeMutationParams, IMoveRowsMutationParams, IRemoveRowsMutationParams, IRemoveSheetCommandParams, IReorderRangeMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/delete-conditional-rule.mutation';
import type { IConditionFormattingRule, IHighlightCell, IRuleModelJson } from '../models/type';
import type { IDataBarCellData, IDataBarRenderParams, IIconSetCellData, IIconSetRenderParams } from '../render/type';
import { Disposable, ICommandService, Inject, Injector, IResourceManagerService, IUniverInstanceService, ObjectMatrix, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { InsertColMutation, InsertRowMutation, MoveColsMutation, MoveRangeMutation, MoveRowsMutation, RemoveColMutation, RemoveRowMutation, RemoveSheetCommand, ReorderRangeMutation, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { CFRuleType, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '../base/const';
import { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory } from '../commands/mutations/delete-conditional-rule.mutation';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';

export class ConditionalFormattingService extends Disposable {
    get _conditionalFormattingViewModelV2() {
        return this._injector.get(ConditionalFormattingViewModel);
    }

    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCellChange();
        this._initSnapshot();
        this._initSheetChange();
    }

    public composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cellCfs = this._conditionalFormattingViewModelV2.getCellCfs(unitId, subUnitId, row, col);

        if (cellCfs && cellCfs?.length) {
            // High priority should be applied at the back, overwriting the previous results.
            // reverse is a side-effect function that changes the original array.
            const ruleList = cellCfs.map((item) => this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule).reverse();
            const endIndex = ruleList.findIndex((rule) => rule?.stopIfTrue);
            if (endIndex > -1) {
                ruleList.splice(endIndex + 1);
            }
            const result = ruleList.reduce((pre, rule) => {
                const type = rule.rule.type;
                const ruleCacheItem = cellCfs.find((cache) => cache.cfId === rule.cfId);

                if (type === CFRuleType.highlightCell) {
                    ruleCacheItem!.result && Tools.deepMerge(pre, { style: ruleCacheItem!.result });
                } else if (type === CFRuleType.colorScale) {
                    const ruleCache = ruleCacheItem?.result;
                    if (ruleCache && typeof ruleCache === 'string') {
                        pre.style = { ...(pre.style ?? {}), bg: { rgb: ruleCache } };
                    }
                } else if (type === CFRuleType.dataBar) {
                    const ruleCache = ruleCacheItem?.result as IDataBarRenderParams;
                    if (ruleCache) {
                        pre.dataBar = ruleCache;
                        pre.isShowValue = ruleCache.isShowValue;
                    }
                } else if (type === CFRuleType.iconSet) {
                    const ruleCache = ruleCacheItem?.result as IIconSetRenderParams;
                    if (ruleCache) {
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

                        if (!subUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        if (!ruleList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        ruleList.forEach((item) => {
                            const params: IDeleteConditionalRuleMutationParams = {
                                unitId,
                                subUnitId,
                                cfId: item.cfId,
                            };
                            redos.push({
                                id: DeleteConditionalRuleMutation.id,
                                params,
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

    // eslint-disable-next-line max-lines-per-function
    private _initCellChange() {
        this.disposeWithMe(
            // eslint-disable-next-line max-lines-per-function
            this._commandService.onCommandExecuted((commandInfo) => {
                const collectRule = (unitId: string, subUnitId: string, cellData: [number, number][]) => {
                    const ruleIds: Set<string> = new Set();
                    cellData.forEach(([row, col]) => {
                        const ruleItem = this._conditionalFormattingViewModelV2.getCellCfs(unitId, subUnitId, row, col);
                        ruleItem?.forEach((item) => ruleIds.add(item.cfId));
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
                            this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
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
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
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
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
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
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
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
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
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
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, value.subUnitId, rule.cfId);
                            });
                        };
                        handleSubUnit(to);
                        handleSubUnit(from);
                        break;
                    }
                    case ReorderRangeMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IReorderRangeMutationParams;
                        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        if (allRules) {
                            const effectRule = allRules.filter((rule) => rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range)));
                            effectRule.forEach((rule) => {
                                this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
                            });
                        }
                        break;
                    }
                }
            })
        );
    }
}

const getUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
const getSubUnitId = (u: IUniverInstanceService) => u.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
