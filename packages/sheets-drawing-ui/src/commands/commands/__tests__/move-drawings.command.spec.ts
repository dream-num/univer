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

import { Direction, RedoCommand, UndoCommand } from '@univerjs/core';
import {
    applySheetDrawingPlacement,
    InsertSheetDrawingCommand,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { expect, it } from 'vitest';
import { createAbsoluteChart, createChartDrawingTestBed } from '../../../__tests__/chart-drawing-test-bed';
import { MoveDrawingsCommand } from '../move-drawings.command';

it('nudges None on CHART through canonical placement and history without a skeleton', async () => {
    const bed = createChartDrawingTestBed(undefined, createAbsoluteChart());
    const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'child' };
    const before = bed.drawings.getDrawingByParam(search)!;
    bed.drawings.focusDrawing([search]);
    expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);
    const after = bed.drawings.getDrawingByParam(search)!;
    expect(after.transform).toEqual({ ...before.transform, left: 151 });
    expect(after.sheetTransform.from).toEqual({ row: 0, column: 0, rowOffset: 120, columnOffset: 151 });
    expect(bed.drawingManager.getDrawingByParam(search)).toEqual(after);
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(bed.drawings.getDrawingByParam(search)).toEqual(before);
    expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
    expect(bed.drawings.getDrawingByParam(search)).toEqual(after);
    const reopened = createChartDrawingTestBed(bed.save());
    expect(reopened.drawings.getDrawingByParam(search)).toEqual(after);
    expect(reopened.skeletons.getSkeleton('test', 'chart')).toBeUndefined();
});

it('refuses unsupported cell anchors on CHART instead of committing an empty nudge', () => {
    const drawing = { ...createAbsoluteChart(), anchorType: SheetDrawingAnchorType.Position };
    const bed = createChartDrawingTestBed(undefined, drawing);
    bed.drawings.focusDrawing([drawing]);
    expect(bed.commandService.syncExecuteCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(false);
});

it.each([SheetDrawingAnchorType.None, SheetDrawingAnchorType.Position, SheetDrawingAnchorType.Both])('retains real GRID nudge behavior for anchor %s', async (kind) => {
    const bed = createChartDrawingTestBed();
    bed.activate('grid');
    const skeleton = bed.skeletons.getSkeleton('test', 'grid')!;
    const drawing = applySheetDrawingPlacement(createAbsoluteChart('grid-child', 'grid'), {
        kind,
        bounds: { left: 250, top: 180, width: 200, height: 140 },
    }, skeleton);
    expect(bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
    bed.drawings.focusDrawing([drawing]);
    expect(await bed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);
    const after = bed.drawings.getDrawingByParam(drawing)!;
    expect(after.anchorType).toBe(kind);
    expect(after.transform).toEqual({ ...drawing.transform, left: 251 });
    expect(bed.drawingManager.getDrawingByParam(drawing)).toEqual(after);
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(bed.drawings.getDrawingByParam(drawing)).toEqual(drawing);
    if (kind === SheetDrawingAnchorType.None) {
        expect(after.sheetTransform.from).toEqual({ row: 0, column: 0, rowOffset: 180, columnOffset: 251 });
    } else {
        expect(after.sheetTransform.from.column).toBeGreaterThan(0);
    }
});
