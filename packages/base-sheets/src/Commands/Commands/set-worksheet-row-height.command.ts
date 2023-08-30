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

        const setWorksheetNameMutationParams: ISetWorksheetRowHeightMutationParams = {
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            rowIndex: params.rowIndex,
            rowHeight: params.rowHeight,
        };
        const undoClearMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(accessor, setWorksheetNameMutationParams);
        const result = commandService.executeCommand(SetWorksheetRowHeightMutation.id, setWorksheetNameMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, setWorksheetNameMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
