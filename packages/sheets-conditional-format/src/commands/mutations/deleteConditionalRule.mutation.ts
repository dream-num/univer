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
import {
    CommandType,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';
import type { IAddConditionalRuleMutationParams } from './addConditionalRule.mutation';
import { addConditionalRuleMutation } from './addConditionalRule.mutation';

export interface IDeleteConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId: string;
}
export const deleteConditionalRuleMutationUndoFactory = (accessor: IAccessor, param: IDeleteConditionalRuleMutationParams) => {
    const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
    const { unitId, subUnitId, cfId } = param;
    const rule = conditionalFormatRuleModel.getRule(unitId, subUnitId, cfId);
    if (rule) {
        return [{ id: addConditionalRuleMutation.id,
                  params: { unitId, subUnitId, rule: Tools.deepClone(rule) } as IAddConditionalRuleMutationParams }];
    }
    return [];
};
export const deleteConditionalRuleMutation: IMutation<IDeleteConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.delete-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, cfId } = params;
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        conditionalFormatRuleModel.deleteRule(unitId, subUnitId, cfId);
        return true;
    },
};
