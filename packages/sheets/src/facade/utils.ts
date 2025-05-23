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

import type { IRange, IRangeWithCoord, Worksheet } from '@univerjs/core';
import {
    HorizontalAlign,
    RANGE_TYPE,
    VerticalAlign,
} from '@univerjs/core';

export type FDefaultAlignment = 'general';
export type FHorizontalAlignment = 'left' | 'center' | 'normal';
export type FVerticalAlignment = 'top' | 'middle' | 'bottom';

/**
 * Transform the Facade API horizontal alignment to the Univer Core horizontal alignment.
 * @param {FHorizontalAlignment} value - The Facade API horizontal alignment.
 * @returns {HorizontalAlign} The Univer Core horizontal alignment.
 */
export function transformFacadeHorizontalAlignment(value: FHorizontalAlignment): HorizontalAlign {
    switch (value) {
        case 'left':
            return HorizontalAlign.LEFT;
        case 'center':
            return HorizontalAlign.CENTER;
        case 'normal':
            return HorizontalAlign.RIGHT;
        default:
            throw new Error(`Invalid horizontal alignment: ${value}`);
    }
}

/**
 * Transform the Univer Core horizontal alignment to the Facade API horizontal alignment.
 * @param {HorizontalAlign} value - The Univer Core horizontal alignment.
 * @returns {FHorizontalAlignment} The Facade API horizontal alignment.
 */
export function transformCoreHorizontalAlignment(value: HorizontalAlign): FHorizontalAlignment | FDefaultAlignment {
    switch (value) {
        case HorizontalAlign.LEFT:
            return 'left';
        case HorizontalAlign.CENTER:
            return 'center';
        case HorizontalAlign.RIGHT:
            return 'normal';
        default:
            return 'general';
    }
}

/**
 * Transform the Facade API vertical alignment to the Univer Core vertical alignment.
 * @param {FVerticalAlignment} value - The Facade API vertical alignment.
 * @returns {VerticalAlign} The Univer Core vertical alignment.
 */
export function transformFacadeVerticalAlignment(value: FVerticalAlignment): VerticalAlign {
    switch (value) {
        case 'top':
            return VerticalAlign.TOP;
        case 'middle':
            return VerticalAlign.MIDDLE;
        case 'bottom':
            return VerticalAlign.BOTTOM;
        default:
            throw new Error(`Invalid vertical alignment: ${value}`);
    }
}

/**
 * Transform the Univer Core vertical alignment to the Facade API vertical alignment.
 * @param {VerticalAlign} value - The Univer Core vertical alignment.
 * @returns {FVerticalAlignment} The Facade API vertical alignment.
 */
export function transformCoreVerticalAlignment(value: VerticalAlign): FVerticalAlignment | FDefaultAlignment {
    switch (value) {
        case VerticalAlign.TOP:
            return 'top';
        case VerticalAlign.MIDDLE:
            return 'middle';
        case VerticalAlign.BOTTOM:
            return 'bottom';
        default:
            return 'general';
    }
}

/**
 * Judge whether the range is merged.
 * @param {IRangeWithCoord} mergeInfo - The merge info.
 * @param {IRange} range - The range.
 * @returns {boolean} Whether the range is merged.
 */
export function isCellMerged(mergeInfo: IRangeWithCoord, range: IRange): boolean {
    if (!isSingleCell(mergeInfo, range)) {
        return false;
    }
    return range.startColumn !== range.endColumn || range.startRow !== range.endRow;
}

/**
 * Judge whether the range is single cell.
 * @param {IRangeWithCoord} mergeInfo - The merge info.
 * @param {IRange} range - The range.
 * @returns {boolean} Whether the range is single cell.
 */
export function isSingleCell(mergeInfo: IRangeWithCoord, range: IRange): boolean {
    return mergeInfo.startColumn === range.startColumn
        && mergeInfo.endColumn === range.endColumn
        && mergeInfo.startRow === range.startRow
        && mergeInfo.endRow === range.endRow;
}

/**
 * Covert the range to row range.
 * @param {IRange} range - The range.
 * @param {Worksheet} worksheet - The worksheet.
 * @returns {IRange} The row range.
 */
export function covertToRowRange(range: IRange, worksheet: Worksheet): IRange {
    return {
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: 0,
        endColumn: worksheet.getColumnCount() - 1,
        rangeType: RANGE_TYPE.ROW,
    };
}

/**
 * Covert the range to column range.
 * @param {IRange} range - The range.
 * @param {Worksheet} worksheet - The worksheet.
 * @returns {IRange} The column range.
 */
export function covertToColRange(range: IRange, worksheet: Worksheet): IRange {
    return {
        startRow: 0,
        endRow: worksheet.getRowCount() - 1,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
        rangeType: RANGE_TYPE.COLUMN,
    };
}
