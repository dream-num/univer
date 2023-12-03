import type { ICellData, IMutation } from '@univerjs/core';
import { CommandType, Dimension, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
} from '../../basics/interfaces/mutation-interface';

/**
 * Generate undo mutation of a `InsertRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertRangeMutationParams} params - do mutation params
 * @returns {IDeleteRangeMutationParams} undo mutation params
 */
export const InsertRangeUndoMutationFactory = (
    accessor: IAccessor,
    params: IInsertRangeMutationParams
): IDeleteRangeMutationParams => ({
    workbookId: params.workbookId,
    worksheetId: params.worksheetId,
    ranges: params.ranges,
    shiftDimension: params.shiftDimension,
});

export const InsertRangeMutation: IMutation<IInsertRangeMutationParams, boolean> = {
    id: 'sheet.mutation.insert-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getLastRowWithContent();
        const lastEndColumn = worksheet.getLastColumnWithContent();

        for (let i = 0; i < params.ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = params.ranges[i];
            const rows = endRow - startRow + 1;
            const columns = endColumn - startColumn + 1;

            if (params.shiftDimension === Dimension.ROWS) {
                // build new data
                for (let r = lastEndRow; r >= startRow; r--) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        // get value blow current range

                        const value = cellMatrix.getValue(r, c);
                        cellMatrix.setValue(r + rows, c, value || {});
                    }
                }
                // insert cell value from user
                for (let r = endRow; r >= startRow; r--) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellMatrix.setValue(r, c, params.cellValue[r][c]);
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
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = endColumn; c >= startColumn; c--) {
                        cellMatrix.setValue(r, c, params.cellValue[r][c]);
                    }
                }
            }
        }

        return true;
    },
};
