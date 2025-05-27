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

import type { IRange, Nullable, SheetSkeleton, Worksheet } from '@univerjs/core';
import { ObjectMatrix, Range } from '@univerjs/core';

export function getRangesHeight(ranges: IRange[], worksheet: Worksheet) {
    const cellHeights = new ObjectMatrix<number>();
    ranges.map((range) => Range.transformRange(range, worksheet)).forEach((range) => {
        Range.foreach(range, (row, col) => {
            const cellHeight = worksheet.getCellHeight(row, col);
            if (cellHeight) {
                cellHeights.setValue(row, col, cellHeight);
            }
        });
    });

    return cellHeights;
}

const MAX_RANGE_CELL_COUNT = 10_000;

export function getSuitableRangesInView(ranges: IRange[], skeleton: Nullable<SheetSkeleton>): { suitableRanges: IRange[]; remainingRanges: IRange[] } {
    if (!skeleton) {
        return { suitableRanges: ranges, remainingRanges: [] };
    }

    const colCount = skeleton.worksheet.getColumnCount();
    const maxRowCount = Math.ceil(MAX_RANGE_CELL_COUNT / colCount);
    const suitableRanges: IRange[] = [];
    const remainingRanges: IRange[] = [];
    const row = skeleton.getOffsetRelativeToRowCol(0, skeleton.scrollY).row;
    // Calculate the distance between each range and current row, then sort by distance
    const rangesWithDistance = ranges.map((range) => {
        // Calculate the minimum distance between range and current row
        let distance: number;
        if (row >= range.startRow && row <= range.endRow) {
            // Current row is within the range, distance is 0
            distance = 0;
        } else if (row < range.startRow) {
            // Current row is above the range, distance is range.startRow - row
            distance = range.startRow - row;
        } else {
            // Current row is below the range, distance is row - range.endRow
            distance = row - range.endRow;
        }

        return {
            range,
            distance,
            rowCount: range.endRow - range.startRow + 1, // Number of rows in the range
        };
    });

    // Sort by distance, if distance is the same, sort by row count in ascending order
    rangesWithDistance.sort((a, b) => {
        if (a.distance !== b.distance) {
            return a.distance - b.distance;
        }
        return a.rowCount - b.rowCount;
    });

    // Add ranges one by one until total row count reaches MAX_RANGE_HEIGHT
    let totalRowCount = 0;
    for (const item of rangesWithDistance) {
        if (totalRowCount + item.rowCount <= maxRowCount) {
            suitableRanges.push(item.range);
            totalRowCount += item.rowCount;
        } else {
            // If adding current range would exceed the limit, check if there's remaining quota to split the range
            const remainingQuota = maxRowCount - totalRowCount;

            if (remainingQuota > 0) {
                // Split range: add the part that can fit to suitable, add the rest to remaining
                const suitablePart: IRange = {
                    ...item.range,
                    endRow: item.range.startRow + remainingQuota - 1,
                };
                const remainingPart: IRange = {
                    ...item.range,
                    startRow: item.range.startRow + remainingQuota,
                };

                suitableRanges.push(suitablePart);
                remainingRanges.push(remainingPart);
                totalRowCount = maxRowCount; // Reached maximum limit
            } else {
                // No remaining quota, add the entire range to remaining
                remainingRanges.push(item.range);
            }
        }
    }

    return { suitableRanges, remainingRanges };
}
