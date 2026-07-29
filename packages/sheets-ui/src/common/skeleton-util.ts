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

import type { SpreadsheetRenderSkeleton } from '../components/sheets/sheet.render-skeleton';
import type { ICellWithCoord, IRange, IRangeWithCoord, ISelectionCell } from '@univerjs/core';

import type { ISelectionWithCoord, ISelectionWithStyle } from '@univerjs/sheets';

export function attachRenderRangeWithCoord(skeleton: SpreadsheetRenderSkeleton, range: IRange): IRangeWithCoord {
    const { startRow, startColumn, endRow, endColumn, rangeType } = range;
    const firstRow = Math.min(startRow, endRow);
    const lastRow = Math.max(startRow, endRow);
    const firstColumn = Math.min(startColumn, endColumn);
    const lastColumn = Math.max(startColumn, endColumn);
    const startCell = skeleton.getNoMergeCellWithCoordByIndex(firstRow, firstColumn);
    const endCell = skeleton.getNoMergeCellWithCoordByIndex(lastRow, lastColumn);

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        rangeType,
        startY: startCell.startY,
        endY: endCell.endY,
        startX: startCell.startX,
        endX: endCell.endX,
    };
}

export function attachRenderPrimaryWithCoord(
    skeleton: SpreadsheetRenderSkeleton,
    primary: ISelectionCell
): ICellWithCoord {
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
            startY: startCell.startY,
            endY: endCell.endY,
            startX: startCell.startX,
            endX: endCell.endX,
        },
    };
}

export function attachRenderSelectionWithCoord(
    selection: ISelectionWithStyle,
    skeleton: SpreadsheetRenderSkeleton
): ISelectionWithCoord {
    return {
        rangeWithCoord: attachRenderRangeWithCoord(skeleton, selection.range),
        primaryWithCoord: selection.primary
            ? attachRenderPrimaryWithCoord(skeleton, selection.primary)
            : selection.primary,
        style: selection.style,
    };
}
