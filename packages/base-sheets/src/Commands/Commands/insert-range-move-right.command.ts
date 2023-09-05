import { IAccessor } from '@wendellhu/redi';
import { CommandType, Dimension, ICellData, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService, ObjectMatrix } from '@univerjs/core';

import { DeleteRangeMutation } from '../Mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../Mutations/insert-range.mutation';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { ISelectionManager } from '../../Services/tokens';

/**
 * The command to insert range.
 */
export const InsertRangeMoveRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-range-move-right',

    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const range = selectionManager.getCurrentSelections();
        if (!range.length) return false;

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { m: '', v: '' });
                }
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            range,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };

        const deleteRangeMutationParams: IDeleteRangeMutationParams = InsertRangeUndoMutationFactory(accessor, insertRangeMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(DeleteRangeMutation.id, deleteRangeMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
