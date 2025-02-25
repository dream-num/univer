/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, IRange, ISelection, ISelectionCell, Nullable, ObjectMatrix, Worksheet } from '@univerjs/core';
import { Direction, getReverseDirection, RANGE_TYPE, Rectangle } from '@univerjs/core';
import { alignToMergedCellsBorders } from '@univerjs/sheets';

export enum MergeType {
    MergeAll = 'mergeAll',
    MergeVertical = 'mergeVertical',
    MergeHorizontal = 'mergeHorizontal',
}

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

// TODO@wzhudev: methods in this file should use `worksheet.getCell()` instead of using raw data

export function findNextRange(
    startRange: IRange,
    direction: Direction,
    worksheet: Worksheet,
    boundary?: IRange,
    isFindNext: boolean = true,
    nextStep: number = 1,
    isGoBack: boolean = true
): IRange {
    let destRange: IRange = { ...startRange };

    /**
     * Set the boundaries for moving the selection area.
     * Here you can customize the boundaries to implement the ability to move the primary within the selection area.
     */
    if (boundary == null) {
        boundary = {
            startRow: 0,
            endRow: worksheet.getRowCount() - 1,
            startColumn: 0,
            endColumn: worksheet.getColumnCount() - 1,
        };
    }

    let next: number;
    switch (direction) {
        case Direction.UP:
            next = startRange.startRow - nextStep;
            while (next > -1 && !worksheet.getRowVisible(next)) {
                next -= 1;
            }
            if (next >= boundary.startRow) {
                destRange.startRow = next;
                destRange.endRow = next;
            } else if (isGoBack) {
                destRange.startRow = boundary.endRow;
                destRange.endRow = boundary.endRow;

                if (isFindNext) {
                    destRange = findNextRange(destRange, Direction.LEFT, worksheet, boundary, false);
                }
            }
            break;
        case Direction.DOWN:
            next = startRange.endRow + nextStep;
            while (next < worksheet.getRowCount() && !worksheet.getRowVisible(next)) {
                next += 1;
            }
            if (next <= boundary.endRow) {
                destRange.startRow = next;
                destRange.endRow = next;
            } else if (isGoBack) {
                destRange.startRow = boundary.startRow;
                destRange.endRow = boundary.startRow;

                if (isFindNext) {
                    destRange = findNextRange(destRange, Direction.RIGHT, worksheet, boundary, false);
                }
            }
            break;
        case Direction.LEFT:
            next = startRange.startColumn - nextStep;
            while (next > -1 && !worksheet.getColVisible(next)) {
                next -= 1;
            }
            if (next >= boundary.startColumn) {
                destRange.startColumn = next;
                destRange.endColumn = next;
            } else if (isGoBack) {
                destRange.startColumn = boundary.endColumn;
                destRange.endColumn = boundary.endColumn;

                if (isFindNext) {
                    destRange = findNextRange(destRange, Direction.UP, worksheet, boundary, false);
                }
            }
            break;
        case Direction.RIGHT:
            next = startRange.endColumn + nextStep;
            while (next < worksheet.getColumnCount() && !worksheet.getColVisible(next)) {
                next += 1;
            }
            if (next <= boundary.endColumn) {
                destRange.startColumn = next;
                destRange.endColumn = next;
            } else if (isGoBack) {
                destRange.startColumn = boundary.startColumn;
                destRange.endColumn = boundary.startColumn;

                if (isFindNext) {
                    destRange = findNextRange(destRange, Direction.DOWN, worksheet, boundary, false);
                }
            }
            break;
        default:
            break;
    }

    return destRange;
}

