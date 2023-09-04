import { CommandType, IMutation, ICurrentUniverService, ObjectMatrix, Tools, Nullable, ICellData, Dimension } from '@univerjs/core';

import { IAccessor } from '@wendellhu/redi';
import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `DeleteRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IDeleteRangeMutationParams} params - do mutation params
 * @returns {IInsertRangeMutationParams} undo mutation params
 */
export const DeleteRangeUndoMutationFactory = (accessor: IAccessor, params: IDeleteRangeMutationParams): Nullable<IInsertRangeMutationParams> => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(params.worksheetId);
    if (!worksheet) return null;
    const cellMatrix = worksheet.getCellMatrix();

    const undoData = new ObjectMatrix<ICellData>();
    const lastEndRow = worksheet.getConfig().rowCount;
    const lastEndColumn = worksheet.getConfig().columnCount;

    for (let i = 0; i < params.range.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = params.range[i];

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
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const lastEndRow = worksheet.getConfig().rowCount;
        const lastEndColumn = worksheet.getConfig().columnCount;

        for (let i = 0; i < params.range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = params.range[i];

            const rows = endRow - startRow + 1;
            const columns = endColumn - startColumn + 1;

            if (params.shiftDimension === Dimension.ROWS) {
                // build new data
                for (let r = startRow; r <= lastEndRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        // get value blow current range
                        const value = cellMatrix.getValue(r + rows, c);
                        if (value) {
                            cellMatrix.setValue(r, c, Tools.deepClone(value as ICellData));
                        } else {
                            // null means delete
                            const originValue = cellMatrix.getValue(r, c);
                            if (originValue) {
                                cellMatrix.deleteValue(r, c);
                                // Deleting data will cause the column number to change, so subtract 1 here in advance
                                c--;
                            }
                        }
                    }
                }
            } else if (params.shiftDimension === Dimension.COLUMNS) {
                // build new data
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= lastEndColumn; c++) {
                        // get value blow current range

                        const value = cellMatrix.getValue(r, c + columns);
                        if (value) {
                            cellMatrix.setValue(r, c, Tools.deepClone(value as ICellData));
                        } else {
                            // null means delete
                            const originValue = cellMatrix.getValue(r, c);
                            if (originValue) {
                                for (let i = 0; i <= endColumn; i++) {
                                    cellMatrix.deleteValue(r, c);
                                }
                                break;
                                // Deleting data will cause the column number to change, so subtract 1 here in advance
                            }
                        }
                    }
                }
            }
        }

        return true;
    },
};
