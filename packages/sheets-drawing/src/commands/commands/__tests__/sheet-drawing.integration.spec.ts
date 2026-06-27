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

import type { ICommandService, Injector, Univer } from '@univerjs/core';
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import { ArrangeTypeEnum, DrawingTypeEnum, ImageSourceType, IUniverInstanceService, UndoCommand } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { CopySheetCommand, RemoveSheetCommand, SetWorksheetActivateCommand } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { resolveSheetDrawingRotateEnabled } from '../../../common/rotate-enabled';
import { ISheetDrawingService } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../remove-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../set-sheet-drawing.command';

function createSheetDrawing(drawingId: string, subUnitId = 'sheet1'): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId,
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
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
        axisAlignSheetTransform: {
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
    };
}

function createSheetDrawingTransform(angle = 0) {
    return {
        left: 10,
        top: 20,
        width: 30,
        height: 40,
        angle,
    };
}

function createGroupSheetDrawing(drawingId: string, angle = 0): ISheetDrawing {
    const drawing = createSheetDrawing(drawingId);

    return {
        ...drawing,
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        transform: createSheetDrawingTransform(angle),
        groupBaseBound: createSheetDrawingTransform(angle),
        sheetTransform: {
            ...drawing.sheetTransform,
            angle,
        },
        axisAlignSheetTransform: {
            ...drawing.axisAlignSheetTransform,
            angle,
        },
    } as ISheetDrawing;
}

