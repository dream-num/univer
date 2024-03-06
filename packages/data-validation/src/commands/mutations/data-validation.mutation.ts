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
import { DataValidationModel } from '../..';
import type { IUpdateRulePayload } from '../../types/interfaces/i-update-rule-payload';

export interface IAddDataValidationMutationParams {
    unitId: string;
    subUnitId: string;
    rule: IDataValidationRule;
    index?: number;
}

export const AddDataValidationMutation: ICommand<IAddDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.addRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.addRule(unitId, subUnitId, rule);
        return true;
    },
};

export interface IRemoveDataValidationMutationParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
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
        dataValidationModel.removeRule(unitId, subUnitId, ruleId);
        return true;
    },
};

export interface IRemoveAllDataValidationMutationParams {
    unitId: string;
    subUnitId: string;
}

export const RemoveAllDataValidationMutation: ICommand<IRemoveAllDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.removeAll',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.removeAll(unitId, subUnitId);
        return true;
    },
};

export interface IReplaceDataValidationMutationParams {
    unitId: string;
    subUnitId: string;
    rules: IDataValidationRule[];
}

export const ReplaceDataValidationMutation: ICommand<IReplaceDataValidationMutationParams> = {
    type: CommandType.MUTATION,
    id: 'data-validation.mutation.replace',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, rules } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        dataValidationModel.replaceAll(unitId, subUnitId, rules);
        return true;
    },
};

export interface IUpdateDataValidationMutationParams {
    payload: IUpdateRulePayload;
    unitId: string;
    subUnitId: string;
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
