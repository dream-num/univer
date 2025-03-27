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
import type { IRangeProtectionRule } from '../../model/range-protection-rule.model';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { AddRangeProtectionMutation } from '../mutations/add-range-protection.mutation';
import { DeleteRangeProtectionMutation } from '../mutations/delete-range-protection.mutation';

export interface IAddRangeProtectionCommandParams {
    permissionId: string;
    rule: IRangeProtectionRule;
}
export const AddRangeProtectionCommand: ICommand<IAddRangeProtectionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-range-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionProtectionModel = accessor.get(RangeProtectionRuleModel);
        const { rule, permissionId } = params;

        const { unitId, subUnitId, ranges, description, viewState, editState } = rule;
        const rules = [{
            ranges,
            permissionId,
            id: selectionProtectionModel.createRuleId(unitId, subUnitId),
            description,
            unitType: rule.unitType,
            unitId,
            subUnitId,
            viewState,
            editState,
        }];

        const result = await commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId,
            subUnitId,
            rules,
        });

        if (result) {
            const redoMutations = [{ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules } }];
            const undoMutations = [{ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: rules.map((rule) => rule.id) } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};
