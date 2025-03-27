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

import type { IMutation, IMutationInfo } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../model/range-protection-rule.model';

import type { IDeleteRangeProtectionMutationParams } from './delete-range-protection.mutation';
import { CommandType } from '@univerjs/core';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { DeleteRangeProtectionMutation } from './delete-range-protection.mutation';

export interface IAddRangeProtectionMutationParams {
    rules: IRangeProtectionRule[];
    unitId: string;
    subUnitId: string;
    name?: string;
    description?: string;
};

export const FactoryAddRangeProtectionMutation = (param: IAddRangeProtectionMutationParams) => {
    const deleteParams: IDeleteRangeProtectionMutationParams = { ...param, ruleIds: param.rules.map((rule) => rule.id) };
    return { id: DeleteRangeProtectionMutation.id, params: deleteParams } as IMutationInfo<IDeleteRangeProtectionMutationParams>;
};

export const AddRangeProtectionMutation: IMutation<IAddRangeProtectionMutationParams> = {
    id: 'sheet.mutation.add-range-protection',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, rules } = params;
        const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
        rules.forEach((rule) => {
            selectionProtectionRuleModel.addRule(unitId, subUnitId, rule);
        });
        return true;
    },
};
