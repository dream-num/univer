import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetColumnShowMutationParams, SetWorksheetColumnShowMutation, SetWorksheetColumnShowMutationFactory } from '../Mutations/set-worksheet-column-show.mutation';
import { SetWorksheetColumnHideMutation } from '../Mutations/set-worksheet-column-hide.mutation';

export interface SetWorksheetColumnShowCommandParams {
    workbookId: string;
    worksheetId: string;
    columnIndex: number;
    columnCount: number;
}

export const SetWorksheetColumnShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-column-show',
    handler: async (accessor: IAccessor, params: SetWorksheetColumnShowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetWorksheetColumnShowMutationParams = {
            workbookId,
            worksheetId,
            columnIndex: params.columnIndex ?? 0,
            columnCount: params.columnCount ?? 1,
        };

        const undoMutationParams = SetWorksheetColumnShowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColumnShowMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColumnHideMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColumnShowMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
