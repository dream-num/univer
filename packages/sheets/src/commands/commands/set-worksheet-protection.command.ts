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
import type { IWorksheetProtectionRule } from '../../services/permission/type';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { SetWorksheetProtectionMutation } from '../mutations/set-worksheet-protection.mutation';

export interface ISetWorksheetProtectionParams {
    permissionId: string;
    rule: IWorksheetProtectionRule;
    oldRule: IWorksheetProtectionRule;
}

export const SetWorksheetProtectionCommand: ICommand<ISetWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { rule, permissionId, oldRule } = params;
        const { unitId, subUnitId } = rule;

        const newRule = { ...rule, permissionId };

        const result = await commandService.executeCommand(SetWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
            newRule,
        });

        if (result) {
            const redoMutations = [{ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, newRule } }];
            const undoMutations = [{ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule: oldRule } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};
