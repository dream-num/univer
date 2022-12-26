import { Dimension } from '../../Enum';
import { ICellData, IRangeData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { CommandUnit, IInsertRangeActionData } from '../../Command';

/**
 *
 * @param count
 * @param cellMatrix
 * @param shiftDimension
 * @param rangeData
 * @param cellValue
 *
 * @internal
 */
export function InsertRange(
    count: {
        rowCount: number;
        columnCount: number;
    },
    cellMatrix: ObjectMatrix<ICellData>,
    shiftDimension: Dimension,
    rangeData: IRangeData,
    cellValue: ObjectMatrixPrimitiveType<ICellData>
): void {
    const { startRow, endRow, startColumn, endColumn } = rangeData;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const lastEndRow = count.rowCount;
    const lastEndColumn = count.columnCount;

    if (shiftDimension === Dimension.ROWS) {
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
                cellMatrix.setValue(
                    r,
                    c,
                    (cellValue as ICellData)[r - startRow][c - startColumn]
                );
            }
        }
    } else if (shiftDimension === Dimension.COLUMNS) {
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
                cellMatrix.setValue(
                    r,
                    c,
                    (cellValue as ICellData)[r - startRow][c - startColumn]
                );
            }
        }
    }
}

export function InsertRangeApply(unit: CommandUnit, data: IInsertRangeActionData) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const rowCount = worksheet!.getLastRow();
    const columnCount = worksheet!.getLastColumn();
    const cellMatrix = worksheet!.getCellMatrix();

    const { startRow, endRow, startColumn, endColumn } = data.rangeData;
    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const lastEndRow = rowCount;
    const lastEndColumn = columnCount;

    if (data.shiftDimension === Dimension.ROWS) {
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
                cellMatrix.setValue(
                    r,
                    c,
                    (data.cellValue as ICellData)[r - startRow][c - startColumn]
                );
            }
        }
    } else if (data.shiftDimension === Dimension.COLUMNS) {
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
                cellMatrix.setValue(
                    r,
                    c,
                    (data.cellValue as ICellData)[r - startRow][c - startColumn]
                );
            }
        }
    }
}
