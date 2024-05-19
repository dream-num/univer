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
import type { ISheetDrawingPosition } from '@univerjs/sheets';
import type { ISelectionRenderService } from '@univerjs/sheets-ui';

export function transformImagePositionToTransform(position: ISheetDrawingPosition, selectionRenderService: ISelectionRenderService): Nullable<ITransformState> {
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

    const left = startSelectionX + fromColumnOffset;
    const top = startSelectionY + fromRowOffset;

    const width = endSelectionX + toColumnOffset - left;
    const height = endSelectionY + toRowOffset - top;

    return {
        left,
        top,
        width,
        height,
    };
}
