import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetColumnHideMutationParams, SetWorksheetColumnHideMutation, SetWorksheetColumnHideMutationFactory } from '../Mutations/set-worksheet-column-hide.mutation';
import { SetWorksheetColumnShowMutation } from '../Mutations/set-worksheet-column-show.mutation';

export interface SetWorksheetColumnHideCommandParams {
    workbookId?: string;
    worksheetId?: string;
    columnIndex?: number;
    columnCount?: number;
}

export const SetWorksheetColumnHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-column-hide',
    handler: async (accessor: IAccessor, params: SetWorksheetColumnHideCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetWorksheetColumnHideMutationParams = {
            workbookId,
            worksheetId,
            columnIndex: params.columnIndex ?? 0,
            columnCount: params.columnCount ?? 1,
        };

        const undoMutationParams = SetWorksheetColumnHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColumnHideMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColumnShowMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColumnHideMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
