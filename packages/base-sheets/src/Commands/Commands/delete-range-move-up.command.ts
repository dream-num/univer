import { IAccessor } from '@wendellhu/redi';
import { CommandType, Dimension, ICommand, ICommandService, IRangeData, IUndoRedoService } from '@univerjs/core';

import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../Mutations/delete-range.mutation';
import { InsertRangeMutation } from '../Mutations/insert-range.mutation';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';

export interface IDeleteRangeMoveUpParams {
    workbookId: string;
    worksheetId: string;
    range: IRangeData;
}

/**
 * The command to delete range.
 */
export const DeleteRangeMoveUpCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-up',

    handler: async (accessor: IAccessor, params: IDeleteRangeMoveUpParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { range, workbookId, worksheetId } = params;

        const deleteRangeMutationParams: IDeleteRangeMutationParams = {
            range,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.ROWS,
        };

        const insertRangeMutationParams: IInsertRangeMutationParams = DeleteRangeUndoMutationFactory(accessor, deleteRangeMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(DeleteRangeMutation.id, deleteRangeMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                },
                redo() {
                    return commandService.executeCommand(DeleteRangeMutation.id, deleteRangeMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
