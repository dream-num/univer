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

import type { IRange } from '../sheets/typedef';
import type { Nullable } from './types';
import { AbsoluteRefType, RANGE_TYPE } from '../sheets/typedef';
import { Rectangle } from './rectangle';

export function moveRangeByOffset(range: IRange, refOffsetX: number, refOffsetY: number, ignoreAbsolute = false): IRange {
    if (refOffsetX === 0 && refOffsetY === 0) {
        return range;
    }

    let newRange = { ...range };

    const startAbsoluteRefType = newRange.startAbsoluteRefType || AbsoluteRefType.NONE;
    const endAbsoluteRefType = newRange.endAbsoluteRefType || AbsoluteRefType.NONE;

    const rangeType = newRange.rangeType || RANGE_TYPE.NORMAL;

    if (!ignoreAbsolute && startAbsoluteRefType === AbsoluteRefType.ALL && endAbsoluteRefType === AbsoluteRefType.ALL) {
        return newRange;
    }

    const start = moveRangeByRangeType(newRange.startRow, refOffsetY, newRange.startColumn, refOffsetX, rangeType);
    const end = moveRangeByRangeType(newRange.endRow, refOffsetY, newRange.endColumn, refOffsetX, rangeType);

    if (ignoreAbsolute || (startAbsoluteRefType === AbsoluteRefType.NONE && endAbsoluteRefType === AbsoluteRefType.NONE)) {
        return newRange = {
            ...newRange,
            startRow: start.row,
            startColumn: start.column,
            endRow: end.row,
            endColumn: end.column,
        };
    }

    if (startAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, startRow: start.row, startColumn: start.column };
    } else if (startAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, startRow: start.row };
    } else if (startAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, startColumn: start.column };
    }

    if (endAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, endRow: end.row, endColumn: end.column };
    } else if (endAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, endRow: end.row };
    } else if (endAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, endColumn: end.column };
    }

    return newRange;
}

function moveRangeByRangeType(row: number, rowOffset: number, column: number, columnOffset: number, rangeType: RANGE_TYPE): { row: number; column: number } {
    if (rangeType === RANGE_TYPE.NORMAL) {
        return { row: row + rowOffset, column: column + columnOffset };
    } else if (rangeType === RANGE_TYPE.ROW) {
        return { row: row + rowOffset, column };
    } else if (rangeType === RANGE_TYPE.COLUMN) {
        return { row, column: column + columnOffset };
    } else {
        return { row, column };
    }
}

/**
 * Split ranges into aligned smaller ranges
 * @param ranges no overlap ranges
 * @returns aligned smaller ranges
 */
export function splitIntoGrid(ranges: IRange[]): IRange[] {
    const columns: Set<number> = new Set();
    const rows: Set<number> = new Set();

    // Extract unique column and row boundaries
    for (const range of ranges) {
        columns.add(range.startColumn);
        columns.add(range.endColumn + 1); // Include boundary right after the end
        rows.add(range.startRow);
        rows.add(range.endRow + 1); // Include boundary right after the end
    }

    // Convert sets to sorted arrays
    const sortedColumns = Array.from(columns).sort((a, b) => a - b);
    const sortedRows = Array.from(rows).sort((a, b) => a - b);

     // Sort ranges by startRow and startColumn
    ranges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);

     // Assign original ranges to the grid cells
    const result: IRange[] = [];
    for (let i = 0; i < sortedRows.length - 1; i++) {
        for (let j = 0; j < sortedColumns.length - 1; j++) {
            // grid cell
            const startColumn = sortedColumns[j];
            const endColumn = sortedColumns[j + 1] - 1;
            const startRow = sortedRows[i];
            const endRow = sortedRows[i + 1] - 1;

            for (const range of ranges) {
                if (range.startRow > endRow) {
                    // Since ranges are sorted, we can break early
                    break;
                }

                // grid cell must be in some range
                // just need to check range is contain grid cell
                if (range.startRow <= startRow && range.endRow >= endRow &&
                    range.startColumn <= startColumn && range.endColumn >= endColumn) {
                    result.push({
                        startColumn,
                        endColumn,
                        startRow,
                        endRow,
                    });
                    break; // No need to check other ranges for this grid cell
                }
            }
        }
    }

    return result;
}

/**
 * Horizontal Merging
 * @param ranges no overlap ranges
 * @returns merged ranges
 */
