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

import type { ISheetDataValidationRule } from '@univerjs/core';
import type { IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { Disposable, Inject, Injector, isRangesEqual, toDisposable } from '@univerjs/core';
import { DataValidatorRegistryService, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { handleCommonDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { removeDataValidationUndoFactory } from '../commands/commands/data-validation.command';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { shouldOffsetFormulaByRange } from '../utils/formula';

export class DataValidationRefRangeController extends Disposable {
    private _disposableMap: Map<string, Set<() => void>> = new Map();

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
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return `${unitID}_${subUnitId}_${ruleId}`;
    }

    registerRule = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
        if (shouldOffsetFormulaByRange(rule.type, this._validatorRegistryService)) {
            return;
        }
        this.register(unitId, subUnitId, rule);
        this.registerFormula(unitId, subUnitId, rule);
    };

    // eslint-disable-next-line max-lines-per-function
    registerFormula(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const ruleId = rule.uid;
        const id = this._getIdWithUnitId(unitId, subUnitId, ruleId);
        const disposeSet = this._disposableMap.get(id) ?? new Set();
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
                    (newFormulaString) => handleFormulaChange('formula1', newFormulaString)
                );
                disposeSet.add(() => disposable.dispose());
            }

            if (formula2) {
                const disposable = this._formulaRefRangeService.registerFormula(
                    unitId,
                    subUnitId,
                    formula2.text,
                    (newFormulaString) => handleFormulaChange('formula2', newFormulaString)
                );
                disposeSet.add(() => disposable.dispose());
            }
        }
    }

    register(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
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
        const current = this._disposableMap.get(id) ?? new Set();
        current.add(() => disposeList.forEach((dispose) => dispose()));
        this._disposableMap.set(id, current);
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
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                    case 'remove': {
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        break;
                    }
                    case 'update': {
                        const rule = option.rule!;
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        if (disposeSet) {
                            disposeSet.forEach((dispose) => dispose());
                        }
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                }
            })
        );

        this.disposeWithMe(toDisposable(() => {
            this._disposableMap.forEach((item) => {
                item.forEach((dispose) => dispose());
            });
            this._disposableMap.clear();
        }));
    }
}
