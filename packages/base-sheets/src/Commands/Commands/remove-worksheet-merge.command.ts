import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../Services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../Mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';

export const RemoveWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-worksheet-merge',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDataList();
        if (!selections?.length) return false;
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const result = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(AddWorksheetMergeMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};
