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

import type { ITransformState } from '@univerjs/core';
import { DrawingTypeEnum, RedoCommand, UndoCommand } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it, onTestFinished } from 'vitest';
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { transformToAxisAlignPosition } from '../../../basics/transform-position';
import { applySheetDrawingPlacement } from '../../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { GroupSheetDrawingCommand } from '../group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../ungroup-sheet-drawing.command';

function setup() {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const unitId = bed.workbook.getUnitId();
    const subUnitId = bed.workbook.getActiveSheet()!.getSheetId();
    const service = bed.get(ISheetDrawingService);
    const search = (drawingId: string) => ({ unitId, subUnitId, drawingId });
    const shape = (drawingId: string, transform: ITransformState): ISheetDrawing => ({
        ...search(drawingId),
        drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        transform,
    } as ISheetDrawing);

    // Mirrors the params the UI and Facade build: the group spans its children.
    async function group(children: ISheetDrawing[]) {
        const left = Math.min(...children.map((child) => child.transform!.left!));
        const top = Math.min(...children.map((child) => child.transform!.top!));
        const right = Math.max(...children.map((child) => child.transform!.left! + child.transform!.width!));
        const bottom = Math.max(...children.map((child) => child.transform!.top! + child.transform!.height!));
        const bounds = { left, top, width: right - left, height: bottom - top };
        const parent = { ...search('group'), drawingType: DrawingTypeEnum.DRAWING_GROUP, transform: bounds, groupBaseBound: bounds };
        expect(await bed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{
            parent,
            children: children.map((child) => ({ ...service.getDrawingByParam(child)!, groupId: 'group' })),
        }])).toBe(true);
        return service.getDrawingByParam(search('group'))!;
    }

    return { bed, service, search, shape, group };
}

describe('UngroupSheetDrawingCommand', () => {
    it('keeps an absolute drawing on a grid worksheet absolute through group, ungroup, undo and redo', async () => {
        const { bed, service, search, shape, group } = setup();
        const absolute = applySheetDrawingPlacement(shape('absolute', {}), {
            kind: SheetDrawingAnchorType.None,
            left: 350,
            top: 320,
            width: 40,
            height: 30,
        });
        expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: absolute.unitId,
            drawings: [absolute, shape('cell', { left: 100, top: 20, width: 40, height: 30 })],
        })).toBe(true);
        const parent = await group([absolute, service.getDrawingByParam(search('cell'))!]);

        // The UI builds released children without an anchor type.
        expect(await bed.commandService.executeCommand(UngroupSheetDrawingCommand.id, [{
            parent,
            children: ['absolute', 'cell'].map((drawingId) => ({ ...search(drawingId), transform: service.getDrawingByParam(search(drawingId))!.transform, groupId: undefined })),
        }])).toBe(true);

        const absoluteMarkers = {
            from: { row: 0, column: 0, columnOffset: 350, rowOffset: 320 },
            to: { row: 0, column: 0, columnOffset: 390, rowOffset: 350 },
        };
        expect(service.getDrawingByParam(search('absolute'))).toMatchObject({ anchorType: SheetDrawingAnchorType.None, axisAlignSheetTransform: absoluteMarkers });

        expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(service.getDrawingByParam(search('absolute'))!.groupId).toBe('group');
        expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(service.getDrawingByParam(search('absolute'))).toMatchObject({ anchorType: SheetDrawingAnchorType.None, axisAlignSheetTransform: absoluteMarkers });
    });

    it('persists the merged transform when a caller releases a grid drawing with a partial transform', async () => {
        const { bed, service, search, shape, group } = setup();
        const children = [shape('first', { left: 100, top: 20, width: 40, height: 30 }), shape('second', { left: 200, top: 20, width: 40, height: 30 })];
        expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: children[0].unitId, drawings: children })).toBe(true);
        const parent = await group(children);

        expect(await bed.commandService.executeCommand(UngroupSheetDrawingCommand.id, [{
            parent,
            children: [
                { ...search('first'), transform: { left: 150 }, groupId: undefined },
                { ...search('second'), groupId: undefined },
            ],
        }])).toBe(true);

        const released = service.getDrawingByParam(search('first'))!;
        expect(released.transform).toMatchObject({ left: 150, top: 20, width: 40, height: 30 });
        const skeleton = bed.get(SheetSkeletonService).ensureSkeleton(released.unitId, released.subUnitId)!;
        expect(released.axisAlignSheetTransform).toEqual(transformToAxisAlignPosition(released.transform!, skeleton));
    });
});
