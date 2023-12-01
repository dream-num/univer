import {
    CommandType,
    Dimension,
    ICellData,
    IMutation,
    IRange,
    IUniverInstanceService,
    Nullable,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../basics/interfaces/mutation-interface';

/**
 * Generate undo mutation of a `DeleteRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IDeleteRangeMutationParams} params - do mutation params
 * @returns {IInsertRangeMutationParams} undo mutation params
 */
export const DeleteRangeUndoMutationFactory = (
    accessor: IAccessor,
    params: IDeleteRangeMutationParams
): Nullable<IInsertRangeMutationParams> => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const worksheet = univerInstanceService
        .getCurrentUniverSheetInstance()

        .getSheetBySheetId(params.worksheetId);
    if (!worksheet) return null;
    const cellMatrix = worksheet.getCellMatrix();

    const undoData = new ObjectMatrix<ICellData>();
    const lastEndRow = worksheet.getConfig().rowCount;
    const lastEndColumn = worksheet.getConfig().columnCount;

    for (let i = 0; i < params.ranges.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = params.ranges[i];
        if (params.shiftDimension === Dimension.ROWS) {
            // build new data
            for (let r = startRow; r <= lastEndRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    // store old value
                    if (r <= endRow) {
                        const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                        undoData.setValue(r, c, cell as ICellData);
                    }
                }
            }
        } else if (params.shiftDimension === Dimension.COLUMNS) {
            // build new data
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= lastEndColumn; c++) {
                    // store old value
                    if (c <= endColumn) {
                        const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                        undoData.setValue(r, c, cell as ICellData);
                    } else {
                        for (let i = 0; i <= endColumn; i++) {
                            const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                            undoData.setValue(r, c + i, cell as ICellData);
                        }
                    }
                }
            }
        }
    }

    return {
        ...Tools.deepClone(params),
        cellValue: undoData.getData(),
    };
};

export const DeleteRangeMutation: IMutation<IDeleteRangeMutationParams, boolean> = {
    id: 'sheet.mutation.delete-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { workbookId, worksheetId, ranges, shiftDimension } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getLastRowWithContent();
        const lastEndColumn = worksheet.getLastColumnWithContent();

        handleDeleteRangeMutation(cellMatrix, ranges, lastEndRow, lastEndColumn, shiftDimension);

        return true;
    },
};

export function handleDeleteRangeMutation<T>(
    cellMatrix: ObjectMatrix<T>,
    ranges: IRange[],
    lastEndRow: number,
    lastEndColumn: number,
    shiftDimension: Dimension
) {
    for (let i = 0; i < ranges.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = ranges[i];

        const rows = endRow - startRow + 1;
        const columns = endColumn - startColumn + 1;

        if (shiftDimension === Dimension.ROWS) {
            // build new data
            for (let r = startRow; r <= lastEndRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    // get value blow current range
                    const value = cellMatrix.getValue(r + rows, c);
                    if (value == null) {
                        cellMatrix.realDeleteValue(r, c);
                    } else {
                        cellMatrix.setValue(r, c, value);
                    }
                }
            }
        } else if (shiftDimension === Dimension.COLUMNS) {
            // build new data
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= lastEndColumn; c++) {
                    // get value blow current range

                    const value = cellMatrix.getValue(r, c + columns);
                    if (value == null) {
                        cellMatrix.realDeleteValue(r, c);
                    } else {
                        cellMatrix.setValue(r, c, value);
                    }
                }
            }
        }
    }
}
