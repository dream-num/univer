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

import type { IDrawingParam } from '@univerjs/core';
import type { IDocDrawing, IDrawingDocTransform } from '@univerjs/docs-drawing';
import type { IImageData } from '@univerjs/drawing';
import { BooleanNumber, DrawingTypeEnum, PositionedObjectLayoutType } from '@univerjs/core';

export function getDocImageCropUpdates(
    param: IDrawingParam & Partial<IImageData>,
    docDrawing: IDocDrawing | undefined,
    renderDrawing: IDrawingParam | undefined | null
): IDrawingDocTransform[] {
    const { drawingId, transform } = param;
    if (docDrawing?.drawingType !== DrawingTypeEnum.DRAWING_IMAGE || renderDrawing?.transform == null) {
        return [];
    }
    const shapeKeys: Array<'prstGeom' | 'adjustValues'> = ['prstGeom', 'adjustValues'];
    const drawings: IDrawingDocTransform[] = shapeKeys
        .filter((key) => Object.prototype.hasOwnProperty.call(param, key))
        .map((key) => ({ drawingId, key, value: param[key] ?? null }));
    // Transformer updates without crop data already persist size through the transformer controller.
    if (transform == null || param.srcRect === undefined) {
        return drawings;
    }
    const nextTransform = { ...renderDrawing.transform, ...transform };
    drawings.push({ drawingId, key: 'srcRect', value: param.srcRect });

    if (nextTransform.width != null && nextTransform.height != null) {
        drawings.push({
            drawingId,
            key: 'size',
            value: { width: nextTransform.width, height: nextTransform.height },
        });
    }

    if (docDrawing.layoutType === PositionedObjectLayoutType.INLINE || renderDrawing.isMultiTransform === BooleanNumber.TRUE) {
        return drawings;
    }

    const horizontalDelta = (nextTransform.left ?? 0) - (renderDrawing.transform.left ?? 0);
    const verticalDelta = (nextTransform.top ?? 0) - (renderDrawing.transform.top ?? 0);
    const { positionH, positionV } = docDrawing.docTransform;

    if (horizontalDelta !== 0 && positionH.posOffset != null) {
        drawings.push({
            drawingId,
            key: 'positionH',
            value: { relativeFrom: positionH.relativeFrom, posOffset: positionH.posOffset + horizontalDelta },
        });
    }
    if (verticalDelta !== 0 && positionV.posOffset != null) {
        drawings.push({
            drawingId,
            key: 'positionV',
            value: { relativeFrom: positionV.relativeFrom, posOffset: positionV.posOffset + verticalDelta },
        });
    }

    return drawings;
}
