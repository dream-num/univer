import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetRowHideMutationParams, SetWorksheetRowHideMutation, SetWorksheetRowHideMutationFactory } from '../Mutations/set-worksheet-row-hide.mutation';
import { SetWorksheetRowShowMutation } from '../Mutations/set-worksheet-row-show.mutation';

export interface SetWorksheetRowHideCommandParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

export const SetWorksheetRowHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-hide',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHideCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setWorksheetHiddenMutationParams: ISetWorksheetRowHideMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rowIndex: params.rowIndex,
            rowCount: params.rowCount,
        };

        const undoSetWorksheetHiddenMutationFactoryParams = SetWorksheetRowHideMutationFactory(accessor, setWorksheetHiddenMutationParams);
        const result = commandService.executeCommand(SetWorksheetRowHideMutation.id, setWorksheetHiddenMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRowShowMutation.id, undoSetWorksheetHiddenMutationFactoryParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHideMutation.id, setWorksheetHiddenMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
