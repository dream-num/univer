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

import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { IImageData } from '@univerjs/drawing';
import { DrawingTypeEnum, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocImageCropUpdates } from '../doc-drawing-crop';

function drawing(): IDocDrawing {
    return {
        unitId: 'doc',
        subUnitId: 'doc',
        drawingId: 'note-image',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        layoutType: PositionedObjectLayoutType.INLINE,
        transform: { left: 40, top: 600, width: 100, height: 40 },
        docTransform: {
            angle: 0,
            size: { width: 150, height: 60 },
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 40 },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 600 },
        },
    };
}

describe('document image crop updates', () => {
    it('does not turn an uncropped transformer notification into a second size mutation', () => {
        const image = drawing();
        const notification = { ...image, srcRect: undefined } as IImageData;
        expect(getDocImageCropUpdates(notification, image, notification)).toEqual([]);
        expect(image.docTransform.size).toEqual({ width: 150, height: 60 });
    });

    it('persists a real crop and permits an explicit reset without moving an inline anchor', () => {
        const image = drawing();
        const renderImage = image as IImageData;
        const crop = { left: 10, right: 10, top: 4, bottom: 4 };
        expect(getDocImageCropUpdates({
            ...renderImage,
            srcRect: crop,
            transform: { left: 50, top: 604, width: 80, height: 32 },
        }, image, renderImage)).toEqual([
            { drawingId: 'note-image', key: 'srcRect', value: crop },
            { drawingId: 'note-image', key: 'size', value: { width: 80, height: 32 } },
        ]);
        expect(getDocImageCropUpdates({ ...renderImage, srcRect: null }, image, renderImage)).toEqual([
            { drawingId: 'note-image', key: 'srcRect', value: null },
            { drawingId: 'note-image', key: 'size', value: { width: 100, height: 40 } },
        ]);
    });
});
