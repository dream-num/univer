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

import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { DeleteDrawingsCommand } from '../delete-drawings.command';

function createSheetDrawing(drawingId: string): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
        transform: { left: 10, top: 20, width: 100, height: 80 },
        axisAlignSheetTransform: {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}

describe('DeleteDrawingsCommand', () => {
    let testBed: ReturnType<typeof createSheetsDrawingUiTestBed>;

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('removes the focused drawing from the real sheet drawing model', async () => {
        testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(DeleteDrawingsCommand);

        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [createSheetDrawing('drawing-1')],
        })).toBe(true);
        sheetDrawingService.focusDrawing([{
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        }]);

        expect(await testBed.commandService.executeCommand(DeleteDrawingsCommand.id)).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        })).toBeUndefined();
        expect(sheetDrawingService.getDrawingOrder(testBed.unitId, testBed.subUnitId)).toEqual([]);
    });

    it('keeps the model unchanged when there is no focused drawing', async () => {
        testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(DeleteDrawingsCommand);

        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [createSheetDrawing('drawing-2')],
        })).toBe(true);

        expect(await testBed.commandService.executeCommand(DeleteDrawingsCommand.id)).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-2',
        })).toMatchObject({
            drawingId: 'drawing-2',
        });
    });
});
