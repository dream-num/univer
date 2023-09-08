import { BooleanNumber, CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISetWorksheetActivateMutationParams, SetWorksheetActivateMutation, SetWorksheetUnActivateMutationFactory } from '../Mutations/set-worksheet-activate.mutation';
import { ISetWorksheetHideMutationParams, SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../Mutations/set-worksheet-hide.mutation';

export interface ISetWorksheetHiddenCommandParams {
    worksheetId?: string;
}

export const SetWorksheetHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-hidden',

    handler: async (accessor: IAccessor, params?: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        if (params) {
            worksheetId = params.worksheetId ?? worksheetId;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
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
        const result = commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const index = workbook.getSheetIndex(worksheet);
        const activateSheetId = workbook.getConfig().sheetOrder[index + 1];

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: activateSheetId,
        };

        const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams);

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(SetWorksheetActivateMutation.id, unActiveMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(SetWorksheetHideMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }
        return false;
    },
};
