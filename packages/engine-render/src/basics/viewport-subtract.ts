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

export function subtractViewportRange(range1: IRange, range2: IRange): IRange[] {
    // If there is no intersection, return range1.

    if (
        range2.startRow >= range1.endRow ||
        range2.endRow <= range1.startRow ||
        range2.startColumn >= range1.endColumn ||
        range2.endColumn <= range1.startColumn
    ) {
        return [range1];
    }

    const ranges: IRange[] = [];

    // top
    if (range2.startRow > range1.startRow) {
        ranges.push({
            startRow: range1.startRow,
            startColumn: range1.startColumn,
            endRow: range2.startRow,
            endColumn: range1.endColumn,
        });
    }

    // bottom
    if (range2.endRow < range1.endRow) {
        ranges.push({
            startRow: range2.endRow,
            startColumn: range1.startColumn,
            endRow: range1.endRow,
            endColumn: range1.endColumn,
        });
    }

    // left
    const topBoundary = Math.max(range1.startRow, range2.startRow);
    const bottomBoundary = Math.min(range1.endRow, range2.endRow);

    if (range2.startColumn > range1.startColumn) {
        ranges.push({
            startRow: topBoundary,
            startColumn: range1.startColumn,
            endRow: bottomBoundary,
            endColumn: range2.startColumn,
        });
    }

    // right
    if (range2.endColumn < range1.endColumn) {
        ranges.push({
            startRow: topBoundary,
            startColumn: range2.endColumn,
            endRow: bottomBoundary,
            endColumn: range1.endColumn,
        });
    }

    return ranges;
}
