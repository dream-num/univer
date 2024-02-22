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
} from '@univerjs/core';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';

export interface IMoveConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    cfId: string;
    targetCfId: string;
}

export const moveConditionalRuleMutation: IMutation<IMoveConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, cfId, targetCfId } = params;
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        conditionalFormatRuleModel.moveRulePriority(unitId, subUnitId, cfId, targetCfId);
        return true;
    },
};
export const moveConditionalRuleMutationUndoFactory = (param: IMoveConditionalRuleMutationParams) => {
    const { unitId, subUnitId, cfId, targetCfId } = param;
    return [{ id: moveConditionalRuleMutation.id,
              params: { unitId, subUnitId, targetCfId: cfId, cfId: targetCfId } as IMoveConditionalRuleMutationParams },
    ];
};
