import { ISelectionRange, Worksheet } from '@univerjs/core';

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

// NOTE@wzhudev: Worksheet or Workbook used in commands layer / service layer / controller layer me should be
// changed to SheerViewModel or BookViewModel in the future.
export function expandToContinuousRange(
    startRange: ISelectionRange,
    directions: IExpandParams,
    worksheet: Worksheet
): ISelectionRange {
    const { left, right, up, down } = directions;
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();

    let changed = true;
    const destRange: ISelectionRange = { ...startRange }; // startRange should not be used below

    while (changed) {
        changed = false;

        if (up && destRange.startRow !== 0) {
            // see if there are value in the upper row of contents
            // set `changed` to true if `startRow` really changes
            const destRow = destRange.startRow - 1; // it may decrease if there are merged cell
            const matrixFromLastRow = worksheet.getMatrixWithMergedCells(
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            // we should check if there are value in the upper row of contents, if it does
            // we should update the `destRange` and set `changed` to true
            matrixFromLastRow.forValue((row, col, value) => {
                if (value.v) {
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            });
        }

        if (down && destRange.endRow !== maxRow - 1) {
            const destRow = destRange.endRow + 1;
            const matrixFromLastRow = worksheet.getMatrixWithMergedCells(
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            matrixFromLastRow.forValue((row, col, value) => {
                if (value.v) {
                    destRange.endRow = Math.max(
                        row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
                        destRange.endRow
                    );
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            });
        }

        if (left && destRange.startRow !== 0) {
            const destCol = destRange.startColumn - 1;
            const matrixFromLastCol = worksheet.getMatrixWithMergedCells(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            matrixFromLastCol.forValue((row, col, value) => {
                if (value.v) {
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(row, destRange.endRow);
                    changed = true;
                }
            });
        }

        if (right && destRange.endColumn !== maxColumn - 1) {
            const destCol = destRange.endColumn + 1;
            const matrixFromLastCol = worksheet.getMatrixWithMergedCells(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            matrixFromLastCol.forValue((row, col, value) => {
                if (value.v) {
                    destRange.endColumn = Math.max(
                        col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
                        destRange.endColumn
                    );
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(row, destRange.endRow);
                    changed = true;
                }
            });
        }
    }

    console.log('debug, final range', destRange);

    return destRange;
}

export function expandToWholeSheet(worksheet: Worksheet): ISelectionRange {
    return {
        startRow: 0,
        startColumn: 0,
        endRow: worksheet.getMaxRows() - 1,
        endColumn: worksheet.getMaxColumns() - 1,
    };
}
