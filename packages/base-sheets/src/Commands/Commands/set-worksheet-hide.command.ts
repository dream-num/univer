import { BooleanNumber, CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetHideMutationParams, SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../Mutations/set-worksheet-hide.mutation';

export interface ISetWorksheetHiddenCommandParams {
    hidden: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-hidden',

    handler: async (accessor: IAccessor, params: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            hidden: params.hidden,
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetHideMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetHideMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
