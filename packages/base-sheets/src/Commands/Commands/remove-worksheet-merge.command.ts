import { CommandType, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { AddWorksheetMergeMutation } from '../Mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface IRemoveWorksheetMergeCommandParams {
    workbookId: string;
    worksheetId: string;
    rectangles: IRangeData[];
}

export const RemoveWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-worksheet-merge',
    handler: async (accessor: IAccessor, params?: IRemoveWorksheetMergeCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let redoMutationParams: IRemoveWorksheetMergeMutationParams;
        if (params == null) {
            const selections = selectionManager.getCurrentSelections();
            const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            if (!selections.length) {
                return false;
            }
            const range = selections[0];
            redoMutationParams = {
                workbookId: workbook.getUnitId(),
                worksheetId: workbook.getActiveSheet().getSheetId(),
                rectangles: [
                    {
                        startRow: range.startRow,
                        startColumn: range.startColumn,
                        endRow: range.endRow,
                        endColumn: range.endColumn,
                    },
                ],
            };
        } else {
            redoMutationParams = {
                workbookId: params.workbookId,
                worksheetId: params.worksheetId,
                rectangles: params.rectangles,
            };
        }

        const undoMutationParams: IRemoveWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveWorksheetMergeMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(AddWorksheetMergeMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(RemoveWorksheetMergeMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
