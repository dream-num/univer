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

import type { ICellWithCoord, IRange, IRangeWithCoord, ISelectionCell } from '@univerjs/core';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionWithCoord, ISelectionWithStyle } from '@univerjs/sheets';

/**
 * Add startXY endXY to range, XY are no merge cell position.
 * @param skeleton
 * @param range
 * @returns {IRangeWithCoord}
 */
export function attachRangeWithCoord(skeleton: SpreadsheetSkeleton, range: IRange): IRangeWithCoord {
    const { startRow, startColumn, endRow, endColumn, rangeType } = range;

    // after the selection is moved, it may be stored endRow < startRow or endColumn < startColumn
    // so startCell and endCell need get min value to draw the selection
    const _startRow = endRow < startRow ? endRow : startRow;
    const _endRow = endRow < startRow ? startRow : endRow;

    const _startColumn = endColumn < startColumn ? endColumn : startColumn;
    const _endColumn = endColumn < startColumn ? startColumn : endColumn;

    const startCell = skeleton.getNoMergeCellWithCoordByIndex(_startRow, _startColumn);
    const endCell = skeleton.getNoMergeCellWithCoordByIndex(_endRow, _endColumn);

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        rangeType,
        startY: startCell?.startY || 0,
        endY: endCell?.endY || 0,
        startX: startCell?.startX || 0,
        endX: endCell?.endX || 0,
    };
}

/**
 * Return selection with coord and style from selection, which has range & primary & style.
 * coord are no merge cell position.
 * @param selection
 * @param skeleton
 * @returns {ISelectionWithCoord} selection with coord and style
 */
export function attachSelectionWithCoord(selection: ISelectionWithStyle, skeleton: SpreadsheetSkeleton): ISelectionWithCoord {
    const { range, primary, style } = selection;
    const rangeWithCoord = attachRangeWithCoord(skeleton, range);
    const primaryWithCoord = primary ? attachPrimaryWithCoord(skeleton, primary) : primary;
    return {
        rangeWithCoord,
        primaryWithCoord,
        style,
    } as ISelectionWithCoord;
}

export function attachPrimaryWithCoord(skeleton: SpreadsheetSkeleton, primary: ISelectionCell): ICellWithCoord {
    const { actualRow, actualColumn, isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } = primary;
    const cellPosition = skeleton.getNoMergeCellWithCoordByIndex(actualRow, actualColumn);
    const startCell = skeleton.getNoMergeCellWithCoordByIndex(startRow, startColumn);
    const endCell = skeleton.getNoMergeCellWithCoordByIndex(endRow, endColumn);

    return {
        actualRow,
        actualColumn,
        isMerged,
        isMergedMainCell,
        startX: cellPosition.startX,
        startY: cellPosition.startY,
        endX: cellPosition.endX,
        endY: cellPosition.endY,
        mergeInfo: {
            startRow,
            startColumn,
            endRow,
            endColumn,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        },
    } as ICellWithCoord;
}