export function mergeHorizontalRanges(ranges: IRange[]): IRange[] {
    ranges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn);
    // Step 1: Group ranges by row
    const rowGroups: { [key: number]: IRange[] } = {};

    for (const range of ranges) {
        if (!rowGroups[range.startRow]) {
            rowGroups[range.startRow] = [];
        }
        rowGroups[range.startRow].push(range);
    }

    // Step 2: Merge ranges within each row
    const mergedRanges: IRange[] = [];

    for (const row in rowGroups) {
        const rangesInRow = rowGroups[+row];

        // Sort ranges by starting column
        rangesInRow.sort((a, b) => a.startColumn - b.startColumn);

        // Merge contiguous ranges
        let currentRange = rangesInRow[0];

        for (let i = 1; i < rangesInRow.length; i++) {
            const nextRange = rangesInRow[i];

            if (nextRange.startColumn <= currentRange.endColumn + 1 && nextRange.startRow === currentRange.startRow && nextRange.endRow === currentRange.endRow) {
                // Ranges are contiguous, merge them
                currentRange.endColumn = Math.max(currentRange.endColumn, nextRange.endColumn);
            } else {
                // Ranges are not contiguous, push the current range and start a new range
                mergedRanges.push(currentRange);
                currentRange = nextRange;
            }
        }

        // Push the last range
        mergedRanges.push(currentRange);
    }

    return mergedRanges;
}

/**
 * Vertical Merging
 * @param ranges no overlap ranges
 * @returns merged ranges
 */
export function mergeVerticalRanges(ranges: IRange[]): IRange[] {
    // Step 1: Sort ranges by columns and then by rows
    ranges.sort((a, b) => a.startColumn - b.startColumn || a.startRow - b.startRow);

    const columnGroups: { [key: number]: IRange[] } = {};

    // Group ranges by columns
    for (const range of ranges) {
        if (!columnGroups[range.startColumn]) {
            columnGroups[range.startColumn] = [];
        }
        columnGroups[range.startColumn].push(range);
    }

    // Step 2: Merge ranges within each column
    const mergedRanges: IRange[] = [];

    for (const col in columnGroups) {
        const rangesInCol = columnGroups[+col];

        // Sort ranges by starting row
        rangesInCol.sort((a, b) => a.startRow - b.startRow);

        // Merge contiguous ranges with the same column range
        let currentRange = rangesInCol[0];

        for (let i = 1; i < rangesInCol.length; i++) {
            const nextRange = rangesInCol[i];

            if (nextRange.startRow <= currentRange.endRow + 1 && nextRange.startColumn === currentRange.startColumn && nextRange.endColumn === currentRange.endColumn) {
                // Ranges are contiguous and have the same column range, merge them
                currentRange.endRow = Math.max(currentRange.endRow, nextRange.endRow);
            } else {
                // Ranges are not contiguous or have different column ranges, push the current range and start a new range
                mergedRanges.push(currentRange);
                currentRange = nextRange;
            }
        }

        // Push the last range
        mergedRanges.push(currentRange);
    }

    return mergedRanges;
}
/**
 * Merge no overlap ranges
 * @param ranges no overlap ranges
 * @returns ranges
 */
export function mergeRanges(ranges: IRange[]): IRange[] {
    const split = splitIntoGrid(ranges);
    const horizontalMerged = mergeHorizontalRanges(split);
    return mergeVerticalRanges(horizontalMerged);
}

export function multiSubtractSingleRange(ranges: IRange[], toDelete: IRange) {
    const res: IRange[] = [];
    ranges.forEach((range) => {
        res.push(...Rectangle.subtract(range, toDelete));
    });
    return Rectangle.mergeRanges(res);
};

 /**
  * Computes the intersection of two ranges.
  * If there is an overlap between the two ranges, returns a new range representing the intersection.
  * If there is no overlap, returns null.
  *
  * @param src - The source range.
  * @param target - The target range.
  * @returns The intersected range or null if there is no intersection.
  */
export function getIntersectRange(src: IRange, target: IRange): Nullable<IRange> {
    const rowOverlap = getOverlap1D(
        src.startRow,
        src.endRow,
        target.startRow,
        target.endRow
    );
    const colOverlap = getOverlap1D(
        src.startColumn,
        src.endColumn,
        target.startColumn,
        target.endColumn
    );

    if (!rowOverlap || !colOverlap) {
        return null;
    }

    const [startRow, endRow] = rowOverlap;
    const [startColumn, endColumn] = colOverlap;

    // Determine rangeType based on input rangeTypes and overlaps
    const rangeType = determineRangeType(
        src.rangeType,
        target.rangeType,
        startRow,
        endRow,
        startColumn,
        endColumn
    );

    return {
        startRow,
        endRow,
        startColumn,
        endColumn,
        rangeType,
    };
}

