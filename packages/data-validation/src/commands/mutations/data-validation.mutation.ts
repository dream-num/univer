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

import { CommandType } from '@univerjs/core';
import type { ICommand, IDataValidationRule } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { IUpdateRulePayload } from '../../types/interfaces/i-update-rule-payload';
import { DataValidationModel } from '../../models/data-validation-model';

export interface IAddDataValidationMutationParams extends ISheetCommandSharedParams {
    rule: IDataValidationRule | IDataValidationRule[];
    index?: number;
}

export const AddDataValidationMutation: ICommand<IAddDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.addRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule, index } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.addRule(unitId, subUnitId, rule, index);

        return true;
    },
};

export interface IRemoveDataValidationMutationParams extends ISheetCommandSharedParams {
    ruleId: string | string[];
}

export const RemoveDataValidationMutation: ICommand<IRemoveDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.removeRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ruleId } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        if (Array.isArray(ruleId)) {
            ruleId.forEach((item) => {
                dataValidationModel.removeRule(unitId, subUnitId, item);
            });
        } else {
            dataValidationModel.removeRule(unitId, subUnitId, ruleId);
        }

        return true;
    },
};

export interface IUpdateDataValidationMutationParams extends ISheetCommandSharedParams {
    payload: IUpdateRulePayload;
    ruleId: string;
}

export const UpdateDataValidationMutation: ICommand<IUpdateDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.updateRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ruleId, payload } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.updateRule(unitId, subUnitId, ruleId, payload);
        return true;
    },
};
