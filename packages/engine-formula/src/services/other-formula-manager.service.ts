import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { IFormulaDataItem, IOtherFormulaData } from '../basics/common';

export interface IOtherFormulaManagerSearchParam {
    unitId: string;
    subComponentId: string;
    formulaId: string;
}

export interface IOtherFormulaManagerInsertParam extends IOtherFormulaManagerSearchParam {
    item: IFormulaDataItem;
}

export interface IOtherFormulaManagerService {
    dispose(): void;

    remove(searchParam: IOtherFormulaManagerSearchParam): void;

    get(searchParam: IOtherFormulaManagerSearchParam): Nullable<IFormulaDataItem>;

    has(searchParam: IOtherFormulaManagerSearchParam): boolean;

    register(insertParam: IOtherFormulaManagerInsertParam): void;

    getOtherFormulaData(): IOtherFormulaData;
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
        this._otherFormulaData = {};
    }

    remove(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        delete this._otherFormulaData?.[unitId]?.[subComponentId]?.[formulaId];
    }

    get(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subComponentId]?.[formulaId];
    }

    has(searchParam: IOtherFormulaManagerSearchParam) {
        const { unitId, subComponentId, formulaId } = searchParam;
        return this._otherFormulaData[unitId]?.[subComponentId]?.[formulaId] != null;
    }

    register(insertParam: IOtherFormulaManagerInsertParam) {
        const { unitId, subComponentId, formulaId, item } = insertParam;
        if (this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }

        if (this._otherFormulaData[unitId][subComponentId]) {
            this._otherFormulaData[unitId][subComponentId] = {};
        }

        this._otherFormulaData[unitId][subComponentId][formulaId] = item;
    }

    getOtherFormulaData() {
        return this._otherFormulaData;
    }
}

export const IOtherFormulaManagerService = createIdentifier<OtherFormulaManagerService>(
    'univer.formula.other-formula-manager.service'
);
