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

import { CommandType } from '@univerjs/core';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';

export interface ISetRangeProtectionMutationParams {
    rule: IRangeProtectionRule;
    unitId: string;
    subUnitId: string;
    ruleId: string;
};

export const SetRangeProtectionMutation: IMutation<ISetRangeProtectionMutationParams> = {
    id: 'sheet.mutation.set-range-protection',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId, rule, ruleId } = params;
        const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
        selectionProtectionRuleModel.setRule(unitId, subUnitId, ruleId, rule);
        return true;
    },
};
export const FactorySetRangeProtectionMutation = (accessor: IAccessor, param: ISetRangeProtectionMutationParams) => {
    const { unitId, subUnitId, ruleId } = param;
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const oldRule = selectionProtectionRuleModel.getRule(unitId, subUnitId, ruleId);
    if (!oldRule) {
        return null;
    }
    const result: IMutationInfo<ISetRangeProtectionMutationParams> = {
        id: SetRangeProtectionMutation.id,
        params: {
            ...param,
            rule: oldRule,
        },
    };
    return result;
};
