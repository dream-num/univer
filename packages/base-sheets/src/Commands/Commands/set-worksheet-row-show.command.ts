import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetRowShowMutationParams, SetWorksheetRowShowMutation, SetWorksheetRowShowMutationFactory } from '../Mutations/set-worksheet-row-show.mutation';
import { SetWorksheetRowHideMutation } from '../Mutations/set-worksheet-row-hide.mutation';

export interface SetWorksheetRowShowCommandParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

export const SetWorksheetRowShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-show',
    handler: async (accessor: IAccessor, params: SetWorksheetRowShowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setWorksheetHiddenMutationParams: ISetWorksheetRowShowMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rowIndex: params.rowIndex,
            rowCount: params.rowCount,
        };

        const undoSetWorksheetHiddenMutationFactoryParams = SetWorksheetRowShowMutationFactory(accessor, setWorksheetHiddenMutationParams);
        const result = commandService.executeCommand(SetWorksheetRowShowMutation.id, setWorksheetHiddenMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHideMutation.id, undoSetWorksheetHiddenMutationFactoryParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowShowMutation.id, setWorksheetHiddenMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
