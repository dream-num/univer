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

import type { DrawingType, IDrawingParam } from '@univerjs/core';
import type { IUnitDrawingService } from '@univerjs/drawing';
import type { ISheetDrawing } from '../services/sheet-drawing.service';
import { DrawingTypeEnum } from '@univerjs/core';
import { resolveDrawingRotateEnabled } from '@univerjs/drawing';

export function isKnownSheetNonRotatableDrawingType(drawingType: DrawingType): boolean {
    return drawingType === DrawingTypeEnum.DRAWING_CHART;
}

export function resolveSheetDrawingRotateEnabled(
    drawing: IDrawingParam,
    drawingService: Pick<IUnitDrawingService<ISheetDrawing>, 'getDrawingsByGroup'>,
    getChildren?: (drawing: IDrawingParam) => readonly IDrawingParam[] | null | undefined
): boolean {
    return resolveDrawingRotateEnabled(drawing, {
        getChildren: (current) => getChildren?.(current) ?? drawingService.getDrawingsByGroup(current),
        isKnownNonRotatableType: isKnownSheetNonRotatableDrawingType,
    });
}
