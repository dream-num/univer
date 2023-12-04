import type { IMutation, IRange, ObjectMatrix, ObjectMatrixPrimitiveType } from '@univerjs/core';
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
        const { workbookId, worksheetId, ranges, cellValue, shiftDimension } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getLastRowWithContent();
        const lastEndColumn = worksheet.getLastColumnWithContent();

        handleInsertRangeMutation(cellMatrix, ranges, lastEndRow, lastEndColumn, shiftDimension, cellValue);

        return true;
    },
};

export function handleInsertRangeMutation<T>(
    cellMatrix: ObjectMatrix<T>,
    ranges: IRange[],
    lastEndRow: number,
    lastEndColumn: number,
    shiftDimension: Dimension,
    cellValue?: ObjectMatrixPrimitiveType<T>
) {
    for (let i = 0; i < ranges.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = ranges[i];
        if (shiftDimension === Dimension.ROWS) {
            const rows = endRow - startRow + 1;
            // build new data
            for (let r = lastEndRow; r >= startRow; r--) {
                for (let c = startColumn; c <= endColumn; c++) {
                    // get value blow current range

                    const value = cellMatrix.getValue(r, c);
                    if (value == null) {
                        cellMatrix.realDeleteValue(r + rows, c);
                    } else {
                        cellMatrix.setValue(r + rows, c, value);
                    }
                }
            }
            // insert cell value from user
            for (let r = endRow; r >= startRow; r--) {
                for (let c = startColumn; c <= endColumn; c++) {
                    if (cellValue) {
                        cellMatrix.setValue(r, c, cellValue[r][c]);
                    } else {
                        cellMatrix.realDeleteValue(r, c);
                    }
                }
            }
        } else if (shiftDimension === Dimension.COLUMNS) {
            const columns = endColumn - startColumn + 1;
            for (let r = startRow; r <= endRow; r++) {
                for (let c = lastEndColumn; c >= startColumn; c--) {
                    // get value blow current range
                    const value = cellMatrix.getValue(r, c);

                    if (value == null) {
                        cellMatrix.realDeleteValue(r, c + columns);
                    } else {
                        cellMatrix.setValue(r, c + columns, value);
                    }
                }
            }
            // insert cell value from user
            for (let r = startRow; r <= endRow; r++) {
                for (let c = endColumn; c >= startColumn; c--) {
                    if (cellValue) {
                        cellMatrix.setValue(r, c, cellValue[r][c]);
                    } else {
                        cellMatrix.realDeleteValue(r, c);
                    }
                }
            }
        }
    }
}
