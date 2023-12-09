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
    worksheetId?: string;
}

export const SetWorksheetHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-hidden',

    handler: async (accessor: IAccessor, params?: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const errorService = accessor.get(ErrorService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        if (params) {
            worksheetId = params.worksheetId ?? worksheetId;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const hidden = worksheet.getConfig().hidden;
        if (hidden === BooleanNumber.TRUE) return false;

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            workbookId,
            worksheetId,
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
                unitID: workbookId,
                undoMutations: [{ id: SetWorksheetHideMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetHideMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return false;
    },
};
