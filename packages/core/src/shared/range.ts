/**
 * Copyright 2023-present DreamNum Inc.
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

import { AbsoluteRefType } from '../sheets/typedef';
import { Rectangle } from './rectangle';
import type { IRange } from '../sheets/typedef';

export function moveRangeByOffset(range: IRange, refOffsetX: number, refOffsetY: number, ignoreAbsolute = false): IRange {
    let newRange = { ...range };

    const startAbsoluteRefType = newRange.startAbsoluteRefType || AbsoluteRefType.NONE;
    const endAbsoluteRefType = newRange.endAbsoluteRefType || AbsoluteRefType.NONE;

    if (!ignoreAbsolute && startAbsoluteRefType === AbsoluteRefType.ALL && endAbsoluteRefType === AbsoluteRefType.ALL) {
        return newRange;
    }

    if (ignoreAbsolute || (startAbsoluteRefType === AbsoluteRefType.NONE && endAbsoluteRefType === AbsoluteRefType.NONE)) {
        return Rectangle.moveOffset(newRange, refOffsetX, refOffsetY);
    }

    if (startAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, startRow: newRange.startRow + refOffsetY, startColumn: newRange.startColumn + refOffsetX };
    } else if (startAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, startRow: newRange.startRow + refOffsetY };
    } else if (startAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, startColumn: newRange.startColumn + refOffsetX };
    }

    if (endAbsoluteRefType === AbsoluteRefType.NONE) {
        newRange = { ...newRange, endRow: newRange.endRow + refOffsetY, endColumn: newRange.endColumn + refOffsetX };
    } else if (endAbsoluteRefType === AbsoluteRefType.COLUMN) {
        newRange = { ...newRange, endRow: newRange.endRow + refOffsetY };
    } else if (endAbsoluteRefType === AbsoluteRefType.ROW) {
        newRange = { ...newRange, endColumn: newRange.endColumn + refOffsetX };
    }

    return newRange;
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

    // Create grid cells based on unique boundaries
    const gridCells: IRange[] = [];
    for (let i = 0; i < sortedRows.length - 1; i++) {
        for (let j = 0; j < sortedColumns.length - 1; j++) {
            gridCells.push({
                startColumn: sortedColumns[j],
                endColumn: sortedColumns[j + 1] - 1,
                startRow: sortedRows[i],
                endRow: sortedRows[i + 1] - 1,
            });
        }
    }

    // Assign original ranges to the grid cells
    const result: IRange[] = [];
    for (const gridCell of gridCells) {
        for (const range of ranges) {
            if (range.startRow <= gridCell.endRow && range.endRow >= gridCell.startRow &&
                range.startColumn <= gridCell.endColumn && range.endColumn >= gridCell.startColumn) {
                result.push({
                    startColumn: Math.max(gridCell.startColumn, range.startColumn),
                    endColumn: Math.min(gridCell.endColumn, range.endColumn),
                    startRow: Math.max(gridCell.startRow, range.startRow),
                    endRow: Math.min(gridCell.endRow, range.endRow),
                });
                break; // No need to check other ranges for this grid cell
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
    // return horizontalMerged;
}

