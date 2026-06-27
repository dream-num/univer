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
import { DrawingTypeEnum } from '@univerjs/core';
import { resolveDrawingRotateEnabled } from '@univerjs/drawing';
import type { ISheetDrawing } from '../services/sheet-drawing.service';

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

export function deriveSheetGroupRotateEnabled(
    parent: IDrawingParam,
    children: readonly IDrawingParam[],
    drawingService: Pick<IUnitDrawingService<ISheetDrawing>, 'getDrawingsByGroup'>
): boolean {
    return resolveSheetDrawingRotateEnabled(parent, drawingService, (drawing) => {
        if (drawing.drawingId === parent.drawingId && drawing.unitId === parent.unitId && drawing.subUnitId === parent.subUnitId) {
            return children;
        }

        return undefined;
    });
}

export function deriveSheetGroupRotateEnabledFromChildren(
    parent: IDrawingParam,
    children: readonly IDrawingParam[]
): boolean {
    return resolveDrawingRotateEnabled(parent, {
        getChildren: (drawing) => {
            if (drawing.drawingId === parent.drawingId && drawing.unitId === parent.unitId && drawing.subUnitId === parent.subUnitId) {
                return children;
            }

            const nestedChildren = children.filter((child) =>
                child.groupId === drawing.drawingId &&
                child.unitId === drawing.unitId &&
                child.subUnitId === drawing.subUnitId
            );

            return nestedChildren.length > 0 ? nestedChildren : undefined;
        },
        isKnownNonRotatableType: isKnownSheetNonRotatableDrawingType,
    });
}

export function withDerivedSheetGroupRotateEnabled<T extends IDrawingParam>(
    parent: T,
    children: readonly IDrawingParam[],
    drawingService: Pick<IUnitDrawingService<ISheetDrawing>, 'getDrawingsByGroup'>
): T {
    return {
        ...parent,
        transform: {
            ...parent.transform,
            rotateEnabled: deriveSheetGroupRotateEnabled(parent, children, drawingService),
        },
    };
}

export function withDerivedSheetGroupRotateEnabledFromChildren<T extends IDrawingParam>(
    parent: T,
    children: readonly IDrawingParam[]
): T {
    return {
        ...parent,
        transform: {
            ...parent.transform,
            rotateEnabled: deriveSheetGroupRotateEnabledFromChildren(parent, children),
        },
    };
}
