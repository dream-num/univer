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
        sheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
        axisAlignSheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        },
    };
}

describe('DeleteDrawingsCommand', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('removes the focused drawing from the real sheet drawing model', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(DeleteDrawingsCommand);

        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [createSheetDrawing('drawing-1')],
        });
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

        testBed.univer.dispose();
    });

    it('keeps the model unchanged when there is no focused drawing', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(DeleteDrawingsCommand);

        await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [createSheetDrawing('drawing-2')],
        });

        expect(await testBed.commandService.executeCommand(DeleteDrawingsCommand.id)).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-2',
        })).toMatchObject({
            drawingId: 'drawing-2',
        });

        testBed.univer.dispose();
    });
});
