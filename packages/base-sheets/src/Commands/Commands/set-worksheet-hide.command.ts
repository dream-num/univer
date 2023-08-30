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

        const setWorksheetHiddenMutationParams: ISetWorksheetHideMutationParams = {
            hidden: params.hidden,
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
        };

        const undoSetWorksheetHiddenMutationFactoryParams = SetWorksheetHideMutationFactory(accessor, setWorksheetHiddenMutationParams);
        const result = commandService.executeCommand(SetWorksheetHideMutation.id, setWorksheetHiddenMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetHideMutation.id, undoSetWorksheetHiddenMutationFactoryParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetHideMutation.id, setWorksheetHiddenMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
