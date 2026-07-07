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

import type { Injector, Univer } from '@univerjs/core';
import type { ISheetDrawing } from '../../../services/sheet-drawing.service';
import {
    ArrangeTypeEnum,
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    IUndoRedoService,
    IUniverInstanceService,
    UndoCommand,
} from '@univerjs/core';
import { DRAWING_COPY_CONTEXT_KEY, IDrawingManagerService } from '@univerjs/drawing';
import { CopySheetCommand, RemoveSheetCommand, SetWorksheetActivateCommand, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { resolveSheetDrawingRotateEnabled } from '../../../common/rotate-enabled';
import { ISheetDrawingService } from '../../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../../mutations/set-drawing-apply.mutation';
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

function withoutAngle<T extends { angle?: number }>(value: T): Omit<T, 'angle'> {
    const { angle: _angle, ...rest } = value;
    return rest;
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

    it('skips remove sheet drawing when no drawing objects are resolved', async () => {
        expect(await commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [],
        })).toBe(false);
    });

    it('removes and restores a grouped drawing graph including chart children', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createGroupSheetDrawing('group-delete'),
                {
                    ...createSheetDrawing('image-child'),
                    groupId: 'group-delete',
                    transform: createSheetDrawingTransform(),
                },
                {
                    ...createSheetDrawing('chart-child'),
                    drawingType: DrawingTypeEnum.DRAWING_CHART,
                    groupId: 'group-delete',
                    transform: createSheetDrawingTransform(),
                } as ISheetDrawing,
            ],
        });

        expect(await commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'group-delete',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
            }],
        })).toBe(true);

        const sheetDrawingService = get(ISheetDrawingService);
        const drawingManagerService = get(IDrawingManagerService);
        const drawingSearches = ['group-delete', 'image-child', 'chart-child'].map((drawingId) => ({ unitId: 'test', subUnitId: 'sheet1', drawingId }));

        drawingSearches.forEach((drawingSearch) => {
            expect(sheetDrawingService.getDrawingByParam(drawingSearch)).toBeUndefined();
            expect(drawingManagerService.getDrawingByParam(drawingSearch)).toBeUndefined();
        });
        expect(sheetDrawingService.getDrawingOrder('test', 'sheet1')).toEqual([]);

        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'group-delete' })).toMatchObject({
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'image-child' })).toMatchObject({
            groupId: 'group-delete',
        });
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'chart-child' })).toMatchObject({
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            groupId: 'group-delete',
        });
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

    it('drops incoming angles for non-rotatable drawings when current angle is absent', async () => {
        const drawing = createSheetDrawing('chart-without-angle');
        const chart = {
            ...drawing,
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            transform: withoutAngle(createSheetDrawingTransform()),
            sheetTransform: withoutAngle(drawing.sheetTransform),
            axisAlignSheetTransform: withoutAngle(drawing.axisAlignSheetTransform),
        } as ISheetDrawing;

        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [chart],
        });

        expect(await commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'chart-without-angle',
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                transform: createSheetDrawingTransform(45),
                sheetTransform: {
                    ...drawing.sheetTransform,
                    angle: 45,
                },
                axisAlignSheetTransform: {
                    ...drawing.axisAlignSheetTransform,
                    angle: 45,
                },
            }],
        })).toBe(true);

        const restoredChart = get(ISheetDrawingService).getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'chart-without-angle',
        })!;

        expect(Object.prototype.hasOwnProperty.call(restoredChart.transform ?? {}, 'angle')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(restoredChart.sheetTransform, 'angle')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(restoredChart.axisAlignSheetTransform, 'angle')).toBe(false);
    });

    it('keeps angle updates unchanged when the current drawing is missing', () => {
        const commandServiceMock = { syncExecuteCommand: vi.fn(() => true) };
        const undoRedoServiceMock = { pushUndoRedo: vi.fn() };
        const sheetDrawingServiceMock = {
            getDrawingByParam: vi.fn(() => undefined),
            getBatchUpdateOp: vi.fn((drawings: ISheetDrawing[]) => ({
                unitId: 'test',
                subUnitId: 'sheet1',
                undo: null,
                redo: null,
                objects: drawings.map(({ unitId, subUnitId, drawingId }) => ({ unitId, subUnitId, drawingId })),
            })),
        };
        const sheetInterceptorServiceMock = {
            onCommandExecute: vi.fn(() => ({ redos: [], undos: [] })),
        };
        const drawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'missing-chart',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            transform: { angle: 45 },
        };
        const accessor = {
            get: vi.fn((token) => {
                if (token === ICommandService) return commandServiceMock;
                if (token === IUndoRedoService) return undoRedoServiceMock;
                if (token === ISheetDrawingService) return sheetDrawingServiceMock;
                if (token === SheetInterceptorService) return sheetInterceptorServiceMock;
                throw new Error('unexpected dependency');
            }),
        };

        expect(SetSheetDrawingCommand.handler(accessor as never, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);
        expect(sheetDrawingServiceMock.getBatchUpdateOp).toHaveBeenCalledWith([drawing]);
        expect(sheetInterceptorServiceMock.onCommandExecute).toHaveBeenCalledWith({
            id: SetSheetDrawingCommand.id,
            params: {
                unitId: 'test',
                drawings: [drawing],
            },
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

    it('copies grouped drawing records with the same group id map', async () => {
        await commandService.executeCommand(SetWorksheetActivateCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        });
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createGroupSheetDrawing('group-copy'),
                {
                    ...createSheetDrawing('image-child'),
                    groupId: 'group-copy',
                    transform: createSheetDrawingTransform(),
                },
                {
                    ...createSheetDrawing('chart-child'),
                    drawingType: DrawingTypeEnum.DRAWING_CHART,
                    groupId: 'group-copy',
                    transform: createSheetDrawingTransform(),
                } as ISheetDrawing,
            ],
        });

        expect(commandService.syncExecuteCommand(CopySheetCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        const workbook = get(IUniverInstanceService).getUniverSheetInstance('test')!;
        const copiedSheetId = workbook.getSheets()
            .map((sheet) => sheet.getSheetId())
            .find((sheetId) => sheetId !== 'sheet1' && sheetId !== 'sheet2')!;
        const copiedDrawings = Object.values(get(ISheetDrawingService).getDrawingData('test', copiedSheetId));
        const copiedGroup = copiedDrawings.find((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP);
        const copiedImage = copiedDrawings.find((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE);
        const copiedChart = copiedDrawings.find((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_CHART);

        expect(copiedDrawings.map((drawing) => drawing.drawingType).sort()).toEqual([
            DrawingTypeEnum.DRAWING_CHART,
            DrawingTypeEnum.DRAWING_IMAGE,
            DrawingTypeEnum.DRAWING_GROUP,
        ].sort());
        expect(copiedGroup?.drawingId).not.toBe('group-copy');
        expect(copiedImage?.drawingId).not.toBe('image-child');
        expect(copiedChart?.drawingId).not.toBe('chart-child');
        expect(copiedImage?.groupId).toBe(copiedGroup?.drawingId);
        expect(copiedChart?.groupId).toBe(copiedGroup?.drawingId);
    });

    it('includes grouped chart children in remove sheet drawing record mutations', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [
                createGroupSheetDrawing('group-remove'),
                {
                    ...createSheetDrawing('image-child'),
                    groupId: 'group-remove',
                    transform: createSheetDrawingTransform(),
                },
                {
                    ...createSheetDrawing('chart-child'),
                    drawingType: DrawingTypeEnum.DRAWING_CHART,
                    groupId: 'group-remove',
                    transform: createSheetDrawingTransform(),
                } as ISheetDrawing,
            ],
        });

        const intercepted = get(SheetInterceptorService).onCommandExecute({
            id: RemoveSheetCommand.id,
            params: { unitId: 'test', subUnitId: 'sheet1' },
        });
        const removeMutation = intercepted.redos.find((mutation) => mutation.id === SetDrawingApplyMutation.id);
        const removeObjects = (removeMutation?.params as { objects?: Array<{ drawingId: string }>; type?: DrawingApplyType } | undefined)?.objects ?? [];

        expect((removeMutation?.params as { type?: DrawingApplyType } | undefined)?.type).toBe(DrawingApplyType.REMOVE);
        expect(removeObjects.map((object) => object.drawingId)).toEqual(['chart-child', 'image-child', 'group-remove']);
    });

    it('copies drawing records that are missing from drawing order after ordered records', () => {
        const sheetDrawingService = get(ISheetDrawingService);
        sheetDrawingService.registerDrawingData('test', {
            sheet1: {
                data: {
                    ordered: createSheetDrawing('ordered'),
                    unordered: createSheetDrawing('unordered'),
                },
                order: ['ordered'],
            },
        });
        const copyContext = new Map<string, unknown>();

        const intercepted = get(SheetInterceptorService).onCommandExecute({
            id: CopySheetCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet1',
                targetSubUnitId: 'copied-sheet',
                copyContext,
            },
        });
        const insertMutation = intercepted.redos.find((mutation) => mutation.id === SetDrawingApplyMutation.id);
        const copiedObjects = (insertMutation?.params as { objects?: Array<{ drawingId: string; subUnitId: string }> } | undefined)?.objects ?? [];
        const copyPlan = copyContext.get(DRAWING_COPY_CONTEXT_KEY) as { drawings: Array<ISheetDrawing & { source?: string }> };

        expect(copyPlan.drawings.map((drawing) => drawing.source)).toEqual([
            'https://example.com/ordered.png',
            'https://example.com/unordered.png',
        ]);
        expect(copiedObjects.map((drawing) => drawing.drawingId)).toEqual(copyPlan.drawings.map((drawing) => drawing.drawingId));
        expect(copiedObjects.map((drawing) => drawing.subUnitId)).toEqual(['copied-sheet', 'copied-sheet']);
    });

    it('does not create remove sheet mutations when batch remove resolves no objects', async () => {
        await commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [createSheetDrawing('empty-remove-guard')],
        });

        const sheetDrawingService = get(ISheetDrawingService);
        const getBatchRemoveOpSpy = vi.spyOn(sheetDrawingService, 'getBatchRemoveOp').mockReturnValue({
            unitId: 'test',
            subUnitId: 'sheet1',
            undo: null,
            redo: null,
            objects: [],
        });

        expect(get(SheetInterceptorService).onCommandExecute({
            id: RemoveSheetCommand.id,
            params: { unitId: 'test', subUnitId: 'sheet1' },
        })).toMatchObject({ redos: [], undos: [] });

        getBatchRemoveOpSpy.mockRestore();
    });

    it('does not create sheet lifecycle mutations when the source sheet has no drawings', () => {
        const sheetInterceptorService = get(SheetInterceptorService);

        expect(sheetInterceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: { unitId: 'test', subUnitId: 'sheet2' },
        })).toMatchObject({ redos: [], undos: [] });

        expect(sheetInterceptorService.onCommandExecute({
            id: CopySheetCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet2',
            },
        })).toMatchObject({ redos: [], undos: [] });

        expect(sheetInterceptorService.onCommandExecute({
            id: CopySheetCommand.id,
            params: {
                unitId: 'test',
                subUnitId: 'sheet2',
                targetSubUnitId: 'copied-empty-sheet',
                copyContext: new Map<string, unknown>(),
            },
        })).toMatchObject({ redos: [], undos: [] });
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
