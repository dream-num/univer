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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import {
    BooleanNumber,
    Disposable,
    DrawingTypeEnum,
    ILogService,
    ImageSourceType,
    IUndoRedoService,
    LogLevel,
    RedoCommandId,
    Tools,
    UndoCommandId,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { RemoveColByRangeCommand, RemoveRowByRangeCommand, SheetSkeletonService } from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    drawingPositionToTransform,
    getSheetDrawingPlacement,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SetSheetDrawingPlacementCommand,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingActiveRenderController } from '../sheet-drawing-active-render.controller';

function createTestBed() {
    const bed = createSheetsDrawingUiTestBed();
    const activated$ = new BehaviorSubject(false);
    const context = { unit: bed.workbook, unitId: bed.unitId, activated$ } as unknown as IRenderContext<Workbook>;
    const createController = () => bed.injector.createInstance(SheetDrawingActiveRenderController, context);
    bed.injector.add([SheetDrawingActiveRenderController, { useFactory: createController }]);
    return { ...bed, activated$ };
}

async function insertDrawing(
    bed: ReturnType<typeof createTestBed>,
    anchorType: SheetDrawingAnchorType | undefined,
    position?: { left: number; top: number }
) {
    const sheetTransform = {
        from: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
        to: { row: 6, column: 6, rowOffset: 0, columnOffset: 0 },
    };
    const skeleton = bed.get(SheetSkeletonService).getSkeletonParam(bed.unitId, bed.subUnitId);
    const { left, top, width, height } = drawingPositionToTransform(sheetTransform, skeleton)!;
    const drawing: ISheetDrawing = {
        unitId: bed.unitId,
        subUnitId: bed.subUnitId,
        drawingId: 'anchored-image',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/drawing.png',
        anchorType,
        sheetTransform,
        axisAlignSheetTransform: sheetTransform,
        transform: { left, top, width, height, ...position },
    };
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
        unitId: bed.unitId,
        drawings: [drawing],
    })).toBe(true);
    return drawing;
}

