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

import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ICellOverGridPosition, ISheetOverGridPosition } from '../basics';
import { precisionTo } from '@univerjs/engine-render';
import { attachRangeWithCoord } from './util';

export function convertPositionSheetOverGridToAbsolute(
    unitId: string,
    subUnitId: string,
    sheetOverGridPosition: ISheetOverGridPosition,
    skeleton: SpreadsheetSkeleton
) {
    const { from, to } = sheetOverGridPosition;
    const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = from;
    const { column: toColumn, columnOffset: toColumnOffset, row: toRow, rowOffset: toRowOffset } = to;

    const startSelectionCell = attachRangeWithCoord(skeleton, {
        startColumn: fromColumn,
        endColumn: fromColumn,
        startRow: fromRow,
        endRow: fromRow,
    });

    const endSelectionCell = attachRangeWithCoord(skeleton, {
        startColumn: toColumn,
        endColumn: toColumn,
        startRow: toRow,
        endRow: toRow,
    });

    const { startX: startSelectionX, startY: startSelectionY } = startSelectionCell;

    const { startX: endSelectionX, startY: endSelectionY } = endSelectionCell;

    const left = precisionTo(startSelectionX + fromColumnOffset, 1);
    const top = precisionTo(startSelectionY + fromRowOffset, 1);

    let width = precisionTo(endSelectionX + toColumnOffset - left, 1);
    let height = precisionTo(endSelectionY + toRowOffset - top, 1);

    if (startSelectionCell.startX === endSelectionCell.endX) {
        width = 0;
    }

    if (startSelectionCell.startY === endSelectionCell.endY) {
        height = 0;
    }

    return {
        unitId,
        subUnitId,
        left,
        top,
        width,
        height,
    };
}

export function convertPositionCellToSheetOverGrid(
    unitId: string,
    subUnitId: string,
    cellOverGridPosition: ICellOverGridPosition,
    width: number,
    height: number,
    skeleton: SpreadsheetSkeleton
) {
    const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = cellOverGridPosition;

    const startSelectionCell = attachRangeWithCoord(skeleton, {
        startColumn: fromColumn,
        endColumn: fromColumn,
        startRow: fromRow,
        endRow: fromRow,
    });

    const { startX: startSelectionX, startY: startSelectionY } = startSelectionCell;

    const left = precisionTo(startSelectionX + fromColumnOffset, 1);
    const top = precisionTo(startSelectionY + fromRowOffset, 1);

    const endSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left + width, top + height);

    return {
        unitId,
        subUnitId,
        sheetTransform: {
            from: {
                column: fromColumn,
                columnOffset: fromColumnOffset,
                row: fromRow,
                rowOffset: fromRowOffset,
            },
            to: endSelectionCell,
        },
        transform: {
            left,
            top,
            width,
            height,
        },
    };
}
