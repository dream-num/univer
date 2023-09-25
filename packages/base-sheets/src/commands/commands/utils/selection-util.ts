import { Direction, ICellData, ISelectionRange, ObjectMatrix, Worksheet } from '@univerjs/core';

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

/**
 * If the current cell has value
 */
export function findNextGapCell(
    startRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    const params: IExpandParams = {
        left: Direction.LEFT === direction,
        right: Direction.RIGHT === direction,
        up: Direction.UP === direction,
        down: Direction.DOWN === direction,
    };

    const expandedRange = expandToNextGapCell(startRange, direction, worksheet);
    const row =
        Direction.UP === direction
            ? expandedRange.startRow
            : Direction.DOWN === direction
            ? expandedRange.endRow
            : startRange.startRow;
    const column =
        Direction.LEFT === direction
            ? expandedRange.startColumn
            : Direction.RIGHT === direction
            ? expandedRange.endColumn
            : startRange.startColumn;
    const matrix = worksheet.getMatrixWithMergedCells(row, column, row, column);

    let destRange: ISelectionRange | null = null;
    matrix.forValue((row, col, value) => {
        destRange = {
            startRow: row,
            startColumn: col,
            endRow: row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
            endColumn: col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
        };
    });

    if (!destRange) {
        throw new Error();
    }

    return destRange;
}

export function expandToNextGapCell(
    startRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    const params: IExpandParams = {
        left: Direction.LEFT === direction,
        right: Direction.RIGHT === direction,
        up: Direction.UP === direction,
        down: Direction.DOWN === direction,
    };

    const destRange = { ...startRange };
    const maxRow = worksheet.getMaxRows();

    function rangeHasValue(
        row: number,
        col: number,
        rowEnd: number,
        colEnd: number
    ): {
        hasValue: boolean;
        matrix: ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>;
    } {
        let hasValue = false;

        const matrix = worksheet.getMatrixWithMergedCells(row, col, rowEnd, colEnd).forValue((_, __, value) => {
            if (value.v) {
                hasValue = true;
                return false; // stop looping
            }
        });

        return {
            hasValue,
            matrix,
        };
    }

    const { startRow, startColumn, endRow, endColumn } = getLastArrayOfRange(startRange, direction);
    let currentPositionHasValue = rangeHasValue(startRow, startColumn, endRow, endColumn).hasValue;
    let firstMove = true;
    let shouldContinue = true;

    while (shouldContinue) {
        if (params.up) {
            if (destRange.startRow === 0) {
                shouldContinue = false;
                break;
            }

            const destRow = destRange.startRow - 1; // it may decrease if there are merged cell
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                matrix.forValue((row, col, value) => {
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(
                        col + (value.colSpan === undefined ? 0 : value.colSpan - 1),
                        destRange.endColumn
                    );
                });

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (params.down) {
            if (destRange.endRow === maxRow - 1) {
                shouldContinue = false;
                break;
            }

            const nextRow = destRange.endRow + 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                nextRow,
                destRange.startColumn,
                nextRow,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                matrix.forValue((row, col, value) => {
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endRow = Math.max(
                        row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
                        destRange.endRow
                    );
                    destRange.endColumn = Math.max(
                        col + (value.rowSpan === undefined ? 0 : value.rowSpan - 1),
                        destRange.endColumn
                    );
                });

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (params.left) {
            if (destRange.startColumn === 0) {
                shouldContinue = false;
                break;
            }

            const destCol = destRange.startColumn - 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                matrix.forValue((row, col, value) => {
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(
                        row + (value.rowSpan === undefined ? 0 : value.rowSpan - 1),
                        destRange.endRow
                    );
                });

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (params.right) {
            if (destRange.endColumn === worksheet.getMaxColumns() - 1) {
                shouldContinue = false;
                break;
            }

            const destCol = destRange.endColumn + 1;
            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                destRange.startRow,
                destCol,
                destRange.endRow,
                destCol
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                matrix.forValue((row, col, value) => {
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(
                        row + (value.rowSpan === undefined ? 0 : value.rowSpan - 1),
                        destRange.endRow
                    );
                    destRange.endColumn = Math.max(
                        col + (value.colSpan === undefined ? 0 : value.colSpan - 1),
                        destRange.endColumn
                    );
                });

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }
    }

    return destRange;
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

function getLastArrayOfRange(startRange: ISelectionRange, direction: Direction): ISelectionRange {
    switch (direction) {
        case Direction.UP:
            return {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.startRow,
                endColumn: startRange.endColumn,
            };
        case Direction.DOWN:
            return {
                startRow: startRange.endRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
            };
        case Direction.LEFT:
            return {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.startColumn,
            };
        case Direction.RIGHT:
            return {
                startRow: startRange.startRow,
                startColumn: startRange.endColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
            };
        default:
            throw new Error('Invalid direction');
    }
}
