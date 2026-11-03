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

import type { IMutationInfo, ISheetDataValidationRule } from '@univerjs/core';
import type {
    IRemoveDataValidationMutationParams,
    IUpdateDataValidationMutationParams,
} from '@univerjs/data-validation';
import type { EffectRefRangeParams, ISetWorksheetNameCommandParams } from '@univerjs/sheets';
import {
    Disposable,
    Inject,
    Injector,
    isFormulaString,
    isRangesEqual,
    IUniverInstanceService,
    toDisposable,
} from '@univerjs/core';
import {
    DataValidatorRegistryService,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
    UpdateRuleType,
} from '@univerjs/data-validation';
import {
    deserializeRangeWithSheetWithCache,
    generateStringWithSequence,
    LexerTreeBuilder,
    sequenceNodeType,
    serializeRangeWithSheet,
    serializeRangeWithSpreadsheet,
} from '@univerjs/engine-formula';
import {
    EffectRefRangId,
    getSheetCommandTarget,
    handleCommonDefaultRangeChangeWithEffectRefCommands,
    RefRangeService,
    SetWorksheetNameCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { removeDataValidationUndoFactory } from '../commands/commands/data-validation.command';
import { UpdateDataValidationFormulaBySheetRenameMutation } from '../commands/mutations/update-data-validation-formula-by-sheet-rename.mutation';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { shouldOffsetFormulaByRange } from '../utils/formula';

export class DataValidationRefRangeController extends Disposable {
    private _disposableMap = new Map<string, { unitId: string; disposables: Set<() => void> }>();

    constructor(
        @Inject(SheetDataValidationModel) private _dataValidationModel: SheetDataValidationModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(DataValidationFormulaService) private _dataValidationFormulaService: DataValidationFormulaService,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService,
        @Inject(DataValidatorRegistryService) private _validatorRegistryService: DataValidatorRegistryService
    ) {
        super();
        this._initRefRange();
        this._initRenameInterceptor();
        this.disposeWithMe(this._injector.get(IUniverInstanceService).unitDisposed$.subscribe((unit) => {
            for (const [id, entry] of this._disposableMap) {
                if (entry.unitId === unit.getUnitId()) {
                    entry.disposables.forEach((dispose) => dispose());
                    this._disposableMap.delete(id);
                }
            }
        }));
    }

    private _initRenameInterceptor() {
        this.disposeWithMe(this._injector.get(SheetInterceptorService).interceptCommand({
            getMutations: (commandInfo) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                if (commandInfo.id !== SetWorksheetNameCommand.id) {
                    return { redos, undos };
                }
                const params = commandInfo.params as ISetWorksheetNameCommandParams;
                const target = getSheetCommandTarget(this._injector.get(IUniverInstanceService), params);
                if (!target || target.worksheet.getName() === params.name) {
                    return { redos, undos };
                }
                for (const [unitId, sheets] of this._dataValidationModel.getAll()) {
                    for (const [subUnitId, rules] of sheets) {
                        for (const rule of rules) {
                            const formula1 = this._renameFormula(rule.formula1, unitId, target.unitId, target.worksheet.getName(), params.name);
                            const formula2 = this._renameFormula(rule.formula2, unitId, target.unitId, target.worksheet.getName(), params.name);
                            if (formula1 === rule.formula1 && formula2 === rule.formula2) {
                                continue;
                            }
                            const mutationParams = {
                                unitId,
                                subUnitId,
                                ruleId: rule.uid,
                                before: { formula1: rule.formula1, formula2: rule.formula2 },
                                after: { formula1, formula2 },
                            };
                            redos.push({ id: UpdateDataValidationFormulaBySheetRenameMutation.id, params: mutationParams });
                            undos.push({
                                id: UpdateDataValidationFormulaBySheetRenameMutation.id,
                                params: { ...mutationParams, before: mutationParams.after, after: mutationParams.before },
                            });
                        }
                    }
                }
                return { redos, undos };
            },
        }));
    }

    private _renameFormula(formula: string | undefined, ownerUnitId: string, unitId: string, oldName: string, name: string) {
        if (!isFormulaString(formula)) {
            return formula;
        }
        let changed = false;
        const nodes = this._injector.get(LexerTreeBuilder).sequenceNodesBuilder(formula!);
        const renamed = nodes?.map((node) => {
            if (typeof node !== 'string' && node.nodeType === sequenceNodeType.STRING) {
                return { ...node, token: `"${node.token.slice(1, -1).split('"').join('""')}"` };
            }
            if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                return node;
            }
            const ref = deserializeRangeWithSheetWithCache(node.token);
            if ((ref.unitId || ownerUnitId) !== unitId || ref.sheetName !== oldName) {
                return node;
            }
            changed = true;
            const token = ref.unitId
                ? serializeRangeWithSpreadsheet(ref.unitId, name, ref.range)
                : serializeRangeWithSheet(name, ref.range);
            return { ...node, token };
        });
        return changed && renamed ? `=${generateStringWithSequence(renamed)}` : formula;
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return JSON.stringify([unitID, subUnitId, ruleId]);
    }

    registerRule = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
        if (shouldOffsetFormulaByRange(rule.type, this._validatorRegistryService)) {
            return;
        }
        this.register(unitId, subUnitId, rule);
        this.registerFormula(unitId, subUnitId, rule);
    };

    registerFormula(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        const id = this._getIdWithUnitId(unitId, subUnitId, ruleId);
        const disposeSet = this._disposableMap.get(id)?.disposables ?? new Set();
        const handleFormulaChange = (type: 'formula1' | 'formula2', formulaString: string) => {
            const oldRule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            if (!oldRule) {
                return { redos: [], undos: [] };
            }
            const oldFormula = oldRule[type];
            if (!oldFormula || oldFormula === formulaString) {
                return { redos: [], undos: [] };
            }
            const redoParams: IUpdateDataValidationMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type: UpdateRuleType.SETTING,
                    payload: {
                        type: oldRule.type,
                        formula1: oldRule.formula1,
                        formula2: oldRule.formula2,
                        [type]: formulaString,
                    },
                },
                source: 'patched',
            };
            const undoParams: IUpdateDataValidationMutationParams = {
                unitId,
                subUnitId,
                ruleId: rule.uid,
                payload: {
                    type: UpdateRuleType.SETTING,
                    payload: {
                        type: oldRule.type,
                        formula1: oldRule.formula1,
                        formula2: oldRule.formula2,
                    },
                },
                source: 'patched',
            };
            const redos = [
                {
                    id: UpdateDataValidationMutation.id,
                    params: redoParams,
                },
            ];
            const undos = [
                {
                    id: UpdateDataValidationMutation.id,
                    params: undoParams,
                },
            ];
            return { redos, undos };
        };

        const currentFormula = this._dataValidationFormulaService.getRuleFormulaInfo(unitId, subUnitId, ruleId);
        if (currentFormula) {
            const [formula1, formula2] = currentFormula;
            if (formula1) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    unitId,
                    subUnitId,
                    formula1.text,
                    (newFormulaString, commandInfo) => {
                        if (commandInfo.id === EffectRefRangId.MoveRangeCommandId
                            && commandInfo.params?.fromUnitId
                            && commandInfo.params.fromUnitId === commandInfo.params.toUnitId
                            && commandInfo.params.fromSubUnitId !== commandInfo.params.toSubUnitId) {
                            return { redos: [], undos: [] };
                        }
                        return handleFormulaChange('formula1', newFormulaString);
                    }
                );
                disposeSet.add(() => disposable.dispose());
            }

            if (formula2) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    unitId,
                    subUnitId,
                    formula2.text,
                    (newFormulaString, commandInfo) => {
                        if (commandInfo.id === EffectRefRangId.MoveRangeCommandId
                            && commandInfo.params?.fromUnitId
                            && commandInfo.params.fromUnitId === commandInfo.params.toUnitId
                            && commandInfo.params.fromSubUnitId !== commandInfo.params.toSubUnitId) {
                            return { redos: [], undos: [] };
                        }
                        return handleFormulaChange('formula2', newFormulaString);
                    }
                );
                disposeSet.add(() => disposable.dispose());
            }
        }
    }

    register(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
            if (commandInfo.id === EffectRefRangId.MoveRangeCommandId
                && commandInfo.params?.fromUnitId
                && commandInfo.params.fromUnitId === commandInfo.params.toUnitId
                && commandInfo.params.fromSubUnitId !== commandInfo.params.toSubUnitId) {
                return { redos: [], undos: [] };
            }
            const oldRanges = [...rule.ranges];
            const resultRangesOrigin = oldRanges.map((range) => {
                return handleCommonDefaultRangeChangeWithEffectRefCommands(range, commandInfo);
            }).filter((range) => !!range);
            const resultRanges = resultRangesOrigin.flat();

            const isEqual = isRangesEqual(resultRanges, oldRanges);
            if (isEqual) {
                return { redos: [], undos: [] };
            }

            if (resultRanges.length) {
                const redoParams: IUpdateDataValidationMutationParams = {
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    payload: {
                        type: UpdateRuleType.RANGE,
                        payload: resultRanges,
                    },
                    source: 'patched',
                };
                // in ref-range case, there won't be any overlap about rule ranges
                const redos = [{ id: UpdateDataValidationMutation.id, params: redoParams }];
                const undos = [{
                    id: UpdateDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        ruleId: rule.uid,
                        payload: {
                            type: UpdateRuleType.RANGE,
                            payload: oldRanges,
                        },
                        source: 'patched',
                    },
                }];
                return { redos, undos };
            } else {
                const redoParams: IRemoveDataValidationMutationParams = { unitId, subUnitId, ruleId: rule.uid };
                const redos = [{ id: RemoveDataValidationMutation.id, params: redoParams }];
                const undos = removeDataValidationUndoFactory(this._injector, redoParams);
                return { redos, undos };
            }
        };
        const disposeList: (() => void)[] = [];

        rule.ranges.forEach((range) => {
            const disposable = this._refRangeService.registerRefRange(range, handleRangeChange, unitId, subUnitId);
            disposeList.push(() => disposable.dispose());
        });
        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
        const current = this._disposableMap.get(id)?.disposables ?? new Set();
        current.add(() => disposeList.forEach((dispose) => dispose()));
        this._disposableMap.set(id, { unitId, disposables: current });
    };

    private _initRefRange() {
        const allRules = this._dataValidationModel.getAll();
        for (const [unitId, subUnitMap] of allRules) {
            for (const [subUnitId, rules] of subUnitMap) {
                for (const rule of rules) {
                    this.registerRule(unitId, subUnitId, rule);
                }
            }
        }

        this.disposeWithMe(
            this._dataValidationModel.ruleChange$.subscribe((option) => {
                const { unitId, subUnitId, rule } = option;
                switch (option.type) {
                    case 'add': {
                        const rule = option.rule!;
                        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
                        this._disposableMap.get(id)?.disposables.forEach((dispose) => dispose());
                        this._disposableMap.delete(id);
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                    case 'remove': {
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid))?.disposables;
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        this._disposableMap.delete(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        break;
                    }
                    case 'update': {
                        const rule = option.rule!;
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid))?.disposables;
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        this._disposableMap.delete(this._getIdWithUnitId(unitId, subUnitId, rule.uid));
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.disposables.forEach((dispose) => dispose());
            });
            this._disposableMap.clear();
        }));
    }
}
