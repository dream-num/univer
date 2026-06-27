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
import { DrawingTypeEnum } from '@univerjs/core';

interface IRotateRenderObject {
    transformerConfig?: {
        rotateEnabled?: boolean;
    };
}

export interface IDrawingRotateEnabledResolverOptions {
    getChildren?: (drawing: IDrawingParam) => readonly IDrawingParam[] | null | undefined;
    getRenderObject?: (drawing: IDrawingParam) => IRotateRenderObject | null | undefined;
    isKnownNonRotatableType?: (drawingType: DrawingType) => boolean;
}

function getDrawingKey(drawing: IDrawingParam): string {
    return `${drawing.unitId}\u0000${drawing.subUnitId}\u0000${drawing.drawingId}`;
}

export function resolveDrawingRotateEnabled(
    drawing: IDrawingParam,
    options: IDrawingRotateEnabledResolverOptions = {},
    visiting = new Set<string>()
): boolean {
    const drawingKey = getDrawingKey(drawing);
    if (visiting.has(drawingKey)) {
        return true;
    }

    if (drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP) {
        visiting.add(drawingKey);
        const children = options.getChildren?.(drawing);
        if (children != null) {
            const enabled = children.every((child) => resolveDrawingRotateEnabled(child, options, visiting));
            visiting.delete(drawingKey);
            return enabled;
        }
        visiting.delete(drawingKey);
    }

    if (drawing.transform?.rotateEnabled === false) {
        return false;
    }

    if (options.getRenderObject?.(drawing)?.transformerConfig?.rotateEnabled === false) {
        return false;
    }

    if (options.isKnownNonRotatableType?.(drawing.drawingType)) {
        return false;
    }

    return true;
}