export function findNextGapRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const destRange = { ...startRange };
    const { startRow, startColumn, endRow, endColumn } = getEdgeOfRange(startRange, direction, worksheet);

    let currentPositionHasValue = rangeHasValue(worksheet, startRow, startColumn, endRow, endColumn).hasValue;
    let firstMove = true;
    let shouldContinue = true;

    while (shouldContinue) {
        if (Direction.UP === direction) {
            let next = destRange.startRow - 1;
            while (next > -1 && !worksheet.getRowVisible(next)) {
                next -= 1;
            }
            if (next === -1) {
                shouldContinue = false;
                break;
            }

            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                next,
                destRange.startColumn,
                next,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    // update searching ranges
                    let min = next;
                    matrix.forValue((row) => {
                        min = Math.min(row, min);
                    });
                    destRange.startRow = min;
                } else {
                    destRange.startRow = next;
                }

                destRange.endRow = destRange.startRow;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.DOWN === direction) {
            let next = destRange.endRow + 1;
            while (next < worksheet.getRowCount() && !worksheet.getRowVisible(next)) {
                next += 1;
            }
            if (next === worksheet.getRowCount()) {
                shouldContinue = false;
                break;
            }

            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                next,
                destRange.startColumn,
                next,
                destRange.endColumn
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let max = next;
                    matrix.forValue((row, _, value) => {
                        max = Math.max(row + (value.rowSpan || 1) - 1, max);
                    });
                    destRange.endRow = max;
                } else {
                    destRange.endRow = next;
                }

                destRange.startRow = destRange.endRow;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.LEFT === direction) {
            let next = destRange.startColumn - 1;
            while (next > -1 && !worksheet.getColVisible(next)) {
                next -= 1;
            }
            if (next === -1) {
                shouldContinue = false;
                break;
            }

            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                destRange.startRow,
                next,
                destRange.endRow,
                next
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let min = next;
                    matrix.forValue((_, col) => {
                        min = Math.min(col, min);
                    });
                    destRange.startColumn = min;
                } else {
                    destRange.startColumn = next;
                }

                destRange.endColumn = destRange.startColumn;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }

        if (Direction.RIGHT === direction) {
            let next = destRange.endColumn + 1;
            while (next < worksheet.getColumnCount() && !worksheet.getColVisible(next)) {
                next += 1;
            }

            if (next === worksheet.getColumnCount()) {
                shouldContinue = false;
                break;
            }

            const { hasValue: nextRangeHasValue, matrix } = rangeHasValue(
                worksheet,
                destRange.startRow,
                next,
                destRange.endRow,
                next
            );

            if (currentPositionHasValue && !nextRangeHasValue && !firstMove) {
                shouldContinue = false;
                break;
            } else {
                if (matrix.getLength() !== 0) {
                    let max = next;
                    matrix.forValue((_, col, value) => {
                        max = Math.max(col + (value.colSpan || 1) - 1, max);
                    });
                    destRange.endColumn = max;
                } else {
                    destRange.endColumn = next;
                }

                destRange.startColumn = destRange.endColumn;

                if (!currentPositionHasValue && nextRangeHasValue) {
                    shouldContinue = false;
                    break;
                }

                currentPositionHasValue = nextRangeHasValue;
                firstMove = false;
            }
        }
    }

    return alignToMergedCellsBorders(destRange, worksheet, true);
}

export function findNextRangeExpand(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    return findNextRange(startRange, direction, worksheet, undefined, false, 1, false);
}

export function expandToNextGapRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const next = findNextGapRange(startRange, direction, worksheet);
    return alignToMergedCellsBorders(Rectangle.union(next, startRange), worksheet, true);
}

export function expandToNextCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    const next = findNextRangeExpand(startRange, direction, worksheet);
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
export function shrinkToNextGapRange(
    startRange: IRange,
    anchorRange: IRange,
    direction: Direction,
    worksheet: Worksheet
): IRange {
    // use `moveToNextGapCell` reversely to get the next going to cell
    const reversedDirection = getReverseDirection(direction);
    const nextGap = findNextGapRange(getEdgeOfRange(startRange, reversedDirection, worksheet), direction, worksheet);

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
    return Rectangle.union(Rectangle.clone(anchorRange), nextGap);
}

/**
 * This function is considered as a reversed operation of `expandToNextCell` but there are some slightly differences.
 * @param startRange
 * @param direction
 * @param worksheet
 */
export function shrinkToNextCell(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    // use `moveToNextCell` reversely to get the next going to range
    const reversedDirection = getReverseDirection(direction);
    const shrinkFromEdge = getEdgeOfRange(startRange, reversedDirection, worksheet);
    const otherEdge = getEdgeOfRange(startRange, direction, worksheet);
    const next = findNextRangeExpand(shrinkFromEdge, direction, worksheet);
    return alignToMergedCellsBorders(Rectangle.union(otherEdge, next), worksheet, false);
}

export function expandToWholeSheet(worksheet: Worksheet): IRange {
    // DEBT: RANGE_TYPE.ALL should not use startRow, startColumn, endRow, endColumn
    return {
        startRow: 0,
        startColumn: 0,
        endRow: worksheet.getRowCount() - 1,
        endColumn: worksheet.getColumnCount() - 1,
        rangeType: RANGE_TYPE.ALL,
    };
}

function getEdgeOfRange(startRange: IRange, direction: Direction, worksheet: Worksheet): IRange {
    let destRange: IRange;
    switch (direction) {
        case Direction.UP:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.startRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };

            break;
        case Direction.DOWN:
            destRange = {
                startRow: startRange.endRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
            break;
        case Direction.LEFT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.startColumn,
                endRow: startRange.endRow,
                endColumn: startRange.startColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
            break;
        case Direction.RIGHT:
            destRange = {
                startRow: startRange.startRow,
                startColumn: startRange.endColumn,
                endRow: startRange.endRow,
                endColumn: startRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
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
): { hasValue: boolean; matrix: ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }> } {
    let hasValue = false;

    const matrix = worksheet.getMatrixWithMergedCells(row, col, rowEnd, colEnd).forValue((_, __, value) => {
        if (cellHasValue(value)) {
            hasValue = true;
            return false; // stop looping
        }
    });

    return {
        hasValue,
        matrix,
    };
}

export function getStartRange(range: IRange, primary: Nullable<ISelectionCell>, direction: Direction): IRange {
    const ret = Rectangle.clone(range);

    if (primary == null) {
        return ret;
    }

    switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
            ret.startColumn = ret.endColumn = primary.actualColumn;
            break;
        case Direction.LEFT:
        case Direction.RIGHT:
            ret.startRow = ret.endRow = primary.actualRow;
            break;
    }

    return ret;
}