/**
 * Computes the overlap between two one-dimensional ranges.
 * Treats NaN values as unbounded (from -Infinity to +Infinity).
 *
 * @param start1 - The start of the first range (inclusive). NaN indicates unbounded.
 * @param end1 - The end of the first range (exclusive). NaN indicates unbounded.
 * @param start2 - The start of the second range (inclusive). NaN indicates unbounded.
 * @param end2 - The end of the second range (exclusive). NaN indicates unbounded.
 * @returns A tuple containing the start and end of the overlap, or null if there is no overlap.
 */
function getOverlap1D(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): [number, number] | null {
    // Treat NaN as unbounded (-Infinity to +Infinity)
    const s1 = isNaN(start1) ? -Infinity : start1;
    const e1 = isNaN(end1) ? Infinity : end1;
    const s2 = isNaN(start2) ? -Infinity : start2;
    const e2 = isNaN(end2) ? Infinity : end2;

    const start = Math.max(s1, s2);
    const end = Math.min(e1, e2);

    if (start <= end) {
        const resultStart = start === -Infinity ? Number.NaN : start;
        const resultEnd = end === Infinity ? Number.NaN : end;
        return [resultStart, resultEnd];
    } else {
        return null;
    }
}

/**
 * Determines the rangeType of the intersection based on the rangeTypes of the input ranges and the overlap.
 * The logic prioritizes the input rangeTypes and determines the intersection's rangeType accordingly.
 *
 * @param src - The source range.
 * @param target - The target range.
 * @param startRow - The start row of the overlap.
 * @param endRow - The end row of the overlap.
 * @param startColumn - The start column of the overlap.
 * @param endColumn - The end column of the overlap.
 * @returns The rangeType of the intersection.
 */
function determineRangeType(
    srcType: RANGE_TYPE | undefined,
    targetType: RANGE_TYPE | undefined,
    startRow: number,
    endRow: number,
    startColumn: number,
    endColumn: number
): RANGE_TYPE {
    // Default to NORMAL if types are undefined
    const resolvedSrcType = srcType !== undefined ? srcType : inferRangeType(startRow, endRow, startColumn, endColumn);
    const resolvedTargetType = targetType !== undefined ? targetType : inferRangeType(startRow, endRow, startColumn, endColumn);

    if (resolvedSrcType === RANGE_TYPE.ALL || resolvedTargetType === RANGE_TYPE.ALL) {
        // Intersection with ALL results in the other range's type
        if (resolvedSrcType === resolvedTargetType) {
            return resolvedSrcType;
        }
        return resolvedSrcType === RANGE_TYPE.ALL ? resolvedTargetType : resolvedSrcType;
    } else if (resolvedSrcType === resolvedTargetType) {
        // Both ranges have the same type
        return resolvedSrcType;
    } else if (resolvedSrcType === RANGE_TYPE.NORMAL || resolvedTargetType === RANGE_TYPE.NORMAL) {
        // Intersection with NORMAL results in NORMAL
        return RANGE_TYPE.NORMAL;
    } else {
        // Different types (ROW and COLUMN), intersection is NORMAL
        return RANGE_TYPE.NORMAL;
    }
}

/**
 * Infers the rangeType based on whether start and end rows or columns are NaN (unbounded).
 * Determines if the range represents rows, columns, normal range, or all cells.
 *
 * @param startRow - The start row of the range.
 * @param endRow - The end row of the range.
 * @param startColumn - The start column of the range.
 * @param endColumn - The end column of the range.
 * @returns The inferred rangeType.
 */
function inferRangeType(
    startRow: number,
    endRow: number,
    startColumn: number,
    endColumn: number
): RANGE_TYPE {
    const hasRow = !isNaN(startRow) && !isNaN(endRow);
    const hasColumn = !isNaN(startColumn) && !isNaN(endColumn);

    if (hasRow && hasColumn) {
        return RANGE_TYPE.NORMAL;
    } else if (hasRow) {
        return RANGE_TYPE.ROW;
    } else if (hasColumn) {
        return RANGE_TYPE.COLUMN;
    } else {
        return RANGE_TYPE.ALL;
    }
}
