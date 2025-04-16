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

import type { Nullable } from '@univerjs/core';
import type { IDirtyUnitOtherFormulaMap, IOtherFormulaData, IOtherFormulaDataItem } from '../basics/common';

import { createIdentifier, Disposable } from '@univerjs/core';

export interface IOtherFormulaManagerSearchParam {
    unitId: string;
    subUnitId: string;
    formulaId: string;
}

export interface IOtherFormulaManagerInsertParam extends IOtherFormulaManagerSearchParam {
    item: IOtherFormulaDataItem;
}

export interface IOtherFormulaManagerService {
    dispose(): void;

    remove(searchParam: IOtherFormulaManagerSearchParam): void;

    get(searchParam: IOtherFormulaManagerSearchParam): Nullable<IOtherFormulaDataItem>;

    has(searchParam: IOtherFormulaManagerSearchParam): boolean;

    register(insertParam: IOtherFormulaManagerInsertParam): void;

    getOtherFormulaData(): IOtherFormulaData;

    batchRegister(formulaData: IOtherFormulaData): void;

    batchRemove(formulaData: IDirtyUnitOtherFormulaMap): void;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class OtherFormulaManagerService extends Disposable implements IOtherFormulaManagerService {
    private _otherFormulaData: IOtherFormulaData = {};

    override dispose(): void {
        super.dispose();
        this._otherFormulaData = {};
    }

    remove(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subUnitId, formulaId } = searchParam;
        delete this._otherFormulaData?.[unitId]?.[subUnitId]?.[formulaId];
    }

    get(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subUnitId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subUnitId]?.[formulaId];
    }

    has(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subUnitId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subUnitId]?.[formulaId] != null;
    }

    register(insertParam: IOtherFormulaManagerInsertParam) {
        const { unitId, subUnitId, formulaId, item } = insertParam;
        if (!this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }

        if (!this._otherFormulaData[unitId]![subUnitId]) {
            this._otherFormulaData[unitId]![subUnitId] = {};
        }

        this._otherFormulaData[unitId]![subUnitId]![formulaId] = item;
    }

    batchRegister(formulaData: IOtherFormulaData) {
        Object.keys(formulaData).forEach((unitId) => {
            const subUnits = formulaData[unitId];
            if (subUnits == null) {
                return true;
            }
            Object.keys(subUnits).forEach((subUnitId) => {
                const subUnit = subUnits[subUnitId];
                if (subUnit == null) {
                    return true;
                }
                Object.keys(subUnit).forEach((formulaId) => {
                    const item = subUnit[formulaId];
                    if (item == null) {
                        return true;
                    }

                    this.register({
                        unitId,
                        subUnitId,
                        formulaId,
                        item,
                    });
                });
            });
        });
    }

    batchRemove(formulaData: IDirtyUnitOtherFormulaMap) {
        Object.keys(formulaData).forEach((unitId) => {
            const subUnits = formulaData[unitId];
            if (subUnits == null) {
                return true;
            }
            Object.keys(subUnits).forEach((subUnitId) => {
                const subUnit = subUnits[subUnitId];
                if (subUnit == null) {
                    return true;
                }
                Object.keys(subUnit).forEach((formulaId) => {
                    this.remove({
                        unitId,
                        subUnitId,
                        formulaId,
                    });
                });
            });
        });
    }

    getOtherFormulaData() {
        return this._otherFormulaData;
    }
}

export const IOtherFormulaManagerService = createIdentifier<OtherFormulaManagerService>(
    'univer.formula.other-formula-manager.service'
);
