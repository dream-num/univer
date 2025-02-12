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

import { type IRange, Rectangle, type Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';

export function isSamePosition(range1: IRange, range2: IRange): boolean {
    return range1.startRow === range2.startRow && range1.startColumn === range2.startColumn;
}

/**
 * Tell if `range2` is after (or the same as) `range1` with row direction is at priority.
 * @param range1
 * @param range2
 * @returns
 */
export function isBehindPositionWithRowPriority(range1: IRange, range2: IRange): boolean {
    return (
        range1.startRow < range2.startRow ||
        (range1.startRow === range2.startRow && range1.startColumn <= range2.startColumn)
    );
}

/**
 * Tell if `range2` is after (or the same as) `range1` with column direction is at priority.
 * @param range1
 * @param range2
 * @returns
 */
export function isBehindPositionWithColumnPriority(range1: IRange, range2: IRange): boolean {
    return (
        range1.startColumn < range2.startColumn ||
        (range1.startColumn === range2.startColumn && range1.startRow <= range2.startRow)
    );
}

/**
 * Tell if `range2` is before (or the same as) `range1` with column direction is at priority.
 * @param range1
 * @param range2
 * @returns
 */
export function isBeforePositionWithRowPriority(range1: IRange, range2: IRange): boolean {
    return (
        range1.startRow > range2.startRow ||
        (range1.startRow === range2.startRow && range1.startColumn >= range2.startColumn)
    );
}

export function isBeforePositionWithColumnPriority(range1: IRange, range2: IRange): boolean {
    return (
        range1.startColumn > range2.startColumn ||
        (range1.startColumn === range2.startColumn && range1.startRow >= range2.startRow)
    );
}

export function isSelectionSingleCell(selection: ISelectionWithStyle, worksheet: Worksheet): boolean {
    const { range } = selection;
    const { startRow, startColumn } = range;
    const hasMergedCell = worksheet.getMergedCell(startRow, startColumn);

    if (hasMergedCell) {
        return Rectangle.equals(range, hasMergedCell);
    } else {
        return range.endRow === range.startRow && range.endColumn === range.startColumn;
    }
}
