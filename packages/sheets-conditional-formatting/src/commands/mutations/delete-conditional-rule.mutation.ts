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
import type { IAddConditionalRuleMutationParams } from './add-conditional-rule.mutation';
import type { IMoveConditionalRuleMutationParams } from './move-conditional-rule.mutation';
import { CommandType, Tools } from '@univerjs/core';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { transformSupportSymmetryAnchor } from '../../utils/anchor';
import { AddConditionalRuleMutation } from './add-conditional-rule.mutation';
import { MoveConditionalRuleMutation } from './move-conditional-rule.mutation';

export interface IDeleteConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId: string;
}
export const DeleteConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: IDeleteConditionalRuleMutationParams) => {
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const { unitId, subUnitId, cfId } = param;
    const ruleList = ([...(conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) || [])]);
    const index = ruleList.findIndex((item) => item.cfId === cfId);
    const beforeRule = ruleList[index - 1];
    if (index > -1) {
        const rule = ruleList[index];
        const result: IMutationInfo[] = [{
            id: AddConditionalRuleMutation.id,
            params: { unitId, subUnitId, rule: Tools.deepClone(rule) } as IAddConditionalRuleMutationParams,
        }];
        ruleList.splice(index, 1);
        if (index !== 0) {
            const firstRule = ruleList[0];
            if (firstRule) {
                const transformResult = transformSupportSymmetryAnchor({ id: firstRule.cfId, type: 'before' }, { id: beforeRule.cfId, type: 'after' }, ruleList, (rule) => rule.cfId);
                if (!transformResult) {
                    return result;
                }
                const [start, end] = transformResult;
                const params: IMoveConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
                    start,
                    end,
                };
                result.push({ id: MoveConditionalRuleMutation.id, params });
            }
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
