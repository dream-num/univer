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

import type { IAccessor, IMutation } from '@univerjs/core';
import type { IConditionFormattingRule } from '../../models/type';
import { CommandType, Tools } from '@univerjs/core';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';

export interface ISetConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId?: string;
    rule: IConditionFormattingRule;
}

export const SetConditionalRuleMutation: IMutation<ISetConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.set-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const cfId = params.cfId || params.rule.cfId;

        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        conditionalFormattingRuleModel.setRule(unitId, subUnitId, rule, cfId);
        return true;
    },
};

export const setConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: ISetConditionalRuleMutationParams) => {
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const { unitId, subUnitId } = param;
    const cfId = param.cfId || param.rule.cfId;
    const rule = conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
    if (rule) {
        return [{
            id: SetConditionalRuleMutation.id,
            params: {
                unitId,
                subUnitId,
                cfId,
                rule: Tools.deepClone(rule),
            } as ISetConditionalRuleMutationParams,
        }];
    }
    return [];
};
