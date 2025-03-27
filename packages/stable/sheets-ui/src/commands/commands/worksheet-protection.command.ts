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

import type { ICommand, Workbook } from '@univerjs/core';

import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';

import { UniverType } from '@univerjs/protocol';
import { AddWorksheetProtectionCommand, DeleteWorksheetProtectionCommand, WorksheetProtectionRuleModel } from '@univerjs/sheets';

export const DeleteWorksheetProtectionFormSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-worksheet-protection-from-sheet-bar',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        const unitId = workbook.getUnitId();

        if (!worksheet) {
            return false;
        }

        const subUnitId = worksheet.getSheetId();

        const rule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);

        const result = await commandService.executeCommand(DeleteWorksheetProtectionCommand.id, {
            unitId,
            subUnitId,
        });

        if (result) {
            const redoMutations = [{ id: DeleteWorksheetProtectionCommand.id, params: { unitId, subUnitId } }];
            const undoMutations = [{ id: AddWorksheetProtectionCommand.id, params: { unitId, rule } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};

export const ChangeSheetProtectionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.change-sheet-protection-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand('sheet-permission.operation.openDialog');
        return true;
    },
};