export function checkIfShrink(selection: ISelection, direction: Direction, worksheet: Worksheet): boolean {
    const { primary, range } = selection;

    const startRange: IRange = Rectangle.clone(range);
    switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
            startRange.startRow = primary?.startRow ?? range.startRow;
            startRange.endRow = primary?.endRow ?? range.startRow;
            break;
        case Direction.LEFT:
        case Direction.RIGHT:
            startRange.startColumn = primary?.startColumn ?? range.startColumn;
            startRange.endColumn = primary?.endColumn ?? range.startColumn;
            break;
    }

    const anchorRange = getEdgeOfRange(startRange, direction, worksheet);
    switch (direction) {
        case Direction.DOWN:
            return range.startRow < anchorRange.startRow;
        case Direction.UP:
            return range.endRow > anchorRange.endRow;
        case Direction.LEFT:
            return anchorRange.endColumn < range.endColumn;
        case Direction.RIGHT:
            return anchorRange.startColumn > range.startColumn;
    }
}

/**
 * Determine whether the entire row is selected
 * @param allRowRanges Range of all rows
 * @param ranges Range of selected rows
 * @returns Whether the entire row is selected
 */
export function isAllRowsCovered(allRowRanges: IRange[], ranges: IRange[]): boolean {
    // Find the minimum start point and maximum end point in all row ranges
    let start = allRowRanges[0].startRow;
    let end = allRowRanges[0].endRow;
    allRowRanges.forEach((range) => {
        const { startRow, endRow } = range;
        start = Math.min(start, startRow);
        end = Math.max(end, endRow);
    });

    const covered = new Array(end - start + 1).fill(false);

    // Mark true in ranges
    ranges.forEach((range) => {
        const { startRow, endRow } = range;
        for (let i = Math.max(startRow, start); i <= Math.min(endRow, end); i++) {
            covered[i - start] = true;
        }
    });

    // Check if every range in allRowRanges is covered
    return allRowRanges.every((range) => {
        const { startRow, endRow } = range;
        for (let i = startRow; i <= endRow; i++) {
            if (!covered[i - start]) {
                return false;
            }
        }
        return true;
    });
}

/**
 * Determine whether the entire column is selected
 * @param allColumnRanges Range of all columns
 * @param ranges Range of selected columns
 * @returns Whether the entire column is selected
 */
export function isAllColumnsCovered(allColumnRanges: IRange[], ranges: IRange[]): boolean {
    // Find the minimum start point and maximum end point in all column ranges
    let start = allColumnRanges[0].startColumn;
    let end = allColumnRanges[0].endColumn;
    allColumnRanges.forEach((range) => {
        const { startColumn, endColumn } = range;
        start = Math.min(start, startColumn);
        end = Math.max(end, endColumn);
    });

    const covered = new Array(end - start + 1).fill(false);

    // Mark true in ranges
    ranges.forEach((range) => {
        const { startColumn, endColumn } = range;
        for (let i = Math.max(startColumn, start); i <= Math.min(endColumn, end); i++) {
            covered[i - start] = true;
        }
    });

    // Check if every range in allColumnRanges is covered
    return allColumnRanges.every((range) => {
        const { startColumn, endColumn } = range;
        for (let i = startColumn; i <= endColumn; i++) {
            if (!covered[i - start]) {
                return false;
            }
        }
        return true;
    });
}

export function getMergeableSelectionsByType(type: MergeType, selections: Nullable<IRange[]>): Nullable<IRange[]> {
    if (!selections) return null;
    if (type === MergeType.MergeAll) {
        return selections.filter((selection) => {
            if (selection.startRow === selection.endRow && selection.startColumn === selection.endColumn) {
                return false;
            }
            return true;
        });
    } else if (type === MergeType.MergeVertical) {
        return selections.filter((selection) => {
            if (selection.startRow === selection.endRow) {
                return false;
            }
            return true;
        });
    } else if (type === MergeType.MergeHorizontal) {
        return selections.filter((selection) => {
            if (selection.startColumn === selection.endColumn) {
                return false;
            }
            return true;
        });
    }

    return selections;
}

function cellHasValue(cell: ICellData): boolean {
    return (cell.v !== undefined && cell.v !== null && cell.v !== '') || cell.p !== undefined;
}
