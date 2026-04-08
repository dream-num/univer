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

import type { IDrawingManagerService } from '@univerjs/drawing';
import type { BaseObject, Image } from '@univerjs/engine-render';
import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getUpdateParams } from '../get-update-params';

describe('getUpdateParams', () => {
    it('maps drawing objects back to drawing params and keeps missing objects as null', () => {
        const shapeObject = {
            oKey: 'shape-1',
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            angle: 15,
        } as BaseObject;
        const imageObject = {
            oKey: 'image-1',
            left: 1,
            top: 2,
            width: 3,
            height: 4,
            angle: 5,
            srcRect: {
                left: 6,
                top: 7,
                width: 8,
                height: 9,
            },
        } as unknown as Image;

        const drawingManagerService = {
            getDrawingOKey: (oKey: string) => {
                if (oKey === 'shape-1') {
                    return {
                        unitId: 'unit-1',
                        subUnitId: 'sub-1',
                        drawingId: 'drawing-shape',
                        drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                    };
                }

                if (oKey === 'image-1') {
                    return {
                        unitId: 'unit-1',
                        subUnitId: 'sub-1',
                        drawingId: 'drawing-image',
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    };
                }

                return null;
            },
        } as IDrawingManagerService;

        const result = getUpdateParams(new Map([
            ['shape-1', shapeObject],
            ['missing', { oKey: 'missing' } as BaseObject],
            ['image-1', imageObject],
        ]), drawingManagerService);

        expect(result).toEqual([
            {
                unitId: 'unit-1',
                subUnitId: 'sub-1',
                drawingId: 'drawing-shape',
                drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                transform: {
                    left: 10,
                    top: 20,
                    width: 30,
                    height: 40,
                    angle: 15,
                },
            },
            null,
            {
                unitId: 'unit-1',
                subUnitId: 'sub-1',
                drawingId: 'drawing-image',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    left: 1,
                    top: 2,
                    width: 3,
                    height: 4,
                    angle: 5,
                },
                srcRect: {
                    left: 6,
                    top: 7,
                    width: 8,
                    height: 9,
                },
            },
        ]);
    });
});
