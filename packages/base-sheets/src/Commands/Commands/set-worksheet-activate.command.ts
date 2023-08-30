import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetActivateMutationParams, SetWorksheetActivateMutation, SetWorksheetActivateMutationFactory } from '../Mutations/set-worksheet-activate.mutation';

export interface ISetWorksheetActivateCommandParams {
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetActivateCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-activate',

    handler: async (accessor: IAccessor, params: ISetWorksheetActivateCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
        };
        const undoMutationParams = SetWorksheetActivateMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetActivateMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetActivateMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetActivateMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
