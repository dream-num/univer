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
import {
    SetColHiddenCommand,
    SetRowHiddenCommand,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
    SheetSkeletonService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ISheetDrawingPlacement } from '../sheet-drawing-placement';
import type { ISheetDrawing } from '../sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import {
    applySheetDrawingPlacement,
    normalizeSheetDrawingPlacement,
    refreshSheetDrawingPlacement,
} from '../sheet-drawing-placement';
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

    it.each([true, false])('restores a fully collapsed two-cell drawing after hiding rows=%s', async (rows) => {
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const sheetTransform = {
            from: { row: 1, column: 1, rowOffset: 6, columnOffset: 12 },
            to: { row: 4, column: 4, rowOffset: 8, columnOffset: 16 },
        };
        const drawing = applySheetDrawingPlacement({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'image',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
        } as ISheetDrawing, { kind: SheetDrawingAnchorType.Both, ...sheetTransform }, skeleton);
        const params = {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{
                startRow: rows ? 1 : 0,
                endRow: rows ? 4 : 19,
                startColumn: rows ? 0 : 1,
                endColumn: rows ? 19 : 4,
            }],
        };
        expect(await bed.commandService.executeCommand(rows ? SetRowHiddenCommand.id : SetColHiddenCommand.id, params))
            .toBe(true);
        skeleton.makeDirty(true);
        skeleton.calculate();
        const hidden = refreshSheetDrawingPlacement(drawing, skeleton);
        expect(hidden.sheetTransform).toEqual(drawing.sheetTransform);
        expect(hidden.transform?.[rows ? 'height' : 'width']).toBe(0);
        expect(refreshSheetDrawingPlacement(hidden, skeleton)).toEqual(hidden);
        expect(await bed.commandService.executeCommand(
            rows ? SetSpecificRowsVisibleCommand.id : SetSpecificColsVisibleCommand.id,
            params
        )).toBe(true);
        skeleton.makeDirty(true);
        skeleton.calculate();
        expect(refreshSheetDrawingPlacement(hidden, skeleton)).toEqual(drawing);
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
