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

import type { IDisposable, IMutationInfo, ISheetDataValidationRule } from '@univerjs/core';
import type { IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { Disposable, generateRandomId, Inject, IUniverInstanceService, toDisposable } from '@univerjs/core';
import {
    AddDataValidationMutation,
    DataValidatorRegistryService,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
    UpdateRuleType,
} from '@univerjs/data-validation';
import { EffectRefRangId } from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { SheetDataValidationModel } from '../models/sheet-data-validation-model';
import { shouldOffsetFormulaByRange } from '../utils/formula';

export class DataValidationFormulaRefRangeController extends Disposable {
    private _disposableMap = new Map<string, { unitId: string; disposable: IDisposable }>();

    constructor(
        @Inject(SheetDataValidationModel) private _dataValidationModel: SheetDataValidationModel,
        @Inject(FormulaRefRangeService) private _formulaRefRangeService: FormulaRefRangeService,
        @Inject(DataValidatorRegistryService) private _validatorRegistryService: DataValidatorRegistryService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initRefRange();
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unit) => {
            for (const [id, entry] of this._disposableMap) {
                if (entry.unitId === unit.getUnitId()) {
                    entry.disposable.dispose();
                    this._disposableMap.delete(id);
                }
            }
        }));
    }

    private _getIdWithUnitId(unitID: string, subUnitId: string, ruleId: string) {
        return JSON.stringify([unitID, subUnitId, ruleId]);
    }

    registerRule = (unitId: string, subUnitId: string, rule: ISheetDataValidationRule) => {
        if (!shouldOffsetFormulaByRange(rule.type, this._validatorRegistryService)) {
            return;
        }

        this.register(unitId, subUnitId, rule);
    };

    register(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const oldRanges = rule.ranges;
        const oldFormula1 = rule.formula1;
        const oldFormula2 = rule.formula2;
        const disposable = this._formulaRefRangeService.registerRangeFormula(unitId, subUnitId, oldRanges, [oldFormula1 ?? '', oldFormula2 ?? ''], (res, commandInfo) => {
            if (commandInfo.id === EffectRefRangId.MoveRangeCommandId
                && commandInfo.params?.fromUnitId
                && commandInfo.params.fromUnitId === commandInfo.params.toUnitId
                && commandInfo.params.fromSubUnitId !== commandInfo.params.toSubUnitId) {
                return { redos: [], undos: [] };
            }
            if (res.length === 0) {
                return {
                    undos: [{
                        id: AddDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            rule,
                            source: 'patched',
                        },
                    }],
                    redos: [{
                        id: RemoveDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: rule.uid,
                            source: 'patched',
                        },
                    }],
                };
            }
            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            const first = res[0];
            redos.push({
                id: UpdateDataValidationMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    payload: {
                        type: UpdateRuleType.ALL,
                        payload: {
                            ranges: first.ranges,
                            formula1: first.formulas[0],
                            formula2: first.formulas[1],
                        },
                    },
                    source: 'patched',
                } as IUpdateDataValidationMutationParams,
            });
            undos.push({
                id: UpdateDataValidationMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    payload: {
                        type: UpdateRuleType.ALL,
                        payload: {
                            ranges: oldRanges,
                            formula1: oldFormula1,
                            formula2: oldFormula2,
                        },
                    },
                    source: 'patched',
                },
            });

            for (let i = 1; i < res.length; i++) {
                const item = res[i];
                const id = generateRandomId();
                redos.push({
                    id: AddDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        rule: {
                            ...rule,
                            uid: id,
                            formula1: item.formulas[0],
                            formula2: item.formulas[1],
                            ranges: item.ranges,
                        },
                        source: 'patched',
                    },
                });
                undos.push({
                    id: RemoveDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        ruleId: id,
                        source: 'patched',
                    },
                });
            }
            return {
                undos,
                redos,
            };
        });
        const id = this._getIdWithUnitId(unitId, subUnitId, rule.uid);
        this._disposableMap.set(id, { unitId, disposable });
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
                        this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule.uid))?.disposable.dispose();
                        this.registerRule(option.unitId, option.subUnitId, rule);
                        break;
                    }
                    case 'remove': {
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid))?.disposable;
                        if (disposeSet) {
                            disposeSet.dispose();
                        }
                        this._disposableMap.delete(this._getIdWithUnitId(unitId, subUnitId, rule!.uid));
                        break;
                    }
                    case 'update': {
                        const rule = option.rule!;
                        const disposeSet = this._disposableMap.get(this._getIdWithUnitId(unitId, subUnitId, rule!.uid))?.disposable;
                        if (disposeSet) {
                            disposeSet.dispose();
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
                item.disposable.dispose();
            });
            this._disposableMap.clear();
        }));
    }
}