describe('sheet drawing integration', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('inserts a drawing through the real command pipeline and syncs both drawing services', async () => {
        const drawing = createSheetDrawing('drawing-1');

        expect(await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toMatchObject({
            drawingId: 'drawing-1',
            subUnitId: 'sheet1',
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toMatchObject({
            drawingId: 'drawing-1',
            subUnitId: 'sheet1',
        });
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-1']);
    });

    it('removes an inserted drawing through the real command pipeline', async () => {
        const drawing = createSheetDrawing('drawing-2');

        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        });

        expect(await commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'drawing-2',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-2' })).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-2' })).toBeUndefined();
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual([]);
    });

    it('updates an existing drawing through the real command pipeline', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('drawing-update')],
        });

        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                ...createSheetDrawing('drawing-update'),
                source: 'https://example.com/updated.png',
                sheetTransform: {
                    angle: 0,
                    flipX: false,
                    flipY: false,
                    skewX: 0,
                    skewY: 0,
                    from: {
                        row: 2,
                        rowOffset: 1,
                        column: 2,
                        columnOffset: 1,
                    },
                    to: {
                        row: 6,
                        rowOffset: 0,
                        column: 5,
                        columnOffset: 0,
                    },
                },
            }],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-update' })).toMatchObject({
            source: 'https://example.com/updated.png',
            sheetTransform: {
                from: {
                    row: 2,
                    column: 2,
                },
                to: {
                    row: 6,
                    column: 5,
                },
            },
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-update' })).toMatchObject({
            source: 'https://example.com/updated.png',
        });
    });

    it('preserves angle updates for groups containing charts while applying move and resize fields', async () => {
        const image = {
            ...createSheetDrawing('image-child'),
            groupId: 'group-with-chart',
            transform: createSheetDrawingTransform(),
        };
        const chart = {
            ...createSheetDrawing('chart-child'),
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            groupId: 'group-with-chart',
            transform: createSheetDrawingTransform(),
        } as ISheetDrawing;

        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createGroupSheetDrawing('group-with-chart', 30),
                image,
                chart,
            ],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const restoredGroup = sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-with-chart' })!;
        expect(Object.prototype.hasOwnProperty.call(restoredGroup.transform ?? {}, 'rotateEnabled')).toBe(false);
        expect(restoredGroup.transform?.angle).toBe(30);
        expect(resolveSheetDrawingRotateEnabled(restoredGroup, sheetDrawingService)).toBe(false);

        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'group-with-chart',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: {
                    left: 15,
                    top: 25,
                    width: 35,
                    height: 45,
                    angle: 60,
                },
                sheetTransform: {
                    ...createSheetDrawing('group-with-chart').sheetTransform,
                    angle: 60,
                },
                axisAlignSheetTransform: {
                    ...createSheetDrawing('group-with-chart').axisAlignSheetTransform,
                    angle: 60,
                },
            }],
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-with-chart' })).toMatchObject({
            transform: {
                left: 15,
                top: 25,
                width: 35,
                height: 45,
                angle: 30,
            },
            sheetTransform: expect.objectContaining({ angle: 30 }),
            axisAlignSheetTransform: expect.objectContaining({ angle: 30 }),
        });

        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'group-with-chart',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: {
                    angle: 60,
                },
            }],
        })).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-with-chart' })).toMatchObject({
            transform: {
                left: 15,
                top: 25,
                width: 35,
                height: 45,
                angle: 30,
            },
            sheetTransform: expect.objectContaining({ angle: 30 }),
            axisAlignSheetTransform: expect.objectContaining({ angle: 30 }),
        });
    });

    it('arranges drawing order through the real command pipeline', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createSheetDrawing('drawing-a'),
                createSheetDrawing('drawing-b'),
                createSheetDrawing('drawing-c'),
            ],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-c', 'drawing-b', 'drawing-a']);

        expect(await commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingIds: ['drawing-c'],
            arrangeType: ArrangeTypeEnum.front,
        })).toBe(true);
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-b', 'drawing-a', 'drawing-c']);

        expect(await commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingIds: ['drawing-c'],
            arrangeType: ArrangeTypeEnum.backward,
        })).toBe(true);
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-b', 'drawing-c', 'drawing-a']);

        expect(await commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingIds: ['drawing-b'],
            arrangeType: ArrangeTypeEnum.forward,
        })).toBe(true);
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-c', 'drawing-b', 'drawing-a']);

        expect(await commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingIds: ['drawing-a'],
            arrangeType: ArrangeTypeEnum.back,
        })).toBe(true);
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual(['drawing-a', 'drawing-c', 'drawing-b']);
    });

    it('copies sheet drawings when a worksheet is duplicated', async () => {
        await commandService.executeCommand(SetWorksheetActivateCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        });
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('drawing-3')],
        });

        expect(commandService.syncExecuteCommand(CopySheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        const workbook = get(IUniverInstanceService).getUniverSheetInstance('test')!;
        let copiedSheetId = '';
        const sheets = workbook.getSheets();
        for (const sheet of sheets) {
            const sheetId = sheet.getSheetId();
            if (sheetId !== 'sheet1' && sheetId !== 'sheet2') {
                copiedSheetId = sheetId;
                break;
            }
        }
        expect(copiedSheetId).not.toBe('');
        const copiedDrawings = Object.values(get(ISheetDrawingService).getDrawingData('test', copiedSheetId));

        expect(copiedDrawings).toHaveLength(1);
        expect(copiedDrawings[0]).toMatchObject({
            unitId: 'test',
            subUnitId: copiedSheetId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        });
        expect(copiedDrawings[0].drawingId).not.toBe('drawing-3');
        expect(get(IDrawingManagerService).getDrawingOrder('test', copiedSheetId)).toHaveLength(1);
    });

    it('removes and restores sheet drawings when a worksheet is deleted and undone', async () => {
        await commandService.executeCommand(SetWorksheetActivateCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        });
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('drawing-4')],
        });

        expect(commandService.syncExecuteCommand(RemoveSheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-4' })).toBeUndefined();
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-4' })).toBeUndefined();
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual([]);
        expect(drawingManagerService.getDrawingOrder('test', 'sheet1')).toEqual([]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-4' })).toMatchObject({
            drawingId: 'drawing-4',
        });
        expect(drawingManagerService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-4' })).toMatchObject({
            drawingId: 'drawing-4',
        });
    });
});
