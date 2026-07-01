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
import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { isKnownDrawingUINonRotatableType, resolveDrawingUIRotateEnabled } from '../rotate-enabled';

function createDrawing(drawingType: DrawingTypeEnum): IDrawingParam {
    return {
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        drawingId: 'drawing-1',
        drawingType,
    };
}

describe('drawing-ui rotate-enabled helpers', () => {
    it('uses chart as the default non-rotatable UI drawing type', () => {
        expect(isKnownDrawingUINonRotatableType(DrawingTypeEnum.DRAWING_CHART)).toBe(true);
        expect(resolveDrawingUIRotateEnabled(createDrawing(DrawingTypeEnum.DRAWING_CHART))).toBe(false);
    });

    it('lets callers override known non-rotatable type handling', () => {
        expect(resolveDrawingUIRotateEnabled(createDrawing(DrawingTypeEnum.DRAWING_CHART), {
            isKnownNonRotatableType: () => false,
        })).toBe(true);
    });
});
