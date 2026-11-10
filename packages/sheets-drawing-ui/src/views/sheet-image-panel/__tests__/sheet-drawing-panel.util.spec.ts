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

import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { isSheetDrawing } from '../sheet-drawing-panel.util';

describe('isSheetDrawing', () => {
    const image = {
        unitId: 'workbook',
        subUnitId: 'sheet',
        drawingId: 'image',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
    };
    const sheetTransform = {
        from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
        to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
    };

    it('accepts an imported image with cell anchors and no axis alignment data', () => {
        const drawing = { ...image, sheetTransform };
        expect(isSheetDrawing(drawing)).toBe(true);
    });

    it('accepts an inserted image with cell anchors and axis alignment data', () => {
        const drawing = { ...image, sheetTransform, axisAlignSheetTransform: sheetTransform };
        expect(isSheetDrawing(drawing)).toBe(true);
    });

    it('rejects images without cell anchors and an empty selection', () => {
        expect(isSheetDrawing(image)).toBe(false);
        expect(isSheetDrawing(undefined)).toBe(false);
        const drawing = { ...image, sheetTransform: undefined };
        expect(isSheetDrawing(drawing)).toBe(false);
    });
});
