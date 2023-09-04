import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetNameMutationParams, SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../Mutations/set-worksheet-name.mutation';

export interface SetWorksheetNameCommandParams {
    name: string;
    worksheetId: string;
    workbookId: string;
}

/**
 * The command to set the sheet name.
 */
export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',

    handler: async (accessor: IAccessor, params: SetWorksheetNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetNameMutationParams = {
            worksheetId: params.worksheetId,
            name: params.name,
            workbookId: params.workbookId,
        };
        const undoMutationParams: ISetWorksheetNameMutationParams = SetWorksheetNameMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetNameMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, redoMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
