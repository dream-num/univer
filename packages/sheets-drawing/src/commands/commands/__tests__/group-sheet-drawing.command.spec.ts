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
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService } from '../../../services/sheet-drawing.service';
import { GroupSheetDrawingCommand } from '../group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';

function createShape(unitId: string, subUnitId: string, drawingId: string, left: number, top: number) {
    return { unitId, subUnitId, drawingId, drawingType: DrawingTypeEnum.DRAWING_SHAPE, transform: { left, top, width: 40, height: 30 } };
}

describe('GroupSheetDrawingCommand', () => {
    it('derives the new group cell markers from its transform', async () => {
        const testBed = createSheetsDrawingTestBed();
        const unitId = testBed.workbook.getUnitId();
        const subUnitId = testBed.workbook.getActiveSheet()!.getSheetId();
        const service = testBed.get(ISheetDrawingService);
        const children = [createShape(unitId, subUnitId, 'child-1', 350, 320), createShape(unitId, subUnitId, 'child-2', 470, 350)];
        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId, drawings: children });

        const transform = { left: 350, top: 320, width: 160, height: 60 };
        const parent = {
            unitId,
            subUnitId,
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform,
            groupBaseBound: transform,
            // Stale caller markers must not reach the model.
            axisAlignSheetTransform: { from: { row: 0, rowOffset: 0, column: 0, columnOffset: 0 }, to: { row: 0, rowOffset: 0, column: 0, columnOffset: 0 } },
        };
        expect(await testBed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{
            parent,
            children: children.map((child) => ({ ...child, groupId: parent.drawingId })),
        }])).toBe(true);

        expect(service.getDrawingByParam(parent)?.axisAlignSheetTransform).toEqual({
            from: { row: 12, rowOffset: 12, column: 3, columnOffset: 40 },
            to: { row: 15, rowOffset: 0, column: 5, columnOffset: 24 },
        });
        testBed.univer.dispose();
    });

    it('fails when the sheet layout cannot be resolved', async () => {
        const testBed = createSheetsDrawingTestBed();
        const parent = {
            unitId: 'missing-unit',
            subUnitId: 'missing-sheet',
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: { left: 0, top: 0, width: 10, height: 10 },
        };
        expect(await testBed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{ parent, children: [] }])).toBe(false);
        testBed.univer.dispose();
    });
});
