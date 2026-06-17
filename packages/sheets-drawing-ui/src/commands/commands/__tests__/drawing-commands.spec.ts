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
import { Direction, DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { FlipSheetDrawingCommand } from '../flip-drawings.command';
import { GroupSheetDrawingCommand } from '../group-sheet-drawing.command';
import { MoveDrawingsCommand } from '../move-drawings.command';
import { UngroupSheetDrawingCommand } from '../ungroup-sheet-drawing.command';

function createSheetDrawing(drawingId: string, left: number, top: number): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
        transform: {
            left,
            top,
            width: 100,
            height: 80,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
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

async function insertDrawings(testBed: ReturnType<typeof createSheetsDrawingUiTestBed>, drawings: ISheetDrawing[]) {
    await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
        unitId: testBed.unitId,
        drawings,
    });
}

class TestRenderManagerService {
    private _srcRect: { left?: number; top?: number; right?: number; bottom?: number } | undefined;

    setImageSrcRect(srcRect: { left?: number; top?: number; right?: number; bottom?: number }): void {
        this._srcRect = srcRect;
    }

    getRenderById() {
        return {
            scene: {
                getObject: () => ({
                    srcRect: this._srcRect,
                }),
            },
        };
    }
}

describe('sheet drawing UI commands', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('moves focused drawings by one pixel in the selected direction', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        await insertDrawings(testBed, [createSheetDrawing('drawing-1', 10, 20)]);
        sheetDrawingService.focusDrawing([{
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        }]);

        expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.RIGHT })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-1',
        })?.transform).toMatchObject({
            left: 11,
            top: 20,
        });

        testBed.univer.dispose();
    });

    it('keeps drawing positions unchanged when move is triggered without a focused drawing', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(MoveDrawingsCommand);
        await insertDrawings(testBed, [createSheetDrawing('drawing-2', 30, 40)]);

        expect(await testBed.commandService.executeCommand(MoveDrawingsCommand.id, { direction: Direction.UP })).toBe(false);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'drawing-2',
        })?.transform).toMatchObject({
            left: 30,
            top: 40,
        });

        testBed.univer.dispose();
    });

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

    it('groups two drawings and then ungroups them back to standalone drawings', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(GroupSheetDrawingCommand);
        testBed.commandService.registerCommand(UngroupSheetDrawingCommand);
        await insertDrawings(testBed, [
            createSheetDrawing('child-1', 10, 20),
            createSheetDrawing('child-2', 40, 60),
        ]);

        const parent = {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: { left: 0, top: 0, width: 140, height: 120 },
            groupBaseBound: { left: 0, top: 0, width: 140, height: 120 },
        };
        const groupedChildren = [
            {
                ...createSheetDrawing('child-1', 10, 20),
                groupId: 'group-1',
            },
            {
                ...createSheetDrawing('child-2', 40, 60),
                groupId: 'group-1',
            },
        ];

        expect(await testBed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{
            parent,
            children: groupedChildren,
        }])).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
        })).toMatchObject({
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'child-1',
        })).toMatchObject({
            groupId: 'group-1',
        });

        const ungroupedChildren = [
            {
                ...createSheetDrawing('child-1', 10, 20),
                groupId: undefined,
            },
            {
                ...createSheetDrawing('child-2', 40, 60),
                groupId: undefined,
            },
        ];
        expect(await testBed.commandService.executeCommand(UngroupSheetDrawingCommand.id, [{
            parent,
            children: ungroupedChildren,
        }])).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
        })).toBeUndefined();
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'child-1',
        })?.groupId).toBeUndefined();

        testBed.univer.dispose();
    });
});
