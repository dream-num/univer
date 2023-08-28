import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetNameMutationParams, SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../Mutations/set-worksheet-name.mutation';

export interface SetWorksheetNameCommandParams {
    name: string;
    worksheetId: string;
    workbookId: string;
}

/**
 * The command to insert a row into a worksheet.
 */
export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',

    handler: async (accessor: IAccessor, params: SetWorksheetNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setWorksheetNameMutationParams: ISetWorksheetNameMutationParams = {
            worksheetId: params.worksheetId,
            name: params.name,
        };
        const undoClearMutationParams: ISetWorksheetNameMutationParams = SetWorksheetNameMutationFactory(accessor, setWorksheetNameMutationParams);
        const result = commandService.executeCommand(SetWorksheetNameMutation.id, setWorksheetNameMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, setWorksheetNameMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
