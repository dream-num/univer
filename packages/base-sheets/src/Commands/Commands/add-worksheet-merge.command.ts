import { CommandType, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../Mutations/add-worksheet-merge.mutation';
import { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface IAddWorksheetMergeCommandParams {
    workbookId?: string;
    worksheetId?: string;
    rectangles?: IRangeData[];
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    handler: async (accessor: IAccessor, params?: IAddWorksheetMergeCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManager.getCurrentSelections();
        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let rectangles = selections;
        if (params == null) {
            if (!selections.length) {
                return false;
            }
        } else {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.rectangles) {
                rectangles = params.rectangles;
            } else {
                if (!selections.length) {
                    return false;
                }
            }
        }

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            rectangles,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeCommandParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            rectangles,
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
