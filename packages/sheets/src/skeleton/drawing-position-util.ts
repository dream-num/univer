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
import { precisionTo } from '@univerjs/engine-render';
import type { ICellOverGridPosition, ISheetOverGridPosition } from '../basics';
import { attachRangeWithCoord } from './util';

/**
 * A positive anchor offset stops at the cell's far edge. The stored offset stays unchanged.
 */
function offsetInsideCell(offset: number, cellSize: number): number {
    if (!(offset > 0)) {
        return offset;
    }
    if (!(cellSize > 0)) {
        return 0;
    }
    return Math.min(offset, cellSize);
}

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

    const fromColumnOffsetInCell = offsetInsideCell(fromColumnOffset, startSelectionCell.endX - startSelectionX);
    const fromRowOffsetInCell = offsetInsideCell(fromRowOffset, startSelectionCell.endY - startSelectionY);
    const toColumnOffsetInCell = offsetInsideCell(toColumnOffset, endSelectionCell.endX - endSelectionX);
    const toRowOffsetInCell = offsetInsideCell(toRowOffset, endSelectionCell.endY - endSelectionY);

    const left = precisionTo(startSelectionX + fromColumnOffsetInCell, 1);
    const top = precisionTo(startSelectionY + fromRowOffsetInCell, 1);

    let width = precisionTo(endSelectionX + toColumnOffsetInCell - left, 1);
    let height = precisionTo(endSelectionY + toRowOffsetInCell - top, 1);

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

    const columnOffsetInCell = offsetInsideCell(fromColumnOffset, startSelectionCell.endX - startSelectionX);
    const rowOffsetInCell = offsetInsideCell(fromRowOffset, startSelectionCell.endY - startSelectionY);

    const left = precisionTo(startSelectionX + columnOffsetInCell, 1);
    const top = precisionTo(startSelectionY + rowOffsetInCell, 1);

    const endSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left + width, top + height, 1, 1, { x: 0, y: 0 });

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
