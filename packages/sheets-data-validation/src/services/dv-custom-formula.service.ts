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

import type { IRange, ISheetDataValidationRule } from '@univerjs/core';
import { Disposable, ICommandService, ObjectMatrix, Range, Tools } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, DataValidationModel, RemoveAllDataValidationMutation, RemoveDataValidationCommand, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from '@univerjs/engine-formula';
import { Inject } from '@wendellhu/redi';
import type { IOtherFormulaManagerInsertParam, IOtherFormulaManagerSearchParam } from '@univerjs/engine-formula/services/other-formula-manager.service.js';
import type { IUpdateDataValidationRangeByMatrixMutationParams } from '..';
import { UpdateDataValidationRangeByMatrixMutation } from '..';

export enum FormulaResultStatus {
    NOT_REGISTER = 1,
    SUCCESS,
    WAIT,
    ERROR,
}

interface IFormulaInfo {
    id: string;
    text: string;
}

interface IDataValidationFormula {
    ruleId: string;
    formula1: IFormulaInfo;
    formula2?: IFormulaInfo;
}

interface IDataValidationFormulaResult {
    result?: boolean | number | string;
    status: FormulaResultStatus;
}

//
export class DataValidationCustomFormulaService extends Disposable {
    private _formulaMap: Map<string, Map<string, ObjectMatrix<IDataValidationFormula>>> = new Map();
    private _formulaRuleMap: Map<string, Map<string, Map<string, [string | undefined, string | undefined]>>> = new Map();
    private _formulaResultCache: Map<string, Map<string, Map<string, IDataValidationFormulaResult>>> = new Map();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
    ) {
        super();
    }

    private _createFormulaId(unitId: string, subUnitId: string) {
        return `sheet.dv_${unitId}_${subUnitId}_${Tools.generateRandomId(8)}`;
    }

    private _ensureFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map<string, ObjectMatrix<IDataValidationFormula>>();
            this._formulaMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            // TODO: load from snapshot
            subUnitMap = new ObjectMatrix<IDataValidationFormula>();
        }
        return subUnitMap;
    }

    private _ensureCacheMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaResultCache.get(unitId);

        if (!unitMap) {
            unitMap = new Map<string, Map<string, IDataValidationFormulaResult>>();
            this._formulaResultCache.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map<string, IDataValidationFormulaResult>();
        }

        return subUnitMap;
    }

    private _ensureRuleFormulaMap(unitId: string, subUnitId: string) {
        let unitMap = this._formulaRuleMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._formulaRuleMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);

        if (!subUnitMap) {
            subUnitMap = new Map<string, [string, string | undefined]>();
        }

        return subUnitMap;
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

    private _clearByRanges(unitId: string, subUnitId: string, ranges: IRange[]) {
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const formulaItem = formulaMap.getValue(row, col);
                if (!formulaItem) {
                    return;
                }
                const { formula1, formula2 } = formulaItem;
                cacheMap.delete(formula1.id);
                this._deleteFormula(unitId, subUnitId, formula1.id);
                if (formula2) {
                    cacheMap.delete(formula2.id);
                    this._deleteFormula(unitId, subUnitId, formula2.id);
                }
            });
        });
    }

    deleteByRuleId(unitId: string, subUnitId: string, ruleId: string) {
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);
        const formulaIds = ruleFormulaMap.get(ruleId);
        if (!formulaIds) {
            return;
        }
        const [formula1Id, formula2Id] = formulaIds;
        if (formula1Id) {
            cacheMap.delete(formula1Id);
            this._deleteFormula(unitId, subUnitId, formula1Id);
        }
        if (formula2Id) {
            cacheMap.delete(formula2Id);
            this._deleteFormula(unitId, subUnitId, formula2Id);
        }

        formulaMap.forValue((row, col, value) => {
            if (value.ruleId === ruleId) {
                formulaMap.realDeleteValue(row, col);
            }
        });
    }

    setByRule(unitId: string, subUnitId: string, rule: ISheetDataValidationRule) {
        const { ranges, formula1, formula2, uid } = rule;
        const formulaMap = this._ensureFormulaMap(unitId, subUnitId);
        const ruleFormulaMap = this._ensureRuleFormulaMap(unitId, subUnitId);

        let formula2Id: string | undefined;
        if (!formula1) {
            return;
        }

        const formula1Id = this._registerFormula(unitId, subUnitId, formula1);

        if (formula2) {
            formula2Id = this._registerFormula(unitId, subUnitId, formula2);
        }

        const item: IDataValidationFormula = {
            ruleId: uid,
            formula1: {
                id: formula1Id,
                text: formula1,
            },
            formula2: formula2
                ? {
                    id: formula2Id!,
                    text: formula2,
                }
                : undefined,
        };
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                formulaMap.setValue(row, col, item);
            });
        });
        ruleFormulaMap.set(uid, [formula1Id, formula2Id]);
    }

    setByObjectMatrix(unitId: string, subUnitId: string, matrix: ObjectMatrix<string>) {
        const formulaMap = this._ensureCacheMap(unitId, subUnitId);
        const cacheMap = this._ensureCacheMap(unitId, subUnitId);
    }

    private _initCommandListener() {
        this._commandService.onCommandExecuted((command) => {
            if (command.id === AddDataValidationMutation.id) {
                const params = command.params as IAddDataValidationMutationParams;
                const { unitId, subUnitId, rule } = params;
                this._setByRule(unitId, subUnitId, rule);
            }

            if (command.id === UpdateDataValidationRangeByMatrixMutation.id) {
                const params = command.params as IUpdateDataValidationRangeByMatrixMutationParams;
                const { unitId, subUnitId, ranges } = params;
                this._setByObjectMatrix(unitId, subUnitId, ranges);
            }

            if (command.id === UpdateDataValidationMutation.id) {
                const params = command.params as IUpdateDataValidationMutationParams;
                const { unitId, subUnitId, ruleId, payload } = params;
                const rule = this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId);

                switch (payload.type) {
                    case UpdateRuleType.RANGE: {
                        break;
                    }

                    case UpdateRuleType.SETTING:
                    default:
                        break;
                }
            }

            if (command.id === RemoveDataValidationMutation.id) {
                const { unitId, subUnitId, ruleId } = command.params as IRemoveDataValidationMutationParams;
                this._clearByRuleId(unitId, subUnitId, ruleId);
            }

            if (command.id === RemoveAllDataValidationMutation.id) {
                // const formulaMap =
            }
        });
    }
}
