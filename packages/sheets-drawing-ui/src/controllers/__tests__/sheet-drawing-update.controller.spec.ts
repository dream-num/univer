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

import { DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { SetDrawingArrangeCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { GroupSheetDrawingCommand } from '../../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../../commands/commands/ungroup-sheet-drawing.command';
import { SheetDrawingUpdateController } from '../sheet-drawing-update.controller';

function createSkeleton() {
    return {
        rowHeaderWidth: 0,
        columnHeaderHeight: 0,
        columnTotalWidth: 1000,
        rowTotalHeight: 1000,
        getNoMergeCellWithCoordByIndex: vi.fn((row: number, column: number) => ({
            startX: column * 10,
            endX: column * 10 + 10,
            startY: row * 20,
            endY: row * 20 + 20,
        })),
        getCellIndexAndOffsetByPosition: vi.fn((left: number, top: number) => {
            const column = Math.floor(left / 10);
            const row = Math.floor(top / 20);
            return {
                column,
                row,
                columnOffset: left - column * 10,
                rowOffset: top - row * 20,
            };
        }),
    };
}

function createController(options?: { openFiles?: unknown[] }) {
    const featurePluginOrderUpdate$ = new Subject<any>();
    const featurePluginUpdate$ = new Subject<any[]>();
    const featurePluginGroupUpdate$ = new Subject<any[]>();
    const featurePluginUngroupUpdate$ = new Subject<any[]>();
    const focus$ = new Subject<any[] | null>();
    const skeleton = createSkeleton();
    const commandService = {
        executeCommand: vi.fn(),
        syncExecuteCommand: vi.fn(() => true),
    };
    const sheetDrawingService = {
        getDrawingByParam: vi.fn(({ drawingId }) => ({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: { left: 10, top: 20, width: 30, height: 40 },
            sheetTransform: {
                from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
                to: { row: 3, column: 4, rowOffset: 0, columnOffset: 0 },
            },
        })),
        getDrawingsByGroup: vi.fn(() => []),
        focusDrawing: vi.fn(),
    };
    const selectionManagerService = {
        getWorkbookSelections: vi.fn(() => ({
            getCurrentSelections: vi.fn(() => []),
            getCurrentLastSelection: vi.fn(() => undefined),
        })),
    };
    const controller = new SheetDrawingUpdateController(
        {
            unitId: 'unit-1',
            unit: {
                getUnitId: () => 'unit-1',
                getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            },
            scene: { width: 400, height: 300 },
        } as never,
        commandService as never,
        { interceptAfterCommand: vi.fn(() => ({ dispose: vi.fn() })) } as never,
        { getCellWithCoordByOffset: vi.fn() } as never,
        { saveImage: vi.fn(), addImageSourceCache: vi.fn() } as never,
        { openFile: vi.fn(async () => options?.openFiles ?? []) } as never,
        sheetDrawingService as never,
        {
            featurePluginOrderUpdate$,
            featurePluginUpdate$,
            featurePluginGroupUpdate$,
            featurePluginUngroupUpdate$,
            focus$,
        } as never,
        { setContextValue: vi.fn() } as never,
        { show: vi.fn() } as never,
        { t: vi.fn((key: string, value?: string) => `${key}:${value ?? ''}`) } as never,
        selectionManagerService as never,
        {
            getSkeleton: vi.fn(() => skeleton),
            getSkeletonParam: vi.fn(() => ({ unitId: 'unit-1', sheetId: 'sheet-1', skeleton })),
        } as never,
        { get: vi.fn() } as never,
        { getImage: vi.fn() } as never
    );

    return {
        controller,
        commandService,
        sheetDrawingService,
        featurePluginOrderUpdate$,
        featurePluginUpdate$,
        featurePluginGroupUpdate$,
        featurePluginUngroupUpdate$,
        focus$,
    };
}

describe('SheetDrawingUpdateController', () => {
    it('reports empty and over-limit file selections without inserting images', async () => {
        const empty = createController({ openFiles: [] });

        await expect(empty.controller.insertFloatImage()).resolves.toBe(false);
        await expect(empty.controller.insertCellImage()).resolves.toBe(false);
        expect((empty.controller as any)._messageService.show).not.toHaveBeenCalled();
        empty.controller.dispose();

        const overLimitFiles = Array.from({ length: 30 }, (_, index) => ({ name: `image-${index}.png` }));
        const overLimit = createController({ openFiles: overLimitFiles });

        await expect(overLimit.controller.insertFloatImage()).resolves.toBe(false);

        expect((overLimit.controller as any)._messageService.show).toHaveBeenCalledWith({
            type: MessageType.Error,
            content: expect.stringContaining('sheets-drawing-ui.update-status.exceedMaxCount'),
        });
        expect(overLimit.commandService.executeCommand).not.toHaveBeenCalled();
        overLimit.controller.dispose();
    });

    it('converts drawing transform updates into sheet drawing commands', () => {
        const { controller, commandService, featurePluginUpdate$ } = createController();

        featurePluginUpdate$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'image-1',
            transform: { left: 25, top: 45 },
        }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(SetSheetDrawingCommand.id, {
            unitId: 'unit-1',
            drawings: [
                expect.objectContaining({
                    drawingId: 'image-1',
                    transform: expect.objectContaining({ left: 25, top: 45, width: 30, height: 40 }),
                    sheetTransform: expect.objectContaining({
                        from: { row: 2, column: 2, rowOffset: 5, columnOffset: 5 },
                        to: { row: 4, column: 5, rowOffset: 5, columnOffset: 5 },
                    }),
                }),
            ],
        });

        controller.dispose();
    });

    it('forwards arrange, group, ungroup and focus drawing events to sheet services', () => {
        const {
            controller,
            commandService,
            sheetDrawingService,
            featurePluginOrderUpdate$,
            featurePluginGroupUpdate$,
            featurePluginUngroupUpdate$,
            focus$,
        } = createController();
        const parent = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
            transform: { left: 0, top: 0, width: 40, height: 40 },
        };
        const child = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'image-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: { left: 10, top: 20, width: 30, height: 40 },
        };

        featurePluginOrderUpdate$.next({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingIds: ['image-1'],
            arrangeType: 'front',
        });
        featurePluginGroupUpdate$.next([{ parent, children: [child] }]);
        featurePluginUngroupUpdate$.next([{ parent, children: [child] }]);
        focus$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'image-1' }]);
        focus$.next([]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(SetDrawingArrangeCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingIds: ['image-1'],
            arrangeType: 'front',
        });
        expect(commandService.executeCommand).toHaveBeenCalledWith(GroupSheetDrawingCommand.id, [
            expect.objectContaining({
                parent: expect.objectContaining({ drawingId: 'group-1', sheetTransform: expect.any(Object) }),
                children: [expect.objectContaining({ drawingId: 'image-1', sheetTransform: expect.any(Object) })],
            }),
        ]);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, [{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
        }]);
        expect(commandService.executeCommand).toHaveBeenCalledWith(UngroupSheetDrawingCommand.id, [
            expect.objectContaining({
                children: [expect.objectContaining({ drawingId: 'image-1', sheetTransform: expect.any(Object) })],
            }),
        ]);
        expect((controller as any)._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, true);
        expect((controller as any)._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_COMMON_DRAWINGS, false);
        expect(sheetDrawingService.focusDrawing).toHaveBeenLastCalledWith([]);

        controller.dispose();
    });

    it('does not persist derived group rotateEnabled before grouping', () => {
        const {
            controller,
            commandService,
            featurePluginGroupUpdate$,
        } = createController();
        const parent = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: { left: 0, top: 0, width: 80, height: 40 },
        };
        const children = [
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'image-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: { left: 10, top: 20, width: 30, height: 40 },
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'chart-1',
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                transform: { left: 40, top: 20, width: 30, height: 40 },
            },
        ];

        featurePluginGroupUpdate$.next([{ parent, children }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(GroupSheetDrawingCommand.id, [
            expect.objectContaining({
                parent: expect.objectContaining({
                    drawingId: 'group-1',
                }),
            }),
        ]);
        const groupCommandParams = commandService.executeCommand.mock.calls.find(([commandId]) => commandId === GroupSheetDrawingCommand.id)?.[1] as any[];
        expect(Object.prototype.hasOwnProperty.call(groupCommandParams[0].parent.transform ?? {}, 'rotateEnabled')).toBe(false);

        controller.dispose();
    });
});
