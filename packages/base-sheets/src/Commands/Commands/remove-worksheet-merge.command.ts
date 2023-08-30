import { CommandType, ICommand, ICommandService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { AddWorksheetMergeMutation } from '../Mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';

export interface IRemoveWorksheetMergeCommandParams {
    workbookId: string;
    worksheetId: string;
    rectangles: IRangeData[];
}

export const RemoveWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-worksheet-merge',
    handler: async (accessor: IAccessor, params: IRemoveWorksheetMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rectangles: params.rectangles,
        };
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
