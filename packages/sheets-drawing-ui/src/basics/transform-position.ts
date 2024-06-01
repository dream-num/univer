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

import type { ITransformState, Nullable } from '@univerjs/core';
import { precisionTo } from '@univerjs/engine-render';
import type { ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import type { ISelectionRenderService } from '@univerjs/sheets-ui';

export function drawingPositionToTransform(position: ISheetDrawingPosition, selectionRenderService: ISelectionRenderService): Nullable<ITransformState> {
    const { from, to } = position;
    const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = from;
    const { column: toColumn, columnOffset: toColumnOffset, row: toRow, rowOffset: toRowOffset } = to;

    const startSelectionCell = selectionRenderService.attachRangeWithCoord({
        startColumn: fromColumn,
        endColumn: fromColumn,
        startRow: fromRow,
        endRow: fromRow,
    });

    if (startSelectionCell == null) {
        return;
    }

    const endSelectionCell = selectionRenderService.attachRangeWithCoord({
        startColumn: toColumn,
        endColumn: toColumn,
        startRow: toRow,
        endRow: toRow,
    });

    if (endSelectionCell == null) {
        return;
    }

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
        left,
        top,
        width,
        height,
    };
}

// use transform and originSize convert to  ISheetDrawingPosition
export function transformToDrawingPosition(transform: ITransformState, selectionRenderService: ISelectionRenderService): Nullable<ISheetDrawingPosition> {
    const { left = 0, top = 0, width = 0, height = 0 } = transform;

    const startSelectionCell = selectionRenderService.getSelectionCellByPosition(left, top);

    if (startSelectionCell == null) {
        return;
    }

    const from = {
        column: startSelectionCell.actualColumn,
        columnOffset: precisionTo(left - startSelectionCell.startX, 1),
        row: startSelectionCell.actualRow,
        rowOffset: precisionTo(top - startSelectionCell.startY, 1),
    };

    const endSelectionCell = selectionRenderService.getSelectionCellByPosition(left + width, top + height);

    if (endSelectionCell == null) {
        return;
    }

    const to = {
        column: endSelectionCell.actualColumn,
        columnOffset: precisionTo(left + width - endSelectionCell.startX, 1),
        row: endSelectionCell.actualRow,
        rowOffset: precisionTo(top + height - endSelectionCell.startY, 1),
    };

    return {
        from,
        to,
    };
}
