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

        const setWorksheetNameMutationParams: ISetWorksheetColWidthMutationParams = {
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            colIndex: params.colIndex,
            colWidth: params.colWidth,
        };
        const undoClearMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(accessor, setWorksheetNameMutationParams);
        const result = commandService.executeCommand(SetWorksheetColWidthMutation.id, setWorksheetNameMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, setWorksheetNameMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
