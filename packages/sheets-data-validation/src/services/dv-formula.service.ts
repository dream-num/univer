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

import { Disposable, ICommandService, isFormulaString, type ISheetDataValidationRule, Tools } from '@univerjs/core';
import type { IOtherFormulaManagerInsertParam, IOtherFormulaManagerSearchParam } from '@univerjs/engine-formula/services/other-formula-manager.service.js';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { RemoveOtherFormulaMutation, SetFormulaCalculationResultMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';
import { FormulaResultStatus, type IDataValidationFormulaResult, type IFormulaInfo } from './formula-common';

// 作为值的formula
// 只需要和rule进行绑定即可
export class DataValidationFormulaService extends Disposable {
    private _formulaRuleMap: Map<string, Map<string, Map<string, [IFormulaInfo | undefined, IFormulaInfo | undefined]>>> = new Map();
    private _formulaCacheMap: Map<string, Map<string, Map<string, IDataValidationFormulaResult>>> = new Map();

    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    private _makeDirtyRule() {}

    private _initFormulaCalculationResultChange() {
        // Gets the result of the formula calculation and caches it
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFormulaCalculationResultMutation.id) {
                const params = commandInfo.params as ISetFormulaCalculationResultMutation;
                const { unitData, unitOtherData } = params;
                for (const unitId in unitOtherData) {
                    const unitData = unitOtherData[unitId];
                    for (const subUnitId in unitData) {
                        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
                        const subUnitData = unitData[subUnitId];
                        for (const formulaId in subUnitData) {
                            const current = subUnitData[formulaId];
                            if (cacheMap.has(formulaId)) {
                                const item = cacheMap.get(formulaId)!;
                                // item.result = current.v;
                                // item.status = current.
                            }
                        }
                    }
                }
            }
        }));
    }

    private _ensureRuleFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaRuleMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._formulaRuleMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map();
        }

        return subUnitMap;
    }

    private _ensureCacheMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaCacheMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._formulaCacheMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map();
        }

        return subUnitMap;
    }

    private _createFormulaId(unitId: string, subUnitId: string) {
        return `sheet.dv_${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }

    private _deleteFormula(unitId: string, subUnitId: string, formulaId: string) {
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        const params: IOtherFormulaManagerSearchParam = {
            unitId,
            subUnitId,
            formulaId,
        };
        this._commandService.executeCommand(RemoveOtherFormulaMutation.id, params);
        cacheMap.delete(formulaId);
    }

    private _registerFormula(unitId: string, subUnitId: string, formulaString: string) {
        const formulaId = this._createFormulaId(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);

        const params: IOtherFormulaManagerInsertParam = {
            unitId,
            subUnitId,
            formulaId,
            item: {
                f: formulaString,
            },
        };
        this._commandService.executeCommand(SetOtherFormulaMutation.id, params);
        cacheMap.set(formulaId, {
            result: undefined,
            status: FormulaResultStatus.WAIT,
        });
        return formulaId;
    };

    addRule(unitId: string, subUnitId: string, ruleId: string, formula1: string | undefined, formula2: string | undefined) {
        const isFormula1Legal = isFormulaString(formula1);
        const isFormula2Legal = isFormulaString(formula2);
        if (!isFormula1Legal && !isFormula2Legal) {
            return;
        }
        const formulaRuleMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        const item: [IFormulaInfo | undefined, IFormulaInfo | undefined] = [undefined, undefined];
        if (isFormula1Legal) {
            const id = this._registerFormula(unitId, subUnitId, formula1!);
            item[0] = { id, text: formula1! };
        }
        if (isFormula2Legal) {
            const id = this._registerFormula(unitId, subUnitId, formula2!);
            item[1] = { id, text: formula2! };
        }
        formulaRuleMap.set(ruleId, item);
    }

    removeRule(unitId: string, subUnitId: string, ruleId: string) {
        const formulaRuleMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        const item = formulaRuleMap.get(ruleId);
        if (!item) {
            return;
        }
        const [formula1, formula2] = item;

        formula1 && this._deleteFormula(unitId, subUnitId, formula1.id);
        formula2 && this._deleteFormula(unitId, subUnitId, formula2.id);
    }

    updateRuleFormulaText(unitId: string, subUnitId: string, ruleId: string, formula1: string | undefined, formula2: string | undefined) {
        const formulaRuleMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        const item = formulaRuleMap.get(ruleId);
        if (!item) {
            this.addRule(unitId, subUnitId, ruleId, formula1, formula2);
            return;
        }

        const [oldFormula1, oldFormula2] = item;
        if (oldFormula1?.text !== formula1) {
            oldFormula1 && this._deleteFormula(unitId, subUnitId, oldFormula1.id);
            if (isFormulaString(formula1)) {
                const formulaId = this._registerFormula(unitId, subUnitId, formula1!);
                item[0] = {
                    text: formula1!,
                    id: formulaId,
                };
            } else {
                item[0] = undefined;
            };
        }

        if (oldFormula2?.text !== formula2) {
            oldFormula2 && this._deleteFormula(unitId, subUnitId, oldFormula2.id);
            if (isFormulaString(formula2)) {
                const formulaId = this._registerFormula(unitId, subUnitId, formula2!);
                item[1] = {
                    text: formula2!,
                    id: formulaId,
                };
            } else {
                item[1] = undefined;
            };
        }
    }
}
