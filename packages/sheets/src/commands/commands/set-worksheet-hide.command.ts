import {
    BooleanNumber,
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetActivateMutationParams,
    SetWorksheetActivateMutation,
    SetWorksheetUnActivateMutationFactory,
} from '../mutations/set-worksheet-activate.mutation';
import {
    ISetWorksheetHideMutationParams,
    SetWorksheetHideMutation,
    SetWorksheetHideMutationFactory,
} from '../mutations/set-worksheet-hide.mutation';

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

        const index = workbook.getSheetIndex(worksheet);
        const activateSheetId = workbook.getConfig().sheetOrder[index + 1];

        if (!activateSheetId) return false;

        const result = commandService.syncExecuteCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: activateSheetId,
        };

        const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.syncExecuteCommand(
            SetWorksheetActivateMutation.id,
            activeSheetMutationParams
        );

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: unActiveMutationParams },
                    { id: SetWorksheetHideMutation.id, params: undoMutationParams },
                ],
                redoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: activeSheetMutationParams },
                    { id: SetWorksheetHideMutation.id, params: redoMutationParams },
                ],
            });
            return true;
        }
        return false;
    },
};
