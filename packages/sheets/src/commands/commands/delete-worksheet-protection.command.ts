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
import { AddWorksheetProtectionMutation } from '../mutations/add-worksheet-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../mutations/delete-worksheet-protection.mutation';

export interface IDeleteWorksheetProtectionParams {
    unitId: string;
    subUnitId: string;
    rule: IWorksheetProtectionRule;
}

export const DeleteWorksheetProtectionCommand: ICommand<IDeleteWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-worksheet-protection',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { rule, unitId, subUnitId } = params;

        commandService.executeCommand(DeleteWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
        });

        const redoMutations = [{ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } }];
        const undoMutations = [{ id: AddWorksheetProtectionMutation.id, params: { unitId, rule, subUnitId } }];
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        return true;
    },
};
