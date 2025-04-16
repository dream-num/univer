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

import type { IMutation } from '@univerjs/core';

import type { IAnchor } from '../../utils/anchor';
import { CommandType } from '@univerjs/core';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { anchorUndoFactory } from '../../utils/anchor';

export interface IMoveConditionalRuleMutationParams {
    unitId: string;
    subUnitId: string;
    start: IAnchor;
    end: IAnchor;
}

export const MoveConditionalRuleMutation: IMutation<IMoveConditionalRuleMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheet.mutation.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, start, end } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        conditionalFormattingRuleModel.moveRulePriority(unitId, subUnitId, start, end);
        return true;
    },
};
export const MoveConditionalRuleMutationUndoFactory = (param: IMoveConditionalRuleMutationParams) => {
    const { unitId, subUnitId } = param;
    const undo = anchorUndoFactory(param.start, param.end);

    if (!undo) {
        return [];
    }
    const [start, end] = undo;

    return [{ id: MoveConditionalRuleMutation.id, params: { unitId, subUnitId, start, end } as IMoveConditionalRuleMutationParams },
    ];
};
