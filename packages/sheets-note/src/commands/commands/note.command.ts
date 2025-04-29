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
import type { IUpdateNoteMutationParams } from '../mutations/note.mutation';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { RemoveNoteMutation, ToggleNotePopupMutation, UpdateNoteMutation } from '../mutations/note.mutation';

export const SheetDeleteNoteCommand: ICommand = {
    id: 'sheet.command.delete-note',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selection = sheetsSelectionsService.getCurrentLastSelection();
        if (!selection?.primary) return false;
        const { actualColumn, actualRow } = selection.primary;
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(RemoveNoteMutation.id, {
            unitId: target.unitId,
            sheetId: target.subUnitId,
            row: actualRow,
            col: actualColumn,
        });
    },
};

export const SheetToggleNotePopupCommand: ICommand = {
    id: 'sheet.command.toggle-note-popup',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selection = sheetsSelectionsService.getCurrentLastSelection();
        if (!selection?.primary) return false;
        const { actualColumn, actualRow } = selection.primary;
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(ToggleNotePopupMutation.id, {
            unitId: target.unitId,
            sheetId: target.subUnitId,
            row: actualRow,
            col: actualColumn,
        });
    },
};

export const SheetUpdateNoteCommand: ICommand<IUpdateNoteMutationParams> = {
    id: 'sheet.command.update-note',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        return commandService.syncExecuteCommand(UpdateNoteMutation.id, params);
    },
};
