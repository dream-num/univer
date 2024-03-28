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

import type { IMutation, IMutationInfo } from '@univerjs/core';
import {
    CommandType,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import type { IAddConditionalRuleMutationParams } from './add-conditional-rule.mutation';
import { AddConditionalRuleMutation } from './add-conditional-rule.mutation';
import type { IMoveConditionalRuleMutationParams } from './move-conditional-rule.mutation';
import { MoveConditionalRuleMutation } from './move-conditional-rule.mutation';

export interface IDeleteConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId: string;
}
export const DeleteConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: IDeleteConditionalRuleMutationParams) => {
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const { unitId, subUnitId, cfId } = param;
    const rule = conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
    const ruleList = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
    if (rule) {
        const index = ruleList!.findIndex((rule) => rule.cfId === cfId);
        const nextRule = ruleList![index - 1];
        const result: IMutationInfo[] = [{ id: AddConditionalRuleMutation.id,
                                           params: { unitId, subUnitId, rule: Tools.deepClone(rule) } as IAddConditionalRuleMutationParams },
        ];
        if (nextRule && index !== 0) {
            result.push({ id: MoveConditionalRuleMutation.id, params: {
                unitId, subUnitId, cfId, targetCfId: nextRule.cfId,
            } as IMoveConditionalRuleMutationParams });
        }
        return result;
    }
    return [];
};
export const DeleteConditionalRuleMutation: IMutation<IDeleteConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.delete-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, cfId } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        conditionalFormattingRuleModel.deleteRule(unitId, subUnitId, cfId);
        return true;
    },
};
