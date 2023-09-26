import {
    Direction,
    getReverseDirection,
    ICellData,
    ISelectionCell,
    ISelectionRange,
    ObjectMatrix,
    Rectangle,
    selectionToArray,
    Worksheet,
} from '@univerjs/core';

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

export function getRangeAtPosition(row: number, col: number, worksheet: Worksheet): ISelectionCell {
    let destRange: ISelectionCell | null = null;

    const matrix = worksheet.getMatrixWithMergedCells(row, col, row, col);
    matrix.forValue((row, col, value) => {
        destRange = {
            row,
            column: col,
            startRow: row,
            startColumn: col,
            isMerged: value.rowSpan !== undefined || value.colSpan !== undefined,
            isMergedMainCell: value.rowSpan !== undefined && value.colSpan !== undefined,
            endRow: row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
            endColumn: col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
        };
    });

    if (!destRange) {
        throw new Error();
    }

    return destRange;
}

export function moveToNextSelection(
    startRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    const destRange: ISelectionRange = { ...startRange };
    switch (direction) {
        case Direction.UP:
            destRange.startRow = Math.max(0, startRange.startRow - 1);
            destRange.endRow = destRange.startRow;
            break;
        case Direction.DOWN:
            destRange.startRow = Math.min(startRange.endRow + 1, worksheet.getRowCount() - 1);
            destRange.endRow = destRange.startRow;
            break;
        case Direction.LEFT:
            destRange.startColumn = Math.max(0, startRange.startColumn - 1);
            destRange.endColumn = destRange.startColumn;
            break;
        case Direction.RIGHT:
            destRange.startColumn = Math.min(startRange.endColumn + 1, worksheet.getColumnCount() - 1);
            destRange.endColumn = destRange.startColumn;
            break;
        default:
            break;
    }

    // FIXME: 这里需要根据那一列的合并单元格情况做扩展
    // destRange = getRangeAtPosition(destRange.startRow, destRange.startColumn, worksheet);
    return destRange;
}

/**
 * If the current cell has value
 */
export function moveToNextGapCell(
    startRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    let destRange: ISelectionRange = { ...startRange };
    const expandedRange = expandToNextGapCell(destRange, direction, worksheet);
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

    destRange = getRangeAtPosition(row, column, worksheet);
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

    const { startRow, startColumn, endRow, endColumn } = getLastArrayOfRange(startRange, direction);
    let currentPositionHasValue = rangeHasValue(worksheet, startRow, startColumn, endRow, endColumn).hasValue;
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
                worksheet,
                destRow,
                destRange.startColumn,
                destRow,
                destRange.endColumn
            );

            // case 1
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

                // case 2
                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                // other cases
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
                worksheet,
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
                worksheet,
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
                worksheet,
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

/**
 * Adjust the range to align merged cell's borders.
 */
export function alignToMergedCellsBorders(startRange: ISelectionRange, worksheet: Worksheet) {
    const coveredMergedCells = worksheet.getMatrixWithMergedCells(...selectionToArray(startRange));
    const exceededMergedCells: ISelectionRange[] = [];

    coveredMergedCells.forValue((row, col, value) => {
        if (value.colSpan !== undefined && value.rowSpan !== undefined) {
            const mergedCellRange = {
                startRow: row,
                startColumn: col,
                endRow: row + value.rowSpan! - 1,
                endColumn: col + value.colSpan! - 1,
            };

            if (!Rectangle.contains(startRange, mergedCellRange)) {
                exceededMergedCells.push(mergedCellRange);
            }
        }
    });

    if (exceededMergedCells.length === 0) {
        return startRange;
    }

    const union = Rectangle.union(startRange, ...exceededMergedCells);
    return alignToMergedCellsBorders(union, worksheet);
}

export function expandToNextCell(
    startRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    const next = moveToNextSelection(startRange, direction, worksheet);
    const destRange: ISelectionRange = {
        startRow: Math.min(startRange.startRow, next.startRow),
        startColumn: Math.min(startRange.startColumn, next.startColumn),
        endRow: Math.max(startRange.endRow, next.endRow),
        endColumn: Math.max(startRange.endColumn, next.endColumn),
    };

    return alignToMergedCellsBorders(Rectangle.union(startRange, destRange), worksheet);
}

/**
 * This function is considered as a reversed operation of `expandToNextGapCell` but there are slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextGapCell(
    startRange: ISelectionRange,
    anchorRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    // use `moveToNextGapCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const next = moveToNextGapCell(getLastArrayOfRange(startRange, reversedDirection), direction, worksheet);

    // 这里具体用哪个去 min 应该取决于方向
    const destRange: ISelectionRange = {
        startRow: Math.min(anchorRange.startRow, next.startRow),
        startColumn: Math.min(anchorRange.startColumn, next.startColumn),
        endRow: Math.max(anchorRange.endRow, next.endRow),
        endColumn: Math.max(anchorRange.endColumn, next.endColumn),
    };

    return destRange;
}

/**
 * This function is considered as a reversed operation of `expandToNextCell` but there are some slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextCell(
    startRange: ISelectionRange,
    anchorRange: ISelectionRange,
    direction: Direction,
    worksheet: Worksheet
): ISelectionRange {
    // use `moveToNextCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const next = moveToNextSelection(getLastArrayOfRange(startRange, reversedDirection), direction, worksheet);

    const destRange: ISelectionRange = {
        startRow: Math.min(anchorRange.startRow, next.startRow),
        startColumn: Math.min(anchorRange.startColumn, next.startColumn),
        endRow: Math.max(anchorRange.endRow, next.endRow),
        endColumn: Math.max(anchorRange.endColumn, next.endColumn),
    };

    return destRange;
}

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
    // TODO: 这里需要根据范围内的合并单元格情况做扩展，扩展到范围内的所有合并单元格
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

function rangeHasValue(
    worksheet: Worksheet,
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
