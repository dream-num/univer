import { BooleanNumber, CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetHiddenMutationParams, SetWorksheetHiddenMutation, SetWorksheetHiddenMutationFactory } from '../Mutations/set-worksheet-hidden.mutation';

export interface ISetWorksheetHiddenCommandParams {
    hidden: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-activate',

    handler: async (accessor: IAccessor, params: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setWorksheetHiddenMutationParams: ISetWorksheetHiddenMutationParams = {
            hidden: params.hidden,
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
        };

        const undoSetWorksheetHiddenMutationFactoryParams = SetWorksheetHiddenMutationFactory(accessor, setWorksheetHiddenMutationParams);
        const result = commandService.executeCommand(SetWorksheetHiddenMutation.id, setWorksheetHiddenMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetHiddenMutation.id, undoSetWorksheetHiddenMutationFactoryParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetHiddenMutation.id, setWorksheetHiddenMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
