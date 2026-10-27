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

import type { IGroupBaseBound } from '@univerjs/core';
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
    tryRefreshSheetDrawingPlacement,
} from '../sheet-drawing-placement';
import { SheetDrawingAnchorType } from '../sheet-drawing.service';

function createChartChild(resizeWithParent = true): ISheetDrawing {
    const from = { row: 0, column: 0, rowOffset: 240, columnOffset: 140 };
    const to = { row: 0, column: 0, rowOffset: 320, columnOffset: 240 };
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId: 'child',
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: 'chart-child',
        anchorType: SheetDrawingAnchorType.None,
        chartParent: { drawingId: 'parent', resizeWithParent },
        transform: { left: 140, top: 240, width: 100, height: 80, angle: 37 },
        sheetTransform: { from, to },
        axisAlignSheetTransform: { from, to },
    };
}

function createChartParent(): ISheetDrawing {
    return {
        ...createChartChild(),
        drawingId: 'parent',
        drawingType: DrawingTypeEnum.DRAWING_CHART,
        chartParent: undefined,
        transform: { left: 100, top: 200, width: 300, height: 200 },
    };
}

describe('chart-owned drawing interaction placement', () => {
    it.each([
        ['left', { left: 60, top: 240, width: 180, height: 80 }, { left: 100, top: 240, width: 140, height: 80 }],
        ['right', { left: 140, top: 240, width: 350, height: 80 }, { left: 140, top: 240, width: 260, height: 80 }],
        ['top', { left: 140, top: 160, width: 100, height: 160 }, { left: 140, top: 200, width: 100, height: 120 }],
        ['bottom', { left: 140, top: 240, width: 100, height: 250 }, { left: 140, top: 240, width: 100, height: 160 }],
    ] satisfies Array<[string, IGroupBaseBound, IGroupBaseBound]>)('clips the moving %s edge while preserving the opposite edge', (_edge, bounds, expected) => {
        const drawing = createChartChild();
        const parent = createChartParent();
        const input = { kind: SheetDrawingAnchorType.None, ...bounds };
        const before = Tools.deepClone({ drawing, parent, input });

        const placed = applySheetDrawingPlacement(drawing, input, undefined, parent, true);

        expect(placed.transform).toEqual({ ...expected, angle: 37 });
        expect(placed.sheetTransform.from).toMatchObject({ columnOffset: expected.left, rowOffset: expected.top });
        expect(placed.sheetTransform.to).toMatchObject({ columnOffset: expected.left + expected.width, rowOffset: expected.top + expected.height });
        expect({ drawing, parent, input }).toEqual(before);
    });

    it('moves within relative parent bounds without changing size', () => {
        const drawing = createChartChild();
        const placed = applySheetDrawingPlacement(drawing, {
            kind: SheetDrawingAnchorType.None,
            left: 50,
            top: 450,
            width: 100,
            height: 80,
        }, undefined, createChartParent());
        expect(placed.transform).toEqual({ left: 100, top: 320, width: 100, height: 80, angle: 37 });
    });

    it('distinguishes horizontal resize from vertical movement', () => {
        const placed = applySheetDrawingPlacement(createChartChild(), {
            kind: SheetDrawingAnchorType.None,
            left: 60,
            top: 450,
            width: 180,
            height: 80,
        }, undefined, createChartParent(), true);
        expect(placed.transform).toEqual({ left: 100, top: 320, width: 140, height: 80, angle: 37 });
    });

    it.each([true, false])('fits numeric extents and keeps the complete child inside its parent, resizeWithParent=%s', (resizeWithParent) => {
        const drawing = createChartChild(resizeWithParent);
        const parent = createChartParent();
        expect(applySheetDrawingPlacement(drawing, {
            kind: SheetDrawingAnchorType.None,
            left: 140,
            top: 240,
            width: 280,
            height: 180,
        }, undefined, parent).transform).toEqual({ left: 120, top: 220, width: 280, height: 180, angle: 37 });
        expect(applySheetDrawingPlacement(drawing, {
            kind: SheetDrawingAnchorType.None,
            left: 140,
            top: 240,
            width: 500,
            height: 350,
        }, undefined, parent).transform).toEqual({ left: 100, top: 200, width: 300, height: 200, angle: 37 });
    });

    it.each([
        ['non-finite origin', { left: Infinity }, 'SHEET_DRAWING_PLACEMENT_POSITION_INVALID'],
        ['non-finite extent', { width: NaN }, 'SHEET_DRAWING_PLACEMENT_EXTENT_INVALID'],
        ['negative extent', { height: -1 }, 'SHEET_DRAWING_PLACEMENT_EXTENT_INVALID'],
        ['collapsed parent', { width: 0 }, 'SHEET_DRAWING_PLACEMENT_EXTENT_INVALID'],
        ['missing extent', { width: undefined }, 'SHEET_DRAWING_PLACEMENT_EXTENT_INVALID'],
    ] satisfies Array<[string, Partial<IGroupBaseBound>, string]>)('rejects a malformed parent with %s before fitting an otherwise valid child', (_name, patch, reason) => {
        const parent = createChartParent();
        parent.transform = { ...parent.transform, ...patch };
        expect(() => applySheetDrawingPlacement(createChartChild(), {
            kind: SheetDrawingAnchorType.None,
            left: 140,
            top: 240,
            width: 100,
            height: 80,
        }, undefined, parent)).toThrow(reason);
    });

    it('rejects an edge clip that collapses DOM area while preserving a shape line', () => {
        const input = { kind: SheetDrawingAnchorType.None, left: 240, top: 240, width: 1, height: 80 };
        expect(() => applySheetDrawingPlacement(createChartChild(), input, undefined, createChartParent(), true))
            .toThrow('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
        const line = applySheetDrawingPlacement({ ...createChartChild(), drawingType: DrawingTypeEnum.DRAWING_SHAPE }, input, undefined, createChartParent(), true);
        expect(line.transform).toMatchObject({ left: 240, top: 240, width: 0, height: 80 });
    });

    it('preserves unrestricted placement when the caller has no parent or the drawing has no chart owner', () => {
        const drawing = createChartChild();
        const input = { kind: SheetDrawingAnchorType.None, left: 50, top: 450, width: 100, height: 80 };
        expect(applySheetDrawingPlacement(drawing, input).transform).toEqual({ left: 50, top: 450, width: 100, height: 80, angle: 37 });
        expect(applySheetDrawingPlacement({ ...drawing, chartParent: undefined }, input, undefined, createChartParent()).transform)
            .toEqual({ left: 50, top: 450, width: 100, height: 80, angle: 37 });
    });
});

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
