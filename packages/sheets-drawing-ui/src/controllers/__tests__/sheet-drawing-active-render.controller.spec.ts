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
import { DrawingTypeEnum, ImageSourceType, RedoCommandId, Tools, UndoCommandId } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { RemoveColByRangeCommand, RemoveRowByRangeCommand, SheetSkeletonService } from '@univerjs/sheets';
import {
    drawingPositionToTransform,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
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
    bed.injector.add([SheetDrawingActiveRenderController, {
        useFactory: () => bed.injector.createInstance(SheetDrawingActiveRenderController, context),
    }]);
    return { ...bed, activated$ };
}

async function insertDrawing(bed: ReturnType<typeof createTestBed>, anchorType = SheetDrawingAnchorType.Both) {
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
        transform: { left, top, width, height },
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

    it.each(['row', 'column'] as const)('keeps activation geometry consistent through %s deletion and undo/redo', async (axis) => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed);
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

    it('preserves unanchored geometry during activation', async () => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed, SheetDrawingAnchorType.None);
            bed.get(SheetDrawingActiveRenderController);
            bed.activated$.next(true);
            vi.runOnlyPendingTimers();
            expect(bed.get(IDrawingManagerService).getDrawingByParam(drawing)).toEqual(drawing);
            expect(bed.get(ISheetDrawingService).getDrawingByParam(drawing)).toEqual(drawing);
        } finally {
            bed.univer.dispose();
            bed.activated$.complete();
        }
    });

    it.each(['deactivated', 'disposed'] as const)('cancels pending activation when the render module is %s', async (state) => {
        const bed = createTestBed();
        try {
            const drawing = await insertDrawing(bed);
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
