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

import type { IAccessor, IMutation, IMutationInfo } from '@univerjs/core';
import type { IRangeProtectionRule } from '../../model/range-protection-rule.model';

import type { IAddRangeProtectionMutationParams } from './add-range-protection.mutation';
import { CommandType } from '@univerjs/core';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { AddRangeProtectionMutation } from './add-range-protection.mutation';

export interface IDeleteRangeProtectionMutationParams {
    ruleIds: string[];
    unitId: string;
    subUnitId: string;
};
export const FactoryDeleteRangeProtectionMutation = (accessor: IAccessor, param: IDeleteRangeProtectionMutationParams) => {
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const rules = param.ruleIds.map((id) => selectionProtectionRuleModel.getRule(param.unitId, param.subUnitId, id)).filter((rule) => !!rule) as IRangeProtectionRule[];
    const result: IMutationInfo<Omit<IAddRangeProtectionMutationParams, 'name'>> = { id: AddRangeProtectionMutation.id, params: { subUnitId: param.subUnitId, unitId: param.unitId, rules } };
    return result;
};
export const DeleteRangeProtectionMutation: IMutation<IDeleteRangeProtectionMutationParams> = {
    id: 'sheet.mutation.delete-range-protection',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, ruleIds } = params;
        const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
        ruleIds.forEach((id) => {
            selectionProtectionRuleModel.deleteRule(unitId, subUnitId, id);
        });
        return true;
    },
};
