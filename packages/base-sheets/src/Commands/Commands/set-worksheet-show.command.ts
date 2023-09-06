import { BooleanNumber, CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISetWorksheetActivateMutationParams, SetWorksheetActivateMutation, SetWorksheetUnActivateMutationFactory } from '../Mutations/set-worksheet-activate.mutation';
import { ISetWorksheetHideMutationParams, SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../Mutations/set-worksheet-hide.mutation';

export interface ISetWorksheetShowCommandParams {
    worksheetId?: string;
}

export const SetWorksheetShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-show',

    handler: async (accessor: IAccessor, params?: ISetWorksheetShowCommandParams) => {
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
        if (hidden === BooleanNumber.FALSE) return false;

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            workbookId,
            worksheetId,
            hidden: BooleanNumber.FALSE,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId,
        };

        const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams);

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(SetWorksheetActivateMutation.id, unActiveMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetWorksheetHideMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
