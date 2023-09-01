import { BooleanNumber, CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import {
    ISetWorksheetRightToLeftMutationParams,
    SetWorksheetRightToLeftMutation,
    SetWorksheetRightToLeftUndoMutationFactory,
} from '../Mutations/set-worksheet-right-to-left.mutation';

export interface ISetWorksheetRightToLeftCommandParams {
    rightToLeft?: BooleanNumber;
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetRightToLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-right-to-left',

    handler: async (accessor: IAccessor, params: ISetWorksheetRightToLeftCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const rightToLeft = params.rightToLeft ?? 0;

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setWorksheetRightToLeftMutationParams: ISetWorksheetRightToLeftMutationParams = {
            rightToLeft,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetWorksheetRightToLeftUndoMutationFactory(accessor, setWorksheetRightToLeftMutationParams);
        const result = commandService.executeCommand(SetWorksheetRightToLeftMutation.id, setWorksheetRightToLeftMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRightToLeftMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRightToLeftMutation.id, setWorksheetRightToLeftMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
