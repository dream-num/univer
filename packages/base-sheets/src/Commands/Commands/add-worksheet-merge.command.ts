import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../Mutations/add-worksheet-merge.mutation';
import { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';
import { ISelectionManager } from '../../Services/tokens';

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    handler: async (accessor: IAccessor) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManager.getCurrentSelections();
        if (!selections.length) return false;
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
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };
        const undoMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(accessor, addMergeMutationParams);
        const result = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(RemoveWorksheetMergeMutation.id, undoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(AddWorksheetMergeMutation.id, undoRemoveMergeMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
