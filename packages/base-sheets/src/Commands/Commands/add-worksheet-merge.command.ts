import { CommandType, ICommand, ICommandService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../Mutations/add-worksheet-merge.mutation';
import { IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { RemoveWorksheetMergeMutation } from '../Mutations/remove-worksheet-merge.mutation';

export interface IAddWorksheetMergeCommandParams {
    workbookId: string;
    worksheetId: string;
    rectangles: IRangeData[];
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    handler: async (accessor: IAccessor, params: IAddWorksheetMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: IAddWorksheetMergeCommandParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rectangles: params.rectangles,
        };

        const undoMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(accessor, redoMutationParams);
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
