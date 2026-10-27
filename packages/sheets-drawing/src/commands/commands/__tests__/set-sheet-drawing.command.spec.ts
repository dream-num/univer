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
import { DrawingTypeEnum, RedoCommand, Tools, UndoCommand } from '@univerjs/core';
import { expect, it, onTestFinished } from 'vitest';
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { applySheetDrawingPlacement } from '../../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../set-sheet-drawing.command';

function createDrawing(drawingId: string, bounds: IGroupBaseBound): ISheetDrawing {
    const marker = { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
    return applySheetDrawingPlacement({
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_CHART,
        transform: bounds,
        sheetTransform: { from: marker, to: marker },
    } as ISheetDrawing, { kind: SheetDrawingAnchorType.None, ...bounds });
}

it.each([true, false])('fits a child against the final parent batch once before JSON1 and replays undo/redo, parent first=%s', async (parentFirst) => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const parent = createDrawing('parent', { left: 100, top: 200, width: 300, height: 200 });
    const child = {
        ...createDrawing('child', { left: 140, top: 240, width: 100, height: 80 }),
        chartParent: { drawingId: 'parent', resizeWithParent: false },
    };
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [parent, child] })).toBe(true);
    const drawings = bed.get(ISheetDrawingService);
    const childSearch = { unitId: 'test', subUnitId: 'sheet1', drawingId: 'child' };
    const parentSearch = { ...childSearch, drawingId: 'parent' };
    const originalChild = drawings.getDrawingByParam(childSearch);
    const originalParent = drawings.getDrawingByParam(parentSearch);
    const parentUpdate = { ...parentSearch, transform: { left: 500, top: 600, width: 200, height: 150 } };
    const childUpdate = { ...childSearch, transform: { left: 640, top: 740, width: 180, height: 120 } };
    const params = { unitId: 'test', drawings: parentFirst ? [parentUpdate, childUpdate] : [childUpdate, parentUpdate] };
    const before = Tools.deepClone(params);
    expect(await bed.commandService.executeCommand(SetSheetDrawingCommand.id, params)).toBe(true);
    const changed = drawings.getDrawingByParam(childSearch)!;
    expect(changed.transform).toMatchObject({ left: 520, top: 630, width: 180, height: 120 });
    expect(changed.sheetTransform.from).toMatchObject({ columnOffset: 520, rowOffset: 630 });
    expect(changed.sheetTransform.to).toMatchObject({ columnOffset: 700, rowOffset: 750 });
    expect(params).toEqual(before);
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(drawings.getDrawingByParam(childSearch)).toEqual(originalChild);
    expect(drawings.getDrawingByParam(parentSearch)).toEqual(originalParent);
    expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
    expect(drawings.getDrawingByParam(childSearch)).toEqual(changed);
});

it('fits an oversized numeric child update into the whole parent for every drawing type', async () => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const parent = createDrawing('parent', { left: 100, top: 200, width: 300, height: 200 });
    const children = [DrawingTypeEnum.DRAWING_CHART, DrawingTypeEnum.DRAWING_IMAGE, DrawingTypeEnum.DRAWING_SHAPE, DrawingTypeEnum.DRAWING_DOM].map((drawingType) => ({
        ...createDrawing(`child-${drawingType}`, { left: 140, top: 240, width: 100, height: 80 }),
        drawingType,
        chartParent: { drawingId: 'parent', resizeWithParent: false },
    }));
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [parent, ...children] })).toBe(true);
    expect(await bed.commandService.executeCommand(SetSheetDrawingCommand.id, {
        unitId: 'test',
        drawings: children.map((drawing) => ({
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            drawingId: drawing.drawingId,
            transform: { left: 140, top: 240, width: 500, height: 350 },
        })),
    })).toBe(true);
    for (const child of children) {
        expect(bed.get(ISheetDrawingService).getDrawingByParam(child)!.transform).toMatchObject(parent.transform!);
    }
});

it.each([
    [true, { left: 580, top: 620, width: 100, height: 80 }],
    [false, { left: 380, top: 460, width: 100, height: 80 }],
] as const)('fits an explicit grandchild against the inherited parent size, resizeWithParent=%s', async (resizeWithParent, expected) => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const ancestor = createDrawing('ancestor', { left: 100, top: 200, width: 500, height: 400 });
    const parent = {
        ...createDrawing('parent', { left: 140, top: 240, width: 200, height: 160 }),
        chartParent: { drawingId: 'ancestor', resizeWithParent },
    };
    const child = {
        ...createDrawing('child', { left: 240, top: 320, width: 100, height: 80 }),
        chartParent: { drawingId: 'parent', resizeWithParent: false },
    };
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [ancestor, parent, child] })).toBe(true);
    expect(await bed.commandService.executeCommand(SetSheetDrawingCommand.id, {
        unitId: 'test',
        drawings: [
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'ancestor', transform: { left: 200, top: 300, width: 1000, height: 800 } },
            { unitId: 'test', subUnitId: 'sheet1', drawingId: 'child', transform: { left: 640, top: 650 } },
        ],
    })).toBe(true);
    expect(bed.get(ISheetDrawingService).getDrawingByParam(child)!.transform)
        .toMatchObject(expected);
});
