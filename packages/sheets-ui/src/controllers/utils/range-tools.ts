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

import type { IRange } from '@univerjs/core';
import type { IDiscreteRange } from '@univerjs/sheets';

interface ILine {
    start: number;
    end: number;
}

function groupConsecutive(values: number[], start: number, end: number): ILine[] {
    const groups: ILine[] = [];
    for (let index = start; index <= end; index++) {
        const value = values[index];
        const previous = groups[groups.length - 1];
        if (previous && value === previous.end + 1) {
            previous.end = value;
        } else {
            groups.push({ start: value, end: value });
        }
    }
    return groups;
}

function projectLine(values: number[], start: number, end: number): ILine | null {
    let low = 0;
    let high = values.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (values[middle] < start) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }
    const first = low;
    if (first === values.length || values[first] > end) {
        return null;
    }

    high = values.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (values[middle] <= end) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }
    return { start: first, end: low - 1 };
}

export function virtualizeDiscreteRanges(ranges: IDiscreteRange[]): {
    ranges: IRange[];
    mapFunc: (row: number, col: number) => { row: number; col: number };
    mapRange: (range: IRange) => IRange[];
    projectRange: (range: IRange) => IRange | null;
} {
    let totalRows: number[] = [];
    let totalCols: number[] = [];
    const totalRanges: IRange[] = [];

    ranges.forEach((r) => {
        // Do not use destructuring, otherwise Maximum call stack size exceeded will occur
        totalRows = totalRows.concat(r.rows);
        totalCols = totalCols.concat(r.cols);
    });

    totalRows = Array.from(new Set(totalRows)).sort((a, b) => a - b);
    totalCols = Array.from(new Set(totalCols)).sort((a, b) => a - b);

    ranges.forEach((r) => {
        totalRanges.push({
            startRow: totalRows.findIndex((row) => row === r.rows[0]),
            endRow: totalRows.findIndex((row) => row === r.rows[r.rows.length - 1]),
            startColumn: totalCols.findIndex((col) => col === r.cols[0]),
            endColumn: totalCols.findIndex((col) => col === r.cols[r.cols.length - 1]),
        });
    });

    return {
        ranges: totalRanges,
        mapFunc: (row, col) => (
            {
                row: totalRows[row],
                col: totalCols[col],
            }
        ),
        mapRange: (range) => {
            const rowGroups = groupConsecutive(totalRows, range.startRow, range.endRow);
            const columnGroups = groupConsecutive(totalCols, range.startColumn, range.endColumn);
            return rowGroups.flatMap((row) => columnGroups.map((column) => ({
                startRow: row.start,
                endRow: row.end,
                startColumn: column.start,
                endColumn: column.end,
            })));
        },
        projectRange: (range) => {
            const row = projectLine(totalRows, range.startRow, range.endRow);
            const column = projectLine(totalCols, range.startColumn, range.endColumn);
            return row && column
                ? { startRow: row.start, endRow: row.end, startColumn: column.start, endColumn: column.end }
                : null;
        },
    };
}
