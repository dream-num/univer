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
import { IDrawingManagerService } from '@univerjs/drawing';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../../../views/sheet-image-panel/component-name';
import { SidebarSheetDrawingOperation } from '../open-drawing-panel.operation';

describe('SidebarSheetDrawingOperation', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('opens the sheet drawing panel for the active worksheet', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        testBed.commandService.registerCommand(SidebarSheetDrawingOperation);

        expect(await testBed.commandService.executeCommand(SidebarSheetDrawingOperation.id, { value: 'open' })).toBe(true);

        expect(testBed.sidebarService.visible).toBe(true);
        expect(testBed.sidebarService.options).toMatchObject({
            header: { title: 'sheets-drawing-ui.panel.title' },
            children: { label: COMPONENT_SHEET_DRAWING_PANEL },
            width: 360,
        });

        testBed.univer.dispose();
    });

    it('clears the focused drawing when the panel is closed', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const drawingManagerService = testBed.get(IDrawingManagerService);
        testBed.commandService.registerCommand(SidebarSheetDrawingOperation);

        drawingManagerService.registerDrawingData(testBed.unitId, {
            [testBed.subUnitId]: {
                'drawing-1': {
                    unitId: testBed.unitId,
                    subUnitId: testBed.subUnitId,
                    drawingId: 'drawing-1',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                },
            },
        } as never);
        drawingManagerService.focusDrawing([{
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        }]);

        await testBed.commandService.executeCommand(SidebarSheetDrawingOperation.id, { value: 'open' });
        testBed.sidebarService.close();

        expect(drawingManagerService.getFocusDrawings()).toEqual([]);

        testBed.univer.dispose();
    });

    it('closes the panel for non-open actions', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        testBed.commandService.registerCommand(SidebarSheetDrawingOperation);

        await testBed.commandService.executeCommand(SidebarSheetDrawingOperation.id, { value: 'open' });
        expect(testBed.sidebarService.visible).toBe(true);

        expect(await testBed.commandService.executeCommand(SidebarSheetDrawingOperation.id, { value: 'close' })).toBe(true);
        expect(testBed.sidebarService.visible).toBe(false);

        testBed.univer.dispose();
    });
});
