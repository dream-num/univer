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

// add rule -> add formula by range -> register formula
// remove rule -> delete formula by range -> remove formula
// update rule ranges -> reset rule ranges
// update rule formula
import { CommandType, type ICommand, type IRange, type ISheetDataValidationRule, type ObjectMatrix } from '@univerjs/core';
import { DataValidationFormulaService } from '../../services/dv-formula.service';

export interface ISetDataValidationFormulaByRangeMutationParams {
    unitId: string;
    subUnitId: string;
    rule: ISheetDataValidationRule;
}

export const SetDataValidationFormulaByRangeMutation: ICommand<ISetDataValidationFormulaByRangeMutationParams> = {
    id: 'sheet-data-validation.mutation.set-formula-by-range',
    type: CommandType.MUTATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const dataValidationFormulaService = accessor.get(DataValidationFormulaService);
        dataValidationFormulaService.setByRule(unitId, subUnitId, rule);
        return true;
    },
};

export interface ISetDataValidationFormulaByMatrixMutationParams {
    unitId: string;
    subUnitId: string;
    matrix: ObjectMatrix<string>;
}

export const SetDataValidationFormulaByMatrixMutation: ICommand<ISetDataValidationFormulaByMatrixMutationParams> = {
    id: 'sheet-data-validation.mutation.set-formula-by-matrix',
    type: CommandType.MUTATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, matrix } = params;

        return true;
    },
};

export interface IRemoveDataValidationFormulaByRangeMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const RemoveDataValidationFormulaByRangeMutation: ICommand<IRemoveDataValidationFormulaByRangeMutationParams> = {
    id: 'sheet-data-validation.mutation.remove-formula-by-range',
    type: CommandType.MUTATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges } = params;
        const dataValidationFormulaService = accessor.get(DataValidationFormulaService);

        dataValidationFormulaService.deleteByRuleId();
        return true;
    },
};

export interface IUpdateDataValidationFormulaRangeMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    ruleId: string;
}

export const UpdateDataValidationFormulaRangeMutation: ICommand<IUpdateDataValidationFormulaRangeMutationParams> = {
    id: 'sheet-data-validation.mutation.update-formula-range',
    type: CommandType.MUTATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ranges } = params;
        return true;
    },
};

export interface IUpdateDataValidationFormulaTextMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
    formula1: string;
    formula2?: string;
}

export const UpdateDataValidationFormulaTextMutation: ICommand<IUpdateDataValidationFormulaTextMutationParams> = {
    id: 'sheet-data-validation.mutation.update-formula-text',
    type: CommandType.MUTATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ranges } = params;
        return true;
    },
};
