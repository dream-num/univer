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

        const setWorksheetActivateMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
        };

        const undoSetWorksheetActivateMutationParams = SetWorksheetActivateMutationFactory(accessor, setWorksheetActivateMutationParams);
        const result = commandService.executeCommand(SetWorksheetActivateMutation.id, setWorksheetActivateMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetActivateMutation.id, undoSetWorksheetActivateMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetActivateMutation.id, setWorksheetActivateMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
