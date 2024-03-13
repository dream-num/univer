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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import type { IUpdateDataValidationFormulaPayload } from '../../types';
import type { SheetDataValidationManager } from '../../models/sheet-data-validation-manager';

export interface IDataValidationFormulaMarkDirtyParams { [unitId: string]: { [sunUnitId: string]: { [formulaId: string]: boolean } } }

export const DataValidationFormulaMarkDirty: IMutation<IDataValidationFormulaMarkDirtyParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.data-validation-formula-mark-dirty',
    handler() {
        return true;
    },
};

export interface IUpdateDataValidationFormulaSilentMutationParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    payload: IUpdateDataValidationFormulaPayload;
}

export const UpdateDataValidationFormulaSilentMutation: IMutation<IUpdateDataValidationFormulaSilentMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.update-data-validation-formula-silent',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, payload, ruleId } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        const manager = dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;

        manager.updateRuleFormulaText(ruleId, payload);
        return true;
    },
};
