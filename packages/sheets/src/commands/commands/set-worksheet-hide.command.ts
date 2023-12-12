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

import type { ICommand } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    ErrorService,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetHideMutationParams } from '../mutations/set-worksheet-hide.mutation';
import { SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../mutations/set-worksheet-hide.mutation';

export interface ISetWorksheetHiddenCommandParams {
    subUnitId?: string;
}

export const SetWorksheetHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-hidden',

    handler: async (accessor: IAccessor, params?: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const errorService = accessor.get(ErrorService);

        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        if (params) {
            subUnitId = params.subUnitId ?? subUnitId;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return false;

        const hidden = worksheet.getConfig().hidden;
        if (hidden === BooleanNumber.TRUE) return false;

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            unitId,
            subUnitId,
            hidden: BooleanNumber.TRUE,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);

        const worksheets = workbook.getSheets();
        const visibleWorksheets = worksheets.filter((sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE);
        if (visibleWorksheets.length === 1) {
            errorService.emit('No visible sheet after you hide this.');
            return false;
        }

        const result = commandService.syncExecuteCommand(SetWorksheetHideMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetHideMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetHideMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return false;
    },
};
