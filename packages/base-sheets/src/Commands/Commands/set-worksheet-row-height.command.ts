import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetRowHeightMutationParams, SetWorksheetRowHeightMutation, SetWorksheetRowHeightMutationFactory } from '../Mutations/set-worksheet-row-height.mutation';

export interface SetWorksheetRowHeightCommandParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowHeight: number[];
}

export const SetWorksheetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-height',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHeightCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetRowHeightMutationParams = {
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            rowIndex: params.rowIndex,
            rowHeight: params.rowHeight,
        };
        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
