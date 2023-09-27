import {
    Direction,
    getReverseDirection,
    ICellData,
    IRange,
    ISelectionCell,
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
            actualRow: row,
            actualColumn: col,
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

export function findNextRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const destRange: IRange = { ...startRange };
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

    return destRange;
}

export function findNextGapRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    let destRange = { ...startRange };
    const maxRow = worksheet.getMaxRows();

    const { startRow, startColumn, endRow, endColumn } = getLastArrayOfRange(startRange, direction, worksheet);
    let currentPositionHasValue = rangeHasValue(worksheet, startRow, startColumn, endRow, endColumn).hasValue;
    let firstMove = true;
    let shouldContinue = true;

    while (shouldContinue) {
        if (Direction.UP === direction) {
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

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                const r = {
                    startColumn: destRange.startColumn,
                    endColumn: destRange.endColumn,
                    startRow: 1_000_000_000,
                    endRow: 0,
                };
                matrix.forValue((row, _, value) => {
                    r.startRow = Math.min(row, r.startRow);
                    r.endRow = Math.max(row + (value.rowSpan || 1) - 1, r.endRow);
                });
                destRange = r;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.DOWN === direction) {
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
                const r = {
                    startColumn: destRange.startColumn,
                    endColumn: destRange.endColumn,
                    startRow: 1_000_000_000,
                    endRow: 0,
                };
                matrix.forValue((row, _, value) => {
                    r.startRow = Math.min(r.startRow, row);
                    r.endRow = Math.max(row + (value.rowSpan || 1) - 1, r.endRow);
                });
                destRange = r;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.LEFT === direction) {
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
                const r = {
                    startRow: destRange.startRow,
                    endRow: destRange.endRow,
                    startColumn: 1_000_000_000,
                    endColumn: 0,
                };
                matrix.forValue((_, col, value) => {
                    r.startColumn = Math.min(col, r.startColumn);
                    r.endColumn = Math.max(col + (value.colSpan || 1) - 1, r.endColumn);
                });

                destRange = r;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.RIGHT === direction) {
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
                const r = {
                    startRow: destRange.startRow,
                    endRow: destRange.endRow,
                    startColumn: 1_000_000_000,
                    endColumn: 0,
                };
                matrix.forValue((_, col, value) => {
                    r.startColumn = Math.min(col, r.startColumn);
                    r.endColumn = Math.max(col + (value.colSpan || 1) - 1, r.endColumn);
                });
                destRange = r;

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

export function expandToNextGapCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const destRange = { ...startRange };
    const maxRow = worksheet.getMaxRows();

    const { startRow, startColumn, endRow, endColumn } = getLastArrayOfRange(startRange, direction, worksheet);
    let currentPositionHasValue = rangeHasValue(worksheet, startRow, startColumn, endRow, endColumn).hasValue;
    let firstMove = true;
    let shouldContinue = true;

    while (shouldContinue) {
        if (Direction.UP === direction) {
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

        if (Direction.DOWN === direction) {
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
                    destRange.endRow = Math.max(row + (value.rowSpan || 1) - 1, destRange.endRow);
                    destRange.endColumn = Math.max(col + (value.colSpan || 1) - 1, destRange.endColumn);
                });

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.LEFT === direction) {
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

        if (Direction.RIGHT === direction) {
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
export function alignToMergedCellsBorders(startRange: IRange, worksheet: Worksheet, shouldRecursive = true) {
    const coveredMergedCells = worksheet.getMatrixWithMergedCells(...selectionToArray(startRange));
    const exceededMergedCells: IRange[] = [];

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
    if (shouldRecursive) {
        return alignToMergedCellsBorders(union, worksheet, shouldRecursive);
    }
    return union;
}

export function expandToNextCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const next = findNextRange(startRange, direction, worksheet);
    const destRange: IRange = {
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
    startRange: IRange,
    anchorRange: IRange,
    direction: Direction,
    worksheet: Worksheet
): IRange {
    // use `moveToNextGapCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const nextGap = findNextGapRange(
        getLastArrayOfRange(startRange, reversedDirection, worksheet),
        direction,
        worksheet
    );

    // if next exceed the startRange we should just expand anchorRange with
    if (direction === Direction.UP && nextGap.startRow <= startRange.startRow) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startColumn: startRange.startColumn, endColumn: startRange.endColumn },
            worksheet,
            true
        );
    }
    if (direction === Direction.DOWN && nextGap.endRow >= startRange.endRow) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startColumn: startRange.startColumn, endColumn: startRange.endColumn },
            worksheet,
            true
        );
    }
    if (direction === Direction.LEFT && nextGap.startColumn <= startRange.startColumn) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startRow: startRange.startRow, endRow: startRange.endRow },
            worksheet,
            true
        );
    }
    if (direction === Direction.RIGHT && nextGap.endColumn >= startRange.endColumn) {
        return alignToMergedCellsBorders(
            { ...anchorRange, startRow: startRange.startRow, endRow: startRange.endRow },
            worksheet,
            true
        );
    }
    return Rectangle.union(anchorRange, nextGap);
}

/**
 * This function is considered as a reversed operation of `expandToNextCell` but there are some slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextCell(
    startRange: IRange,
    anchorRange: IRange,
    direction: Direction,
    worksheet: Worksheet
): IRange {
    // use `moveToNextCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const next = findNextRange(getLastArrayOfRange(startRange, reversedDirection, worksheet), direction, worksheet);

    const destRange: IRange = {
        startRow: Math.min(anchorRange.startRow, next.startRow),
        startColumn: Math.min(anchorRange.startColumn, next.startColumn),
        endRow: Math.max(anchorRange.endRow, next.endRow),
        endColumn: Math.max(anchorRange.endColumn, next.endColumn),
    };

    return destRange;
}

export function expandToContinuousRange(startRange: IRange, directions: IExpandParams, worksheet: Worksheet): IRange {
    const { left, right, up, down } = directions;
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();

    let changed = true;
    const destRange: IRange = { ...startRange }; // startRange should not be used below

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

export function expandToWholeSheet(worksheet: Worksheet): IRange {
    return {
        startRow: 0,
        startColumn: 0,
        endRow: worksheet.getMaxRows() - 1,
        endColumn: worksheet.getMaxColumns() - 1,
    };
}

function getLastArrayOfRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    let destRange: IRange;
    switch (direction) {
        case Direction.UP:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.startRow,
                endColumn: startRange.endColumn,
            };

            break;
        case Direction.DOWN:
            destRange = {
                startRow: startRange.endRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
            };
            break;
        case Direction.LEFT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.startColumn,
            };
            break;
        case Direction.RIGHT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.endColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
            };
            break;
        default:
            throw new Error('Invalid direction');
    }

    return alignToMergedCellsBorders(destRange, worksheet, false);
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
