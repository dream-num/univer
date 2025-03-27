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

import type { ITransformState, Nullable } from '@univerjs/core';
import type { ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import type { ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { precisionTo } from '@univerjs/engine-render';
import { convertPositionSheetOverGridToAbsolute } from '@univerjs/sheets-ui';

export function drawingPositionToTransform(
    position: ISheetDrawingPosition,
    selectionRenderService: ISheetSelectionRenderService,
    sheetSkeletonManagerService: SheetSkeletonManagerService
): Nullable<ITransformState> {
    const { from, to, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = position;
    const skeletonParam = sheetSkeletonManagerService.getCurrent();
    if (skeletonParam == null) {
        return;
    }

    const absolutePosition = convertPositionSheetOverGridToAbsolute(
        skeletonParam.unitId,
        skeletonParam.sheetId,
        { from, to },
        sheetSkeletonManagerService
    );

    let { left, top, width, height } = absolutePosition;

    const skeleton = sheetSkeletonManagerService.getCurrentSkeleton()!;

    // const startSelectionCell = attachRangeWithCoord(skeleton, {
    //     startColumn: fromColumn,
    //     endColumn: fromColumn,
    //     startRow: fromRow,
    //     endRow: fromRow,
    // });

    // if (startSelectionCell == null) {
    //     return;
    // }

    // const endSelectionCell = attachRangeWithCoord(skeleton, {
    //     startColumn: toColumn,
    //     endColumn: toColumn,
    //     startRow: toRow,
    //     endRow: toRow,
    // });

    // if (endSelectionCell == null) {
    //     return;
    // }

    // const { startX: startSelectionX, startY: startSelectionY } = startSelectionCell;

    // const { startX: endSelectionX, startY: endSelectionY } = endSelectionCell;

    // let left = precisionTo(startSelectionX + fromColumnOffset, 1);
    // let top = precisionTo(startSelectionY + fromRowOffset, 1);

    // let width = precisionTo(endSelectionX + toColumnOffset - left, 1);
    // let height = precisionTo(endSelectionY + toRowOffset - top, 1);

    // if (startSelectionCell.startX === endSelectionCell.endX) {
    //     width = 0;
    // }

    // if (startSelectionCell.startY === endSelectionCell.endY) {
    //     height = 0;
    // }

    const sheetWidth = skeleton.rowHeaderWidth + skeleton.columnTotalWidth;
    const sheetHeight = skeleton.columnHeaderHeight + skeleton.rowTotalHeight;

    if ((left + width) > sheetWidth) {
        left = sheetWidth - width;
    }
    if ((top + height) > sheetHeight) {
        top = sheetHeight - height;
    }

    return {
        flipY,
        flipX,
        angle,
        skewX,
        skewY,
        left,
        top,
        width,
        height,
    };
}

// use transform and originSize convert to  ISheetDrawingPosition
export function transformToDrawingPosition(transform: ITransformState, selectionRenderService: ISheetSelectionRenderService): Nullable<ISheetDrawingPosition> {
    const { left = 0, top = 0, width = 0, height = 0, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = transform;

    const startSelectionCell = selectionRenderService.getCellWithCoordByOffset(left, top);

    if (startSelectionCell == null) {
        return;
    }

    const from = {
        column: startSelectionCell.actualColumn,
        columnOffset: precisionTo(left - startSelectionCell.startX, 1),
        row: startSelectionCell.actualRow,
        rowOffset: precisionTo(top - startSelectionCell.startY, 1),
    };

    const endSelectionCell = selectionRenderService.getCellWithCoordByOffset(left + width, top + height);

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
        flipY,
        flipX,
        angle,
        skewX,
        skewY,
        from,
        to,
    };
}
