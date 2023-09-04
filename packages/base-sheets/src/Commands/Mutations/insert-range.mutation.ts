import { CommandType, IMutation, ICurrentUniverService, ICellData, Dimension } from '@univerjs/core';

import { IAccessor } from '@wendellhu/redi';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `InsertRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertRangeMutationParams} params - do mutation params
 * @returns {IDeleteRangeMutationParams} undo mutation params
 */
export const InsertRangeUndoMutationFactory = (accessor: IAccessor, params: IInsertRangeMutationParams): IDeleteRangeMutationParams => ({
    workbookId: params.workbookId,
    worksheetId: params.worksheetId,
    range: params.range,
    shiftDimension: params.shiftDimension,
});

export const InsertRangeMutation: IMutation<IInsertRangeMutationParams, boolean> = {
    id: 'sheet.mutation.insert-range',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getLastRow();
        const lastEndColumn = worksheet.getLastColumn();

        for (let i = 0; i < params.range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = params.range[i];
            const rows = endRow - startRow + 1;
            const columns = endColumn - startColumn + 1;

            if (params.shiftDimension === Dimension.ROWS) {
                // build new data
                for (let r = lastEndRow; r >= startRow; r--) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        // get value blow current range
                        const value = cellMatrix.getValue(r, c);
                        cellMatrix.setValue(r + rows, c, value as ICellData);
                    }
                }
                // insert cell value from user
                for (let r = endRow; r >= startRow; r--) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellMatrix.setValue(r, c, params.cellValue[r - startRow][c - startColumn]);
                    }
                }
            } else if (params.shiftDimension === Dimension.COLUMNS) {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = lastEndColumn; c >= startColumn; c--) {
                        // get value blow current range
                        const value = cellMatrix.getValue(r, c);

                        cellMatrix.setValue(r, c + columns, value as ICellData);
                    }
                }
                // insert cell value from user
                // for (let r = endRow; r >= startRow; r--) {
                //     for (let c = startColumn; c <= endColumn; c++) {
                //         cellMatrix.setValue(r, c, (cellValue as ICellData)[r - startRow][c - startColumn]);
                //     }
                // }
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = endColumn; c >= startColumn; c--) {
                        cellMatrix.setValue(r, c, params.cellValue[r - startRow][c - startColumn]);
                    }
                }
            }
        }

        return true;
    },
};
