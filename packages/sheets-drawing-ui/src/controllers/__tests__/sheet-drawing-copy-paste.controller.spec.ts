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

import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { RemoveSheetDrawingCommand, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { COPY_TYPE, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetsDrawingCopyPasteController } from '../sheet-drawing-copy-paste.controller';

function createSkeleton() {
    return {
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

function createImageDrawing(overrides: Record<string, unknown> = {}) {
    return {
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        drawingId: 'image-1',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.BASE64,
        source: 'data:image/png;base64,AA==',
        anchorType: SheetDrawingAnchorType.Both,
        transform: { left: 5, top: 5, width: 10, height: 20 },
        sheetTransform: {
            from: { row: 0, column: 0, rowOffset: 5, columnOffset: 5 },
            to: { row: 1, column: 1, rowOffset: 5, columnOffset: 5 },
        },
        axisAlignSheetTransform: {
            from: { row: 0, column: 0, rowOffset: 5, columnOffset: 5 },
            to: { row: 1, column: 1, rowOffset: 5, columnOffset: 5 },
        },
        ...overrides,
    };
}

function createController(options?: { focusedDrawings?: any[]; drawingData?: Record<string, any> }) {
    let hook: any;
    const skeleton = createSkeleton();
    const drawingService = {
        getFocusDrawings: vi.fn(() => options?.focusedDrawings ?? []),
        getDrawingData: vi.fn(() => options?.drawingData ?? {}),
        getBatchAddOp: vi.fn((drawings) => ({ undo: 'add-undo', redo: 'add-redo', objects: drawings })),
        getBatchUpdateOp: vi.fn((drawings) => ({ undo: 'update-undo', redo: 'update-redo', objects: drawings })),
    };
    const commandService = {
        executeCommand: vi.fn(),
    };
    const sheetClipboardService = {
        addClipboardHook: vi.fn((config) => {
            hook = config;
            return { dispose: vi.fn() };
        }),
    };

    const controller = new SheetsDrawingCopyPasteController(
        sheetClipboardService as never,
        {} as never,
        { getSkeleton: vi.fn(() => skeleton) } as never,
        drawingService as never,
        { writeText: vi.fn() } as never,
        commandService as never
    );

    return { controller, hook, skeleton, drawingService, commandService };
}

describe('SheetsDrawingCopyPasteController', () => {
    it('copies drawings contained in a cell range and pastes them with the range offset', () => {
        const containedDrawing = createImageDrawing();
        const outsideDrawing = createImageDrawing({
            drawingId: 'outside-image',
            transform: { left: 80, top: 80, width: 10, height: 20 },
        });
        const positionOnlyDrawing = createImageDrawing({
            drawingId: 'position-only',
            anchorType: SheetDrawingAnchorType.Position,
        });
        const { controller, hook, drawingService } = createController({
            drawingData: {
                [containedDrawing.drawingId]: containedDrawing,
                [outsideDrawing.drawingId]: outsideDrawing,
                [positionOnlyDrawing.drawingId]: positionOnlyDrawing,
                chart: { drawingId: 'chart', drawingType: DrawingTypeEnum.DRAWING_CHART },
            },
        });

        hook.onBeforeCopy('unit-1', 'sheet-1', {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }, COPY_TYPE.COPY);

        const mutations = hook.onPasteCells(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0, 1], cols: [0, 1] },
            },
            {
                unitId: 'unit-2',
                subUnitId: 'sheet-2',
                range: { rows: [2, 3], cols: [3, 4] },
            },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(1);
        const pastedDrawing = drawingService.getBatchAddOp.mock.calls[0][0][0];
        expect(pastedDrawing).toMatchObject({
            unitId: 'unit-2',
            subUnitId: 'sheet-2',
            transform: { left: 35, top: 45, width: 10, height: 20 },
            sheetTransform: {
                from: { row: 2, column: 3, rowOffset: 5, columnOffset: 5 },
                to: { row: 3, column: 4, rowOffset: 5, columnOffset: 5 },
            },
        });
        expect(pastedDrawing.drawingId).not.toBe(containedDrawing.drawingId);
        expect(mutations.redos).toEqual([
            expect.objectContaining({ params: expect.objectContaining({ op: 'add-redo', objects: [pastedDrawing] }) }),
        ]);

        controller.dispose();
    });

    it('cuts a focused image drawing and pastes it as a new drawing at the target range', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook, drawingService, commandService } = createController({
            focusedDrawings: [focusedDrawing],
        });

        hook.onBeforeCopy('unit-1', 'sheet-1', {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        }, COPY_TYPE.CUT);

        expect(commandService.executeCommand).toHaveBeenCalledWith(RemoveSheetDrawingCommand.id, {
            unitId: 'unit-1',
            drawings: [focusedDrawing],
        });

        const mutations = hook.onPasteCells(
            undefined,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [3], cols: [4] },
            },
            null,
            { copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(1);
        const pastedDrawing = drawingService.getBatchAddOp.mock.calls[0][0][0];
        expect(pastedDrawing).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            transform: { left: 40, top: 60, width: 10, height: 20 },
        });
        expect(pastedDrawing.drawingId).not.toBe(focusedDrawing.drawingId);
        expect(mutations.redos).toEqual([
            expect.objectContaining({ params: expect.objectContaining({ op: 'add-redo', objects: [pastedDrawing] }) }),
        ]);

        controller.dispose();
    });
});
