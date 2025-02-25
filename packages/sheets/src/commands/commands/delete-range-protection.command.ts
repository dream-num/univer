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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { DeleteRangeProtectionMutation } from '../mutations/delete-range-protection.mutation';
import { AddRangeProtectionMutation } from '../mutations/add-range-protection.mutation';
import type { IRangeProtectionRule } from '../../model/range-protection-rule.model';

export interface IDeleteRangeProtectionCommandParams {
    unitId: string;
    subUnitId: string;
    rule: IRangeProtectionRule;
}
export const DeleteRangeProtectionCommand: ICommand<IDeleteRangeProtectionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, rule } = params;

        const redoMutationParam = {
            unitId,
            subUnitId,
            ruleIds: [rule.id],
        };
        const result = await commandService.executeCommand(DeleteRangeProtectionMutation.id, redoMutationParam);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: DeleteRangeProtectionMutation.id, params: redoMutationParam }],
                undoMutations: [{ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [rule] } }],
            });
        }

        return true;
    },
};
