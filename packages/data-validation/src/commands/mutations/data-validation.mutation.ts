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

import type { ICommand, IDataValidationRule } from '@univerjs/core';
import type { DataValidationChangeSource } from '../../models/data-validation-model';
import type { IUpdateRulePayload } from '../../types/interfaces/i-update-rule-payload';
import { CommandType } from '@univerjs/core';
import { DataValidationModel } from '../../models/data-validation-model';

export interface IAddDataValidationMutationParams {
    rule: IDataValidationRule | IDataValidationRule[];
    index?: number;
    source?: DataValidationChangeSource;
    unitId: string;
    subUnitId: string;
}

export const AddDataValidationMutation: ICommand<IAddDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.addRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule, index, source = 'command' } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.addRule(unitId, subUnitId, rule, source, index);

        return true;
    },
};

export interface IRemoveDataValidationMutationParams {
    ruleId: string | string[];
    source?: DataValidationChangeSource;
    unitId: string;
    subUnitId: string;
}

export const RemoveDataValidationMutation: ICommand<IRemoveDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.removeRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ruleId, source = 'command' } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        if (Array.isArray(ruleId)) {
            ruleId.forEach((item) => {
                dataValidationModel.removeRule(unitId, subUnitId, item, source);
            });
        } else {
            dataValidationModel.removeRule(unitId, subUnitId, ruleId, source);
        }

        return true;
    },
};

export interface IUpdateDataValidationMutationParams {
    payload: IUpdateRulePayload;
    ruleId: string;
    source?: DataValidationChangeSource;
    unitId: string;
    subUnitId: string;
}

export const UpdateDataValidationMutation: ICommand<IUpdateDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.updateRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, ruleId, payload, source = 'command' } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.updateRule(unitId, subUnitId, ruleId, payload, source);
        return true;
    },
};
