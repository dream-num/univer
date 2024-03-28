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
import type { IAccessor } from '@wendellhu/redi';

import {
    CommandType,
} from '@univerjs/core';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';

export interface IMoveConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId: string;
    targetCfId: string;
}

export const MoveConditionalRuleMutation: IMutation<IMoveConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, cfId, targetCfId } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        conditionalFormattingRuleModel.moveRulePriority(unitId, subUnitId, cfId, targetCfId);
        return true;
    },
};
export const MoveConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: IMoveConditionalRuleMutationParams) => {
    const { unitId, subUnitId, cfId } = param;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const ruleList = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
    if (!ruleList) {
        return [];
    }
    const index = ruleList.findIndex((rule) => rule.cfId === cfId);
    const preTargetRule = ruleList[index - 1];
    if (!preTargetRule) {
        return [];
    }
    return [{ id: MoveConditionalRuleMutation.id,
              params: { unitId, subUnitId, cfId, targetCfId: preTargetRule.cfId } as IMoveConditionalRuleMutationParams },
    ];
};
