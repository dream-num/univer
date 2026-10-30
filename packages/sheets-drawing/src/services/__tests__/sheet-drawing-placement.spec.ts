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

import { DrawingTypeEnum, Tools } from '@univerjs/core';
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
    transformDrawingsToChartSheet,
    tryRefreshSheetDrawingPlacement,
} from '../sheet-drawing-placement';
import { SheetDrawingAnchorType } from '../sheet-drawing.service';

describe('sheet drawing placement extents', () => {
    let bed: ReturnType<typeof createSheetsDrawingTestBed>;
    beforeEach(() => {
        bed = createSheetsDrawingTestBed();
    });
    afterEach(() => bed.univer.dispose());

    it.each([
        ['missing markers', { sheetTransform: undefined }],
        ['null markers', { sheetTransform: null }],
        ['missing from', { sheetTransform: { to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 } } }],
        ['null to', { sheetTransform: { from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 }, to: null } }],
        ['invalid cell', { sheetTransform: {
            from: { row: NaN, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
        } }],
        ['negative extent', { transform: { left: 10, top: 20, width: 20, height: -4243 } }],
        ['non-finite extent', { transform: { left: 10, top: 20, width: NaN, height: 20 } }],
    ])('returns a diagnostic for %s without rewriting the drawing', (_name, patch) => {
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const drawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'invalid-image',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 },
            },
            transform: { left: 10, top: 20, width: 20, height: 20 },
            ...patch,
        } as ISheetDrawing;
        const before = Tools.deepClone(drawing);
        const result = tryRefreshSheetDrawingPlacement(drawing, skeleton);
        expect(result).toMatchObject({ ok: false, reason: expect.any(String) });
        expect(drawing).toEqual(before);
        // The existing strict API must still reject the same invalid placement.
        if (!result.ok) {
            expect(() => refreshSheetDrawingPlacement(drawing, skeleton)).toThrow(result.reason);
        }
    });

    it('reports a negative calculated two-cell extent as a result', () => {
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const drawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'inverted-image',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            anchorType: SheetDrawingAnchorType.Both,
            sheetTransform: {
                from: { row: 4, column: 4, rowOffset: 0, columnOffset: 0 },
                to: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            },
        } as ISheetDrawing;
        const before = Tools.deepClone(drawing);
        expect(tryRefreshSheetDrawingPlacement(drawing, skeleton)).toMatchObject({
            ok: false,
            details: { width: expect.any(Number), height: expect.any(Number) },
        });
        expect(drawing).toEqual(before);
    });

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

    it.each([
        [150, 4800, 0.5],
        [300, 100, 2],
    ])('keeps model placements stable with scroll=(%s,%s) and scale=%s', (scrollX, scrollY, scale) => {
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const bounds = { left: 300, top: 85, width: 180.3, height: 46 };
        const marker = { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'scrolled-image',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: { ...bounds, angle: 90 },
            sheetTransform: { from: marker, to: marker },
            axisAlignSheetTransform: { from: marker, to: marker },
        };
        for (const kind of [SheetDrawingAnchorType.Position, SheetDrawingAnchorType.Both]) {
            skeleton.setScroll(0, 0);
            skeleton.setScale(1);
            const expected = applySheetDrawingPlacement(drawing, { kind, bounds }, skeleton);
            skeleton.setScroll(scrollX, scrollY);
            skeleton.setScale(scale);
            const actual = applySheetDrawingPlacement(drawing, { kind, bounds }, skeleton);
            expect(actual).toEqual(expected);
            expect(refreshSheetDrawingPlacement(actual, skeleton)).toEqual(expected);
            expect(normalizeSheetDrawingPlacement({ kind, bounds }, skeleton))
                .toEqual(normalizeSheetDrawingPlacement({ kind, bounds }, bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet2')!));
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

describe('Drawing transfer to Chart Sheet model coordinates', () => {
    const image = (id: string, left: number, top: number, width: number, height: number): ISheetDrawing => ({
        unitId: 'source',
        subUnitId: 'grid',
        drawingId: id,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: { left, top, width, height },
        sheetTransform: { from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 }, to: { row: 2, column: 2, rowOffset: 0, columnOffset: 0 } },
    } as ISheetDrawing);

    it.each([false, true])('fits a batch proportionally at the page start with RTL=%s without mutating its source', (rtl) => {
        const drawings = [image('first', 2000, 500, 200, 100), image('second', 2300, 550, 100, 50)];
        const before = Tools.deepClone(drawings);
        const copies = transformDrawingsToChartSheet(drawings, { left: 20, top: 30, width: 200, height: 150 }, rtl)!;
        expect(copies[0].transform).toMatchObject({ left: 20, top: 30, width: 100, height: 50 });
        expect(copies[1].transform).toMatchObject({ left: 170, top: 55, width: 50, height: 25 });
        expect(copies.every((drawing) => drawing.anchorType === SheetDrawingAnchorType.None)).toBe(true);
        expect(drawings).toEqual(before);
        expect(copies.map((drawing) => [drawing.unitId, drawing.subUnitId, drawing.drawingId])).toEqual(
            drawings.map((drawing) => [drawing.unitId, drawing.subUnitId, drawing.drawingId])
        );
    });

    it.each([false, true])('keeps small drawings at their size and uses the logical page corner with RTL=%s', (rtl) => {
        const copy = transformDrawingsToChartSheet([image('small', 400, 300, 40, 20)], { left: 20, top: 30, width: 200, height: 150 }, rtl)![0];
        expect(copy.transform).toMatchObject({ left: rtl ? 180 : 20, top: 30, width: 40, height: 20 });
    });

    it('fits rotated drawings without changing rotation or mirroring their content for RTL', () => {
        const drawing = image('rotated', 200, 100, 80, 40);
        drawing.transform = { ...drawing.transform, angle: 90, flipX: true };
        const copy = transformDrawingsToChartSheet([drawing], { left: 0, top: 0, width: 40, height: 40 }, true)![0];
        expect(copy.transform).toMatchObject({ width: 40, height: 20, angle: 90, flipX: true });
        expect(copy.transform!.left!).toBeCloseTo(10);
        expect(copy.transform!.top!).toBeCloseTo(30);
    });

    it('retains zero-width Shape lines and rejects malformed image geometry before creating a copy', () => {
        const line = { ...image('line', 300, 200, 0, 100), drawingType: DrawingTypeEnum.DRAWING_SHAPE };
        expect(transformDrawingsToChartSheet([line], { left: 0, top: 0, width: 200, height: 200 }, true)![0].transform)
            .toMatchObject({ left: 200, top: 0, width: 0, height: 100 });
        expect(transformDrawingsToChartSheet([image('invalid', 0, 0, -1, 10)], { left: 0, top: 0, width: 200, height: 200 }, false)).toBeNull();
    });
});
