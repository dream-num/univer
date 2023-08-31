import { IAccessor } from '@wendellhu/redi';
import { CommandType, Dimension, ICellData, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService, ObjectMatrix } from '@univerjs/core';

import { DeleteRangeMutation } from '../Mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../Mutations/insert-range.mutation';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';

export interface IInsertRangeParams {
    workbookId: string;
    worksheetId: string;
    range: IRangeData;
    shiftDimension: Dimension;
    destination?: IRangeData;
}

/**
 * The command to insert range.
 */
export const InsertRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-range',

    handler: async (accessor: IAccessor, params: IInsertRangeParams) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { destination, workbookId, worksheetId, range, shiftDimension } = params;
        let rangeData: IRangeData = range;
        const cellValue = new ObjectMatrix<ICellData>();
        const { startRow, endRow, startColumn, endColumn } = range;
        if (destination) {
            const worksheet = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook().getSheetBySheetId(worksheetId);
            if (!worksheet) return false;
            const sheetMatrix = worksheet.getCellMatrix();

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r - startRow, c - startColumn, sheetMatrix.getValue(r, c) || {});
                }
            }

            rangeData = {
                startRow,
                endRow: startRow + destination.endRow - destination.startRow,
                startColumn,
                endColumn: startRow + destination.endColumn - destination.startColumn,
            };
        } else {
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { m: '', v: '' });
                }
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            range: rangeData,
            worksheetId,
            workbookId,
            shiftDimension,
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
