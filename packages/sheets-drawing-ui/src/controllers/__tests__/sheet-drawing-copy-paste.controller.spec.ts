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

import type { IRange } from '@univerjs/core';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import { DrawingTypeEnum, ICommandService, ImageSourceType, Injector, ObjectMatrix } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { RemoveSheetDrawingCommand, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { InsertFloatImageCommand } from '../../commands/commands/insert-image.command';
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

type IImageDrawing = ReturnType<typeof createImageDrawing>;

interface IPrivateControllerAccess {
    _copyInfo: {
        unitId: string;
        subUnitId: string;
        copyRange?: IRange;
        drawings: IImageDrawing[];
    } | null;
}

interface ITestClipboardHook extends ISheetClipboardHook {
    onBeforeCopy: NonNullable<ISheetClipboardHook['onBeforeCopy']>;
    onBeforeCopyFocusedObject?: (unitId: string, subUnitId: string, copyType: COPY_TYPE) => boolean;
    onPasteCells: NonNullable<ISheetClipboardHook['onPasteCells']>;
    onPasteFiles: NonNullable<ISheetClipboardHook['onPasteFiles']>;
    onPasteUnrecognized: NonNullable<ISheetClipboardHook['onPasteUnrecognized']>;
}

function createController(options?: { focusedDrawings?: IImageDrawing[]; drawingData?: Record<string, object> }) {
    let hook: ISheetClipboardHook | undefined;
    const skeleton = createSkeleton();
    const drawingService = {
        getFocusDrawings: vi.fn(() => options?.focusedDrawings ?? []),
        getDrawingData: vi.fn(() => options?.drawingData ?? {}),
        getBatchAddOp: vi.fn((drawings: IImageDrawing[]) => ({ undo: 'add-undo', redo: 'add-redo', objects: drawings })),
        getBatchUpdateOp: vi.fn((drawings: IImageDrawing[]) => ({ undo: 'update-undo', redo: 'update-redo', objects: drawings })),
    };
    const commandService = {
        executeCommand: vi.fn(),
    };
    const sheetClipboardService = {
        addClipboardHook: vi.fn((config: ISheetClipboardHook) => {
            hook = config;
            return { dispose: vi.fn() };
        }),
    };

    const injector = new Injector([
        [ISheetClipboardService, { useValue: sheetClipboardService }],
        [IRenderManagerService, { useValue: {} }],
        [SheetSkeletonService, { useValue: { getSkeleton: vi.fn(() => skeleton) } }],
        [IDrawingManagerService, { useValue: drawingService }],
        [IClipboardInterfaceService, { useValue: { writeText: vi.fn() } }],
        [ICommandService, { useValue: commandService }],
        [SheetsDrawingCopyPasteController],
    ]);
    const controller = injector.get(SheetsDrawingCopyPasteController);

    return { controller, hook: hook as ITestClipboardHook, skeleton, drawingService, commandService };
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
            focusedDrawings: [outsideDrawing],
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
            new ObjectMatrix(),
            { copyId: 'range-copy', copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
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

        expect(hook.onBeforeCopyFocusedObject).toBeTypeOf('function');
        expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.CUT)).toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(RemoveSheetDrawingCommand.id, {
            unitId: 'unit-1',
            drawings: [focusedDrawing],
        });

        const mutations = hook.onPasteCells(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [3], cols: [4] },
            },
            new ObjectMatrix(),
            { copyId: 'image-cut', copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
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

    it('copies all focused image drawings', () => {
        const firstDrawing = createImageDrawing({ drawingId: 'first-image' });
        const secondDrawing = createImageDrawing({
            drawingId: 'second-image',
            transform: { left: 30, top: 40, width: 10, height: 20 },
        });
        const { controller, hook, drawingService } = createController({
            focusedDrawings: [firstDrawing, secondDrawing],
        });

        expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [3], cols: [4] },
            },
            [new File(['clipboard'], 'clipboard-image.png', { type: 'image/png' })],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(2);
        expect(drawingService.getBatchAddOp.mock.calls.map(([drawings]) => drawings[0].transform)).toEqual([
            expect.objectContaining({ left: 40, top: 60 }),
            expect.objectContaining({ left: 65, top: 95 }),
        ]);
        expect(mutations.redos).toHaveLength(2);

        controller.dispose();
    });

    it('pastes external image files instead of the previous copied drawing', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });
        const internalImage = new File(['internal'], 'clipboard-image.png', { type: 'image/png' });
        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [internalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations).toEqual({
            undos: [],
            redos: [{
                id: InsertFloatImageCommand.id,
                params: { files: [externalImage] },
            }],
        });

        controller.dispose();
    });

    it('clears a copied image after pasting external cell content', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        const mutations = hook.onPasteCells(
            null,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            new ObjectMatrix(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations).toEqual({ undos: [], redos: [] });

        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });
        expect(hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        ).redos).toEqual([{
            id: InsertFloatImageCommand.id,
            params: { files: [externalImage] },
        }]);

        expect(hook.onPasteUnrecognized({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { rows: [0], cols: [0] },
        })).toEqual({ undos: [], redos: [] });

        controller.dispose();
    });

    it('clears a copied image after an unrecognized internal paste', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });
        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        hook.onPasteUnrecognized({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { rows: [0], cols: [0] },
        });

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations.redos).toEqual([{
            id: InsertFloatImageCommand.id,
            params: { files: [externalImage] },
        }]);

        controller.dispose();
    });
});
