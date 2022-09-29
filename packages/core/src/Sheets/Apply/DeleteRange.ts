import { Dimension } from '../../Enum/Dimension';
import { ICellData, IRangeData } from '../../Interfaces';
import { Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { Nullable } from '../../Shared/Types';

/**
 *
 * @param count
 * @param cellMatrix
 * @param shiftDimension
 * @param rangeData
 * @returns
 *
 * @internal
 */
export function DeleteRange(
    count: {
        rowCount: number;
        columnCount: number;
    },
    cellMatrix: ObjectMatrix<ICellData>,
    shiftDimension: Dimension,
    rangeData: IRangeData
): ObjectMatrixPrimitiveType<ICellData> {
    const { startRow, endRow, startColumn, endColumn } = rangeData;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const lastEndRow = count.rowCount;
    const lastEndColumn = count.columnCount;

    const result = new ObjectMatrix<ICellData>();
    if (shiftDimension === Dimension.ROWS) {
        // build new data
        for (let r = startRow; r <= lastEndRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                // store old value
                if (r <= endRow) {
                    const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                    result.setValue(r, c, cell as ICellData);
                }
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
    } else if (shiftDimension === Dimension.COLUMNS) {
        // build new data
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= lastEndColumn; c++) {
                // store old value
                if (c <= endColumn) {
                    const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                    result.setValue(r, c, cell as ICellData);
                } else {
                    for (let i = 0; i <= endColumn; i++) {
                        const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                        result.setValue(r, c + i, cell as ICellData);
                    }
                }

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

    return result.getData();
}
