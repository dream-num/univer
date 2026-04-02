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
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '@univerjs/sheets';
import type { ISheetDrawingPosition } from '../services/sheet-drawing.service';
import { convertPositionSheetOverGridToAbsolute } from '@univerjs/sheets';

export function drawingPositionToTransform(position: ISheetDrawingPosition, sheetSkeletonParam: Nullable<ISheetSkeletonManagerParam>): Nullable<ITransformState> {
    if (!sheetSkeletonParam) return;

    const { unitId, sheetId, skeleton } = sheetSkeletonParam;
    const { from, to, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = position;
    const absolutePosition = convertPositionSheetOverGridToAbsolute(unitId, sheetId, { from, to }, skeleton);

    let { left, top, width, height } = absolutePosition;

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
export function transformToDrawingPosition(transform: ITransformState, skeleton: SpreadsheetSkeleton): ISheetDrawingPosition {
    const { left = 0, top = 0, width = 0, height = 0, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = transform;
    const startSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left, top);
    const endSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left + width, top + height);

    return {
        flipY,
        flipX,
        angle,
        skewX,
        skewY,
        from: startSelectionCell,
        to: endSelectionCell,
    };
}

/**
 * In excel, the basic drawing with rotate bound use major axis switch, axis-aligned bound will bu used.That means the position bound of drawing element will save as nearly axis-aligned rectangle.
 * Here is the rule to convert transform to axis-aligned position:
 * [-45°, 45°):  use the original bound
 * [45°, 135°): rotate the bound 90° clockwise,and the left, top, bottom,right will use the rotated bound.
 * [135°, 225°): use the original bound
 * [225°, 315°): rotate the bound 90° counterclockwise, and the left, top, bottom, right will use the rotated bound.
 * @return The axis-aligned position of the drawing element.
 */
export function transformToAxisAlignPosition(transform: ITransformState, skeleton: SpreadsheetSkeleton): ISheetDrawingPosition {
    const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = transform;

    const norm = ((angle % 360) + 360) % 360;

    const useSwappedAxis =
        (norm >= 45 && norm < 135) ||
        (norm >= 225 && norm < 315);

    if (!useSwappedAxis) {
        return transformToDrawingPosition(transform, skeleton);
    }

    const rotatedTransform = {
        ...transform,
        left: left + width / 2 - height / 2,
        top: top + height / 2 - width / 2,
        width: height,
        height: width,
    };

    return transformToDrawingPosition(rotatedTransform, skeleton);
}