describe('SheetDrawingActiveRenderController', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it.each([SheetDrawingAnchorType.Position, SheetDrawingAnchorType.Both])(
        'isolates failed geometry and retries repaired drawings on activation (%s)',
        async (anchorType) => {
            const bed = createTestBed();
            const subscriptions = new Disposable();
            const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
            try {
                const base = await insertDrawing(bed, anchorType);
                const sheetService = bed.get(ISheetDrawingService);
                const manager = bed.get(IDrawingManagerService);
                bed.get(ILogService).setLogLevel(LogLevel.ERROR);
                const valid = { ...base, drawingId: 'before', transform: { ...base.transform, left: -100, top: -100 } };
                const invalid = {
                    ...base,
                    drawingId: 'invalid',
                    transform: { ...base.transform, width: -1 },
                    sheetTransform: { ...base.sheetTransform, to: { ...base.sheetTransform.from, columnOffset: -2 } },
                };
                const secondInvalid = { ...invalid, drawingId: 'second-invalid' };
                const last = { ...valid, drawingId: 'after' };
                const drawings = [valid, invalid, secondInvalid, last];
                const snapshot = {
                    [bed.subUnitId]: {
                        data: Object.fromEntries(drawings.map((drawing) => [drawing.drawingId, drawing])),
                        order: drawings.map((drawing) => drawing.drawingId),
                    },
                };
                sheetService.registerDrawingData(bed.unitId, Tools.deepClone(snapshot));
                manager.registerDrawingData(bed.unitId, Tools.deepClone(snapshot));
                const beforeHistory = bed.get(IUndoRedoService).getUndoRedoStatus(bed.unitId);
                const notifications = [sheetService, manager].map((service) => {
                    const added = vi.fn();
                    const removed = vi.fn();
                    subscriptions.disposeWithMe(service.add$.subscribe(added));
                    subscriptions.disposeWithMe(service.remove$.subscribe(removed));
                    return { added, removed };
                });
                bed.get(SheetDrawingActiveRenderController);
                bed.activated$.next(true);
                expect(() => vi.runOnlyPendingTimers()).not.toThrow();
                for (const { added, removed } of notifications) {
                    expect(added.mock.calls.at(-1)![0].map((drawing: ISheetDrawing) => drawing.drawingId))
                        .toEqual([valid.drawingId, last.drawingId]);
                    expect(removed).toHaveBeenLastCalledWith([invalid, secondInvalid]);
                }
                for (const drawing of drawings) {
                    expect(manager.getDrawingByParam(drawing)).toEqual(sheetService.getDrawingByParam(drawing));
                }
                for (const drawing of [valid, last]) {
                    expect(sheetService.getDrawingByParam(drawing)?.transform).toMatchObject({
                        left: base.transform!.left,
                        top: base.transform!.top,
                    });
                }
                expect(sheetService.getDrawingByParam(invalid)).toEqual(invalid);
                expect(sheetService.getDrawingByParam(secondInvalid)).toEqual(secondInvalid);
                expect(bed.get(IUndoRedoService).getUndoRedoStatus(bed.unitId)).toEqual(beforeHistory);
                expect(logged).toHaveBeenCalledTimes(1);
                expect(logged.mock.calls[0][1]).toMatchObject({
                    unitId: bed.unitId,
                    subUnitId: bed.subUnitId,
                    failures: [invalid, secondInvalid].map(({ drawingId, drawingType }) => ({
                        drawingId,
                        drawingType,
                        anchorType,
                        error: expect.objectContaining({
                            width: anchorType === SheetDrawingAnchorType.Both ? -2 : -1,
                            height: anchorType === SheetDrawingAnchorType.Both ? 0 : base.transform!.height,
                        }),
                    })),
                });
                expect(await bed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
                    unitId: bed.unitId,
                    subUnitId: bed.subUnitId,
                    drawings: [invalid, secondInvalid].map(({ drawingId }) => ({
                        drawingId,
                        placement: getSheetDrawingPlacement(base),
                    })),
                })).toBe(true);
                bed.activated$.next(true);
                vi.runOnlyPendingTimers();
                for (const { added } of notifications) {
                    expect(added.mock.calls.at(-1)![0].map((drawing: ISheetDrawing) => drawing.drawingId))
                        .toEqual(drawings.map((drawing) => drawing.drawingId));
                }
                expect(logged).toHaveBeenCalledTimes(1);
            } finally {
                subscriptions.dispose();
                logged.mockRestore();
                bed.univer.dispose();
                bed.activated$.complete();
            }
        }
    );

    it.each(['row', 'column'] as const)('reactivates an image after initially hidden %ss become visible', async (axis) => {
        const bed = createTestBed();
        const subscriptions = new Disposable();
        try {
            const drawing = await insertDrawing(bed, SheetDrawingAnchorType.Both);
            const sheetService = bed.get(ISheetDrawingService);
            const before = Tools.deepClone(sheetService.getDrawingByParam(drawing));
            const worksheet = bed.workbook.getActiveSheet();
            const data = axis === 'row' ? worksheet.getRowManager().getRowData() : worksheet.getColumnManager().getColumnData();
            for (let index = 3; index < 6; index++) {
                data[index] = { ...data[index], hd: BooleanNumber.TRUE };
            }
            const skeleton = bed.get(SheetSkeletonService).getSkeleton(bed.unitId, bed.subUnitId)!;
            skeleton.makeDirty(true);
            skeleton.calculate();
            const added = vi.fn();
            const removed = vi.fn();
            subscriptions.disposeWithMe(sheetService.add$.subscribe(added));
            subscriptions.disposeWithMe(sheetService.remove$.subscribe(removed));
            bed.get(SheetDrawingActiveRenderController);
            bed.activated$.next(true);
            expect(() => vi.runOnlyPendingTimers()).not.toThrow();
            expect(removed).toHaveBeenLastCalledWith([drawing]);
            expect(added).toHaveBeenLastCalledWith([]);
            expect(sheetService.getDrawingByParam(drawing)).toEqual(before);
            for (let index = 3; index < 6; index++) {
                data[index]!.hd = BooleanNumber.FALSE;
            }
            skeleton.makeDirty(true);
            skeleton.calculate();
            bed.activated$.next(true);
            vi.runOnlyPendingTimers();
            expect(added.mock.calls.at(-1)![0]).toHaveLength(1);
            expect(sheetService.getDrawingByParam(drawing)?.transform).toEqual(before!.transform);
            expect(bed.get(IDrawingManagerService).getDrawingByParam(drawing)).toEqual(sheetService.getDrawingByParam(drawing));
        } finally {
            subscriptions.dispose();
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it.each([
        ['row', SheetDrawingAnchorType.Both],
        ['column', SheetDrawingAnchorType.Both],
        ['row', undefined],
        ['column', undefined],
    ] as const)('keeps activation geometry consistent through %s deletion and undo/redo (%s)', async (axis, anchorType) => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed, anchorType);
            bed.get(SheetDrawingActiveRenderController);
            const sheetService = bed.get(ISheetDrawingService);
            const manager = bed.get(IDrawingManagerService);
            manager.registerDrawingData(bed.unitId, Tools.deepClone(sheetService.getDrawingDataForUnit(bed.unitId)));
            const read = () => Tools.deepClone(sheetService.getDrawingByParam(drawing)!);
            bed.activated$.next(true);
            vi.runOnlyPendingTimers();
            const before = read();
            expect(manager.getDrawingByParam(drawing)).toEqual(before);
            const range = axis === 'row'
                ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 }
                : { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 };
            expect(await bed.commandService.executeCommand(
                axis === 'row' ? RemoveRowByRangeCommand.id : RemoveColByRangeCommand.id,
                { unitId: bed.unitId, subUnitId: bed.subUnitId, range }
            )).toBe(true);
            const after = read();
            expect(after.sheetTransform!.from[axis]).toBe(before.sheetTransform!.from[axis] - 1);
            expect(after.transform![axis === 'row' ? 'top' : 'left']).toBeLessThan(
                before.transform![axis === 'row' ? 'top' : 'left']!
            );
            expect(manager.getDrawingByParam(drawing)).toEqual(after);
            expect(bed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
            bed.activated$.next(true);
            vi.runOnlyPendingTimers();
            expect(read()).toEqual(before);
            expect(manager.getDrawingByParam(drawing)).toEqual(before);
            expect(bed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
            expect(read()).toEqual(after);
            expect(manager.getDrawingByParam(drawing)).toEqual(after);
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it.each([
        [SheetDrawingAnchorType.Both, 0, 81.9],
        [SheetDrawingAnchorType.Position, 0, 81.9],
        [SheetDrawingAnchorType.None, 0, 81.9],
        [SheetDrawingAnchorType.Both, 81.9, 0],
        [SheetDrawingAnchorType.Position, 81.9, 0],
        [SheetDrawingAnchorType.None, 81.9, 0],
    ] as const)('reactivates a line and preserves movement undo/redo (%s, %s, %s)', async (anchorType, width, height) => {
        const bed = createTestBed();
        try {
            const from = { row: 3, column: 3, rowOffset: 0, columnOffset: 0 };
            const sheetTransform = { from, to: { ...from, rowOffset: height, columnOffset: width } };
            const skeleton = bed.get(SheetSkeletonService).getSkeletonParam(bed.unitId, bed.subUnitId);
            const drawing: ISheetDrawing = {
                unitId: bed.unitId,
                subUnitId: bed.subUnitId,
                drawingId: 'line',
                drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                anchorType,
                sheetTransform,
                axisAlignSheetTransform: sheetTransform,
                transform: drawingPositionToTransform(sheetTransform, skeleton),
            };
            expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
                unitId: bed.unitId,
                drawings: [drawing],
            })).toBe(true);
            bed.get(SheetDrawingActiveRenderController);
            const sheetService = bed.get(ISheetDrawingService);
            const manager = bed.get(IDrawingManagerService);
            manager.registerDrawingData(bed.unitId, Tools.deepClone(sheetService.getDrawingDataForUnit(bed.unitId)));
            const reactivate = () => {
                bed.activated$.next(false);
                vi.runOnlyPendingTimers();
                bed.activated$.next(true);
                vi.runOnlyPendingTimers();
                const current = Tools.deepClone(sheetService.getDrawingByParam(drawing)!);
                expect(current.transform).toMatchObject({ width, height });
                expect(manager.getDrawingByParam(drawing)).toEqual(current);
                return current;
            };
            const before = reactivate();
            expect(reactivate()).toEqual(before);
            expect(await bed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
                unitId: bed.unitId,
                subUnitId: bed.subUnitId,
                drawings: [{ drawingId: drawing.drawingId, placement: {
                    kind: anchorType,
                    bounds: {
                        left: before.transform!.left! + 10,
                        top: before.transform!.top! + 10,
                        width,
                        height,
                    },
                } }],
            })).toBe(true);
            const after = reactivate();
            expect(after.transform!.left).toBeCloseTo(before.transform!.left! + 10);
            expect(after.transform!.top).toBeCloseTo(before.transform!.top! + 10);
            expect(bed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
            expect(reactivate()).toEqual(before);
            expect(bed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
            expect(reactivate()).toEqual(after);
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it.each([SheetDrawingAnchorType.None, undefined])('activates absolute or legacy cell-anchored geometry (%s)', async (anchorType) => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed, anchorType, { left: 1000, top: 2000 });
            bed.get(SheetDrawingActiveRenderController);
            bed.activated$.next(true);
            vi.runOnlyPendingTimers();
            const current = bed.get(ISheetDrawingService).getDrawingByParam(drawing)!;
            expect(bed.get(IDrawingManagerService).getDrawingByParam(drawing)).toEqual(current);
            if (anchorType === SheetDrawingAnchorType.None) {
                expect(current).toEqual(drawing);
            } else {
                const skeleton = bed.get(SheetSkeletonService).getSkeletonParam(bed.unitId, bed.subUnitId);
                const position = drawingPositionToTransform(drawing.sheetTransform, skeleton)!;
                expect(current.transform).toMatchObject({
                    left: position.left,
                    top: position.top,
                    width: drawing.transform!.width,
                    height: drawing.transform!.height,
                });
                expect(current.transform?.left).not.toBe(1000);
                expect(current.transform?.top).not.toBe(2000);
                expect(getSheetDrawingPlacement(current).kind).toBe(SheetDrawingAnchorType.Position);
            }
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it('preserves one-cell anchored size during activation after column widths change', async () => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed, SheetDrawingAnchorType.Position);
            bed.get(SheetDrawingActiveRenderController);
            const sheetService = bed.get(ISheetDrawingService);
            const manager = bed.get(IDrawingManagerService);
            manager.registerDrawingData(bed.unitId, Tools.deepClone(sheetService.getDrawingDataForUnit(bed.unitId)));
            const before = Tools.deepClone(sheetService.getDrawingByParam(drawing)!);
            const columnManager = bed.workbook.getActiveSheet().getColumnManager();
            columnManager.setColumnWidth(1, 140);
            for (let column = 3; column < 6; column++) {
                columnManager.setColumnWidth(column, 20);
            }
            const skeleton = bed.get(SheetSkeletonService).getSkeleton(bed.unitId, bed.subUnitId)!;
            skeleton.makeDirty(true);
            skeleton.calculate();
            const expected = applySheetDrawingPlacement(before, getSheetDrawingPlacement(before), skeleton);

            bed.activated$.next(true);
            vi.runOnlyPendingTimers();

            const after = sheetService.getDrawingByParam(drawing)!;
            expect(after.transform).toEqual(expected.transform);
            expect(after.transform!.width).toBe(before.transform!.width);
            expect(after.transform!.height).toBe(before.transform!.height);
            expect(after.transform!.left).not.toBe(before.transform!.left);
            expect(manager.getDrawingByParam(drawing)).toEqual(after);
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it.each(['deactivated', 'disposed'] as const)('cancels pending activation when the render module is %s', async (state) => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed, SheetDrawingAnchorType.Both);
            const controller = bed.get(SheetDrawingActiveRenderController);
            const added = vi.fn();
            const subscription = bed.get(IDrawingManagerService).add$.subscribe(added);
            bed.activated$.next(true);
            if (state === 'disposed') {
                controller.dispose();
            } else {
                bed.activated$.next(false);
            }
            vi.runOnlyPendingTimers();
            expect(added).not.toHaveBeenCalled();
            expect(bed.get(IDrawingManagerService).getDrawingByParam(drawing)).toEqual(drawing);
            subscription.unsubscribe();
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });
});
