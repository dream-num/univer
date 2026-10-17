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

import type { ISheetDrawingPlacement } from '../sheet-drawing-placement';
import type { ISheetDrawing } from '../sheet-drawing.service';
import { DrawingTypeEnum } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { applySheetDrawingPlacement, normalizeSheetDrawingPlacement } from '../sheet-drawing-placement';
import { SheetDrawingAnchorType } from '../sheet-drawing.service';

describe('sheet drawing placement extents', () => {
    let bed: ReturnType<typeof createSheetsDrawingTestBed>;
    beforeEach(() => {
        bed = createSheetsDrawingTestBed();
    });
    afterEach(() => bed.univer.dispose());

    it.each([
        [0, 81.9],
        [81.9, 0],
    ])('preserves a line bounding box of %s by %s in every anchor mode', (width, height) => {
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const from = { row: 2, column: 2, rowOffset: 0, columnOffset: 0 };
        const to = { ...from, rowOffset: height, columnOffset: width };
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'line',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            sheetTransform: { from, to },
            axisAlignSheetTransform: { from, to },
            transform: { left: 200, top: 100, width, height },
        };
        const placements: ISheetDrawingPlacement[] = [
            { kind: SheetDrawingAnchorType.None, left: 200, top: 100, width, height },
            { kind: SheetDrawingAnchorType.Position, from, width, height },
            { kind: SheetDrawingAnchorType.Both, from, to },
        ];
        for (const placement of placements) {
            const result = applySheetDrawingPlacement(drawing, placement, skeleton);
            expect(result.transform).toMatchObject({ width, height });
            expect(result.anchorType).toBe(placement.kind);
            for (const drawingType of [DrawingTypeEnum.DRAWING_IMAGE, DrawingTypeEnum.DRAWING_DOM]) {
                expect(() => applySheetDrawingPlacement({ ...drawing, drawingType }, placement, skeleton))
                    .toThrow('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
            }
        }
    });

    it.each([[0, 0], [-1, 20], [20, -1], [NaN, 20], [20, Infinity]])(
        'rejects an invalid extent of %s by %s',
        (width, height) => {
            expect(() => normalizeSheetDrawingPlacement({
                kind: SheetDrawingAnchorType.None,
                left: 0,
                top: 0,
                width,
                height,
            })).toThrow('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
        }
    );
});
