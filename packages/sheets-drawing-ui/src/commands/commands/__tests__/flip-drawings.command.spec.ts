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

import { IRenderManagerService } from '@univerjs/engine-render';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { FlipSheetDrawingCommand } from '../flip-drawings.command';
import { createSheetDrawing, insertDrawings } from './drawing-command-test-utils';

class TestRenderManagerService {
    private _srcRect: { left?: number; top?: number; right?: number; bottom?: number } | undefined;

    setImageSrcRect(srcRect: { left?: number; top?: number; right?: number; bottom?: number }): void {
        this._srcRect = srcRect;
    }

    getRenderUnitById() {
        return {
            scene: {
                getObject: () => ({
                    srcRect: this._srcRect,
                }),
            },
        };
    }
}

describe('FlipSheetDrawingCommand', () => {
    it('returns false when flip is triggered without command parameters', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        testBed.commandService.registerCommand(FlipSheetDrawingCommand);

        expect(await testBed.commandService.executeCommand(FlipSheetDrawingCommand.id)).toBe(false);

        testBed.univer.dispose();
    });

    it('skips drawings that are missing from the drawing model or lack a sheet skeleton', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        testBed.commandService.registerCommand(FlipSheetDrawingCommand);
        await insertDrawings(testBed, [
            {
                ...createSheetDrawing('detached-drawing', 5, 6),
                unitId: 'detached-unit',
            },
        ]);

        expect(await testBed.commandService.executeCommand(FlipSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [
                {
                    unitId: testBed.unitId,
                    subUnitId: testBed.subUnitId,
                    drawingId: 'missing-drawing',
                },
                {
                    unitId: 'detached-unit',
                    subUnitId: testBed.subUnitId,
                    drawingId: 'detached-drawing',
                },
            ],
            flipH: true,
        })).toBe(false);

        testBed.univer.dispose();
    });

    it('flips a drawing horizontally and vertically in the sheet drawing model', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(FlipSheetDrawingCommand);
        await insertDrawings(testBed, [createSheetDrawing('drawing-3', 50, 60)]);

        expect(await testBed.commandService.executeCommand(FlipSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [{
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                drawingId: 'drawing-3',
            }],
            flipH: true,
            flipV: true,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-3',
        })?.transform).toMatchObject({
            flipX: true,
            flipY: true,
        });

        testBed.univer.dispose();
    });

    it('updates the image crop rectangle when flipping a cropped drawing', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IRenderManagerService, { useClass: TestRenderManagerService as never }],
        ]);
        const renderManagerService = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        renderManagerService.setImageSrcRect({ right: 24, bottom: 36 });
        testBed.commandService.registerCommand(FlipSheetDrawingCommand);
        await insertDrawings(testBed, [createSheetDrawing('cropped-drawing', 50, 60)]);

        expect(await testBed.commandService.executeCommand(FlipSheetDrawingCommand.id, {
            unitId: testBed.unitId,
            drawings: [{
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                drawingId: 'cropped-drawing',
            }],
            flipH: true,
            flipV: true,
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'cropped-drawing',
        })).toMatchObject({
            srcRect: {
                left: 0,
                top: 0,
                right: 24,
                bottom: 36,
            },
            transform: {
                flipX: true,
                flipY: true,
            },
        });

        testBed.univer.dispose();
    });
});
