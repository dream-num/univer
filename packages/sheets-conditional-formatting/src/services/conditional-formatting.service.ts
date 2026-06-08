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

import type { IMutationInfo, IRange } from '@univerjs/core';
import type {
    ICopySheetCommandParams,
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IMoveColumnsMutationParams,
    IMoveRangeMutationParams,
    IMoveRowsMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveSheetCommandParams,
    IReorderRangeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import type { IAddConditionalRuleMutationParams } from '../commands/mutations/add-conditional-rule.mutation';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/delete-conditional-rule.mutation';
import type { IRuleModelJson } from '../models/type';
import {
    Disposable,
    ICommandService,
    Inject,
    Injector,
    IResourceManagerService,
    isInternalEditorID,
    IUniverInstanceService,
    ObjectMatrix,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CopySheetCommand,
    getSheetCommandTarget,
    InsertColMutation,
    InsertRowMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetCommand,
    ReorderRangeMutation,
    SetRangeValuesMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '../base/const';
import { AddConditionalRuleMutation, AddConditionalRuleMutationUndoFactory } from '../commands/mutations/add-conditional-rule.mutation';
import { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory } from '../commands/mutations/delete-conditional-rule.mutation';
import { ConditionalFormattingRangeIndexModel } from '../models/conditional-formatting-range-index-model';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';
import { ConditionalFormattingStyleComposer } from './conditional-formatting-style-composer.service';

export class ConditionalFormattingService extends Disposable {
    get _conditionalFormattingViewModelV2() {
        return this._injector.get(ConditionalFormattingViewModel);
    }

    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingRangeIndexModel) private _conditionalFormattingRangeIndexModel: ConditionalFormattingRangeIndexModel,
        @Inject(ConditionalFormattingStyleComposer) private _conditionalFormattingStyleComposer: ConditionalFormattingStyleComposer,
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
        return this._conditionalFormattingStyleComposer.composeStyle(unitId, subUnitId, row, col);
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
            } catch {
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
                    this._conditionalFormattingRangeIndexModel.rebuild();
                    if (isInternalEditorID(unitID)) return;
                    this._conditionalFormattingViewModelV2.clearCache();
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
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;

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
                    } else if (commandInfo.id === CopySheetCommand.id) {
                        const params = commandInfo.params as ICopySheetCommandParams & { targetSubUnitId: string };
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }

                        const { unitId, subUnitId } = target;
                        const { targetSubUnitId } = params;

                        const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
                        if (!ruleList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        ruleList.forEach((item) => {
                            const params: IAddConditionalRuleMutationParams = {
                                unitId,
                                subUnitId: targetSubUnitId,
                                rule: {
                                    ...item,
                                    cfId: this._conditionalFormattingRuleModel.createCfId(unitId, targetSubUnitId),
                                },
                            };
                            redos.push({ id: AddConditionalRuleMutation.id, params });
                            undos.push(AddConditionalRuleMutationUndoFactory(this._injector, params));
                        });

                        return { redos, undos };
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
                const markRulesDirtyByRanges = (unitId: string, subUnitId: string, ranges: IRange[]) => {
                    const rules = this._conditionalFormattingRangeIndexModel.getRulesByRanges(unitId, subUnitId, ranges);
                    rules.forEach((rule) => {
                        this._conditionalFormattingViewModelV2.markRuleDirty(unitId, subUnitId, rule.cfId);
                    });
                };

                switch (commandInfo.id) {
                    case SetRangeValuesMutation.id: {
                        const params = commandInfo.params as ISetRangeValuesMutationParams;
                        const { subUnitId, unitId, cellValue } = params;
                        const ranges: IRange[] = [];
                        new ObjectMatrix(cellValue).forValue((row, col, value) => {
                            // When P and V are involved
                            const result = value && Object.keys(value).some((key) => ['p', 'v'].includes(key));
                            if (result) {
                                ranges.push({ startRow: row, endRow: row, startColumn: col, endColumn: col });
                            }
                        });
                        markRulesDirtyByRanges(unitId, subUnitId, ranges);
                        break;
                    }
                    case InsertColMutation.id:
                    case RemoveColMutation.id: {
                        const params = commandInfo.params as IInsertColMutationParams | IRemoveColMutationParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) return;

                        const { worksheet, unitId, subUnitId } = target;
                        const { range } = params;
                        const effectRange: IRange = { ...range, endColumn: worksheet.getColumnCount() - 1 };

                        markRulesDirtyByRanges(unitId, subUnitId, [effectRange]);
                        break;
                    }
                    case RemoveRowMutation.id:
                    case InsertRowMutation.id: {
                        const params = commandInfo.params as IRemoveRowsMutationParams | IInsertRowMutationParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) return;

                        const { worksheet, unitId, subUnitId } = target;
                        const { range } = params;
                        const effectRange: IRange = { ...range, endRow: worksheet.getRowCount() - 1 };

                        markRulesDirtyByRanges(unitId, subUnitId, [effectRange]);
                        break;
                    }
                    case MoveRowsMutation.id: {
                        const params = commandInfo.params as IMoveRowsMutationParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) return;

                        const { worksheet, unitId, subUnitId } = target;
                        const { sourceRange, targetRange } = params;
                        const effectRange: IRange = {
                            startRow: Math.min(sourceRange.startRow, targetRange.startRow),
                            endRow: worksheet.getRowCount() - 1,
                            startColumn: 0,
                            endColumn: worksheet.getColumnCount() - 1,
                        };

                        markRulesDirtyByRanges(unitId, subUnitId, [effectRange]);
                        break;
                    }
                    case MoveColsMutation.id: {
                        const params = commandInfo.params as IMoveColumnsMutationParams;
                        const target = getSheetCommandTarget(this._univerInstanceService, params);
                        if (!target) return;

                        const { worksheet, unitId, subUnitId } = target;
                        const { sourceRange, targetRange } = params;
                        const effectRange: IRange = {
                            startRow: 0,
                            endRow: worksheet.getRowCount() - 1,
                            startColumn: Math.min(sourceRange.startColumn, targetRange.startColumn),
                            endColumn: worksheet.getColumnCount() - 1,
                        };

                        markRulesDirtyByRanges(unitId, subUnitId, [effectRange]);
                        break;
                    }
                    case MoveRangeMutation.id: {
                        const { unitId, to, from } = commandInfo.params as IMoveRangeMutationParams;
                        const handleSubUnit = (value: IMoveRangeMutationParams['from']) => {
                            const ranges: IRange[] = [];
                            new ObjectMatrix(value.value).forValue((row, col) => {
                                ranges.push({ startRow: row, endRow: row, startColumn: col, endColumn: col });
                            });
                            markRulesDirtyByRanges(unitId, value.subUnitId, ranges);
                        };
                        handleSubUnit(to);
                        handleSubUnit(from);
                        break;
                    }
                    case ReorderRangeMutation.id: {
                        const { range, unitId, subUnitId } = commandInfo.params as IReorderRangeMutationParams;
                        markRulesDirtyByRanges(unitId, subUnitId, [range]);
                        break;
                    }
                }
            })
        );
    }
}
