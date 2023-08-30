import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetColWidthMutationParams, SetWorksheetColWidthMutation, SetWorksheetColWidthMutationFactory } from '../Mutations/set-worksheet-col-width.mutation';

export interface SetWorksheetColWidthCommandParams {
    workbookId: string;
    worksheetId: string;
    colIndex: number;
    colWidth: number[];
}

export const SetWorksheetColWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-col-width',
    handler: async (accessor: IAccessor, params: SetWorksheetColWidthCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetColWidthMutationParams = {
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            colIndex: params.colIndex,
            colWidth: params.colWidth,
        };
        const undoMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColWidthMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
