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
import { IDrawingManagerService } from '@univerjs/drawing';
import { InsertSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { EditSheetDrawingOperation } from '../edit-sheet-drawing.operation';
import { SidebarSheetDrawingOperation } from '../open-drawing-panel.operation';

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

describe('EditSheetDrawingOperation', () => {
    let testBed: ReturnType<typeof createSheetsDrawingUiTestBed>;

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('keeps focus and sidebar unchanged when no drawing is provided', async () => {
        testBed = createSheetsDrawingUiTestBed();
        const drawingManagerService = testBed.get(IDrawingManagerService);
        testBed.commandService.registerCommand(EditSheetDrawingOperation);
        testBed.commandService.registerCommand(SidebarSheetDrawingOperation);

        expect(await testBed.commandService.executeCommand(EditSheetDrawingOperation.id, null as never)).toBe(false);
        expect(drawingManagerService.getFocusDrawings()).toEqual([]);
        expect(testBed.sidebarService.visible).toBe(false);
    });

    it('selects a drawing and opens the sheet drawing editor', async () => {
        testBed = createSheetsDrawingUiTestBed();
        const drawingManagerService = testBed.get(IDrawingManagerService);
        testBed.commandService.registerCommand(EditSheetDrawingOperation);
        testBed.commandService.registerCommand(SidebarSheetDrawingOperation);

        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [createSheetDrawing('drawing-1')],
        })).toBe(true);

        expect(await testBed.commandService.executeCommand(EditSheetDrawingOperation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        })).toBe(true);

        expect(drawingManagerService.getFocusDrawings()).toEqual([expect.objectContaining({
            drawingId: 'drawing-1',
        })]);
        expect(testBed.sidebarService.visible).toBe(true);
    });
});
